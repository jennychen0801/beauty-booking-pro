import { useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, AuthUser } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 背景抓取角色，不阻塞 loading 狀態
  const loadRole = async (u: AuthUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .single()
        
      if (!error && data?.role) {
        setUser(prev => prev ? { ...prev, role: data.role } : null)
      }
    } catch (err) {
      console.error('Error loading role:', err)
    }
  }

  useEffect(() => {
    // 1. 初始檢查
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        loadRole(session.user) // 背景執行
      }
      setLoading(false)
    })

    // 2. 監聽狀態
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        loadRole(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
