'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { summarizeKeepsAndProblems, generateActionsFromTry } from '@/lib/ai/services'
import Icon from '@/components/Icon'

type KPTAItem = {
  text: string
  tempId: string
}

type ActionItem = {
  text: string
  tempId: string
  deadline: string
  tryId?: string
}

type TryWithSelection = KPTAItem & {
  selected: boolean
}

export default function NewRetrospectivePage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'keep' | 'problem' | 'try' | 'action'>('keep')
  const [title, setTitle] = useState('')
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // KPTA data
  const [keeps, setKeeps] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [problems, setProblems] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [tries, setTries] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [selectedTries, setSelectedTries] = useState<Set<string>>(new Set())

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<{
    summary: string
    keyInsight: string
    suggestions: string[]
    overallSentiment: string
  } | null>(null)

  // Initialize dates on mount
  useEffect(() => {
    const today = new Date()
    const end = new Date(today)
    const start = new Date(today)
    start.setDate(today.getDate() - 7) // Default to weekly

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(endStr)
    setTitle(generateTitleFromDates(startStr, endStr))
  }, [])

  const addItem = (type: 'keep' | 'problem' | 'try') => {
    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
    }[type]

    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
    }[type]

    setter([...current, { text: '', tempId: Date.now().toString() }])
  }

  const updateItem = (type: 'keep' | 'problem' | 'try', index: number, text: string) => {
    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
    }[type]

    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
    }[type]

    const updated = [...current]
    updated[index] = { ...updated[index], text }
    setter(updated)
  }

  const removeItem = (type: 'keep' | 'problem' | 'try', index: number) => {
    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
    }[type]

    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
    }[type]

    if (current.length > 1) {
      setter(current.filter((_, i) => i !== index))
    }
  }

  const updateActionDeadline = (index: number, deadline: string) => {
    const updated = [...actions]
    updated[index] = { ...updated[index], deadline }
    setActions(updated)
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    const steps: Array<'keep' | 'problem' | 'try' | 'action'> = ['keep', 'problem', 'try', 'action']
    const currentIndex = steps.indexOf(currentStep)

    // If transitioning from Try to Action, auto-select all valid tries
    if (currentStep === 'try' && currentIndex < steps.length - 1) {
      const validTryIds = tries.filter(t => t.text.trim()).map(t => t.tempId)
      setSelectedTries(new Set(validTryIds))
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: Array<'keep' | 'problem' | 'try' | 'action'> = ['keep', 'problem', 'try', 'action']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const generateSummary = async () => {
    const validKeeps = keeps.filter(k => k.text.trim()).map(k => k.text)
    const validProblems = problems.filter(p => p.text.trim()).map(p => p.text)

    console.log('Generating summary with:', { validKeeps, validProblems })

    if (validKeeps.length === 0 && validProblems.length === 0) {
      setAiSummary({
        summary: 'Add some Keeps or Problems to get AI insights',
        keyInsight: 'Enter your wins and challenges first',
        suggestions: [],
        overallSentiment: 'neutral'
      })
      return
    }

    setAiLoading(true)
    try {
      const summary = await summarizeKeepsAndProblems(validKeeps, validProblems)
      console.log('Summary generated:', summary)
      setAiSummary(summary)
    } catch (error: any) {
      console.error('Error generating summary:', error)
      console.error('Error details:', error.message, error.stack)

      // Provide helpful fallback based on what user entered
      const hasMoreKeeps = validKeeps.length > validProblems.length
      setAiSummary({
        summary: hasMoreKeeps
          ? `You have ${validKeeps.length} wins and ${validProblems.length} challenges this period.`
          : `You're facing ${validProblems.length} challenges but also have ${validKeeps.length} wins.`,
        keyInsight: validProblems.length > 0
          ? `Focus on: ${validProblems[0]}`
          : `Build on: ${validKeeps[0]}`,
        suggestions: [
          ...(validProblems.length > 0 ? [`Address: ${validProblems[0]}`] : []),
          ...(validKeeps.length > 0 ? [`Continue: ${validKeeps[0]}`] : [])
        ],
        overallSentiment: hasMoreKeeps ? 'positive' : 'mixed'
      })
    } finally {
      setAiLoading(false)
    }
  }

  const useSuggestion = (suggestion: string) => {
    // Add suggestion to tries if not already there
    const alreadyExists = tries.some(t => t.text.trim() === suggestion.trim())
    if (!alreadyExists) {
      setTries([...tries, { text: suggestion, tempId: Date.now().toString() }])
    }
  }

  // Auto-generate title from dates (moved before useEffect)
  const generateTitleFromDates = (start: string, end: string) => {
    if (!start || !end) return ''

    const startDate = new Date(start)
    const endDate = new Date(end)

    const formatDate = (date: Date) => {
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      return `${month} ${day}`
    }

    const startMonth = startDate.getMonth()
    const endMonth = endDate.getMonth()
    const year = endDate.getFullYear()

    // Same month
    if (startMonth === endMonth) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}, ${year}`
    }

    // Different months
    return `${formatDate(startDate)} - ${formatDate(endDate)}, ${year}`
  }

  // Update title when dates change
  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    if (date && endDate) {
      setTitle(generateTitleFromDates(date, endDate))
    }
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    if (startDate && date) {
      setTitle(generateTitleFromDates(startDate, date))
    }
  }

  // Set default dates when period type changes
  const handlePeriodTypeChange = (type: 'weekly' | 'monthly') => {
    setPeriodType(type)

    const today = new Date()
    const end = new Date(today)
    const start = new Date(today)

    if (type === 'weekly') {
      start.setDate(today.getDate() - 7)
    } else {
      start.setMonth(today.getMonth() - 1)
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(endStr)
    setTitle(generateTitleFromDates(startStr, endStr))
  }

  const autoGenerateActions = async () => {
    // Only generate actions for selected tries
    const selectedValidTries = tries.filter(t => t.text.trim() && selectedTries.has(t.tempId))
    const validProblems = problems.filter(p => p.text.trim()).map(p => p.text)

    if (selectedValidTries.length === 0) {
      setActions([])
      return
    }

    setAiLoading(true)
    try {
      const allActions: ActionItem[] = []

      for (const tryItem of selectedValidTries) {
        const generatedActions = await generateActionsFromTry(tryItem.text, validProblems)

        generatedActions.forEach(action => {
          const deadlineDate = new Date()
          deadlineDate.setDate(deadlineDate.getDate() + action.suggestedDeadlineDays)

          allActions.push({
            text: action.text,
            tempId: Date.now().toString() + Math.random(),
            deadline: deadlineDate.toISOString().split('T')[0],
            tryId: tryItem.tempId
          })
        })
      }

      setActions(allActions)
    } catch (error) {
      console.error('Error generating actions:', error)
      // Fallback: create one action per selected try
      const fallbackActions = selectedValidTries.map(tryItem => {
        const defaultDeadline = new Date()
        defaultDeadline.setDate(defaultDeadline.getDate() + 7)
        return {
          text: tryItem.text,
          tempId: Date.now().toString() + Math.random(),
          deadline: defaultDeadline.toISOString().split('T')[0],
          tryId: tryItem.tempId
        }
      })
      setActions(fallbackActions)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Create retrospective
      const { data: retro, error: retroError } = await supabase
        .from('retrospectives')
        .insert({
          user_id: user.id,
          title: title || `${periodType === 'weekly' ? 'Weekly' : 'Monthly'} Retrospective`,
          period_type: periodType,
          period_start_date: startDate || null,
          period_end_date: endDate || null,
          status: 'completed',
        })
        .select()
        .single()

      if (retroError) throw retroError

      // Insert keeps
      const keepsToInsert = keeps
        .filter(k => k.text.trim())
        .map((k, i) => ({
          retrospective_id: retro.id,
          text: k.text,
          order_index: i,
        }))

      if (keepsToInsert.length > 0) {
        const { error: keepsError } = await supabase.from('keeps').insert(keepsToInsert)
        if (keepsError) throw keepsError
      }

      // Insert problems
      const problemsToInsert = problems
        .filter(p => p.text.trim())
        .map((p, i) => ({
          retrospective_id: retro.id,
          text: p.text,
          order_index: i,
        }))

      if (problemsToInsert.length > 0) {
        const { error: problemsError } = await supabase.from('problems').insert(problemsToInsert)
        if (problemsError) throw problemsError
      }

      // Insert tries
      const triesToInsert = tries
        .filter(t => t.text.trim())
        .map((t, i) => ({
          retrospective_id: retro.id,
          text: t.text,
          order_index: i,
        }))

      if (triesToInsert.length > 0) {
        const { error: triesError } = await supabase.from('tries').insert(triesToInsert)
        if (triesError) throw triesError
      }

      // Insert actions with deadlines
      if (actions.length > 0) {
        const actionsToInsert = actions.map((a, i) => ({
          user_id: user.id,
          retrospective_id: retro.id,
          text: a.text,
          due_date: a.deadline,
          order_index: i,
        }))

        const { error: actionsError } = await supabase.from('actions').insert(actionsToInsert)
        if (actionsError) throw actionsError
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving retrospective:', error)
      alert('Failed to save retrospective. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {

    if (currentStep === 'action') {
      const validTries = tries.filter(t => t.text.trim())
      const hasSelectedTries = selectedTries.size > 0

      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-primary mb-2">Action Items</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select which tries to convert into concrete action items
            </p>
          </div>

          {/* Try Selection */}
          {validTries.length > 0 && (
            <div className="max-w-3xl mx-auto mb-6">
              <div className="card bg-gradient-to-br from-ios-blue/5 to-ios-teal/5 border-ios-blue/20">
                <h3 className="text-ios-headline font-semibold text-ios-label-primary mb-3 flex items-center space-x-2">
                  <Icon name="checkmark.circle" size={20} className="text-ios-blue" />
                  <span>Select Tries to Convert</span>
                </h3>
                <div className="space-y-2">
                  {validTries.map((tryItem) => (
                    <label
                      key={tryItem.tempId}
                      className={`flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedTries.has(tryItem.tempId)
                          ? 'bg-ios-blue/10 border-2 border-ios-blue'
                          : 'bg-white border-2 border-ios-gray-5 hover:border-ios-blue/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTries.has(tryItem.tempId)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedTries)
                          if (e.target.checked) {
                            newSelected.add(tryItem.tempId)
                          } else {
                            newSelected.delete(tryItem.tempId)
                          }
                          setSelectedTries(newSelected)
                        }}
                        className="mt-1 w-5 h-5 text-ios-blue rounded focus:ring-ios-blue"
                      />
                      <span className="flex-1 text-ios-body text-ios-label-primary">{tryItem.text}</span>
                    </label>
                  ))}
                </div>

                {/* Generate Actions Button */}
                <button
                  onClick={autoGenerateActions}
                  disabled={!hasSelectedTries || aiLoading}
                  className="btn btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Actions...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="sparkles" size={18} />
                      <span>Generate Actions ({selectedTries.size} selected)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Generated Actions */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {actions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {validTries.length === 0
                    ? 'Go back and add some Try items first'
                    : hasSelectedTries
                    ? 'Click "Generate Actions" to create action items from your selected tries'
                    : 'Select at least one Try item above to generate actions'}
                </p>
                <button
                  onClick={() => {
                    const defaultDeadline = new Date()
                    defaultDeadline.setDate(defaultDeadline.getDate() + 7)
                    setActions([{
                      text: '',
                      tempId: Date.now().toString(),
                      deadline: defaultDeadline.toISOString().split('T')[0]
                    }])
                  }}
                  className="btn btn-outline"
                >
                  <Icon name="plus.circle" size={18} className="inline mr-2" />
                  Or Add Manually
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-ios-headline font-semibold text-ios-label-primary">
                    Action Items ({actions.length})
                  </h3>
                  <button
                    onClick={autoGenerateActions}
                    disabled={!hasSelectedTries || aiLoading}
                    className="text-ios-blue text-ios-subheadline font-semibold disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                </div>
                {actions.map((action, index) => (
                  <div key={action.tempId} className="card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-2">
                          <Icon name="target" size={20} className="text-primary mt-3" />
                          <textarea
                            value={action.text}
                            onChange={(e) => {
                              const updated = [...actions]
                              updated[index] = { ...updated[index], text: e.target.value }
                              setActions(updated)
                            }}
                            placeholder="What action will you take?"
                            className="textarea flex-1"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center space-x-2 ml-7">
                          <Icon name="calendar" size={16} className="text-ios-label-secondary" />
                          <label className="text-ios-caption1 text-ios-label-secondary">Deadline:</label>
                          <input
                            type="date"
                            value={action.deadline}
                            onChange={(e) => updateActionDeadline(index, e.target.value)}
                            className="input text-sm"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeAction(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const defaultDeadline = new Date()
                    defaultDeadline.setDate(defaultDeadline.getDate() + 7)
                    setActions([...actions, {
                      text: '',
                      tempId: Date.now().toString(),
                      deadline: defaultDeadline.toISOString().split('T')[0]
                    }])
                  }}
                  className="btn btn-outline w-full"
                >
                  <Icon name="plus.circle" size={18} className="inline mr-2" />
                  Add Another Action
                </button>
              </>
            )}
          </div>
        </div>
      )
    }

    // Try step
    if (currentStep === 'try') {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔬</div>
            <h2 className="text-3xl font-bold text-secondary mb-2">Try</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What new approaches will you experiment with?
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {tries.map((item, index) => (
              <div key={item.tempId} className="flex gap-2">
                <textarea
                  value={item.text}
                  onChange={(e) => updateItem('try', index, e.target.value)}
                  placeholder={`Enter approach #${index + 1}...`}
                  className="textarea flex-1"
                  rows={3}
                />
                {tries.length > 1 && (
                  <button
                    onClick={() => removeItem('try', index)}
                    className="text-red-500 hover:text-red-700 px-3"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => addItem('try')}
              className="btn btn-outline w-full"
            >
              <Icon name="plus.circle" size={18} className="inline mr-2" />
              Add Another Try
            </button>
          </div>
        </div>
      )
    }

    const stepConfig = {
      keep: {
        title: 'Keep',
        icon: '✨',
        color: 'status-success',
        prompt: 'What went well? What positive habits or events should I continue?',
        items: keeps,
        setter: setKeeps,
      },
      problem: {
        title: 'Problem',
        icon: '🚧',
        color: 'status-warning',
        prompt: 'What obstacles or challenges did I face? What\'s holding me back?',
        items: problems,
        setter: setProblems,
      },
    }

    const config = stepConfig[currentStep as 'keep' | 'problem']

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{config.icon}</div>
          <h2 className={`text-3xl font-bold text-${config.color} mb-2`}>{config.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{config.prompt}</p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {config.items.map((item, index) => (
            <div key={item.tempId} className="flex gap-2">
              <textarea
                value={item.text}
                onChange={(e) => updateItem(currentStep as 'keep' | 'problem', index, e.target.value)}
                placeholder={`Enter ${config.title.toLowerCase()} #${index + 1}...`}
                className="textarea flex-1"
                rows={3}
              />
              {config.items.length > 1 && (
                <button
                  onClick={() => removeItem(currentStep as 'keep' | 'problem', index)}
                  className="text-red-500 hover:text-red-700 px-3"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => addItem(currentStep as 'keep' | 'problem')}
            className="btn btn-outline w-full"
          >
            + Add Another {config.title}
          </button>
        </div>
      </div>
    )
  }

  const steps = ['keep', 'problem', 'try', 'action']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header - Apple Style */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-ios-blue/10 to-ios-teal/10">
            <Icon name="sparkles" size={28} className="text-ios-blue" />
          </div>
          <div>
            <h1 className="text-ios-large-title text-ios-label-primary font-bold">New Retrospective</h1>
            <p className="text-ios-body text-ios-label-secondary">Reflect and grow from your experiences</p>
          </div>
        </div>

        {/* Apple-style Segmented Control for Period Type */}
        <div className="mb-4">
          <label className="block text-ios-caption1 font-semibold text-ios-label-secondary uppercase tracking-wide mb-2">
            Period
          </label>
          <div className="inline-flex p-1 bg-ios-gray-6 rounded-xl">
            <button
              onClick={() => handlePeriodTypeChange('weekly')}
              className={`px-6 py-2 rounded-lg text-ios-body font-semibold transition-all ${
                periodType === 'weekly'
                  ? 'bg-white text-ios-label-primary shadow-sm'
                  : 'text-ios-label-secondary'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handlePeriodTypeChange('monthly')}
              className={`px-6 py-2 rounded-lg text-ios-body font-semibold transition-all ${
                periodType === 'monthly'
                  ? 'bg-white text-ios-label-primary shadow-sm'
                  : 'text-ios-label-secondary'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Date Range - Minimal Apple Style */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-ios-caption1 font-semibold text-ios-label-secondary uppercase tracking-wide mb-2">
              Start
            </label>
            <div className="relative">
              <Icon name="calendar" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-label-tertiary pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input pl-10 text-ios-body"
                max={endDate || undefined}
              />
            </div>
          </div>
          <div>
            <label className="block text-ios-caption1 font-semibold text-ios-label-secondary uppercase tracking-wide mb-2">
              End
            </label>
            <div className="relative">
              <Icon name="calendar" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ios-label-tertiary pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="input pl-10 text-ios-body"
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Auto-generated Title - Subtle */}
        <div className="p-4 bg-gradient-to-br from-ios-purple/5 to-ios-pink/5 rounded-2xl border border-ios-purple/10">
          <div className="flex items-center space-x-2">
            <Icon name="doc.text" size={18} className="text-ios-purple" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-ios-headline font-semibold text-ios-label-primary placeholder:text-ios-label-tertiary"
              placeholder="Enter title..."
            />
          </div>
        </div>
      </div>

      {/* Progress Indicator - Minimal */}
      <div className="mb-6">
        <div className="flex items-center justify-between space-x-4">
          {steps.map((step, index) => (
            <div key={step} className="flex-1">
              <div className={`h-1 rounded-full transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'bg-gradient-to-r from-ios-blue to-ios-teal'
                  : 'bg-ios-gray-5'
              }`} />
              <p className={`text-ios-caption2 mt-1 text-center capitalize ${
                index === currentStepIndex
                  ? 'text-ios-blue font-semibold'
                  : index < currentStepIndex
                    ? 'text-ios-label-secondary'
                    : 'text-ios-label-tertiary'
              }`}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="card mb-8">
        {renderStep()}
      </div>

      {/* Navigation - Apple Style */}
      <div className="flex items-center justify-between gap-3">
        {currentStepIndex > 0 ? (
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0 || aiLoading}
            className="btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Icon name="chevron.left" size={16} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={aiLoading}
            className="btn btn-primary disabled:opacity-50 flex items-center space-x-2"
          >
            <span>Continue</span>
            <Icon name="chevron.right" size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || aiLoading}
            className="btn btn-secondary disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="checkmark.circle.fill" size={18} />
                <span>Complete</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
