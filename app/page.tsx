'use client';

import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import type { Retrospective } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);
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
    // Will implement later
  };

  if (isLoading) {
    return null;
  }

  if (!showApp) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
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
        <Dashboard
          retrospectives={retrospectives}
          onNewRetrospective={handleNewRetrospective}
        />
      </main>
    </div>
  );
}
