import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarInfluencerInput,
  ContactarInfluencerInput,
  CrearInfluencerInput,
  Influencer,
  InfluencerFiltros,
} from '@/types/influencer'

const BASE_PATH = '/influencers'

export const influencersService = {
  /** Listar influencers con filtros y paginación. */
  async listar(filtros?: InfluencerFiltros): Promise<DataPaginated<Influencer>> {
    return apiClient.get<DataPaginated<Influencer>>(BASE_PATH, {
      params: filtros,
    })
  },

  async obtenerPorId(id: string): Promise<Influencer> {
    return apiClient.get<Influencer>(`${BASE_PATH}/${id}`)
  },

  /** Crear influencer manualmente (sin Apify). */
  async crear(input: CrearInfluencerInput): Promise<Influencer> {
    return apiClient.post<Influencer>(BASE_PATH, input)
  },

  /** Acción de validación: editar métricas y estado (PATCH /:id/editar). */
  async editar(id: string, input: ActualizarInfluencerInput): Promise<Influencer> {
    return apiClient.patch<Influencer>(`${BASE_PATH}/${id}/editar`, input)
  },

  /** Cambiar estado de contacto manualmente (solo ADMIN). */
  async contactar(id: string, input: ContactarInfluencerInput): Promise<Influencer> {
    return apiClient.patch<Influencer>(`${BASE_PATH}/${id}/contactar`, input)
  },

  /** Eliminar influencer (solo ADMIN). */
  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
