'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/hooks'
import { format } from 'date-fns'
import Icon from '@/components/Icon'
import DashboardAIInsights from '@/components/DashboardAIInsights'

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
      console.log('🚀 Dashboard: Starting fetch for user:', user!.id)

      // Fetch recent retrospectives (for display)
      const { data: retros, error: retrosError } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('📝 Dashboard: Recent retros fetched:', retros?.length || 0)
      if (retrosError) {
        console.error('❌ Dashboard: Error fetching recent retros:', retrosError)
        throw retrosError
      }

      // Get actual total count of all retrospectives
      const { count: totalRetroCount } = await supabase
        .from('retrospectives')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)

      // Get count of completed retrospectives (for AI insights)
      console.log('🔍 Dashboard: Fetching completed retrospectives for user:', user!.id)
      const { count: completedRetroCount, error: completedRetroError } = await supabase
        .from('retrospectives')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'completed')

      console.log('📊 Dashboard: Completed retro count:', completedRetroCount)
      if (completedRetroError) {
        console.error('❌ Dashboard: Error fetching completed retrospectives:', completedRetroError)
      }

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
        totalRetrospectives: totalRetroCount || 0,
        completedRetrospectives: completedRetroCount || 0,
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-12 h-12 border-3 border-ios-blue/30 border-t-ios-blue rounded-full animate-spin" />
          </div>
          <p className="text-ios-footnote text-ios-label-secondary">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const completionRate = stats.totalActions > 0
    ? Math.round((stats.completedActions / stats.totalActions) * 100)
    : 0

  return (
    <div className="animate-slide-up pb-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-ios-large-title text-ios-label-primary mb-2">
          Welcome back
        </h1>
        <p className="text-ios-body text-ios-label-secondary">
          Ready to reflect and turn insights into action?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {/* Total Retrospectives */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-ios-blue/10">
              <Icon name="doc.text.fill" size={20} className="text-ios-blue" />
            </div>
          </div>
          <div className="text-ios-large-title font-bold text-ios-label-primary mb-1">
            {stats.totalRetrospectives}
          </div>
          <div className="text-ios-footnote text-ios-label-secondary font-medium">
            Retrospectives
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-ios-green/10">
              <Icon name="checkmark.circle.fill" size={20} className="text-ios-green" />
            </div>
          </div>
          <div className="text-ios-large-title font-bold text-ios-label-primary mb-1">
            {stats.completedRetrospectives}
          </div>
          <div className="text-ios-footnote text-ios-label-secondary font-medium">
            Completed
          </div>
        </div>

        {/* Action Items */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-ios-teal/10">
              <Icon name="target" size={20} className="text-ios-teal" />
            </div>
          </div>
          <div className="text-ios-large-title font-bold text-ios-label-primary mb-1">
            {stats.totalActions}
          </div>
          <div className="text-ios-footnote text-ios-label-secondary font-medium">
            Actions
          </div>
        </div>

        {/* Completion Rate */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-ios-orange/10">
              <Icon name="chart.bar" size={20} className="text-ios-orange" />
            </div>
          </div>
          <div className="text-ios-large-title font-bold text-ios-label-primary mb-1">
            {completionRate}%
          </div>
          <div className="text-ios-footnote text-ios-label-secondary font-medium">
            Completion
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-ios-title-2 text-ios-label-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* New Retrospective */}
          <Link
            href="/dashboard/new"
            className="group card active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-ios-blue/10 to-ios-blue/5 group-hover:from-ios-blue/15 group-hover:to-ios-blue/10 transition-all">
                <Icon name="sparkles" size={28} className="text-ios-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-ios-headline text-ios-label-primary mb-0.5">
                  New Retrospective
                </h3>
                <p className="text-ios-footnote text-ios-label-secondary">
                  Start a new KPTA session
                </p>
              </div>
              <Icon name="chevron.right" size={16} className="text-ios-gray-3 group-hover:text-ios-gray-1 transition-colors" />
            </div>
          </Link>

          {/* View Actions */}
          <Link
            href="/dashboard/actions"
            className="group card active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-ios-green/10 to-ios-green/5 group-hover:from-ios-green/15 group-hover:to-ios-green/10 transition-all">
                <Icon name="checkmark.circle.fill" size={28} className="text-ios-green" />
              </div>
              <div className="flex-1">
                <h3 className="text-ios-headline text-ios-label-primary mb-0.5">
                  View Actions
                </h3>
                <p className="text-ios-footnote text-ios-label-secondary">
                  Track your action items
                </p>
              </div>
              <Icon name="chevron.right" size={16} className="text-ios-gray-3 group-hover:text-ios-gray-1 transition-colors" />
            </div>
          </Link>

          {/* View History */}
          <Link
            href="/dashboard/history"
            className="group card active:scale-[0.98]"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-ios-purple/10 to-ios-purple/5 group-hover:from-ios-purple/15 group-hover:to-ios-purple/10 transition-all">
                <Icon name="calendar" size={28} className="text-ios-purple" />
              </div>
              <div className="flex-1">
                <h3 className="text-ios-headline text-ios-label-primary mb-0.5">
                  View History
                </h3>
                <p className="text-ios-footnote text-ios-label-secondary">
                  Browse past sessions
                </p>
              </div>
              <Icon name="chevron.right" size={16} className="text-ios-gray-3 group-hover:text-ios-gray-1 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* AI Insights Section - Auto-loads */}
      <div className="mb-10">
        <DashboardAIInsights userId={user!.id} retroCount={stats.completedRetrospectives} />
      </div>

      {/* Recent Retrospectives */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-ios-title-2 text-ios-label-primary">Recent</h2>
          <Link
            href="/dashboard/history"
            className="text-ios-blue hover:text-ios-blue/80 text-ios-subheadline font-semibold flex items-center space-x-1 group"
          >
            <span>View All</span>
            <Icon name="chevron.right" size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {retrospectives.length === 0 ? (
          <div className="card-flat text-center py-16 animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ios-blue/10 mb-4">
              <Icon name="sparkles" size={40} className="text-ios-blue" />
            </div>
            <h3 className="text-ios-title-3 text-ios-label-primary mb-2">No retrospectives yet</h3>
            <p className="text-ios-body text-ios-label-secondary mb-8 max-w-sm mx-auto">
              Start your growth journey by creating your first retrospective
            </p>
            <Link href="/dashboard/new" className="btn btn-primary inline-flex items-center space-x-2">
              <Icon name="plus.circle.fill" size={18} />
              <span>Create First Retrospective</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {retrospectives.map((retro, index) => (
              <Link
                key={retro.id}
                href={`/dashboard/retrospective/${retro.id}`}
                className="group card-flat active:scale-[0.99] block"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-ios-headline text-ios-label-primary truncate">
                        {retro.title || `${retro.period_type === 'weekly' ? 'Weekly' : 'Monthly'} Retrospective`}
                      </h3>
                      <span className={`badge flex-shrink-0 ${
                        retro.status === 'completed' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {retro.status === 'completed' ? 'Completed' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-ios-footnote text-ios-label-secondary">
                      {format(new Date(retro.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Icon name="chevron.right" size={16} className="text-ios-gray-3 group-hover:text-ios-gray-1 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
