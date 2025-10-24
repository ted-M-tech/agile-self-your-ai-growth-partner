import { NextRequest, NextResponse } from 'next/server'
import { analyzePatterns, analyzeSentiment } from '@/lib/ai/services'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, limit = 10 } = await req.json()

    console.log('🔍 AI Insights API called with userId:', userId)

    if (!userId) {
      console.error('❌ Missing userId in request')
      return NextResponse.json(
        { error: 'Missing userId', userMessage: 'Unable to load AI insights. Please refresh the page.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // DEBUG: Check all retrospectives for this user (without status filter)
    const { data: allRetros, count: allRetroCount } = await supabase
      .from('retrospectives')
      .select('id, status, user_id', { count: 'exact' })
      .eq('user_id', userId)

    console.log(`🔍 DEBUG: User ${userId} has ${allRetroCount || 0} total retrospectives`)
    console.log(`🔍 DEBUG: Retrospectives:`, allRetros)

    // Get current retrospective count (with status filter)
    const { count: retroCount, error: countError } = await supabase
      .from('retrospectives')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (countError) {
      console.error('❌ Error counting retrospectives:', countError)
      return NextResponse.json(
        {
          error: 'Failed to count retrospectives',
          userMessage: 'Unable to access your retrospectives. Please try again later.',
          details: countError.message
        },
        { status: 500 }
      )
    }

    console.log(`📊 User ${userId} has ${retroCount} completed retrospectives (out of ${allRetroCount} total)`)

    if (!retroCount || retroCount < 1) {
      console.log(`⚠️ Not enough retrospectives for insights (found ${retroCount || 0}, need 1)`)
      return NextResponse.json(
        {
          error: `Need at least 1 retrospective for insights (found ${retroCount || 0})`,
          userMessage: `Create your first retrospective to unlock AI insights`,
          retroCount: retroCount || 0,
          required: 1
        },
        { status: 400 }
      )
    }

    // Check cache first (gracefully handle if table doesn't exist)
    let cachedInsight = null
    let cacheError = null

    try {
      // @ts-ignore - Type definitions don't include ai_insights_cache yet
      const result = await supabase
        .from('ai_insights_cache')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'combined')
        .single()

      cachedInsight = result.data
      cacheError = result.error
    } catch (err: any) {
      console.warn('⚠️ Cache table might not exist:', err.message)
      // Continue without cache if table doesn't exist
    }

    // If cache exists and retrospective count hasn't changed, return cached data
    if (cachedInsight && (cachedInsight as any).retrospective_count === retroCount && !cacheError) {
      console.log(`✅ Returning cached insights for user ${userId}`)
      return NextResponse.json({
        ...(cachedInsight as any).data,
        cached: true,
        cachedAt: (cachedInsight as any).updated_at
      })
    }

    console.log(`✨ Generating new insights for user ${userId} (cache ${cachedInsight ? 'outdated' : 'missing'})`)

    // Fetch recent retrospectives
    const { data: retrospectives, error: retroError } = await supabase
      .from('retrospectives')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .limit(limit) as { data: Array<{ id: string; title: string | null; created_at: string }> | null; error: any }

    if (retroError || !retrospectives || retrospectives.length < 2) {
      console.error('❌ Error fetching retrospectives:', retroError)
      return NextResponse.json(
        {
          error: 'Failed to fetch retrospectives',
          userMessage: 'Unable to load your retrospectives. Please try again later.',
          details: retroError?.message
        },
        { status: 500 }
      )
    }

    console.log(`📝 Fetched ${retrospectives.length} retrospectives with data`)

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
    console.log('🤖 Generating AI insights...')
    let patterns, sentiment

    try {
      [patterns, sentiment] = await Promise.all([
        analyzePatterns(retrospectivesWithData),
        analyzeSentiment(retrospectivesWithData.map(r => ({
          created_at: r.created_at,
          keeps: r.keeps,
          problems: r.problems
        })))
      ])
      console.log('✅ AI insights generated successfully')
    } catch (aiError: any) {
      console.error('❌ Error generating AI insights:', aiError)
      return NextResponse.json(
        {
          error: 'Failed to generate AI insights',
          userMessage: 'Our AI service is temporarily unavailable. Please try again in a few moments.',
          details: aiError.message
        },
        { status: 500 }
      )
    }

    // Combine results - keep only theme and category for frontend
    const combinedInsights = {
      wellbeingScore: sentiment.wellbeingScore || 50,
      wellbeingTrend: sentiment.sentimentTrend || 'stable',
      topThemes: (patterns.recurringThemes || []).map(t => ({
        theme: t.theme,
        category: t.category
      })),
      keyRecommendation: patterns.recommendations?.[0] || 'Keep reflecting regularly',
      trends: patterns.trends || [],
      allRecommendations: patterns.recommendations || []
    }

    // Save to cache (upsert) - gracefully handle if table doesn't exist
    try {
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
        console.warn('⚠️ Warning: Could not cache insights:', upsertError.message)
        // Don't fail if caching fails, just return the data
      } else {
        console.log(`💾 Cached insights for user ${userId}`)
      }
    } catch (cacheWriteError: any) {
      console.warn('⚠️ Cache table might not exist, skipping cache:', cacheWriteError.message)
      // Continue without caching if table doesn't exist
    }

    return NextResponse.json({
      ...combinedInsights,
      cached: false
    })
  } catch (error: any) {
    console.error('❌ Unexpected error in AI insights API:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate insights',
        userMessage: 'An unexpected error occurred while loading AI insights. Please try refreshing the page.',
        details: error.stack
      },
      { status: 500 }
    )
  }
}
