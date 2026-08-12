import { apiClient } from '@/services/api'
import type { DisponibilidadCita, DisponibilidadFiltros } from '@/types/disponibilidad'

const BASE_PATH = '/disponibilidades'

interface ApiEnvelope<T> {
  data: T
  mensaje: string
}

export const disponibilidadService = {
  async listarDisponibles(filtros?: DisponibilidadFiltros): Promise<DisponibilidadCita[]> {
    const res = await apiClient.get<ApiEnvelope<DisponibilidadCita[]>>(`${BASE_PATH}/disponibles`, { params: filtros })
    return res.data
  },
  async listarMisBloques(): Promise<DisponibilidadCita[]> {
    const res = await apiClient.get<ApiEnvelope<DisponibilidadCita[]>>(`${BASE_PATH}/mis-bloques`)
    return res.data
  },
  async generarDesdeHorarios(): Promise<DisponibilidadCita[]> {
    const res = await apiClient.post<ApiEnvelope<DisponibilidadCita[]>>(`${BASE_PATH}/generar`, {})
    return res.data
  },
  async crear(horarioId: string, timeZone?: string): Promise<DisponibilidadCita> {
    const res = await apiClient.post<ApiEnvelope<DisponibilidadCita>>(BASE_PATH, { horarioId, timeZone })
    return res.data
  },
  async toggle(id: string): Promise<DisponibilidadCita> {
    const res = await apiClient.patch<ApiEnvelope<DisponibilidadCita>>(`${BASE_PATH}/${id}/toggle`, {})
    return res.data
  },
  async eliminar(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(`${BASE_PATH}/${id}`)
  },
}