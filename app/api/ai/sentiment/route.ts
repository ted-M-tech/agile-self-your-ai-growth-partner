import { NextRequest, NextResponse } from 'next/server'
import { analyzeSentiment } from '@/lib/ai/services'
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
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .limit(limit) as { data: Array<{ id: string; created_at: string }> | null; error: any }

    if (retroError) {
      return NextResponse.json(
        { error: 'Failed to fetch retrospectives' },
        { status: 500 }
      )
    }

    if (!retrospectives || retrospectives.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 retrospectives for sentiment analysis' },
        { status: 400 }
      )
    }

    // Fetch keeps and problems for each retrospective
    const retrospectivesWithData = await Promise.all(
      (retrospectives || []).map(async (retro) => {
        const [keepsResult, problemsResult] = await Promise.all([
          supabase
            .from('keeps')
            .select('text')
            .eq('retrospective_id', retro.id),
          supabase
            .from('problems')
            .select('text')
            .eq('retrospective_id', retro.id)
        ])

        const keeps = keepsResult.data as Array<{ text: string }> | null
        const problems = problemsResult.data as Array<{ text: string }> | null

        return {
          created_at: retro.created_at,
          keeps: keeps?.map(k => k.text) || [],
          problems: problems?.map(p => p.text) || []
        }
      })
    )

    // Generate sentiment analysis
    const sentiment = await analyzeSentiment(retrospectivesWithData)

    return NextResponse.json(sentiment)
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
}
