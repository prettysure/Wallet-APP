import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'wallet-app-user'

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const usersStore = new Map<string, { user: User; password: string }>()

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback((email: string, password: string) => {
    const key = email.trim().toLowerCase()
    const stored = usersStore.get(key)
    if (!stored || stored.password !== password) {
      return { ok: false, error: 'Invalid email or password' }
    }
    setUser(stored.user)
    return { ok: true }
  }, [])

  const register = useCallback((name: string, email: string, password: string) => {
    const key = email.trim().toLowerCase()
    if (usersStore.has(key)) {
      return { ok: false, error: 'An account with this email already exists' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: key,
    }
    usersStore.set(key, { user, password })
    setUser(user)
    return { ok: true }
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
