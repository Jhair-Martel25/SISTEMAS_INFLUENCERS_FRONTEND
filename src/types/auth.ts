import type { Role } from './api'

/**
 * Autenticación
 * -------------
 * Formato real de POST /auth/login y /auth/refresh (ver CONTEXTO_FRONTEND.md §3.1).
 */

export interface UsuarioSesion {
  id: string
  nombre: string
  email: string
  role: Role
}

export interface LoginCredentials {
  email: string
  password: string
  /** true → refresh token de 30 días; false/ausente → 7 días. */
  recordar?: boolean
}

/** Body de POST /auth/refresh (rota el refresh token). */
export interface RefreshCredentials {
  userId: string
  refreshToken: string
}

/** Body de POST /auth/logout. */
export interface LogoutCredentials {
  refreshToken: string
}

/** Respuesta de login y refresh (envuelta en ApiResponse por el interceptor). */
export interface AuthResponse {
  data: {
    usuario: UsuarioSesion
    backendToken: string
    refreshToken: string
  }
  mensaje: string
}

/** Alias usado por el resto de la app para referirse al usuario logueado. */
export type User = UsuarioSesion

/** Datos de sesión persistidos en el navegador. */
export interface AuthState {
  user: User | null
  backendToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
