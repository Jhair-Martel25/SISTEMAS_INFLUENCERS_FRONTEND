import type { LoginCredentials, AuthResponse, User } from '@/types/auth'

const MOCK_USER: User = {
  id: '1',
  nombre: 'Admin Sembrando Perú',
  email: 'admin@sembrandoperu.com',
  rol: 'admin',
}

const MOCK_TOKEN = 'mock-jwt-token-sembrando-peru-2026'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (
      credentials.email === 'admin@sembrandoperu.com' &&
      credentials.password === '123456'
    ) {
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN,
      }
    }

    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
  },
}
