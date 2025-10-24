'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { format } from 'date-fns'
import Icon from '@/components/Icon'

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
      <div className="flex items-center justify-center h-96">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-12 h-12 border-3 border-ios-blue/30 border-t-ios-blue rounded-full animate-spin" />
          </div>
          <p className="text-ios-footnote text-ios-label-secondary">Loading actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-8 animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-ios-large-title text-ios-label-primary mb-2">Actions</h1>
        <p className="text-ios-body text-ios-label-secondary">Track and complete your commitments</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card text-center">
          <div className="text-ios-title-1 font-bold text-ios-label-primary mb-1">
            {actions.length}
          </div>
          <div className="text-ios-caption-1 text-ios-label-secondary font-medium uppercase tracking-wide">
            Total
          </div>
        </div>
        <div className="stat-card text-center">
          <div className="text-ios-title-1 font-bold text-ios-orange mb-1">
            {pendingCount}
          </div>
          <div className="text-ios-caption-1 text-ios-label-secondary font-medium uppercase tracking-wide">
            Pending
          </div>
        </div>
        <div className="stat-card text-center">
          <div className="text-ios-title-1 font-bold text-ios-green mb-1">
            {completedCount}
          </div>
          <div className="text-ios-caption-1 text-ios-label-secondary font-medium uppercase tracking-wide">
            Completed
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-full text-ios-subheadline font-semibold whitespace-nowrap transition-all ${
            filter === 'pending'
              ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/30'
              : 'bg-ios-gray-6 text-ios-label-secondary hover:bg-ios-gray-5'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-ios-subheadline font-semibold whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/30'
              : 'bg-ios-gray-6 text-ios-label-secondary hover:bg-ios-gray-5'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-full text-ios-subheadline font-semibold whitespace-nowrap transition-all ${
            filter === 'completed'
              ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/30'
              : 'bg-ios-gray-6 text-ios-label-secondary hover:bg-ios-gray-5'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Actions List - iOS Reminders Style */}
      {actions.length === 0 ? (
        <div className="card-flat text-center py-16 animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ios-blue/10 mb-4">
            <Icon name="target" size={40} className="text-ios-blue" />
          </div>
          <h3 className="text-ios-title-3 text-ios-label-primary mb-2">No actions found</h3>
          <p className="text-ios-body text-ios-label-secondary mb-8 max-w-sm mx-auto">
            {filter === 'pending'
              ? "You don't have any pending actions. Great job!"
              : filter === 'completed'
              ? "You haven't completed any actions yet. Keep going!"
              : 'Create a retrospective to add action items'}
          </p>
          <Link href="/dashboard/new" className="btn btn-primary inline-flex items-center space-x-2">
            <Icon name="plus.circle.fill" size={18} />
            <span>Create Retrospective</span>
          </Link>
        </div>
      ) : (
        <div className="card-flat divide-y divide-ios-gray-5 overflow-hidden">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="group relative"
              style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeIn 0.3s ease-out forwards'
              }}
            >
              <div className="flex items-start gap-4 p-4 transition-all hover:bg-ios-gray-6/50 active:bg-ios-gray-6">
                {/* iOS-style Circular Checkbox */}
                <button
                  onClick={() => toggleAction(action.id, action.is_completed)}
                  className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-ios-blue/50 rounded-full"
                >
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${action.is_completed
                      ? 'bg-ios-blue border-ios-blue'
                      : 'border-ios-gray-3 hover:border-ios-blue'
                    }
                  `}>
                    {action.is_completed && (
                      <Icon name="checkmark.circle.fill" size={24} className="text-white -m-0.5" />
                    )}
                  </div>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-ios-body mb-1 transition-all
                    ${action.is_completed
                      ? 'line-through text-ios-label-tertiary'
                      : 'text-ios-label-primary'
                    }
                  `}>
                    {action.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-ios-caption-1 text-ios-label-secondary">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" size={12} />
                      {format(new Date(action.created_at), 'MMM d')}
                    </span>
                    {action.is_completed && action.completed_at && (
                      <>
                        <span className="text-ios-gray-4">•</span>
                        <span className="flex items-center gap-1 text-ios-green">
                          <Icon name="checkmark.circle.fill" size={12} />
                          {format(new Date(action.completed_at), 'MMM d')}
                        </span>
                      </>
                    )}
                    {action.retrospectives && (
                      <>
                        <span className="text-ios-gray-4">•</span>
                        <Link
                          href={`/dashboard/retrospective/${action.retrospective_id}`}
                          className="text-ios-blue hover:text-ios-blue/80 flex items-center gap-1"
                        >
                          <Icon name="doc.text" size={12} />
                          <span>Retrospective</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete Button - Hidden until hover */}
                <button
                  onClick={() => deleteAction(action.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  title="Delete action"
                >
                  <div className="p-2 rounded-lg hover:bg-ios-red/10 active:bg-ios-red/20 transition-colors">
                    <Icon name="trash.fill" size={18} className="text-ios-red" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
