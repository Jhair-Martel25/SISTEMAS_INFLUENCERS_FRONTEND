import { apiClient } from '@/services/api'
import type {
  Reunion,
  AgendarReunionInput,
  ActualizarEstadoReunionInput,
  EstadoReunion,
} from '@/types/reunion'

const BASE_PATH = '/reuniones'

interface ReunionesResponse {
  mensaje: string
  data: Reunion[]
}

interface ReunionResponse {
  mensaje: string
  data: Reunion
}

export const reunionesService = {
  /** Lista de reuniones, con filtro opcional por estado. */
  async listar(filtro?: { estado?: EstadoReunion }): Promise<Reunion[]> {
    const response = await apiClient.get<ReunionesResponse>(BASE_PATH, { params: filtro })
    return response.data
  },

  async obtenerPorId(id: string): Promise<Reunion> {
    const response = await apiClient.get<ReunionResponse>(`${BASE_PATH}/${id}`)
    return response.data
  },

  async agendar(input: AgendarReunionInput): Promise<Reunion> {
    const response = await apiClient.post<ReunionResponse>(BASE_PATH, input)
    return response.data
  },

  async actualizarEstado(id: string, input: ActualizarEstadoReunionInput): Promise<Reunion> {
    const response = await apiClient.patch<ReunionResponse>(`${BASE_PATH}/${id}/estado`, input)
    return response.data
  },
}