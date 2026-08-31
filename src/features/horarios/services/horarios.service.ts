import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarHorarioInput,
  CrearHorarioInput,
  Horario,
  HorarioFiltros,
} from '@/types/horario'

const BASE_PATH = '/horarios'

export const horariosService = {
  /** ADMIN ve todos; VOLUNTARIO ve solo los suyos. */
  async listar(filtros?: HorarioFiltros): Promise<DataPaginated<Horario>> {
    return apiClient.get<DataPaginated<Horario>>(BASE_PATH, {
      params: filtros,
    })
  },

  /** Solo los horarios del voluntario autenticado. */
  async listarMisHorarios(
    filtros?: HorarioFiltros,
  ): Promise<DataPaginated<Horario>> {
    return apiClient.get<DataPaginated<Horario>>(`${BASE_PATH}/mis-horarios`, {
      params: filtros,
    })
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
