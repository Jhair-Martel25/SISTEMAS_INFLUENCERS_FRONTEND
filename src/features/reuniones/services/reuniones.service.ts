import { apiClient } from '@/lib/http'
import type {
  ActualizarEstadoReunionInput,
  AgendarReunionInput,
  Reunion,
  ReunionFiltros,
} from '@/types/reunion'

const BASE_PATH = '/reuniones'

export const reunionesService = {
  /** ADMIN ve todas; VOLUNTARIO ve las suyas. */
  async listar(filtros?: ReunionFiltros): Promise<Reunion[]> {
    return apiClient.get<Reunion[]>(BASE_PATH, { params: filtros })
  },

  async obtenerPorId(id: string): Promise<Reunion> {
    return apiClient.get<Reunion>(`${BASE_PATH}/${id}`)
  },

  /** El influencer reserva un bloque (PÚBLICO — no requiere token). */
  async agendar(input: AgendarReunionInput): Promise<Reunion> {
    return apiClient.post<Reunion>(BASE_PATH, input, { skipAuth: true })
  },

  async actualizarEstado(id: string, input: ActualizarEstadoReunionInput): Promise<Reunion> {
    return apiClient.patch<Reunion>(`${BASE_PATH}/${id}/estado`, input)
  },
}
