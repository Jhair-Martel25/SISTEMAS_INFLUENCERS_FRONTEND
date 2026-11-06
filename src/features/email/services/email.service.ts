import { apiClient } from '@/lib/http'
import type {
  EnviarEmailMasivoRequest,
  EnviarEmailRequest,
  EnviarEmailResponse,
  VistaPreviaCorreoRequest,
  VistaPreviaCorreoResponse,
} from '@/types/email'

const BASE_PATH = '/email'

export const emailService = {
  /** Enviar correo a un influencer usando una plantilla (ADMIN y VOLUNTARIO). */
  async enviar(input: EnviarEmailRequest): Promise<EnviarEmailResponse> {
    return apiClient.post<EnviarEmailResponse>(`${BASE_PATH}/enviar`, input)
  },

  /** Enviar a varios influencers a la vez (ADMIN y VOLUNTARIO). */
  async enviarMasivo(input: EnviarEmailMasivoRequest): Promise<EnviarEmailResponse[]> {
    return apiClient.post<EnviarEmailResponse[]>(`${BASE_PATH}/enviar-masivo`, input)
  },

  /** HTML exacto del correo (diseño + texto editado) para la vista previa. */
  async vistaPrevia(input: VistaPreviaCorreoRequest): Promise<VistaPreviaCorreoResponse> {
    return apiClient.post<VistaPreviaCorreoResponse>(`${BASE_PATH}/vista-previa`, input)
  },
}
