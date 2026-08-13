import type { EstadoContacto, EstadoValidacion } from './api'

/**
 * Influencers
 * -----------
 * Entidad tal como la devuelve el backend (GET /influencers, POST, etc.).
 * Ver CONTEXTO_FRONTEND.md §3.5.
 *
 * Nota: `seguidores` y `cantidad_post` son STRING (no número) por decisión
 * del backend. No convertirlos a number al tipar.
 */

export interface InfluencerResumenUsuario {
  id: string
  nombre: string
}

export interface InfluencerConsultaIaResumen {
  id: string
  voluntarioId: string
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
  /** Origen: consulta IA que lo generó (incluye voluntario). */
  consultaIa?: InfluencerConsultaIaResumen | null
  /** Quién lo validó/actualizó por última vez. */
  validadoPor?: InfluencerResumenUsuario | null
}

/** Body de POST /influencers (creación manual, sin Apify). */
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
