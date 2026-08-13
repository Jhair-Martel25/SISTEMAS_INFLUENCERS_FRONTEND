import type { EstadoConsultaIA, EstadoValidacion } from './api'

/**
 * Consultas IA (prospección con Apify)
 * ------------------------------------
 * Refleja POST /consultas-ia y GET /consultas-ia.
 * Ver CONTEXTO_FRONTEND.md §3.4.
 */

/** Body de POST /consultas-ia. */
export interface ConsultaIAInput {
  descripcionPrompt: string
  cantidadSolicitada: number
  rangoSeguidores: string
  plantillaId: string
}

/** Influencer generado por la IA (incluido en la respuesta de POST). */
export interface InfluencerSugerido {
  id: string
  nombre: string
  usuarioIg: string
  linkIg: string
  seguidores: string
  cantidad_post: string
  biografia?: string | null
  email?: string | null
  estadoValidacion: EstadoValidacion
  mensajePersonalizado?: string | null
}

/** Resumen de la ejecución de la consulta. */
export interface ResumenConsultaIA {
  totalPerfilesReales: number
  nuevos: number
  duplicados: number
  conEmail: number
}

/** Respuesta de POST /consultas-ia. */
export interface ConsultaIAResultado {
  consulta: ConsultaIA
  influencers: InfluencerSugerido[]
  resumen: ResumenConsultaIA
}

/** Consulta IA (como aparece en GET /consultas-ia). */
export interface ConsultaIA {
  id: string
  descripcionPrompt: string
  cantidadSolicitada: number
  rangoSeguidores: string
  estado: EstadoConsultaIA
  fecha: string
  voluntarioId: string
  plantillaId: string
  voluntario?: { id: string; nombre: string }
  plantilla?: { id: string; nombre: string }
}

/** Respuesta de GET /consultas-ia (arreglo de consultas). */
export type ConsultaIAHistorial = ConsultaIA[]
