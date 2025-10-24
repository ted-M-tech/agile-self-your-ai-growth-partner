import { NextRequest, NextResponse } from 'next/server'
import { generateSuggestions } from '@/lib/ai/services'
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

    // Verify retrospective belongs to user
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

    // Fetch keeps and problems
    const [
      { data: keeps },
      { data: problems }
    ] = await Promise.all([
      supabase
        .from('keeps')
        .select('id, text')
        .eq('retrospective_id', retrospectiveId)
        .order('order_index'),
      supabase
        .from('problems')
        .select('id, text')
        .eq('retrospective_id', retrospectiveId)
        .order('order_index')
    ])

    // Generate AI suggestions
    const suggestions = await generateSuggestions(
      problems || [],
      keeps || []
    )

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
