import { NextRequest, NextResponse } from 'next/server'
import { analyzePatterns, analyzeSentiment } from '@/lib/ai/services'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, limit = 10 } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current retrospective count
    const { count: retroCount, error: countError } = await supabase
      .from('retrospectives')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (countError) {
      console.error('Error counting retrospectives:', countError)
      return NextResponse.json(
        { error: 'Failed to count retrospectives' },
        { status: 500 }
      )
    }

    console.log(`User ${userId} has ${retroCount} retrospectives`)

    if (!retroCount || retroCount < 2) {
      return NextResponse.json(
        { error: `Need at least 2 retrospectives for insights (found ${retroCount || 0})` },
        { status: 400 }
      )
    }

    // Check cache first
    // @ts-ignore - Type definitions don't include ai_insights_cache yet
    const { data: cachedInsight, error: cacheError } = await supabase
      .from('ai_insights_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_type', 'combined')
      .single()

    // If cache exists and retrospective count hasn't changed, return cached data
    if (cachedInsight && (cachedInsight as any).retrospective_count === retroCount && !cacheError) {
      console.log(`Returning cached insights for user ${userId}`)
      return NextResponse.json({
        ...(cachedInsight as any).data,
        cached: true,
        cachedAt: (cachedInsight as any).updated_at
      })
    }

    console.log(`Generating new insights for user ${userId} (cache ${cachedInsight ? 'outdated' : 'missing'})`)

    // Fetch recent retrospectives
    const { data: retrospectives, error: retroError } = await supabase
      .from('retrospectives')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .limit(limit) as { data: Array<{ id: string; title: string | null; created_at: string }> | null; error: any }

    if (retroError || !retrospectives || retrospectives.length < 2) {
      console.error('Error fetching retrospectives:', retroError)
      return NextResponse.json(
        { error: 'Failed to fetch retrospectives' },
        { status: 500 }
      )
    }

    // Fetch keeps, problems, tries for each retrospective
    const retrospectivesWithData = await Promise.all(
      (retrospectives || []).map(async (retro) => {
        const [keepsResult, problemsResult, triesResult] = await Promise.all([
          supabase
            .from('keeps')
            .select('text')
            .eq('retrospective_id', retro.id),
          supabase
            .from('problems')
            .select('text')
            .eq('retrospective_id', retro.id),
          supabase
            .from('tries')
            .select('text')
            .eq('retrospective_id', retro.id)
        ])

        const keeps = keepsResult.data as Array<{ text: string }> | null
        const problems = problemsResult.data as Array<{ text: string }> | null
        const tries = triesResult.data as Array<{ text: string }> | null

        return {
          ...retro,
          keeps: keeps?.map(k => k.text) || [],
          problems: problems?.map(p => p.text) || [],
          tries: tries?.map(t => t.text) || []
        }
      })
    )

    // Generate patterns and sentiment in parallel
    const [patterns, sentiment] = await Promise.all([
      analyzePatterns(retrospectivesWithData),
      analyzeSentiment(retrospectivesWithData.map(r => ({
        created_at: r.created_at,
        keeps: r.keeps,
        problems: r.problems
      })))
    ])

    // Combine results
    const combinedInsights = {
      wellbeingScore: sentiment.wellbeingScore || 50,
      wellbeingTrend: sentiment.sentimentTrend || 'stable',
      topThemes: patterns.recurringThemes?.slice(0, 3) || [],
      keyRecommendation: patterns.recommendations?.[0] || 'Keep reflecting regularly',
      trends: patterns.trends || [],
      allRecommendations: patterns.recommendations || []
    }

    // Save to cache (upsert)
    // @ts-ignore - Type definitions don't include ai_insights_cache yet
    const { error: upsertError } = await supabase.from('ai_insights_cache').upsert({
        user_id: userId,
        insight_type: 'combined',
        data: combinedInsights,
        retrospective_count: retroCount
      }, {
        onConflict: 'user_id,insight_type'
      })

    if (upsertError) {
      console.error('Error caching insights:', upsertError)
      // Don't fail if caching fails, just return the data
    } else {
      console.log(`Cached insights for user ${userId}`)
    }

    return NextResponse.json({
      ...combinedInsights,
      cached: false
    })
  } catch (error: any) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
