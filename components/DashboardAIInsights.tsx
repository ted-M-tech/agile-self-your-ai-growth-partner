'use client'

import { useEffect, useState } from 'react'
import Icon from './Icon'

type AIInsightsProps = {
  userId: string
  retroCount: number
}

type CombinedInsights = {
  wellbeingScore: number
  wellbeingTrend: 'improving' | 'stable' | 'declining'
  topThemes: { theme: string; frequency: number }[]
  keyRecommendation: string
}

export default function DashboardAIInsights({ userId, retroCount }: AIInsightsProps) {
  const [insights, setInsights] = useState<CombinedInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (retroCount >= 2) {
      loadInsights()
    } else {
      setLoading(false)
    }
  }, [userId, retroCount])

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use new cached insights API
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, limit: 10 })
      })

      const data = await response.json()

      if (response.ok) {
        setInsights({
          wellbeingScore: data.wellbeingScore || 50,
          wellbeingTrend: data.wellbeingTrend || 'stable',
          topThemes: data.topThemes?.slice(0, 3) || [],
          keyRecommendation: data.keyRecommendation || 'Keep reflecting regularly'
        })

        // Log if using cache
        if (data.cached) {
          console.log('Loaded insights from cache (last updated:', data.cachedAt, ')')
        } else {
          console.log('Generated fresh insights')
        }
      } else {
        throw new Error(data.error || 'Failed to load insights')
      }
    } catch (err: any) {
      console.error('Error loading AI insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (retroCount < 2) {
    return null
  }

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-ios-purple/10 to-ios-pink/10">
            <Icon name="sparkles" size={24} className="text-ios-purple" />
          </div>
          <div>
            <h3 className="text-ios-title-3 text-ios-label-primary">AI Insights</h3>
            <p className="text-ios-footnote text-ios-label-secondary">Analyzing your progress...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-ios-purple/30 border-t-ios-purple rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return null
  }

  const getTrendIcon = (trend: string): 'chevron.right' | 'chevron.down' => {
    switch (trend) {
      case 'improving': return 'chevron.right'
      case 'declining': return 'chevron.down'
      default: return 'chevron.right'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-ios-green'
      case 'declining': return 'text-ios-red'
      default: return 'text-ios-gray-1'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-ios-green'
    if (score >= 40) return 'text-ios-orange'
    return 'text-ios-red'
  }

  return (
    <div className="card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-ios-purple/10 to-ios-pink/10">
            <Icon name="sparkles" size={24} className="text-ios-purple" />
          </div>
          <div>
            <h3 className="text-ios-title-3 text-ios-label-primary">AI Insights</h3>
            <p className="text-ios-footnote text-ios-label-secondary">
              Based on your last {retroCount} retrospectives
            </p>
          </div>
        </div>
      </div>

      {/* Well-being Score - Large and Prominent */}
      <div className="mb-6 p-6 bg-gradient-to-br from-ios-purple/5 to-ios-pink/5 rounded-2xl border border-ios-purple/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-ios-caption1 text-ios-label-secondary mb-1">Well-being Score</p>
            <div className="flex items-baseline space-x-2">
              <span className={`text-5xl font-bold ${getScoreColor(insights.wellbeingScore)}`}>
                {insights.wellbeingScore}
              </span>
              <span className="text-ios-title-3 text-ios-label-tertiary">/100</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-ios-caption1 text-ios-label-secondary mb-1">Trend</p>
            <div className="flex items-center space-x-1 justify-end">
              <Icon
                name={getTrendIcon(insights.wellbeingTrend)}
                size={24}
                className={`${getTrendColor(insights.wellbeingTrend)} ${
                  insights.wellbeingTrend === 'improving' ? '-rotate-90' : ''
                }`}
              />
              <span className={`text-ios-headline font-semibold capitalize ${getTrendColor(insights.wellbeingTrend)}`}>
                {insights.wellbeingTrend}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Themes */}
      {insights.topThemes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="list.bullet" size={18} className="text-ios-blue" />
            <h4 className="text-ios-headline text-ios-label-primary font-semibold">Recurring Patterns</h4>
          </div>
          <div className="space-y-2">
            {insights.topThemes.map((theme, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-ios-gray-6 rounded-xl">
                <span className="text-ios-body text-ios-label-primary">{theme.theme}</span>
                <span className="text-ios-caption2 px-2 py-1 rounded-md bg-ios-blue/10 text-ios-blue font-medium">
                  {theme.frequency}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Recommendation */}
      {insights.keyRecommendation && (
        <div className="p-4 bg-gradient-to-r from-ios-orange/5 to-ios-yellow/5 rounded-xl border border-ios-orange/10">
          <div className="flex items-start space-x-3">
            <Icon name="lightbulb.fill" size={20} className="text-ios-orange mt-0.5" />
            <div className="flex-1">
              <h4 className="text-ios-subheadline font-semibold text-ios-orange mb-1">Focus Area</h4>
              <p className="text-ios-body text-ios-label-primary leading-relaxed">
                {insights.keyRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
