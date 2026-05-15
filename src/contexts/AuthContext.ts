import { createContext } from 'react'
import { Session, User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  role?: string
}

export interface AuthContextType {
  session: Session | null
  user: AuthUser | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
})
