import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './lib/supabase'

function Navbar() {
  const { user } = useAuth()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          BeautyPro
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/services" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
            服務項目
          </Link>
          {user ? (
            <>
              <Link to="/my-bookings" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                我的預約
              </Link>
              <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                管理後台
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                登出
              </button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/booking" element={<Booking />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
