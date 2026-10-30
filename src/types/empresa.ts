/**
 * Empresas y embajadores corporativos
 * ------------------------------------
 * Contrato del módulo `empresas` del backend (base corporativa + contactos).
 * Un embajador de tipo EMPRESA puede vincularse a una empresa registrada y a
 * uno de sus contactos/funcionarios (ver `POST /influencers`).
 */

export const TIPO_EMBAJADOR = {
  EMPRESA: 'EMPRESA',
  INFLUENCER: 'INFLUENCER',
} as const

export type TipoEmbajador = keyof typeof TIPO_EMBAJADOR

export const ORIGEN_EMPRESA = {
  BASE_DATOS: 'BASE_DATOS',
  MANUAL: 'MANUAL',
} as const

export type OrigenEmpresa = keyof typeof ORIGEN_EMPRESA

/** Etiqueta amigable para el selector de tipo. */
export interface TipoEmbajadorOpcion {
  valor: TipoEmbajador
  etiqueta: string
  descripcion: string
}

export const TIPOS_EMBAJADOR: TipoEmbajadorOpcion[] = [
  {
    valor: TIPO_EMBAJADOR.INFLUENCER,
    etiqueta: 'Influencer',
    descripcion: 'Perfil personal de Instagram, TikTok o Facebook.',
  },
  {
    valor: TIPO_EMBAJADOR.EMPRESA,
    etiqueta: 'Empresa',
    descripcion:
      'Empresa de la base corporativa (o nueva) con su contacto/funcionario.',
  },
]

/** Contacto o funcionario de una empresa (GET /empresas/:id/contactos). */
export interface ContactoEmpresa {
  id: string
  nombres: string
  apellidos: string | null
  nombreCompleto: string
  cargo: string | null
  area: string | null
  email: string | null
  telefono: string | null
  whatsapp: string | null
  linkedin: string | null
  principal: boolean
  influencerId: string | null
}

/** Resultado de GET /empresas/buscar (autocompletado). */
export interface EmpresaBusqueda {
  id: string
  nombre: string
  ruc: string | null
  ciiu: string | null
  tipoEmpresaCiiu: string | null
  sector: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
  totalContactos: number
}

/** Datos prellenados que entrega el backend para registrar al embajador. */
export interface EmpresaPrefill {
  tipoEmbajador: TipoEmbajador
  empresaId: string
  empresa: string
  ruc: string | null
  ciiu: string | null
  tipoEmpresaCiiu: string | null
  sector: string | null
  descripcion: string | null
  email: string | null
  emailCorporativo: string | null
  phone: string | null
  ubigeo: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
  direccion: string | null
  sitioWeb: string | null
}

/** Detalle completo de una empresa (GET /empresas/:id). */
export interface Empresa {
  id: string
  nombre: string
  ruc: string | null
  ciiu: string | null
  tipoEmpresaCiiu: string | null
  sector: string | null
  ranking: number | null
  descripcion: string | null
  direccion: string | null
  sitioWeb: string | null
  telefono1: string | null
  telefono2: string | null
  telefono3: string | null
  fax1: string | null
  emailCorporativo: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
  ubigeo: string | null
  activa: boolean
  origen: OrigenEmpresa
  contactos: ContactoEmpresa[]
  prefill: EmpresaPrefill
}

export interface CrearContactoEmpresaInput {
  nombres: string
  apellidos?: string
  cargo?: string
  area?: string
  email?: string
  telefono?: string
  whatsapp?: string
  linkedin?: string
  notas?: string
  principal?: boolean
}

export type ActualizarContactoEmpresaInput = Partial<CrearContactoEmpresaInput>

export interface CrearEmpresaInput {
  nombre: string
  ruc?: string
  ciiu?: string
  tipoEmpresaCiiu?: string
  sector?: string
  ranking?: number
  descripcion?: string
  direccion?: string
  sitioWeb?: string
  telefono1?: string
  telefono2?: string
  telefono3?: string
  fax1?: string
  emailCorporativo?: string
  departamento?: string
  provincia?: string
  distrito?: string
  ubigeo?: string
  contactos?: CrearContactoEmpresaInput[]
}

export type ActualizarEmpresaInput = Partial<
  Omit<CrearEmpresaInput, 'contactos'>
>

export interface EmpresaBusquedaFiltros {
  q?: string
  limite?: number
}

/** Resumen de empresa que viene embebido en un influencer. */
export interface EmpresaRegistradaResumen {
  id: string
  nombre: string
  ruc: string | null
  ciiu: string | null
  tipoEmpresaCiiu: string | null
}
