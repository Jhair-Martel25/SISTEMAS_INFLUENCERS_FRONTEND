import type { EstadoContacto, EstadoValidacion } from './api'
import type {
  CrearEmpresaInput,
  EmpresaRegistradaResumen,
  TipoEmbajador,
} from './empresa'

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

/** Influencer completo (respuesta del backend). */
export interface Influencer {
  id: string
  nombre: string
  usuarioIg: string
  linkIg: string
  /** EMPRESA si representa a una empresa; INFLUENCER si es un perfil personal. */
  tipoEmbajador?: TipoEmbajador
  /** Empresa vinculada (solo tipo EMPRESA). */
  empresaId?: string | null
  empresaRegistrada?: EmpresaRegistradaResumen | null
  empresa?: string | null
  ruc?: string | null
  ciiu?: string | null
  sector?: string | null
  descripcion?: string | null
  direccion?: string | null
  sitioWeb?: string | null
  ubigeo?: string | null
  departamento?: string | null
  provincia?: string | null
  distrito?: string | null
  cargo?: string | null
  area?: string | null
  /** Red social de origen (INSTAGRAM, TIKTOK, FACEBOOK...). */
  redSocial?: string | null
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
  /** Quién lo validó/actualizó por última vez. */
  validadoPor?: InfluencerResumenUsuario | null
}

/** Body de POST /influencers (creación manual, sin Apify). */
export interface CrearInfluencerInput {
  nombre?: string
  /** El backend deriva uno del otro: basta con enviar usuarioIg o linkIg. */
  usuarioIg?: string
  linkIg?: string
  tipoEmbajador?: TipoEmbajador
  /** Empresa existente (solo tipo EMPRESA). */
  empresaId?: string
  /** Datos de una empresa nueva (solo tipo EMPRESA, alternativa a empresaId). */
  nuevaEmpresa?: CrearEmpresaInput
  /** Contacto/funcionario de la empresa que sera el embajador. */
  contactoEmpresaId?: string
  empresa?: string
  ruc?: string
  ciiu?: string
  sector?: string
  descripcion?: string
  direccion?: string
  sitioWeb?: string
  ubigeo?: string
  departamento?: string
  provincia?: string
  distrito?: string
  cargo?: string
  area?: string
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
  empresa?: string
  ruc?: string
  ciiu?: string
  sector?: string
  descripcion?: string
  direccion?: string
  sitioWeb?: string
  ubigeo?: string
  departamento?: string
  provincia?: string
  distrito?: string
  cargo?: string
  area?: string
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
  tipoEmbajador?: TipoEmbajador
  empresaId?: string
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

export type RedSocial = 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK'

export interface CaptarInfluencersInput {
  prompt: string
  redesSociales?: RedSocial[]
  maxItems?: number
  minSeguidores?: number
  maxSeguidores?: number
  consultaId?: string
  incluirFiltroContacto?: boolean
}

export interface CaptarInfluencersResponse {
  totalResultados: number
  validos: number
  nuevos: number
  actualizados: number
  conEmail: number
  porRed: Record<string, number>
}

/** Fila no importada porque el usuario ya existe (POST /influencers/importar-excel). */
export interface FilaOmitidaImportacion {
  fila: number
  usuarioIg: string
  motivo: string
}

/** Fila con un dato invalido (POST /influencers/importar-excel). */
export interface FilaErrorImportacion {
  fila: number
  campo: string
  mensaje: string
}

/** Respuesta de POST /influencers/importar-excel. */
export interface ResultadoImportacionExcel {
  totalFilas: number
  importados: number
  omitidos: FilaOmitidaImportacion[]
  errores: FilaErrorImportacion[]
}
