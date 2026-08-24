import type { EstadoUsuario } from './api'

/**
 * Usuarios
 * --------
 * Ver CONTEXTO_FRONTEND.md §3.2. Solo ADMIN gestiona usuarios.
 * `roleId`: 1 = ADMIN, 2 = VOLUNTARIO.
 */

export interface Usuario {
  id: string
  email: string
  nombre: string
  estado: EstadoUsuario
  roleId: number
  createdAt?: string
  /** Foto de perfil (data URL base64 o URL pública). Ausente/null si no tiene. */
  foto?: string | null
}

/** Body de POST /usuarios. */
export interface CrearUsuarioInput {
  email: string
  nombre: string
  roleId: number
}

/** Body de PATCH /usuarios/:id (cuerpo parcial). */
export interface ActualizarUsuarioInput {
  email?: string
  nombre?: string
  roleId?: number
}

/** Query params de GET /usuarios. */
export interface UsuarioFiltros {
  page?: number
  limit?: number
  estado?: EstadoUsuario
  roleId?: number
}

/**
 * Body de PATCH /usuarios/perfil (autoservicio: el propio usuario logueado).
 * A diferencia de `ActualizarUsuarioInput`, no permite cambiar nombre ni rol.
 */
export interface ActualizarPerfilInput {
  email?: string
  /** Obligatoria si se envía `passwordNueva`. */
  passwordActual?: string
  passwordNueva?: string
  /** Data URL (base64) de la nueva foto de perfil. */
  foto?: string
}