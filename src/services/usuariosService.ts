import { apiClient } from '@/services/api'
import type {
  Usuario,
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  UsuarioFiltros,
  UsuariosResponse,
} from '@/types/usuario'

const BASE_PATH = '/usuarios'

export const usuariosService = {
  async listar(filtros?: UsuarioFiltros): Promise<UsuariosResponse> {
    return apiClient.get<UsuariosResponse>(BASE_PATH, {
      params: filtros,
    });
  },

  async obtenerPorId(id: string): Promise<Usuario> {
    return apiClient.get<Usuario>(`${BASE_PATH}/${id}`)
  },

  async crear(input: CrearUsuarioInput): Promise<Usuario> {
    return apiClient.post<Usuario>(BASE_PATH, input)
  },

  async actualizar(
    id: string,
    input: ActualizarUsuarioInput
  ): Promise<Usuario> {
    return apiClient.patch<Usuario>(
      `${BASE_PATH}/${id}`,
      input
    )
  },

  async desactivar(id: string): Promise<Usuario> {
    return apiClient.patch(`${BASE_PATH}/${id}/desactivar`, {});
  },
}