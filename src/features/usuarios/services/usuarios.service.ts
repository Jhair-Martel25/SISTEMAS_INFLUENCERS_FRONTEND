import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarPerfilInput,
  ActualizarPerfilResponse,
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

  /** Reactivar un usuario desactivado → estado = ACTIVO. */
  async reactivar(id: string): Promise<Usuario> {
    return apiClient.patch<Usuario>(`${BASE_PATH}/${id}/reactivar`)
  },

  /** Restablece la contraseña a la predeterminada y cierra sus sesiones. */
  async restablecerPassword(id: string): Promise<{ mensaje: string }> {
    return apiClient.patch<{ mensaje: string }>(`${BASE_PATH}/${id}/restablecer-password`)
  },

  /**
   * Actualiza correo y/o contraseña del propio usuario logueado
   * (autoservicio, disponible para ADMIN y VOLUNTARIO). Si se cambia la
   * contraseña, el backend invalida los refresh tokens de ese usuario.
   */
  async actualizarPerfil(
    input: ActualizarPerfilInput,
  ): Promise<ActualizarPerfilResponse> {
    return apiClient.patch<ActualizarPerfilResponse>(
      `${BASE_PATH}/datos-personales`,
      input,
    )
  },
}