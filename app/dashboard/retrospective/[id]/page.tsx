'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { format } from 'date-fns'

type Keep = {
  id: string
  text: string
  order_index: number
}

type Problem = {
  id: string
  text: string
  order_index: number
}

type Try = {
  id: string
  text: string
  order_index: number
}

type Action = {
  id: string
  text: string
  is_completed: boolean
  completed_at: string | null
  order_index: number
}

type Retrospective = {
  id: string
  title: string | null
  period_type: 'weekly' | 'monthly'
  status: 'draft' | 'completed'
  created_at: string
  keeps: Keep[]
  problems: Problem[]
  tries: Try[]
  actions: Action[]
}

export default function RetrospectiveDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      fetchRetrospective()
    }
  }, [user, params.id])

  const fetchRetrospective = async () => {
    try {
      const { data: retro, error: retroError } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('id', params.id as string)
        .eq('user_id', user!.id)
        .single()

      if (retroError) throw retroError

      // Fetch all related data
      const [keepsRes, problemsRes, triesRes, actionsRes] = await Promise.all([
        supabase
          .from('keeps')
          .select('*')
          .eq('retrospective_id', retro.id)
          .order('order_index'),
        supabase
          .from('problems')
          .select('*')
          .eq('retrospective_id', retro.id)
          .order('order_index'),
        supabase
          .from('tries')
          .select('*')
          .eq('retrospective_id', retro.id)
          .order('order_index'),
        supabase
          .from('actions')
          .select('*')
          .eq('retrospective_id', retro.id)
          .order('order_index'),
      ])

      if (keepsRes.error) throw keepsRes.error
      if (problemsRes.error) throw problemsRes.error
      if (triesRes.error) throw triesRes.error
      if (actionsRes.error) throw actionsRes.error

      setRetrospective({
        ...retro,
        keeps: keepsRes.data || [],
        problems: problemsRes.data || [],
        tries: triesRes.data || [],
        actions: actionsRes.data || [],
      })
    } catch (error) {
      console.error('Error fetching retrospective:', error)
      alert('Retrospective not found or access denied')
      router.push('/dashboard/history')
    } finally {
      setLoading(false)
    }
  }

  const toggleAction = async (actionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('actions')
        .update({
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', actionId)

      if (error) throw error

      // Update local state
      setRetrospective((prev) =>
        prev
          ? {
              ...prev,
              actions: prev.actions.map((action) =>
                action.id === actionId
                  ? {
                      ...action,
                      is_completed: !currentStatus,
                      completed_at: !currentStatus ? new Date().toISOString() : null,
                    }
                  : action
              ),
            }
          : null
      )
    } catch (error) {
      console.error('Error toggling action:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading retrospective...</p>
        </div>
      </div>
    )
  }

  if (!retrospective) {
    return null
  }

  const completedActions = retrospective.actions.filter((a) => a.is_completed).length
  const totalActions = retrospective.actions.length
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/dashboard/history" className="hover:text-secondary">
            History
          </Link>
          <span>→</span>
          <span>Retrospective</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              {retrospective.title || `${retrospective.period_type === 'weekly' ? 'Weekly' : 'Monthly'} Retrospective`}
            </h1>
            <p className="text-gray-600">
              {format(new Date(retrospective.created_at), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                retrospective.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {retrospective.status}
            </span>
          </div>
        </div>
      </div>

      {/* KPTA Sections */}
      <div className="space-y-6 mb-8">
        {/* Keep Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">✨</span>
            <div>
              <h2 className="text-2xl font-bold text-status-success">Keep</h2>
              <p className="text-sm text-gray-600">What went well</p>
            </div>
          </div>
          {retrospective.keeps.length === 0 ? (
            <p className="text-gray-400 italic">No keeps added</p>
          ) : (
            <ul className="space-y-2">
              {retrospective.keeps.map((keep) => (
                <li key={keep.id} className="flex items-start gap-2">
                  <span className="text-status-success mt-1">•</span>
                  <span className="text-gray-700">{keep.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Problem Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🚧</span>
            <div>
              <h2 className="text-2xl font-bold text-status-warning">Problem</h2>
              <p className="text-sm text-gray-600">Challenges faced</p>
            </div>
          </div>
          {retrospective.problems.length === 0 ? (
            <p className="text-gray-400 italic">No problems added</p>
          ) : (
            <ul className="space-y-2">
              {retrospective.problems.map((problem) => (
                <li key={problem.id} className="flex items-start gap-2">
                  <span className="text-status-warning mt-1">•</span>
                  <span className="text-gray-700">{problem.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Try Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔬</span>
            <div>
              <h2 className="text-2xl font-bold text-secondary">Try</h2>
              <p className="text-sm text-gray-600">New approaches to experiment with</p>
            </div>
          </div>
          {retrospective.tries.length === 0 ? (
            <p className="text-gray-400 italic">No tries added</p>
          ) : (
            <ul className="space-y-2">
              {retrospective.tries.map((tryItem) => (
                <li key={tryItem.id} className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span className="text-gray-700">{tryItem.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              <div>
                <h2 className="text-2xl font-bold text-primary">Actions</h2>
                <p className="text-sm text-gray-600">Concrete to-do items</p>
              </div>
            </div>
            {totalActions > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <div className="text-xs text-gray-500">
                  {completedActions}/{totalActions} Complete
                </div>
              </div>
            )}
          </div>

          {retrospective.actions.length === 0 ? (
            <p className="text-gray-400 italic">No actions added</p>
          ) : (
            <div className="space-y-3">
              {retrospective.actions.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    action.is_completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-secondary'
                  }`}
                >
                  <button
                    onClick={() => toggleAction(action.id, action.is_completed)}
                    className="flex-shrink-0 mt-1"
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        action.is_completed
                          ? 'bg-status-success border-status-success'
                          : 'border-gray-300 hover:border-secondary'
                      }`}
                    >
                      {action.is_completed && <span className="text-white text-sm">✓</span>}
                    </div>
                  </button>
                  <span
                    className={`flex-1 ${
                      action.is_completed ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    {action.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link href="/dashboard/history" className="btn btn-outline">
          ← Back to History
        </Link>
      </div>
    </div>
  )
}
