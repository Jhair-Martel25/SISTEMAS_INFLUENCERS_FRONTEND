'use client'

import { create } from 'zustand'
import type { Role } from '@/types/api'
import type { LoginCredentials, User } from '@/types/auth'
import { authService } from '@/features/auth/services/auth.service'
import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  type StoredUser,
} from '@/lib/auth-storage'
import { apiClient } from '@/lib/http'

interface AuthState {
  user: User | null
  backendToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isVoluntario: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  /** Hidrata el estado a partir de la sesión guardada (se llama al montar la app). */
  refreshSession: () => void
}

function buildDerived(user: User | null, backendToken: string | null) {
  const isAuthenticated = Boolean(user && backendToken)
  return {
    user,
    backendToken,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isVoluntario: user?.role === 'VOLUNTARIO',
  }
}

/** Convierte el usuario guardado en el tipo `User` tipado con el rol. */
function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    nombre: stored.nombre,
    email: stored.email,
    role: stored.role as Role,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  backendToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isVoluntario: false,

  login: async (credentials) => {
    const data = await authService.login(credentials)
    setStoredAuth(data.backendToken, data.refreshToken, data.usuario)
    set({
      ...buildDerived(data.usuario, data.backendToken),
      refreshToken: data.refreshToken,
      isLoading: false,
    })
  },

  logout: async () => {
    const { refreshToken } = get()
    try {
      if (refreshToken) {
        await authService.logout({ refreshToken })
      }
    } catch {
      // Si el backend no responde (sin conexión), igual se limpia la sesión local.
    } finally {
      clearStoredAuth()
      set({
        ...buildDerived(null, null),
        refreshToken: null,
        isLoading: false,
      })
    }
  },

  refreshSession: () => {
    const user = getStoredUser()
    const backendToken = getStoredToken()
    const refreshToken = getStoredRefreshToken()

    if (!user || !backendToken || !refreshToken) {
      set({
        ...buildDerived(null, null),
        refreshToken: null,
        isLoading: false,
      })
      return
    }

    set({
      ...buildDerived(toUser(user), backendToken),
      refreshToken,
      isLoading: false,
    })
  },
}))

/**
 * Sesión expirada → limpiar estado y redirigir a /login.
 * Lo registra el HttpBase para que lo llame automáticamente ante un 401
 * cuando el refresh también falla.
 */
apiClient.setUnauthorizedHandler(() => {
  clearStoredAuth()
  useAuthStore.setState({
    ...buildDerived(null, null),
    refreshToken: null,
    isLoading: false,
  })
  if (typeof window !== 'undefined') {
    window.location.assign('/login')
  }
})
