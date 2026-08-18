/**
 * Tipos: Influencer
 * ------------------
 * Define la estructura de datos utilizada por el módulo de influencers.
 * Estos tipos están alineados con el modelo Influencer del backend.
 */

export type EstadoValidacion =
  | 'PENDIENTE'
  | 'VALIDADO'
  | 'RECHAZADO'

export type EstadoContacto =
  | 'SIN_CONTACTAR'
  | 'CORREO_ENVIADO'
  | 'FORMULARIO_LLENADO'
  | 'REUNION_AGENDADA'
  | 'RECHAZO_CONTACTO'

export interface Influencer {
  id: string

  nombre: string
  usuarioIg: string
  linkIg: string

  email?: string
  phone?: string

  seguidores?: string
  cantidad_post?: string
  biografia?: string
  mensajePersonalizado?: string

  estadoValidacion: EstadoValidacion
  estadoContacto: EstadoContacto

  createdAt?: string

  validadoPor?: {
    id: string
    nombre: string
  }
}

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

export type ActualizarInfluencerInput =
  Partial<CrearInfluencerInput>

export interface InfluencerFiltros {
  page?: number
  limit?: number
  estadoValidacion?: EstadoValidacion
  estadoContacto?: EstadoContacto
  tematica?: string
}

export interface InfluencersResponse {
  data: Influencer[]
  meta: {
    total: number
    page: number
    limit: number
  }
}