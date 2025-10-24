'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { format } from 'date-fns'

type Retrospective = {
  id: string
  title: string | null
  period_type: 'weekly' | 'monthly'
  status: 'draft' | 'completed'
  created_at: string
  keeps_count?: number
  problems_count?: number
  tries_count?: number
  actions_count?: number
  completed_actions_count?: number
}

export default function HistoryPage() {
  const { user } = useUser()
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      fetchRetrospectives()
    }
  }, [user])

  const fetchRetrospectives = async () => {
    try {
      const { data, error } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch counts for each retrospective
      const retrospectivesWithCounts = await Promise.all(
        (data || []).map(async (retro) => {
          const [keepsRes, problemsRes, triesRes, actionsRes, completedActionsRes] =
            await Promise.all([
              supabase
                .from('keeps')
                .select('*', { count: 'exact', head: true })
                .eq('retrospective_id', retro.id),
              supabase
                .from('problems')
                .select('*', { count: 'exact', head: true })
                .eq('retrospective_id', retro.id),
              supabase
                .from('tries')
                .select('*', { count: 'exact', head: true })
                .eq('retrospective_id', retro.id),
              supabase
                .from('actions')
                .select('*', { count: 'exact', head: true })
                .eq('retrospective_id', retro.id),
              supabase
                .from('actions')
                .select('*', { count: 'exact', head: true })
                .eq('retrospective_id', retro.id)
                .eq('is_completed', true),
            ])

          return {
            ...retro,
            keeps_count: keepsRes.count || 0,
            problems_count: problemsRes.count || 0,
            tries_count: triesRes.count || 0,
            actions_count: actionsRes.count || 0,
            completed_actions_count: completedActionsRes.count || 0,
          }
        })
      )

      setRetrospectives(retrospectivesWithCounts)
    } catch (error) {
      console.error('Error fetching retrospectives:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteRetrospective = async (id: string) => {
    if (!confirm('Are you sure you want to delete this retrospective? This will also delete all associated data.')) {
      return
    }

    try {
      const { error } = await supabase.from('retrospectives').delete().eq('id', id)

      if (error) throw error

      setRetrospectives(retrospectives.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Error deleting retrospective:', error)
      alert('Failed to delete retrospective')
    }
  }

  const filteredRetrospectives = retrospectives.filter((retro) => {
    if (!searchQuery) return true
    const title = retro.title || `${retro.period_type} retrospective`
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Retrospective History</h1>
        <p className="text-gray-600">Review your growth journey over time</p>
      </div>

      {/* Search Bar */}
      {retrospectives.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search retrospectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input max-w-md"
          />
        </div>
      )}

      {/* Retrospectives List */}
      {retrospectives.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No retrospectives yet</h3>
          <p className="text-gray-600 mb-6">
            Start your growth journey by creating your first retrospective
          </p>
          <Link href="/dashboard/new" className="btn btn-primary inline-block">
            Create First Retrospective
          </Link>
        </div>
      ) : filteredRetrospectives.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-gray-600">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRetrospectives.map((retro) => {
            const completionRate =
              retro.actions_count && retro.actions_count > 0
                ? Math.round(((retro.completed_actions_count || 0) / retro.actions_count) * 100)
                : 0

            return (
              <div key={retro.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Title and Meta */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/retrospective/${retro.id}`}
                        className="text-xl font-semibold text-primary hover:text-primary-light"
                      >
                        {retro.title || `${retro.period_type === 'weekly' ? 'Weekly' : 'Monthly'} Retrospective`}
                      </Link>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          retro.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {retro.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {format(new Date(retro.created_at), 'MMMM d, yyyy')}
                    </p>

                    {/* KPTA Summary */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-status-success">✨</span>
                        <span className="text-gray-600">{retro.keeps_count || 0} Keeps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-status-warning">🚧</span>
                        <span className="text-gray-600">{retro.problems_count || 0} Problems</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-secondary">🔬</span>
                        <span className="text-gray-600">{retro.tries_count || 0} Tries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-primary">🎯</span>
                        <span className="text-gray-600">{retro.actions_count || 0} Actions</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress and Actions */}
                  <div className="flex items-center gap-4">
                    {/* Completion Rate */}
                    {retro.actions_count && retro.actions_count > 0 && (
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${
                            completionRate === 100
                              ? 'text-status-success'
                              : completionRate > 50
                              ? 'text-status-warning'
                              : 'text-gray-400'
                          }`}
                        >
                          {completionRate}%
                        </div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/retrospective/${retro.id}`}
                        className="btn btn-primary text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteRetrospective(retro.id)}
                        className="btn btn-outline text-sm text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create New Button (fixed at bottom on mobile) */}
      <div className="mt-8 text-center">
        <Link href="/dashboard/new" className="btn btn-secondary inline-block">
          + Create New Retrospective
        </Link>
      </div>
    </div>
  )
}
