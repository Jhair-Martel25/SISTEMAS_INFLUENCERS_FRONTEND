export interface User {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'voluntario' | 'supervisor'
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
