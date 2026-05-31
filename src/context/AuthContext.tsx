import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, setToken, getToken, ApiError } from '../api/client'
import { isValidEmail, EMAIL_VALIDATION_MESSAGE } from '../utils/email'

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }

      try {
        const { user: me } = await api.me()
        if (!cancelled) setUser(me)
      } catch {
        setToken(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const key = email.trim().toLowerCase()
    if (!isValidEmail(key)) {
      return { ok: false, error: EMAIL_VALIDATION_MESSAGE }
    }

    try {
      const { token, user: loggedIn } = await api.login(key, password)
      setToken(token)
      setUser(loggedIn)
      return { ok: true }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Login failed. Please try again.'
      return { ok: false, error: message }
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const key = email.trim().toLowerCase()
    if (!isValidEmail(key)) {
      return { ok: false, error: EMAIL_VALIDATION_MESSAGE }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }

    try {
      await api.register(name.trim(), key, password)
      return { ok: true }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Registration failed. Please try again.'
      return { ok: false, error: message }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
