'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'

type KPTAItem = {
  text: string
  tempId: string
}

export default function NewRetrospectivePage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'keep' | 'problem' | 'try' | 'action'>('keep')
  const [title, setTitle] = useState('')
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly')

  // KPTA data
  const [keeps, setKeeps] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [problems, setProblems] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [tries, setTries] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])
  const [actions, setActions] = useState<KPTAItem[]>([{ text: '', tempId: '1' }])

  const addItem = (type: 'keep' | 'problem' | 'try' | 'action') => {
    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
      action: setActions,
    }[type]

    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
      action: actions,
    }[type]

    setter([...current, { text: '', tempId: Date.now().toString() }])
  }

  const updateItem = (type: 'keep' | 'problem' | 'try' | 'action', index: number, text: string) => {
    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
      action: actions,
    }[type]

    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
      action: setActions,
    }[type]

    const updated = [...current]
    updated[index] = { ...updated[index], text }
    setter(updated)
  }

  const removeItem = (type: 'keep' | 'problem' | 'try' | 'action', index: number) => {
    const current = {
      keep: keeps,
      problem: problems,
      try: tries,
      action: actions,
    }[type]

    const setter = {
      keep: setKeeps,
      problem: setProblems,
      try: setTries,
      action: setActions,
    }[type]

    if (current.length > 1) {
      setter(current.filter((_, i) => i !== index))
    }
  }

  const handleNext = () => {
    const steps: Array<'keep' | 'problem' | 'try' | 'action'> = ['keep', 'problem', 'try', 'action']
    const currentIndex = steps.indexOf(currentStep)
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

      // Insert actions
      const actionsToInsert = actions
        .filter(a => a.text.trim())
        .map((a, i) => ({
          user_id: user.id,
          retrospective_id: retro.id,
          text: a.text,
          order_index: i,
        }))

      if (actionsToInsert.length > 0) {
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
      try: {
        title: 'Try',
        icon: '🔬',
        color: 'secondary',
        prompt: 'Based on the problems and keeps, what new approach will I experiment with?',
        items: tries,
        setter: setTries,
      },
      action: {
        title: 'Action',
        icon: '🎯',
        color: 'primary',
        prompt: 'Convert each Try into specific, concrete to-do items you can actually complete.',
        items: actions,
        setter: setActions,
      },
    }

    const config = stepConfig[currentStep]

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
                onChange={(e) => updateItem(currentStep, index, e.target.value)}
                placeholder={`Enter ${config.title.toLowerCase()} #${index + 1}...`}
                className="textarea flex-1"
                rows={3}
              />
              {config.items.length > 1 && (
                <button
                  onClick={() => removeItem(currentStep, index)}
                  className="text-red-500 hover:text-red-700 px-3"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => addItem(currentStep)}
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

        {/* Title and Period */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week of Oct 16-22"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period Type
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as 'weekly' | 'monthly')}
              className="input"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
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
          disabled={currentStepIndex === 0}
          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button onClick={handleNext} className="btn btn-primary">
            Next →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Retrospective ✓'}
          </button>
        )}
      </div>
    </div>
  )
}
