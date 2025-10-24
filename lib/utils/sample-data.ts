import { supabase } from '@/lib/supabase/client'

export async function createSampleRetrospective(userId: string) {
  try {
    // Create a sample retrospective
    const { data: retrospective, error: retroError } = await supabase
      .from('retrospectives')
      .insert({
        user_id: userId,
        title: 'My First Week Retrospective',
        period_type: 'weekly',
        status: 'completed',
        period_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (retroError) throw retroError
    if (!retrospective) throw new Error('Failed to create retrospective')

    // Sample Keeps (things that went well)
    const keeps = [
      'Completed all planned tasks for the sprint',
      'Good communication with team members',
      'Learned a new technology',
    ]

    // Sample Problems (challenges faced)
    const problems = [
      'Time management could be better',
      'Too many meetings disrupted focus time',
    ]

    // Sample Tries (new approaches to experiment with)
    const tries = [
      'Use time-blocking technique for better focus',
      'Schedule dedicated focus hours in the calendar',
      'Start a daily learning routine',
    ]

    // Insert Keeps
    const keepsData = keeps.map((text, index) => ({
      retrospective_id: retrospective.id,
      text,
      order_index: index,
    }))

    const { error: keepsError } = await supabase
      .from('keeps')
      .insert(keepsData)

    if (keepsError) throw keepsError

    // Insert Problems
    const problemsData = problems.map((text, index) => ({
      retrospective_id: retrospective.id,
      text,
      order_index: index,
    }))

    const { error: problemsError } = await supabase
      .from('problems')
      .insert(problemsData)

    if (problemsError) throw problemsError

    // Insert Tries
    const triesData = tries.map((text, index) => ({
      retrospective_id: retrospective.id,
      text,
      order_index: index,
    }))

    const { data: insertedTries, error: triesError } = await supabase
      .from('tries')
      .insert(triesData)
      .select()

    if (triesError) throw triesError
    if (!insertedTries) throw new Error('Failed to create tries')

    // Sample Actions (concrete action items derived from tries)
    const actions = [
      {
        try_id: insertedTries[0].id,
        text: 'Block 2-hour focus sessions every morning',
        is_completed: true,
      },
      {
        try_id: insertedTries[0].id,
        text: 'Use Pomodoro timer for deep work',
        is_completed: false,
      },
      {
        try_id: insertedTries[1].id,
        text: 'Mark 9-11 AM as "Do Not Disturb" in calendar',
        is_completed: false,
      },
      {
        try_id: insertedTries[2].id,
        text: 'Spend 30 minutes daily on learning',
        is_completed: true,
      },
    ]

    const actionsData = actions.map((action, index) => ({
      user_id: userId,
      retrospective_id: retrospective.id,
      try_id: action.try_id,
      text: action.text,
      is_completed: action.is_completed,
      completed_at: action.is_completed ? new Date().toISOString() : null,
      order_index: index,
    }))

    const { error: actionsError } = await supabase
      .from('actions')
      .insert(actionsData)

    if (actionsError) throw actionsError

    return { success: true, retrospective }
  } catch (error) {
    console.error('Error creating sample retrospective:', error)
    return { success: false, error }
  }
}
