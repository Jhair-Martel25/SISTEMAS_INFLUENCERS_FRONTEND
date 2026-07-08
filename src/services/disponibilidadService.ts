import { apiClient } from '@/services/api'
import type {
  Disponibilidad,
  DisponibilidadResumen,
  ActualizarDisponibilidadInput,
} from '@/types/disponibilidad'

const BASE_PATH = '/disponibilidad'

export const disponibilidadService = {
  async listar(): Promise<Disponibilidad[]> {
    return apiClient.get<Disponibilidad[]>(BASE_PATH)
  },

  async obtenerResumen(): Promise<DisponibilidadResumen> {
    return apiClient.get<DisponibilidadResumen>(`${BASE_PATH}/resumen`)
  },

  async obtenerPorVoluntario(voluntarioId: string): Promise<Disponibilidad> {
    return apiClient.get<Disponibilidad>(`${BASE_PATH}/voluntario/${voluntarioId}`)
  },

  async actualizar(
    voluntarioId: string,
    input: ActualizarDisponibilidadInput
  ): Promise<Disponibilidad> {
    return apiClient.put<Disponibilidad>(`${BASE_PATH}/voluntario/${voluntarioId}`, input)
  },
}
