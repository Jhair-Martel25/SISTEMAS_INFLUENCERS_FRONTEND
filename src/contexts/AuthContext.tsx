'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { LoginCredentials, User } from '@/types/auth'
import { authService } from '@/services/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

const STORAGE_KEY_TOKEN = 'sp_token'
const STORAGE_KEY_USER = 'sp_user'
const COOKIE_NAME = 'sp_token'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEY_USER)
    const cookieToken = getCookie(COOKIE_NAME)

    if (storedToken && storedUser && cookieToken) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)

    setToken(response.token)
    setUser(response.user)

    localStorage.setItem(STORAGE_KEY_TOKEN, response.token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user))
    setCookie(COOKIE_NAME, response.token)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    clearCookie(COOKIE_NAME)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
