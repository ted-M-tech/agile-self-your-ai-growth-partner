import { NextRequest, NextResponse } from 'next/server'
import { summarizeRetrospective } from '@/lib/ai/services'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { retrospectiveId, userId } = await req.json()

    if (!retrospectiveId || !userId) {
      return NextResponse.json(
        { error: 'Missing retrospectiveId or userId' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch retrospective data
    const { data: retrospective, error: retroError } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('id', retrospectiveId)
      .eq('user_id', userId)
      .single()

    if (retroError || !retrospective) {
      return NextResponse.json(
        { error: 'Retrospective not found' },
        { status: 404 }
      )
    }

    // Fetch keeps, problems, tries
    const [
      { data: keeps },
      { data: problems },
      { data: tries }
    ] = await Promise.all([
      supabase
        .from('keeps')
        .select('text')
        .eq('retrospective_id', retrospectiveId)
        .order('order_index'),
      supabase
        .from('problems')
        .select('text')
        .eq('retrospective_id', retrospectiveId)
        .order('order_index'),
      supabase
        .from('tries')
        .select('text')
        .eq('retrospective_id', retrospectiveId)
        .order('order_index')
    ])

    // Generate AI summary
    const summary = await summarizeRetrospective(
      keeps?.map(k => k.text) || [],
      problems?.map(p => p.text) || [],
      tries?.map(t => t.text) || []
    )

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
