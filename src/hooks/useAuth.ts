'use client'

import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/store/auth-store'

/**
 * Hook de autenticación.
 * Lee el estado del store de Zustand (ya no usa React Context).
 */
export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      backendToken: state.backendToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isAdmin: state.isAdmin,
      isVoluntario: state.isVoluntario,
      login: state.login,
      logout: state.logout,
      refreshSession: state.refreshSession,
    })),
  )
}
