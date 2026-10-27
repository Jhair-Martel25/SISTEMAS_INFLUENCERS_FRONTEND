import { apiClient } from '@/lib/http'
import type { UbigeoItem } from '@/types/ubigeo'

const BASE_PATH = '/ubigeo'

export const ubigeoService = {
  /**
   * Búsqueda por autocompletado en tiempo real.
   * Permite buscar por código (ej: "150122") o por texto (ej: "Miraflores", "Lima").
   */
  async autocompletar(query: string, limite = 10): Promise<UbigeoItem[]> {
    return apiClient.get<UbigeoItem[]>(`${BASE_PATH}/autocompletar`, {
      params: { q: query.trim(), limite },
    })
  },

  /**
   * Consulta directa por código UBIGEO (6, 4 o 2 dígitos).
   */
  async obtenerPorCodigo(codigo: string): Promise<UbigeoItem> {
    return apiClient.get<UbigeoItem>(`${BASE_PATH}/${codigo.trim()}`)
  },
}
