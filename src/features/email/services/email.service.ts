import { apiClient } from '@/lib/http'
import type {
  EnviarEmailMasivoRequest,
  EnviarEmailRequest,
  EnviarEmailResponse,
} from '@/types/email'

const BASE_PATH = '/email'

export const emailService = {
  /** Enviar correo a un influencer usando una plantilla (solo ADMIN). */
  async enviar(input: EnviarEmailRequest): Promise<EnviarEmailResponse> {
    return apiClient.post<EnviarEmailResponse>(`${BASE_PATH}/enviar`, input)
  },

  /** Enviar a varios influencers a la vez (solo ADMIN). */
  async enviarMasivo(input: EnviarEmailMasivoRequest): Promise<EnviarEmailResponse[]> {
    return apiClient.post<EnviarEmailResponse[]>(`${BASE_PATH}/enviar-masivo`, input)
  },
}
