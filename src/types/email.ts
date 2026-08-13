/**
 * Email (solo ADMIN)
 * ------------------
 * Ver CONTEXTO_FRONTEND.md §3.9. Cada resultado es independiente en el envío
 * masivo; revisar `exitoso` por ítem.
 */

/** Body de POST /email/enviar. */
export interface EnviarEmailRequest {
  influencerId: string
  plantillaId: string
}

/** Body de POST /email/enviar-masivo. */
export interface EnviarEmailMasivoRequest {
  influencerIds: string[]
  plantillaId: string
}

/** Resultado de un envío (individual y por ítem del masivo). */
export interface EnviarEmailResponse {
  influencerId: string
  email: string
  exitoso: boolean
  error?: string
}
