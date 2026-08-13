/**
 * Almacenamiento unificado de la sesión (localStorage + cookie espejo).
 *
 * Fuente única de verdad para tokens y usuario. Lo usan:
 *  - `lib/http/http-base.ts` (interceptor de 401 + refresh automático)
 *  - `store/auth-store.ts` (login/logout)
 * De esta forma no hay dependencia circular entre ambos.
 *
 * La cookie `sp_token` es un espejo del access token que consume el middleware
 * (`src/proxy.ts`) para proteger rutas en el servidor. Se mantiene sincronizada
 * al setear/limpiar la sesión.
 */

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'sp.auth.token',
  REFRESH: 'sp.auth.refresh',
  USER: 'sp.auth.user',
} as const

/** Cookie espejo leída por el middleware de protección de rutas. */
const AUTH_COOKIE = 'sp_token'

/** Usuario persistido en sesión (mínimo para poder hacer refresh). */
export interface StoredUser {
  id: string
  nombre: string
  email: string
  role: string
}

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(key)
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, value)
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function getStoredToken(): string | null {
  return getItem(AUTH_STORAGE_KEYS.TOKEN)
}

export function getStoredRefreshToken(): string | null {
  return getItem(AUTH_STORAGE_KEYS.REFRESH)
}

export function getStoredUser(): StoredUser | null {
  const raw = getItem(AUTH_STORAGE_KEYS.USER)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

/** Guarda el trío completo tras login/refresh. */
export function setStoredAuth(token: string, refreshToken: string, user: StoredUser): void {
  setItem(AUTH_STORAGE_KEYS.TOKEN, token)
  setItem(AUTH_STORAGE_KEYS.REFRESH, refreshToken)
  setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user))
  setCookie(AUTH_COOKIE, token)
}

/** Rota tokens tras un refresh (el usuario no cambia). */
export function updateStoredTokens(token: string, refreshToken: string): void {
  setItem(AUTH_STORAGE_KEYS.TOKEN, token)
  setItem(AUTH_STORAGE_KEYS.REFRESH, refreshToken)
  setCookie(AUTH_COOKIE, token)
}

export function clearStoredAuth(): void {
  removeItem(AUTH_STORAGE_KEYS.TOKEN)
  removeItem(AUTH_STORAGE_KEYS.REFRESH)
  removeItem(AUTH_STORAGE_KEYS.USER)
  clearCookie(AUTH_COOKIE)
}
