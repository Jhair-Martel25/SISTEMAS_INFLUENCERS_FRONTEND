import { apiClient } from '@/lib/http'
import type { DataPaginated } from '@/types/api'
import type {
  ActualizarInfluencerInput,
  CaptarInfluencersInput,
  CaptarInfluencersResponse,
  ContactarInfluencerInput,
  CrearInfluencerInput,
  GenerarInfluencersInput,
  Influencer,
  InfluencerFiltros,
  InfluencerGenerado,
} from '@/types/influencer'

const BASE_PATH = '/influencers'

export const influencersService = {
  /** Listar influencers con filtros y paginaciÃƒÂ³n. */
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

  /** Generar influencers automaticamente con IA (POST /influencers/generar). Ya quedan creados en el backend. */
  async generarConIA(input: GenerarInfluencersInput): Promise<InfluencerGenerado[]> {
    return apiClient.post<InfluencerGenerado[]>(`/influencers/generar`, {
      tema: input.tema,
      rangoSeguidores: input.rangoSeguidores,
      cantidad: input.cantidad,
    })
  },

  /** Captar influencers mediante Google Search + Apify (POST /influencers/captar). */
  async captarInfluencers(
    input: CaptarInfluencersInput,
  ): Promise<CaptarInfluencersResponse> {
    return apiClient.post<CaptarInfluencersResponse>(`${BASE_PATH}/captar`, input)
  },

  /** AcciÃƒÂ³n de validaciÃƒÂ³n: editar mÃƒÂ©tricas y estado (PATCH /:id/editar). */
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
