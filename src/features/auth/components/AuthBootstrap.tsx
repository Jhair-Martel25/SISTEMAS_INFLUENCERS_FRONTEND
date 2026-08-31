'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

/**
 * Hidrata la sesión desde localStorage al montar la aplicación.
 * Se renderiza sin UI; solo dispara `refreshSession` una vez.
 */
export function AuthBootstrap() {
  useEffect(() => {
    useAuthStore.getState().refreshSession()
  }, [])

  return null
}
