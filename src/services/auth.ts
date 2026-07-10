import { apiClient } from './api'
import type { LoginCredentials, AuthResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    )
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sp_token')
      localStorage.removeItem('sp_user')
    }
  }
}