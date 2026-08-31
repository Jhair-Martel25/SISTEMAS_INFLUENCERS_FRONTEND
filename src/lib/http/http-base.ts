/**
 * Cliente HTTP genérico (base).
 *
 * Contiene los métodos HTTP genéricos y la lógica transversal:
 *  - Adjuntar `Authorization: Bearer <token>` automáticamente.
 *  - Ante un 401: renovar sesión con POST /auth/refresh una sola vez
 *    (rotando tokens) y reintentar la petición original.
 *  - Normalizar respuestas: devolver el `data` del envoltorio `{ data, mensaje }`.
 *  - Lanzar `ApiError` con el `mensaje` real del backend.
 *
 * No debe importar de `features/` (evita dependencias circulares); solo usa
 * `lib/auth-storage`.
 */

import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredToken,
  getStoredUser,
  updateStoredTokens,
} from '../auth-storage'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

/** Endpoints de auth que nunca deben reintentar con refresh (evita bucles). */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh']

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export interface RequestOptions {
  params?: object
  headers?: HeadersInit
  signal?: AbortSignal
  /** No adjuntar token ni reintentar con refresh (endpoints públicos). */
  skipAuth?: boolean
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function buildHeaders(token: string | null, custom?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...custom,
  }
}

/** Convierte un objeto de query params en "?a=1&b=2", ignorando undefined/null. */
function buildQueryString(params?: object): string {
  if (!params) return ''

  const entries = Object.entries(params as Record<string, unknown>)
  const filtered = entries.filter(
    ([, value]) => value !== undefined && value !== null,
  )

  if (filtered.length === 0) return ''

  return `?${new URLSearchParams(
    filtered.map(([key, value]) => [key, String(value)]),
  ).toString()}`
}

async function parseJson(
  response: Response,
): Promise<Record<string, unknown> | null> {
  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  return isJson ? response.json().catch(() => null) : null
}

export class HttpBase {
  private baseUrl = API_BASE_URL

  /** Promesa compartida: ante varios 401 simultáneos, solo uno renueva. */
  private refreshPromise: Promise<string> | null = null

  /** Callback que se ejecuta cuando la sesión expira (lo registra auth-store). */
  private onUnauthorized: (() => void) | null = null

  setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorized = handler
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'GET', undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'POST', body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'PUT', body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'PATCH', body, options)
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, 'DELETE', undefined, options)
  }

  private async request<T>(
    path: string,
    method: HttpMethod,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers, signal, skipAuth = false } = options
    const url = `${this.baseUrl}${path}${buildQueryString(params)}`

    const doFetch = (token: string | null) =>
      fetch(url, {
        method,
        headers: buildHeaders(token, headers),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      })

    const token = skipAuth ? null : getStoredToken()
    let response = await doFetch(token)

    const shouldRefresh = !skipAuth && !AUTH_ENDPOINTS.includes(path)

    if (response.status === 401 && shouldRefresh) {
      try {
        const newToken = await this.obtainFreshToken()
        response = await doFetch(newToken)
      } catch (err) {
        clearStoredAuth()
        this.onUnauthorized?.()
        const message =
          err instanceof ApiError
            ? err.message
            : 'Sesión expirada. Vuelve a iniciar sesión.'
        throw new ApiError(
          message,
          401,
          err instanceof ApiError ? err.data : null,
        )
      }
    }

    return handleResponse<T>(response)
  }

  private obtainFreshToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshAccessToken().finally(() => {
        this.refreshPromise = null
      })
    }
    return this.refreshPromise
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = getStoredRefreshToken()
    const user = getStoredUser()

    if (!refreshToken || !user?.id) {
      throw new ApiError('No hay una sesión activa.', 401)
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, refreshToken }),
    })

    const body = await parseJson(response)

    if (!response.ok) {
      throw new ApiError(
        body?.mensaje
          ? String(body.mensaje)
          : 'La sesión expiró. Vuelve a iniciar sesión.',
        response.status,
        body,
      )
    }

    const data = body?.data as
      | { backendToken?: string; refreshToken?: string }
      | undefined

    if (!data?.backendToken || !data?.refreshToken) {
      throw new ApiError('Respuesta de renovación de sesión inválida.', 500, body)
    }

    updateStoredTokens(data.backendToken, data.refreshToken)
    return data.backendToken
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(
      body?.mensaje
        ? String(body.mensaje)
        : body?.message
          ? String(body.message)
          : `Error ${response.status}`,
      response.status,
      body,
    )
  }

  // Normalizar: devolver solo `data` del envoltorio { data, mensaje }.
  return (body?.data ?? body) as T
}
