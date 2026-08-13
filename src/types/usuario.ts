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
