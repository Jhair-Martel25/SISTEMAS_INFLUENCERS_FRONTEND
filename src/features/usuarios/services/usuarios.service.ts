import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  Usuario,
  UsuarioFiltros,
} from '@/types/usuario'

const BASE_PATH = '/usuarios'

export const usuariosService = {
  /** Listar usuarios con filtros y paginación (solo ADMIN). */
  async listar(filtros?: UsuarioFiltros): Promise<DataPaginated<Usuario>> {
    return apiClient.get<DataPaginated<Usuario>>(BASE_PATH, {
      params: filtros,
    })
  },

  async obtenerPorId(id: string): Promise<Usuario> {
    return apiClient.get<Usuario>(`${BASE_PATH}/${id}`)
  },

  async crear(input: CrearUsuarioInput): Promise<Usuario> {
    return apiClient.post<Usuario>(BASE_PATH, input)
  },

  async actualizar(id: string, input: ActualizarUsuarioInput): Promise<Usuario> {
    return apiClient.patch<Usuario>(`${BASE_PATH}/${id}`, input)
  },

  /** Baja lógica → estado = INACTIVO. */
  async desactivar(id: string): Promise<Usuario> {
    return apiClient.patch<Usuario>(`${BASE_PATH}/${id}/desactivar`)
  },
}
