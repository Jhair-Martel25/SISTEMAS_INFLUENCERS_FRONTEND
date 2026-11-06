import { apiClient } from '@/lib/http'
import type {
  ActualizarEstadoReunionInput,
  AgendaPublica,
  AgendaPublicaQuery,
  AgendarHorarioInput,
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

  /** Agenda del usuario que envió la invitación (PÚBLICO). */
  async agendaPublica(query: AgendaPublicaQuery): Promise<AgendaPublica> {
    return apiClient.get<AgendaPublica>(`${BASE_PATH}/agenda`, {
      params: { ...query },
      skipAuth: true,
    })
  },

  /** Reserva un día y hora de esa agenda (PÚBLICO). */
  async agendarHorario(input: AgendarHorarioInput): Promise<Reunion> {
    return apiClient.post<Reunion>(`${BASE_PATH}/agendar-horario`, input, { skipAuth: true })
  },

  async actualizarEstado(id: string, input: ActualizarEstadoReunionInput): Promise<Reunion> {
    return apiClient.patch<Reunion>(`${BASE_PATH}/${id}/estado`, input)
  },
}
