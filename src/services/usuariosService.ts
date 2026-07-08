import { apiClient } from '@/services/api'
import type {
  Voluntario,
  CrearVoluntarioInput,
  ActualizarVoluntarioInput,
  VoluntarioFiltros,
} from '@/types/voluntario'

const BASE_PATH = '/usuarios'

export const usuariosService = {
  async listar(filtros?: VoluntarioFiltros): Promise<Voluntario[]> {
    return apiClient.get<Voluntario[]>(BASE_PATH, { params: filtros })
  },

  async obtenerPorId(id: string): Promise<Voluntario> {
    return apiClient.get<Voluntario>(`${BASE_PATH}/${id}`)
  },

  async crear(input: CrearVoluntarioInput): Promise<Voluntario> {
    return apiClient.post<Voluntario>(BASE_PATH, input)
  },

  async actualizar(id: string, input: ActualizarVoluntarioInput): Promise<Voluntario> {
    return apiClient.put<Voluntario>(`${BASE_PATH}/${id}`, input)
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
