'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useUser } from '@/lib/auth/hooks'
import { supabase } from '@/lib/supabase/client'
import Icon from '@/components/Icon'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'house.fill' as const, activeIcon: 'house.fill' as const },
    { name: 'New', href: '/dashboard/new', icon: 'plus.circle.fill' as const, activeIcon: 'plus.circle.fill' as const },
    { name: 'Actions', href: '/dashboard/actions', icon: 'checkmark.circle' as const, activeIcon: 'checkmark.circle.fill' as const },
    { name: 'History', href: '/dashboard/history', icon: 'calendar' as const, activeIcon: 'calendar' as const },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background-secondary">
        {/* Top Navigation - Glass Morphism */}
        <nav className="nav-glass sticky top-0 z-50">
          <div className="container-app">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-ios-blue to-ios-teal rounded-xl flex items-center justify-center">
                  <Icon name="sparkles" size={18} className="text-white" />
                </div>
                <span className="text-ios-title-3 font-bold text-ios-label-primary">Agile Self</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        px-4 py-2 rounded-xl transition-all font-semibold
                        flex items-center space-x-2
                        ${isActive
                          ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/30'
                          : 'text-ios-label-secondary hover:bg-ios-gray-6 hover:text-ios-label-primary'
                        }
                      `}
                    >
                      <Icon
                        name={isActive ? item.activeIcon : item.icon}
                        size={18}
                        className={isActive ? 'text-white' : 'text-ios-gray-2'}
                      />
                      <span className="text-ios-subheadline">{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-ios-gray-6/50">
                  <Icon name="person.circle.fill" size={16} className="text-ios-gray-2" />
                  <span className="text-ios-footnote text-ios-label-secondary max-w-[120px] truncate">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost text-ios-footnote px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - iOS Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 nav-glass z-50 safe-area-bottom">
          <div className="grid grid-cols-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex flex-col items-center justify-center py-2 transition-all active:scale-95
                    ${isActive ? 'text-ios-blue' : 'text-ios-gray-2'}
                  `}
                >
                  <Icon
                    name={isActive ? item.activeIcon : item.icon}
                    size={24}
                    className="mb-1"
                  />
                  <span className="text-ios-caption-2 font-medium">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="container-app py-6 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
