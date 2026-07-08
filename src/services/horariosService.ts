import { apiClient } from '@/services/api'
import type {
  Reunion,
  CrearReunionInput,
  ActualizarReunionInput,
  AgendaSemanal,
} from '@/types/reunion'

const BASE_PATH = '/reuniones'

export const horariosService = {
  /** Lista de reuniones, con filtros opcionales por fecha/estado. */
  async listarReuniones(filtros?: { fecha?: string; estado?: Reunion['estado'] }): Promise<Reunion[]> {
    return apiClient.get<Reunion[]>(BASE_PATH, { params: filtros })
  },

  async obtenerReunion(id: string): Promise<Reunion> {
    return apiClient.get<Reunion>(`${BASE_PATH}/${id}`)
  },

  async crearReunion(input: CrearReunionInput): Promise<Reunion> {
    return apiClient.post<Reunion>(BASE_PATH, input)
  },

  async actualizarReunion(id: string, input: ActualizarReunionInput): Promise<Reunion> {
    return apiClient.put<Reunion>(`${BASE_PATH}/${id}`, input)
  },

  async reagendar(id: string, fecha: string, hora: string): Promise<Reunion> {
    return apiClient.patch<Reunion>(`${BASE_PATH}/${id}/reagendar`, { fecha, hora })
  },

  async cancelar(id: string): Promise<Reunion> {
    return apiClient.patch<Reunion>(`${BASE_PATH}/${id}/cancelar`, {})
  },

  /** Trae la agenda semanal (grilla día x hora) que se muestra en /reuniones/agenda. */
  async obtenerAgendaSemanal(semana?: string): Promise<AgendaSemanal> {
    return apiClient.get<AgendaSemanal>(`${BASE_PATH}/agenda`, {
      params: semana ? { semana } : undefined,
    })
  },
}
