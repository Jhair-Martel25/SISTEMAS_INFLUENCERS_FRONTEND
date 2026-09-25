import type { EstadoContacto, EstadoValidacion } from './api'

/**
 * Influencers
 * -----------
 * Entidad tal como la devuelve el backend (GET /influencers, POST, etc.).
 * Ver CONTEXTO_FRONTEND.md Ã‚Â§3.5.
 *
 * Nota: `seguidores` y `cantidad_post` son STRING (no nÃƒÂºmero) por decisiÃƒÂ³n
 * del backend. No convertirlos a number al tipar.
 */

export interface InfluencerResumenUsuario {
  id: string
  nombre: string
}

/** Influencer completo (respuesta del backend). */
export interface Influencer {
  id: string
  nombre: string
  usuarioIg: string
  linkIg: string
  email?: string | null
  phone?: string | null
  seguidores?: string | null
  cantidad_post?: string | null
  biografia?: string | null
  mensajePersonalizado?: string | null
  estadoValidacion: EstadoValidacion
  estadoContacto: EstadoContacto
  createdAt?: string
  updatedAt?: string
  /** QuiÃƒÂ©n lo validÃƒÂ³/actualizÃƒÂ³ por ÃƒÂºltima vez. */
  validadoPor?: InfluencerResumenUsuario | null
}

/** Body de POST /influencers (creaciÃƒÂ³n manual, sin Apify). */
export interface CrearInfluencerInput {
  nombre: string
  usuarioIg: string
  linkIg: string
  email?: string
  phone?: string
  seguidores?: string
  cantidad_post?: string
  biografia?: string
  mensajePersonalizado?: string
  estadoValidacion?: EstadoValidacion
}

/** Body de PATCH /influencers/:id/editar (cuerpo parcial). */
export interface ActualizarInfluencerInput {
  nombre?: string
  usuarioIg?: string
  linkIg?: string
  email?: string
  phone?: string
  seguidores?: string
  cantidad_post?: string
  biografia?: string
  mensajePersonalizado?: string
  estadoValidacion?: EstadoValidacion
  estadoContacto?: EstadoContacto
}

/** Body de PATCH /influencers/:id/contactar (solo ADMIN). */
export interface ContactarInfluencerInput {
  estadoContacto: EstadoContacto
}

/** Query params de GET /influencers. */
export interface InfluencerFiltros {
  estadoValidacion?: EstadoValidacion
  estadoContacto?: EstadoContacto
  tematica?: string
  page?: number
  limit?: number
}

/** Body de POST /influencers/generar (generacion automatica con IA). */
export interface GenerarInfluencersInput {
  tema: string
  rangoSeguidores: string
  cantidad: number
}

/**
 * Item de la respuesta de POST /influencers/generar. Ya queda guardado en
 * el backend. No trae `id`: se usa `UsuarioIg` (el usuario de Instagram, que
 * es unico) como key en las tablas.
 */
export interface InfluencerGenerado {
  Nombre: string
  UsuarioIg: string
  LinkIg: string
  Email: string
  biografia: string
  mensaje_personalizado: string
  cantidad_post: number
  seguidores: number
  emailVerificado: boolean
  igVerificado: boolean
}

/** Redes soportadas por POST /influencers/captar. */
export type RedSocial = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK'

/** Body de POST /influencers/captar (Google Search + Apify). */
export interface CaptarInfluencersInput {
  prompt: string
  redesSociales?: RedSocial[]
  maxItems?: number
  minSeguidores?: number
  maxSeguidores?: number
  consultaId?: string
}

/** Respuesta de POST /influencers/captar. */
export interface CaptarInfluencersResponse {
  totalResultados: number
  validos: number
  nuevos: number
  actualizados: number
  conEmail: number
  porRed: Record<string, number>
}
