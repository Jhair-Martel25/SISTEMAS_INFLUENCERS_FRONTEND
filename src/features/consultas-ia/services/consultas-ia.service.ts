import { apiClient } from '@/lib/http'
import type {
  ConsultaIAHistorial,
  ConsultaIAInput,
  ConsultaIAResultado,
} from '@/types/consultaIA'

const BASE_PATH = '/consultas-ia'

export const consultaIAService = {
  /** Ejecutar búsqueda de influencers vía Apify (puede tardar ~60s). */
  async generar(input: ConsultaIAInput): Promise<ConsultaIAResultado> {
    return apiClient.post<ConsultaIAResultado>(BASE_PATH, input)
  },

  /** Historial de consultas (ADMIN todas, VOLUNTARIO las suyas). */
  async listar(): Promise<ConsultaIAHistorial> {
    return apiClient.get<ConsultaIAHistorial>(BASE_PATH)
  },
}
