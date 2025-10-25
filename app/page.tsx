'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, ListTodo, History, Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import type { Retrospective } from '@/lib/types';

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('retrospectives');
    if (stored) {
      setRetrospectives(JSON.parse(stored));
      setShowApp(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (retrospectives.length > 0) {
      localStorage.setItem('retrospectives', JSON.stringify(retrospectives));
    }
  }, [retrospectives]);

  const handleGetStarted = () => {
    setShowApp(true);
  };

  const handleNewRetrospective = () => {
    setActiveTab('new');
  };

  const pendingActions = retrospectives
    .flatMap(r => r.actions)
    .filter(a => !a.completed).length;

  if (!showApp) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agile Self
              </h1>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <p className="text-sm text-slate-600 hidden sm:block">
              Turn Reflection Into Action
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex bg-white/80 backdrop-blur-sm border border-slate-200">
            <TabsTrigger value="home" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2 relative">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Actions</span>
              {pendingActions > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1 text-xs bg-blue-600">
                  {pendingActions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Dashboard
              retrospectives={retrospectives}
              onNewRetrospective={handleNewRetrospective}
            />
          </TabsContent>

          <TabsContent value="new">
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">KPTA Entry component will go here</p>
              <p className="text-sm text-slate-500">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">Actions List component will go here</p>
              <p className="text-sm text-slate-500">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">Retrospective History component will go here</p>
              <p className="text-sm text-slate-500">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-20">
              <p className="text-slate-600 mb-4">Settings component will go here</p>
              <p className="text-sm text-slate-500">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
