'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { KPTAEntry } from '@/components/KPTAEntry';
import { ActionsList } from '@/components/ActionsList';
import { RetrospectiveHistory } from '@/components/RetrospectiveHistory';
import { Settings as SettingsComponent } from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, ListTodo, History, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import type { Retrospective } from '@/lib/types';

type TabType = 'home' | 'new' | 'actions' | 'history' | 'settings';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);

  // Load data from localStorage on mount ONLY
  useEffect(() => {
    const hasStarted = localStorage.getItem('hasStarted');
    const stored = localStorage.getItem('retrospectives');

    if (hasStarted === 'true') {
      setShowApp(true);
    }

    if (stored) {
      try {
        setRetrospectives(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored retrospectives:', e);
      }
    }

    setIsLoading(false);
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('hasStarted', 'true');
    setShowApp(true);
  };

  const handleNewRetrospective = () => {
    setActiveTab('new');
  };

  const handleSaveRetrospective = (newRetro: Retrospective) => {
    const updated = [newRetro, ...retrospectives];
    setRetrospectives(updated);
    localStorage.setItem('retrospectives', JSON.stringify(updated));
    setActiveTab('home');
  };

  const handleCancelEntry = () => {
    setActiveTab('home');
  };

  const handleUpdateRetrospectives = (updated: Retrospective[]) => {
    setRetrospectives(updated);
    localStorage.setItem('retrospectives', JSON.stringify(updated));
  };

  if (isLoading) {
    return null;
  }

  if (!showApp) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const pendingActions = retrospectives
    .flatMap(r => r.actions)
    .filter(a => !a.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Toaster />
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Agile Self
            </h1>
            <p className="text-sm text-slate-600 hidden sm:block">
              Turn Reflection Into Action
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <div className="inline-flex gap-2 p-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('home')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              variant={activeTab === 'new' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('new')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
            <Button
              variant={activeTab === 'actions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('actions')}
              className="gap-2 relative"
            >
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Actions</span>
              {pendingActions > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1 text-xs bg-blue-600">
                  {pendingActions}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'home' && (
            <Dashboard
              retrospectives={retrospectives}
              onNewRetrospective={handleNewRetrospective}
            />
          )}

          {activeTab === 'new' && (
            <KPTAEntry
              onSave={handleSaveRetrospective}
              onCancel={handleCancelEntry}
            />
          )}

          {activeTab === 'actions' && (
            <ActionsList
              retrospectives={retrospectives}
              onUpdateRetrospectives={handleUpdateRetrospectives}
            />
          )}

          {activeTab === 'history' && (
            <RetrospectiveHistory
              retrospectives={retrospectives}
              onUpdateRetrospectives={handleUpdateRetrospectives}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsComponent
              retrospectives={retrospectives}
              onUpdateRetrospectives={handleUpdateRetrospectives}
            />
          )}
        </div>
      </main>
    </div>
  );
}
