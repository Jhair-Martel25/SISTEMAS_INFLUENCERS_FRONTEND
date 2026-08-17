import { useMutation, useQueryClient } from '@tanstack/react-query'
import { emailService } from '../services/email.service'
import { EnviarEmailResultSchema } from '../schemas/email.schema'
import type { EnviarEmailRequest, EnviarEmailResponse } from '@/types/email'

/**
 * Hooks de la feature `email`.
 *
 * Envuelven los services con TanStack Query. La mutación valida la respuesta
 * con Zod y, al enviar, invalida las claves de influencers porque el backend
 * cambia el `estadoContacto` del influencer a CORREO_ENVIADO.
 */

/** Enviar correo de contacto a un influencer (solo ADMIN). */
export function useEnviarEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      input: EnviarEmailRequest,
    ): Promise<EnviarEmailResponse> => {
      const data = await emailService.enviar(input)
      return EnviarEmailResultSchema.parse(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
    },
  })
}