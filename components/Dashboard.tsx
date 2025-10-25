'use client';

import { useState } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertCircle, Sparkles, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { Retrospective } from '@/lib/types';

interface DashboardProps {
  retrospectives: Retrospective[];
  onNewRetrospective: () => void;
}

interface WellbeingData {
  date: string;
  score: number;
  label: string;
}

interface AIInsight {
  type: 'pattern' | 'suggestion' | 'achievement' | 'warning';
  title: string;
  description: string;
  icon: typeof Brain;
  color: string;
}

// Calculate wellbeing score based on sentiment analysis
function calculateWellbeingScore(retrospective: Retrospective): number {
  const keepsCount = retrospective.keeps.length;
  const problemsCount = retrospective.problems.length;
  const triesCount = retrospective.tries.length;
  const actionsCount = retrospective.actions.length;

  // Base score from keeps vs problems ratio
  const sentiment = keepsCount / Math.max(problemsCount || 1, 1);
  let score = Math.min(50 + (sentiment * 20), 90);

  // Boost for taking action
  if (triesCount > 0) score += 5;
  if (actionsCount > 0) score += 5;

  // Analyze text length and content (mock AI analysis)
  const totalText = [
    ...retrospective.keeps,
    ...retrospective.problems,
    ...retrospective.tries,
  ].join(' ');

  if (totalText.length > 200) score += 5; // Detailed reflection bonus

  return Math.min(Math.round(score), 100);
}

// Generate AI insights based on retrospectives
function generateAIInsights(retrospectives: Retrospective[]): AIInsight[] {
  if (retrospectives.length === 0) return [];

  const insights: AIInsight[] = [];
  const recentRetros = retrospectives.slice(0, 5);

  // Pattern detection
  const allProblems = recentRetros.flatMap(r => r.problems);
  const problemWords = allProblems.join(' ').toLowerCase();

  if (problemWords.includes('sleep') || problemWords.includes('tired')) {
    insights.push({
      type: 'pattern',
      title: 'Recurring Sleep Pattern',
      description: 'Sleep issues appear frequently in your retrospectives. Consider creating an action to establish a consistent bedtime routine.',
      icon: AlertCircle,
      color: 'text-amber-600',
    });
  }

  if (problemWords.includes('procrastinat') || problemWords.includes('delay')) {
    insights.push({
      type: 'suggestion',
      title: 'Procrastination Detected',
      description: 'Try the "2-Minute Rule": if a task takes less than 2 minutes, do it immediately. For larger tasks, commit to just 5 minutes to build momentum.',
      icon: Lightbulb,
      color: 'text-blue-600',
    });
  }

  // Achievement detection
  const recentScore = calculateWellbeingScore(retrospectives[0]);
  const olderScore = retrospectives.length > 3 ? calculateWellbeingScore(retrospectives[3]) : 0;

  if (recentScore > olderScore + 10) {
    insights.push({
      type: 'achievement',
      title: 'Wellbeing Trending Up! 🎉',
      description: `Your wellbeing score has improved by ${Math.round(recentScore - olderScore)} points. Keep up the great work!`,
      icon: TrendingUp,
      color: 'text-green-600',
    });
  }

  // Action completion analysis
  const completedActions = retrospectives.flatMap(r => r.actions).filter(a => a.completed).length;
  const totalActions = retrospectives.flatMap(r => r.actions).length;
  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  if (completionRate > 70) {
    insights.push({
      type: 'achievement',
      title: 'Action Champion',
      description: `You've completed ${Math.round(completionRate)}% of your action items. Your commitment to growth is inspiring!`,
      icon: Sparkles,
      color: 'text-purple-600',
    });
  } else if (completionRate < 30 && totalActions > 5) {
    insights.push({
      type: 'warning',
      title: 'Action Items Need Attention',
      description: 'Many action items remain incomplete. Try breaking them into smaller, more manageable steps.',
      icon: AlertCircle,
      color: 'text-red-600',
    });
  }

  // Consistency check
  if (retrospectives.length >= 4) {
    const dates = retrospectives.slice(0, 4).map(r => new Date(r.date).getTime());
    const intervals = [];
    for (let i = 0; i < dates.length - 1; i++) {
      intervals.push(dates[i] - dates[i + 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const daysInterval = avgInterval / (1000 * 60 * 60 * 24);

    if (daysInterval >= 5 && daysInterval <= 9) {
      insights.push({
        type: 'achievement',
        title: 'Consistent Reflection Habit',
        description: 'You\'re maintaining a regular weekly reflection practice. Consistency is key to personal growth!',
        icon: Brain,
        color: 'text-indigo-600',
      });
    }
  }

  return insights;
}

export function Dashboard({ retrospectives, onNewRetrospective }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  // Calculate wellbeing trend
  const wellbeingData: WellbeingData[] = retrospectives
    .slice(0, timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : retrospectives.length)
    .reverse()
    .map((retro) => ({
      date: retro.date,
      score: calculateWellbeingScore(retro),
      label: new Date(retro.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  const currentScore = wellbeingData.length > 0 ? wellbeingData[wellbeingData.length - 1].score : 0;
  const avgScore = wellbeingData.length > 0
    ? Math.round(wellbeingData.reduce((sum, d) => sum + d.score, 0) / wellbeingData.length)
    : 0;

  const insights = generateAIInsights(retrospectives);
  const recentRetros = retrospectives.slice(0, 3);

  // Stats
  const totalRetrospectives = retrospectives.length;
  const totalActions = retrospectives.flatMap(r => r.actions).length;
  const completedActions = retrospectives.flatMap(r => r.actions).filter(a => a.completed).length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Growth Overview</h2>
          <p className="text-slate-600">Track progress and insights</p>
        </div>
        <Button onClick={onNewRetrospective} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Retrospective
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Current Wellbeing</p>
                <p className="text-3xl font-bold text-slate-900">{currentScore}/100</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-slate-900">{avgScore}/100</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Action Rate</p>
                <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{totalRetrospectives}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellbeing Trend Chart */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wellbeing Score Over Time</CardTitle>
              <CardDescription>Track your emotional wellbeing trend</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
                className={timeRange === '30d' ? 'bg-blue-600' : ''}
              >
                30D
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
                className={timeRange === '90d' ? 'bg-blue-600' : ''}
              >
                90D
              </Button>
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('all')}
                className={timeRange === 'all' ? 'bg-blue-600' : ''}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {wellbeingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wellbeingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No data yet. Create your first retrospective to start tracking!
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized insights from your retrospectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all"
                >
                  <div className={`${insight.color} mt-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`${insight.color} font-semibold mb-1`}>{insight.title}</h4>
                    <p className="text-sm text-slate-600">{insight.description}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="h-fit capitalize"
                  >
                    {insight.type}
                  </Badge>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Retrospectives Summary */}
      {recentRetros.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>Recent Retrospectives</CardTitle>
            <CardDescription>Quick overview of your latest reflections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRetros.map((retro, index) => {
              const score = calculateWellbeingScore(retro);
              return (
                <motion.div
                  key={retro.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">
                        {retro.title || new Date(retro.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex gap-3 text-sm text-slate-500">
                        <span className="text-green-600">{retro.keeps.length} Keeps</span>
                        <span className="text-red-600">{retro.problems.length} Problems</span>
                        <span className="text-blue-600">{retro.actions.length} Actions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Score</div>
                      <div className={`text-lg font-bold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {score}/100
                      </div>
                    </div>
                  </div>
                  <Progress value={score} className="h-2" />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
