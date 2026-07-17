
/**
 * Tipos: Influencer
 * ------------------
 * Define la forma de un influencer y sus valores posibles (estado, red
 * social), para que toda la app (formulario, tabla, servicio) use la
 * misma estructura de datos sin repetirla en cada archivo.
 */
export type EstadoInfluencer = 'Pendiente' | 'Validado' | 'Rechazado'
export type RedSocial = 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook'

export interface Influencer {
  id: string
  nombreCompleto: string
  usuarioIG: string
  redSocial: RedSocial
  scoreIA: number
  correo: string
  telefono?: string
  pais: string
  ciudad: string
  seguidores: string
  engagement: string
  tematica: string
  linkPerfil: string
  estado: EstadoInfluencer
  voluntarioEncargadoId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CrearInfluencerInput {
  nombreCompleto: string
  usuarioIG: string
  correo: string
  telefono?: string
  pais: string
  ciudad: string
  seguidores: string
  engagement: string
  tematica: string
  linkPerfil: string
  estado: EstadoInfluencer
  voluntarioEncargadoId?: string
}

export type ActualizarInfluencerInput = Partial<CrearInfluencerInput>

export interface InfluencerFiltros {
  busqueda?: string
  estado?: EstadoInfluencer
  tematica?: string
  page?: number
  pageSize?: number
}