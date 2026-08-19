import { apiClient } from '@/services/api'
import type {
  Influencer,
  CrearInfluencerInput,
  ActualizarInfluencerInput,
  InfluencerFiltros,
  InfluencersResponse,
  EstadoContacto,
} from '@/types/influencer'

const BASE_PATH = '/influencers'

interface InfluencerApiResponse {
  mensaje: string
  data: Influencer
}

interface InfluencersApiResponse {
  mensaje: string
  data: InfluencersResponse
}

export const influencersService = {
  async listar(
    filtros?: InfluencerFiltros
  ): Promise<InfluencersResponse> {
    const response = await apiClient.get<InfluencersApiResponse>(
      BASE_PATH,
      { params: filtros }
    )

    return response.data
  },

  async obtenerPorId(id: string): Promise<Influencer> {
    const response = await apiClient.get<InfluencerApiResponse>(
      `${BASE_PATH}/${id}`
    )

    return response.data
  },

  async crear(input: CrearInfluencerInput): Promise<Influencer> {
    const response = await apiClient.post<InfluencerApiResponse>(
      BASE_PATH,
      input
    )

    return response.data
  },

  async actualizar(
    id: string,
    input: ActualizarInfluencerInput
  ): Promise<Influencer> {
    const response = await apiClient.patch<InfluencerApiResponse>(
      `${BASE_PATH}/${id}/editar`,
      input
    )

    return response.data
  },

  async cambiarEstado(
    id: string,
    estado: EstadoContacto
  ): Promise<Influencer> {
    const response = await apiClient.patch<InfluencerApiResponse>(
      `${BASE_PATH}/${id}/contactar`,
      { estadoContacto: estado }
    )

    return response.data
  },

  async eliminar(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`)
  },
}