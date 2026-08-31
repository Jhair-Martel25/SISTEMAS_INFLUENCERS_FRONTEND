import { apiClient } from '@/lib/http'
import type {
  AuthResponse,
  LoginCredentials,
  LogoutCredentials,
  RefreshCredentials,
} from '@/types/auth'

const BASE_PATH = '/auth'

export const authService = {
  /** Iniciar sesión y obtener tokens (público). */
  async login(credentials: LoginCredentials): Promise<AuthResponse['data']> {
    return apiClient.post<AuthResponse['data']>(
      `${BASE_PATH}/login`,
      credentials,
      { skipAuth: true },
    )
  },

  /** Renovar access token (público, rota el refresh token). */
  async refresh(credentials: RefreshCredentials): Promise<AuthResponse['data']> {
    return apiClient.post<AuthResponse['data']>(
      `${BASE_PATH}/refresh`,
      credentials,
      { skipAuth: true },
    )
  },

  /** Cerrar sesión y revocar el refresh token (requiere JWT). */
  async logout(credentials: LogoutCredentials): Promise<void> {
    await apiClient.post(`${BASE_PATH}/logout`, credentials)
  },
}
