import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarHorarioInput,
  CrearHorarioInput,
  GuardarMisHorariosInput,
  Horario,
  HorarioFiltros,
  HorarioResumenUsuario,
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

  /** Reemplaza el horario semanal completo del usuario autenticado. */
  async guardarMisHorarios(
    input: GuardarMisHorariosInput,
  ): Promise<DataPaginated<Horario>> {
    return apiClient.put<DataPaginated<Horario>>(`${BASE_PATH}/mis-horarios`, input)
  },

  /** ADMIN: todos los usuarios con su horario semanal y total de horas. */
  async resumen(): Promise<HorarioResumenUsuario[]> {
    return apiClient.get<HorarioResumenUsuario[]>(`${BASE_PATH}/resumen`)
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
