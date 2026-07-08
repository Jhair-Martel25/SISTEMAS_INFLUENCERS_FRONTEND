/**
 * Cliente central de la API.
 * Todos los servicios (usuarios, influencers, disponibilidad, horarios,
 * plantillas, consultaIA, etc.) deben usar este archivo para comunicarse
 * con el backend, en vez de llamar a `fetch` directamente.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

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

/** Recupera el token guardado tras el login (localStorage, solo en cliente). */
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token')
}

function buildHeaders(customHeaders?: HeadersInit): HeadersInit {
  const token = getToken()

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  }
}

/** Convierte un objeto de query params en un string "?a=1&b=2", ignorando undefined/null. */
function buildQueryString(params?: object) {
  if (!params) return ''

  const entries = Object.entries(params as Record<string, unknown>)
  const filtered = entries.filter(([, value]) => value !== undefined && value !== null)

  if (filtered.length === 0) return ''

  const search = new URLSearchParams(
    filtered.map(([key, value]) => [key, String(value)])
  )

  return `?${search.toString()}`
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
      `Error ${response.status} al comunicarse con el servidor`

    throw new ApiError(message, response.status, body)
  }

  return body as T
}

interface RequestOptions {
  params?: object
  headers?: HeadersInit
  signal?: AbortSignal
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(options?.params)}`, {
      method: 'GET',
      headers: buildHeaders(options?.headers),
      signal: options?.signal,
    })

    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    })

    return handleResponse<T>(response)
  },

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    })

    return handleResponse<T>(response)
  },

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    })

    return handleResponse<T>(response)
  },

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(options?.headers),
      signal: options?.signal,
    })

    return handleResponse<T>(response)
  },
}