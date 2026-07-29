import { apiClient } from '@/services/api'
import type {
  Influencer,
  CrearInfluencerInput,
  ActualizarInfluencerInput,
  InfluencerFiltros,
  InfluencersResponse,
} from '@/types/influencer'

const BASE_PATH = '/influencers'

export const influencersService = {
  async listar(
    filtros?: InfluencerFiltros
  ): Promise<InfluencersResponse> {
    return apiClient.get<InfluencersResponse>(
      BASE_PATH,
      { params: filtros }
    )
  },

  async obtenerPorId(id: string): Promise<Influencer> {
    return apiClient.get<Influencer>(`${BASE_PATH}/${id}`)
  },

  async crear(input: CrearInfluencerInput): Promise<Influencer> {
    return apiClient.post<Influencer>(BASE_PATH, input)
  },

  async actualizar(id: string, input: ActualizarInfluencerInput): Promise<Influencer> {
    return apiClient.put<Influencer>(`${BASE_PATH}/${id}`, input)
  },

  async cambiarEstado(id: string, estado: Influencer['estado']): Promise<Influencer> {
    return apiClient.patch<Influencer>(`${BASE_PATH}/${id}/estado`, { estado })
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
