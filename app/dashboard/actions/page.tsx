'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { format } from 'date-fns'

type Action = {
  id: string
  text: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
  retrospective_id: string
  retrospectives?: {
    title: string | null
    created_at: string
  }
}

type FilterType = 'all' | 'pending' | 'completed'

export default function ActionsPage() {
  const { user } = useUser()
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending')

  useEffect(() => {
    if (user) {
      fetchActions()
    }
  }, [user, filter])

  const fetchActions = async () => {
    try {
      let query = supabase
        .from('actions')
        .select(`
          *,
          retrospectives (
            title,
            created_at
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('is_completed', false)
      } else if (filter === 'completed') {
        query = query.eq('is_completed', true)
      }

      const { data, error } = await query

      if (error) throw error
      setActions(data || [])
    } catch (error) {
      console.error('Error fetching actions:', error)
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
      setActions(
        actions.map((action) =>
          action.id === actionId
            ? {
                ...action,
                is_completed: !currentStatus,
                completed_at: !currentStatus ? new Date().toISOString() : null,
              }
            : action
        )
      )
    } catch (error) {
      console.error('Error toggling action:', error)
    }
  }

  const deleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return

    try {
      const { error } = await supabase.from('actions').delete().eq('id', actionId)

      if (error) throw error

      setActions(actions.filter((action) => action.id !== actionId))
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }

  const pendingCount = actions.filter((a) => !a.is_completed).length
  const completedCount = actions.filter((a) => a.is_completed).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Action Items</h1>
        <p className="text-gray-600">Track and complete your commitments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="text-2xl font-bold text-primary">{actions.length}</div>
          <div className="text-sm text-gray-600">Total Actions</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-status-warning">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-status-success">{completedCount}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-status-warning text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-status-success text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Actions List */}
      {actions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No actions found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'pending'
              ? "You don't have any pending actions. Great job!"
              : filter === 'completed'
              ? "You haven't completed any actions yet. Keep going!"
              : 'Create a retrospective to add action items'}
          </p>
          <Link href="/dashboard/new" className="btn btn-primary inline-block">
            Create Retrospective
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`card hover:shadow-lg transition-all ${
                action.is_completed ? 'bg-gray-50 opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
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

                {/* Content */}
                <div className="flex-1">
                  <p
                    className={`text-lg mb-2 ${
                      action.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {action.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>
                      Created: {format(new Date(action.created_at), 'MMM d, yyyy')}
                    </span>
                    {action.is_completed && action.completed_at && (
                      <span className="text-status-success">
                        Completed: {format(new Date(action.completed_at), 'MMM d, yyyy')}
                      </span>
                    )}
                    {action.retrospectives && (
                      <Link
                        href={`/dashboard/retrospective/${action.retrospective_id}`}
                        className="text-secondary hover:text-secondary-dark"
                      >
                        View Retrospective →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteAction(action.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete action"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
