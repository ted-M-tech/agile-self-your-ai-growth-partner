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

export default function DashboardPage() {
  const { user } = useUser()
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRetrospectives: 0,
    completedRetrospectives: 0,
    totalActions: 0,
    completedActions: 0,
  })

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent retrospectives
      const { data: retros, error: retrosError } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (retrosError) throw retrosError

      // Fetch actions count
      const { count: totalActions } = await supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)

      const { count: completedActions } = await supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_completed', true)

      setRetrospectives(retros || [])
      setStats({
        totalRetrospectives: retros?.length || 0,
        completedRetrospectives: retros?.filter(r => r.status === 'completed').length || 0,
        totalActions: totalActions || 0,
        completedActions: completedActions || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const completionRate = stats.totalActions > 0
    ? Math.round((stats.completedActions / stats.totalActions) * 100)
    : 0

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to reflect and turn insights into action?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-primary">{stats.totalRetrospectives}</div>
          <div className="text-sm text-gray-600">Total Retrospectives</div>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-status-success">{stats.completedRetrospectives}</div>
          <div className="text-sm text-gray-600">Completed Sessions</div>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-secondary">{stats.totalActions}</div>
          <div className="text-sm text-gray-600">Action Items</div>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-status-warning">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/new" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">✨</div>
              <div>
                <h3 className="font-semibold text-lg">New Retrospective</h3>
                <p className="text-sm text-gray-600">Start a new KPTA session</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/actions" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">✅</div>
              <div>
                <h3 className="font-semibold text-lg">View Actions</h3>
                <p className="text-sm text-gray-600">Track your action items</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/history" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">📚</div>
              <div>
                <h3 className="font-semibold text-lg">View History</h3>
                <p className="text-sm text-gray-600">Browse past sessions</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Retrospectives */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Retrospectives</h2>
          <Link href="/dashboard/history" className="text-secondary hover:text-secondary-dark text-sm font-medium">
            View All →
          </Link>
        </div>

        {retrospectives.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">No retrospectives yet</h3>
            <p className="text-gray-600 mb-6">Start your growth journey by creating your first retrospective</p>
            <Link href="/dashboard/new" className="btn btn-primary inline-block">
              Create First Retrospective
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {retrospectives.map((retro) => (
              <Link
                key={retro.id}
                href={`/dashboard/retrospective/${retro.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {retro.title || `${retro.period_type === 'weekly' ? 'Weekly' : 'Monthly'} Retrospective`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        retro.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {retro.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(retro.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-secondary text-xl">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
