import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import React, { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import BeauticianProfile from './pages/BeauticianProfile'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './lib/supabase'

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleDarkMode = () => setIsDark(!isDark)

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 font-sans selection:bg-gold-200 selection:text-gold-900 text-gray-950 dark:text-white">
          <Navbar isDark={isDark} toggleDarkMode={toggleDarkMode} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/beautician/:id" element={<BeauticianProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/booking" element={<Booking />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          <Toaster position="top-right" toastOptions={{
            className: 'dark:bg-gray-900 dark:text-white dark:border-gray-800 border font-sans text-sm',
          }} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

function Navbar({ isDark, toggleDarkMode }: { isDark: boolean; toggleDarkMode: () => void }) {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-luxury font-bold tracking-tighter text-gray-900 dark:text-white group">
          BEAUTY<span className="text-gold-600 group-hover:text-gold-500 transition-colors">GLOW</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <Link to="/services" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors uppercase tracking-widest">
              探索服務
            </Link>
            {user && (
              <Link to="/my-bookings" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors uppercase tracking-widest">
                預約管理
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors uppercase tracking-widest">
                後台管理
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition-all border border-gray-100 dark:border-gray-800"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800"></div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-gold-600 font-bold uppercase">{user.role} MEMBER</span>
                </div>
                
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full border-2 border-gold-500/20 p-0.5"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-700 dark:text-gold-500 font-bold text-sm border border-gold-500/20">
                    {(user.user_metadata?.full_name || user.email)?.[0].toUpperCase()}
                  </div>
                )}

                <button
                  onClick={() => supabase.auth.signOut()}
                  className="hidden md:block text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-600 dark:hover:bg-gold-500 transition-all">
                MEMBER LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
