import type { Role } from '@/types/api'

/**
 * Permisos por rol (tabla centralizada).
 *
 * Define qué secciones puede ver cada rol. Se usa en el Sidebar (menú) y en
 * el layout protegido (guard de navegación). Los permisos reflejan la tabla
 * de endpoints del backend (CONTEXTO_FRONTEND.md §3).
 *
 * Nota: la seguridad real la aplica el backend (403 si no corresponde);
 * estas reglas son para la experiencia de usuario (ocultar menús y evitar
 * navegar a secciones prohibidas).
 */

export const RECURSOS = {
  DASHBOARD: 'dashboard',
  INFLUENCERS: 'influencers',
  HORARIOS: 'horarios',
  DISPONIBILIDAD: 'disponibilidad',
  REUNIONES: 'reuniones',
  USUARIOS: 'usuarios',
  PLANTILLAS: 'plantillas',
  EMAIL: 'email',
  PERFIL: 'perfil',
} as const

export type Recurso = (typeof RECURSOS)[keyof typeof RECURSOS]

const PERMISOS_POR_ROL: Record<Role, Recurso[]> = {
  ADMIN: [
    RECURSOS.DASHBOARD,
    RECURSOS.INFLUENCERS,
    RECURSOS.HORARIOS,
    RECURSOS.REUNIONES,
    RECURSOS.USUARIOS,
    RECURSOS.PLANTILLAS,
    RECURSOS.EMAIL,
    RECURSOS.PERFIL,
  ],
  VOLUNTARIO: [
    RECURSOS.INFLUENCERS,
    RECURSOS.HORARIOS,
    RECURSOS.DISPONIBILIDAD,
    RECURSOS.REUNIONES,
    RECURSOS.PLANTILLAS,
    RECURSOS.PERFIL,
  ],
}

/** ¿El rol puede ver el recurso? */
export function puedeVer(role: Role | undefined, recurso: Recurso): boolean {
  if (!role) return false
  return PERMISOS_POR_ROL[role].includes(recurso)
}

/** ¿El rol es ADMIN? */
export function esAdmin(role: Role | undefined): boolean {
  return role === 'ADMIN'
}

/** Ruta inicial a la que redirigir según el rol. */
export function homeSegunRol(role: Role | undefined): string {
  return esAdmin(role) ? '/dashboard' : '/influencers'
}