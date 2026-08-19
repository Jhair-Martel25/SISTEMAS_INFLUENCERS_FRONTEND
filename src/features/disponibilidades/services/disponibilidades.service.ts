import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  CrearDisponibilidadInput,
  DisponibilidadCita,
  DisponibilidadFiltros,
  GenerarDisponibilidadInput,
} from '@/types/disponibilidad'

const BASE_PATH = '/disponibilidades'

export const disponibilidadesService = {
  /** Bloques libres (PÚBLICO — no requiere token). */
  async listarDisponibles(
    filtros?: DisponibilidadFiltros,
  ): Promise<DataPaginated<DisponibilidadCita>> {
    return apiClient.get<DataPaginated<DisponibilidadCita>>(
      `${BASE_PATH}/disponibles`,
      {
        params: filtros,
        skipAuth: true,
      },
    )
  },

  /** Todos los bloques del usuario logueado. */
  async listarMisBloques(
    filtros?: DisponibilidadFiltros,
  ): Promise<DataPaginated<DisponibilidadCita>> {
    return apiClient.get<DataPaginated<DisponibilidadCita>>(
      `${BASE_PATH}/mis-bloques`,
      { params: filtros },
    )
  },

  /** Generar bloques de 60 min para hoy de la próxima semana según horario. */
  async generar(input?: GenerarDisponibilidadInput): Promise<{ creados: number; existentes: number }> {
    return apiClient.post<{ creados: number; existentes: number }>(
      `${BASE_PATH}/generar`,
      input,
    )
  },

  /** Eliminar bloques vencidos sin reunión. */
  async limpiar(): Promise<{ eliminados: number }> {
    return apiClient.delete<{ eliminados: number }>(`${BASE_PATH}/limpiar`)
  },

  /** Crear bloque manual ({ fechaHora: "YYYY-MM-DD HH:mm:ss" }). */
  async crear(input: CrearDisponibilidadInput): Promise<DisponibilidadCita> {
    return apiClient.post<DisponibilidadCita>(BASE_PATH, input)
  },

  async toggle(id: string): Promise<DisponibilidadCita> {
    return apiClient.patch<DisponibilidadCita>(`${BASE_PATH}/${id}/toggle`)
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
