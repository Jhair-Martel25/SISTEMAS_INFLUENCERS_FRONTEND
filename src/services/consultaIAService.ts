import { apiClient } from '@/services/api'
import type { ConsultaIAInput, ConsultaIAResultado } from '@/types/consultaIA'

const BASE_PATH = '/consulta-ia'

export const consultaIAService = {
  /** Envía el prompt + filtros al backend y devuelve los influencers sugeridos por la IA. */
  async generar(input: ConsultaIAInput): Promise<ConsultaIAResultado> {
    return apiClient.post<ConsultaIAResultado>(`${BASE_PATH}/generar`, input)
  },

  /** Historial de consultas anteriores, por si se quiere mostrar en el módulo. */
  async listarHistorial(): Promise<ConsultaIAResultado[]> {
    return apiClient.get<ConsultaIAResultado[]>(`${BASE_PATH}/historial`)
  },
}
