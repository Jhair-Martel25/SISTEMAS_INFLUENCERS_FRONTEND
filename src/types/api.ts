/**
 * Canon de valores y envoltorios de respuesta de la API.
 *
 * Fuente de verdad: CONTEXTO_FRONTEND.md (§1.5 glosario de estados y
 * §2.3 formato de respuestas del backend). Toda la app debe importar
 * estos valores desde aquí y no hardcodearlos en componentes.
 */

// ---------------------------------------------------------------------------
// Estados del backend (glosario §1.5)
// ---------------------------------------------------------------------------

export const ESTADO_VALIDACION = {
  PENDIENTE: 'PENDIENTE',
  VALIDADO: 'VALIDADO',
  RECHAZADO: 'RECHAZADO',
} as const

export const ESTADO_CONTACTO = {
  SIN_CONTACTAR: 'SIN_CONTACTAR',
  CORREO_ENVIADO: 'CORREO_ENVIADO',
  FORMULARIO_LLENADO: 'FORMULARIO_LLENADO',
  REUNION_AGENDADA: 'REUNION_AGENDADA',
  RECHAZO_CONTACTO: 'RECHAZO_CONTACTO',
} as const

export const ESTADO_REUNION = {
  PENDIENTE: 'PENDIENTE',
  REALIZADA: 'REALIZADA',
  CANCELADA: 'CANCELADA',
  NO_ASISTIO: 'NO_ASISTIO',
} as const

export const ESTADO_USUARIO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const

export const ESTADO_CONSULTA_IA = {
  PROCESANDO: 'PROCESANDO',
  COMPLETADO: 'COMPLETADO',
  ERROR: 'ERROR',
} as const

export const DIA_SEMANA = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
} as const

export const TEMATICA = {
  SALUD: 'SALUD',
  AMBIENTE: 'AMBIENTE',
  FAUNA: 'FAUNA',
  REFORESTACION: 'REFORESTACION',
  MEDIATICO: 'MEDIATICO',
  EDUCACION: 'EDUCACION',
} as const

// ---------------------------------------------------------------------------
// Tipos derivados de las constantes
// ---------------------------------------------------------------------------

export type EstadoValidacion = keyof typeof ESTADO_VALIDACION
export type EstadoContacto = keyof typeof ESTADO_CONTACTO
export type EstadoReunion = keyof typeof ESTADO_REUNION
export type EstadoUsuario = keyof typeof ESTADO_USUARIO
export type EstadoConsultaIA = keyof typeof ESTADO_CONSULTA_IA
export type DiaSemana = keyof typeof DIA_SEMANA
export type Tematica = keyof typeof TEMATICA

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = {
  ADMIN: 'ADMIN',
  VOLUNTARIO: 'VOLUNTARIO',
} as const

export type Role = keyof typeof ROLES

/** Mapeo roleId → Role (el backend usa 1 = ADMIN, 2 = VOLUNTARIO). */
export const ROLE_ID_A_ROLE: Record<number, Role> = {
  1: ROLES.ADMIN,
  2: ROLES.VOLUNTARIO,
}

export function roleDesdeId(roleId: number): Role | undefined {
  return ROLE_ID_A_ROLE[roleId]
}

// ---------------------------------------------------------------------------
// Envoltorios de respuesta del interceptor global (§2.3)
// ---------------------------------------------------------------------------

/** Respuesta de éxito no paginada: { data, mensaje }. */
export interface ApiResponse<T> {
  data: T
  mensaje: string
}

export interface MetaPaginacion {
  total: number
  page: number
  limit: number
}

/**
 * Respuesta de éxito paginada (usuarios e influencers).
 * Los ítems viven en `res.data.data` y la paginación en `res.data.meta`.
 */
export interface ApiPaginatedResponse<T> {
  data: {
    data: T[]
    meta: MetaPaginacion
  }
  mensaje: string
}

/**
 * Payload paginado ya normalizado por el cliente API (tras extraer el
 * envoltorio). Lo usan los servicios que llaman a endpoints paginados:
 * `apiClient.get<DataPaginated<T>>(...)` devuelve `{ data: T[], meta }`.
 */
export interface DataPaginated<T> {
  data: T[]
  meta: MetaPaginacion
}

/** Cuerpo de error (HTTP ≠ 2xx). No usa el wrapper { data }. */
export interface ApiErrorBody {
  statusCode: number
  mensaje: string
  timestamp: string
  ruta: string
}
