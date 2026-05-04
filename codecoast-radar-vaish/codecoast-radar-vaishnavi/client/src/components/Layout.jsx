import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { 
  HomeIcon, 
  BriefcaseIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { connect, disconnect, notifications } = useSocketStore()
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      connect(token)
    }
    
    return () => disconnect()
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Tracker', href: '/tracker', icon: ClipboardDocumentListIcon },
    { name: 'Subscription', href: '/subscription', icon: CreditCardIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ]

  const handleLogout = () => {
    logout()
    disconnect()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CodeCoast</h1>
              <p className="text-xs text-gray-500">Radar</p>
            </div>
          </div>

          {/* User info */}
          <div className="px-6 py-4 bg-primary-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  {user?.subscription?.tier === 'pro' ? (
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">PRO</span>
                  ) : (
                    <span className="text-gray-500">Free Plan</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">Mangalore & Coastal Karnataka IT Jobs</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <BellIcon className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
