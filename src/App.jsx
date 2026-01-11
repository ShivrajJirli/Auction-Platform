import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AuctionComponent from './components/AuctionComponent'
import AuctionListPage from './pages/AuctionListPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminFundRequests from './pages/admin/AdminFundRequests'
import { Loader2 } from 'lucide-react'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Attempt to hydrate state from localStorage if available
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  // Simple Admin Check (in real app, verify with backend)
  const isAdmin = currentUser?.is_admin || currentUser?.email === 'admin@bidmaster.com' // Fallback for demo just in case migration didn't run effectively yet

  const [loading, setLoading] = useState(false)

  // Persist user session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  // Function to manually refresh user data
  const refreshUser = async () => {
    if (!currentUser?.id) return
    const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single()
    if (data) {
      setCurrentUser(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev)
    }
  }

  // Real-time User Data Sync
  useEffect(() => {
    if (!currentUser?.id) return

    refreshUser() // Initial fetch

    // 2. Subscribe to Real-time Changes (Keep as backup)
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('Realtime User Update:', payload)
          setCurrentUser(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id]) // Re-run only if ID changes (login/logout)


  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            currentUser ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            currentUser ? <Navigate to="/dashboard" replace /> : <RegisterPage onLogin={handleLogin} />
          }
        />

        {/* Protected Dashboard Routes (User) */}
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <DashboardLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<DashboardPage currentUser={currentUser} onRefresh={refreshUser} />} />
          <Route path="auctions" element={<AuctionListPage />} />
          <Route path="auction/:id" element={<AuctionComponent currentUser={currentUser} onRefresh={refreshUser} />} />
          <Route path="auction" element={<Navigate to="/dashboard/auctions" replace />} /> {/* Redirect old route absolute path */}
          <Route path="analytics" element={<AnalyticsPage currentUser={currentUser} />} />
          <Route path="profile" element={<ProfilePage currentUser={currentUser} onLogout={handleLogout} />} />
        </Route>

        <Route
          path="/admin-login"
          element={
            currentUser && isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage onLogin={handleLogin} />
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            currentUser && isAdmin ? (
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="funds" element={<AdminFundRequests />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App