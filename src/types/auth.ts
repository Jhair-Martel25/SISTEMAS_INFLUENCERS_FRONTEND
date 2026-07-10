export interface User {
  id: string
  nombre: string
  email: string
  role: 'ADMIN' | 'VOLUNTARIO'
}

export interface LoginCredentials {
  email: string
  password: string
  recordar?: boolean
}

export interface AuthResponse {
  data: {
    usuario: User
    backendToken: string
  }
  mensaje: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}