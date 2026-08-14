import { apiClient } from '@/services/api'
import type {
  Usuario,
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  UsuarioFiltros,
  UsuariosResponse,
} from '@/types/usuario'

const BASE_PATH = '/usuarios'
const ROLE_ID_VOLUNTARIO = 2

interface UsuariosApiResponse {
  mensaje: string
  data: UsuariosResponse
}

interface UsuarioApiResponse {
  mensaje: string
  data: Usuario
}

export const usuariosService = {
  async listar(filtros?: UsuarioFiltros): Promise<UsuariosResponse> {
    const response = await apiClient.get<UsuariosApiResponse>(BASE_PATH, { params: filtros })
    return response.data
  },

  async crear(input: CrearUsuarioInput): Promise<Usuario> {
    const response = await apiClient.post<UsuarioApiResponse>(BASE_PATH, input)
    return response.data
  },

  async actualizar(id: string, input: ActualizarUsuarioInput): Promise<Usuario> {
    const response = await apiClient.patch<UsuarioApiResponse>(`${BASE_PATH}/${id}`, input)
    return response.data
  },

  async desactivar(id: string): Promise<Usuario> {
    const response = await apiClient.patch<UsuarioApiResponse>(`${BASE_PATH}/${id}/desactivar`, {})
    return response.data
  },

  /** Atajo: solo usuarios con rol VOLUNTARIO, activos. Usado en Gestión de Voluntarios. */
  async listarVoluntarios(page = 1, limit = 50): Promise<Usuario[]> {
    const resultado = await this.listar({ page, limit, estado: 'ACTIVO', roleId: ROLE_ID_VOLUNTARIO })
    return resultado.data
  },
}