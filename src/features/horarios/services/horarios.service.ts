import { apiClient } from '@/lib/http'
import type {
  ActualizarHorarioInput,
  CrearHorarioInput,
  Horario,
} from '@/types/horario'

const BASE_PATH = '/horarios'

export const horariosService = {
  /** ADMIN ve todos; VOLUNTARIO ve solo los suyos. */
  async listar(): Promise<Horario[]> {
    return apiClient.get<Horario[]>(BASE_PATH)
  },

  /** Solo los horarios del voluntario autenticado. */
  async listarMisHorarios(): Promise<Horario[]> {
    return apiClient.get<Horario[]>(`${BASE_PATH}/mis-horarios`)
  },

  async crear(input: CrearHorarioInput): Promise<Horario> {
    return apiClient.post<Horario>(BASE_PATH, input)
  },

  async actualizar(id: string, input: ActualizarHorarioInput): Promise<Horario> {
    return apiClient.patch<Horario>(`${BASE_PATH}/${id}`, input)
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
