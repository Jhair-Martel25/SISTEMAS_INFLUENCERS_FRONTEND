import { z } from 'zod'

/**
 * Schemas Zod de la feature `email`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de usarla.
 * Ver CONTEXTO_FRONTEND.md §3.9.
 */

/** Resultado de POST /email/enviar. */
export const EnviarEmailResultSchema = z.object({
  influencerId: z.string(),
  email: z.string(),
  exitoso: z.boolean(),
  error: z.string().optional(),
})

export type EnviarEmailResult = z.infer<typeof EnviarEmailResultSchema>