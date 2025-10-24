'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useUser } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'New Retrospective', href: '/dashboard/new', icon: '✨' },
    { name: 'Actions', href: '/dashboard/actions', icon: '✅' },
    { name: 'History', href: '/dashboard/history', icon: '📚' },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container-app">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">Agile Self</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm text-gray-600">
                  {user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs">{item.name.split(' ')[0]}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="container-app py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
