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
  /** Texto editado en el sistema (si se omite, el de la plantilla). */
  asunto?: string
  cuerpo?: string
}

/** Body de POST /email/enviar-masivo. */
export interface EnviarEmailMasivoRequest {
  influencerIds: string[]
  plantillaId: string
  asunto?: string
  cuerpo?: string
}

/** Para quién se renderiza el correo (cambia el marco del diseño clásico). */
export type TipoDestinoCorreo = 'INFLUENCER' | 'EMPRESA'

/** Body de POST /email/vista-previa. */
export interface VistaPreviaCorreoRequest {
  plantillaId?: string
  diseno?: string
  tipo?: TipoDestinoCorreo
  asunto?: string
  cuerpo?: string
  nombre?: string
  empresa?: string
  /** Imagen aún no guardada (data URL) para la vista previa del diseño IMAGEN. */
  imagenBase64?: string
}

export interface VistaPreviaCorreoResponse {
  asunto: string
  html: string
  diseno: string
}

/** Resultado de un envío (individual y por ítem del masivo). */
export interface EnviarEmailResponse {
  influencerId: string
  email: string
  exitoso: boolean
  error?: string
}
