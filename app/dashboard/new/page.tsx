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

    // When moving from Problem to Try, generate AI summary
    if (currentStep === 'problem') {
      setCurrentStep('try')
      await generateSummary()
      return
    }

    // After Try step, auto-generate actions
    if (currentStep === 'try') {
      await autoGenerateActions()
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
    const validTries = tries.filter(t => t.text.trim())
    const validProblems = problems.filter(p => p.text.trim()).map(p => p.text)

    if (validTries.length === 0) {
      setActions([])
      return
    }

    setAiLoading(true)
    try {
      const allActions: ActionItem[] = []

      for (const tryItem of validTries) {
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
      // Fallback: create one action per try
      const fallbackActions = validTries.map(tryItem => {
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
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-primary mb-2">Action Items</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {aiLoading
                ? 'AI is generating action items from your tries...'
                : 'Review and set deadlines for your action items'}
            </p>
          </div>

          {aiLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-ios-body text-ios-label-secondary">Generating actions...</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No actions generated. Please add some Try items first.
                </div>
              ) : (
                actions.map((action, index) => (
                  <div key={action.tempId} className="card flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-2">
                        <Icon name="target" size={20} className="text-primary mt-1" />
                        <p className="text-ios-body text-ios-label-primary flex-1">{action.text}</p>
                      </div>
                      <div className="flex items-center space-x-2">
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
                ))
              )}
            </div>
          )}
        </div>
      )
    }

    // Special rendering for Try step with AI summary
    if (currentStep === 'try') {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔬</div>
            <h2 className="text-3xl font-bold text-secondary mb-2">Try</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based on AI insights, what new approaches will you experiment with?
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Insights Panel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="sparkles" size={20} className="text-ios-purple" />
                <h3 className="text-ios-title-3 text-ios-label-primary font-semibold">AI Analysis</h3>
              </div>

              {aiLoading ? (
                <div className="card text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
                    <div className="w-8 h-8 border-3 border-ios-purple/30 border-t-ios-purple rounded-full animate-spin" />
                  </div>
                  <p className="text-ios-body text-ios-label-secondary">Analyzing...</p>
                </div>
              ) : aiSummary ? (
                <div className="space-y-3">
                  {/* Summary */}
                  {aiSummary.summary && (
                    <div className="card bg-gradient-to-br from-ios-blue/5 to-ios-teal/5 border border-ios-blue/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="doc.text" size={16} className="text-ios-blue" />
                        <h4 className="text-ios-subheadline font-semibold text-ios-blue">Summary</h4>
                      </div>
                      <p className="text-ios-body text-ios-label-primary leading-relaxed">
                        {aiSummary.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Insight */}
                  {aiSummary.keyInsight && (
                    <div className="card bg-gradient-to-br from-ios-yellow/10 to-ios-orange/10 border border-ios-yellow/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="lightbulb.fill" size={16} className="text-ios-orange" />
                        <h4 className="text-ios-subheadline font-semibold text-ios-orange">Key Focus</h4>
                      </div>
                      <p className="text-ios-body text-ios-label-primary font-medium leading-relaxed">
                        {aiSummary.keyInsight}
                      </p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {aiSummary.suggestions.length > 0 && (
                    <div className="card bg-gradient-to-br from-ios-purple/5 to-ios-purple/10 border border-ios-purple/20">
                      <div className="flex items-center space-x-2 mb-3">
                        <Icon name="arrow.right.circle.fill" size={16} className="text-ios-purple" />
                        <h4 className="text-ios-subheadline font-semibold text-ios-purple">What to Try</h4>
                      </div>
                      <div className="space-y-2">
                        {aiSummary.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => useSuggestion(suggestion)}
                            className="w-full text-left p-3 rounded-lg bg-white hover:bg-ios-purple/5 border border-ios-purple/10 hover:border-ios-purple/30 transition-all group"
                          >
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-ios-purple/20 flex items-center justify-center mt-0.5">
                                <span className="text-ios-caption2 font-bold text-ios-purple">{idx + 1}</span>
                              </div>
                              <span className="text-ios-body text-ios-label-primary leading-relaxed flex-1">
                                {suggestion}
                              </span>
                              <Icon name="plus.circle" size={18} className="text-ios-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-ios-caption2 text-ios-label-tertiary mt-2 text-center">
                        💡 Click any suggestion to add it to your Tries
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Try Input Panel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="pencil" size={20} className="text-secondary" />
                <h3 className="text-ios-title-3 text-ios-label-primary font-semibold">Your Tries</h3>
              </div>

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">New Retrospective</h1>

        {/* Period Type and Date Range */}
        <div className="mb-6 space-y-4">
          {/* Period Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodTypeChange('weekly')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  periodType === 'weekly'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => handlePeriodTypeChange('monthly')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  periodType === 'monthly'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input"
                max={endDate || undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="input"
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Auto-generated Title */}
          {title && (
            <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retrospective Title
              </label>
              <div className="flex items-center space-x-2">
                <Icon name="calendar" size={18} className="text-secondary" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-lg font-medium text-gray-900"
                  placeholder="Edit title..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStepIndex ? 'bg-secondary' : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="card mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0 || aiLoading}
          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={aiLoading}
            className="btn btn-primary disabled:opacity-50"
          >
            {aiLoading ? 'Processing...' : 'Next →'}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || aiLoading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Retrospective ✓'}
          </button>
        )}
      </div>
    </div>
  )
}
