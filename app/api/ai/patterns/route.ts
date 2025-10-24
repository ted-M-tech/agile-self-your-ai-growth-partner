import { NextRequest, NextResponse } from 'next/server'
import { analyzePatterns } from '@/lib/ai/services'
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

    // Fetch recent retrospectives
    const { data: retrospectives, error: retroError } = await supabase
      .from('retrospectives')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .limit(limit) as { data: Array<{ id: string; title: string | null; created_at: string }> | null; error: any }

    if (retroError) {
      console.error('Error fetching retrospectives:', retroError)
      return NextResponse.json(
        { error: 'Failed to fetch retrospectives', details: retroError.message },
        { status: 500 }
      )
    }

    console.log(`Found ${retrospectives?.length || 0} retrospectives for user ${userId}`)

    if (!retrospectives || retrospectives.length < 2) {
      return NextResponse.json(
        { error: `Need at least 2 retrospectives for pattern analysis (found ${retrospectives?.length || 0})` },
        { status: 400 }
      )
    }

    // Fetch all keeps, problems, tries for each retrospective
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

    // Generate pattern analysis
    const analysis = await analyzePatterns(retrospectivesWithData)

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Error analyzing patterns:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze patterns' },
      { status: 500 }
    )
  }
}
