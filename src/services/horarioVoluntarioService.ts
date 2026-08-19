import { apiClient } from '@/services/api'
import type { Horario, CrearHorarioInput, ActualizarHorarioInput } from '@/types/horario'

const BASE_PATH = '/horarios'

interface HorariosResponse {
  mensaje: string
  data: {
    data: Horario[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }
}

interface HorarioResponse {
  mensaje: string
  data: Horario
}

export const horarioVoluntarioService = {
  /** ADMIN ve todos los horarios, VOLUNTARIO ve solo los suyos. */
  async listar(): Promise<Horario[]> {
    const response = await apiClient.get<HorariosResponse>(BASE_PATH, {
      params: { page: 1, limit: 1000 },
    })
    return response.data.data
  },

  /** Los horarios del voluntario autenticado. */
  async listarMisHorarios(): Promise<Horario[]> {
    const response = await apiClient.get<HorariosResponse>(`${BASE_PATH}/mis-horarios`)
    return response.data.data ?? response.data
  },

  async crear(input: CrearHorarioInput): Promise<Horario> {
    const response = await apiClient.post<HorarioResponse>(BASE_PATH, input)
    return response.data
  },

  async actualizar(id: string, input: ActualizarHorarioInput): Promise<Horario> {
    const response = await apiClient.patch<HorarioResponse>(`${BASE_PATH}/${id}`, input)
    return response.data
  },

  async eliminar(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },
}