'use client'

import { useAuth } from '@/hooks/useAuth'
import {
  esAdmin,
  homeSegunRol,
  puedeVer,
  type Recurso,
} from '@/config/roles'

/**
 * Hook de permisos por rol.
 * Lee el rol del usuario logueado (Zustand) y expone utilidades para
 * consultar si puede ver un recurso, su rol y su ruta inicial.
 */
export function usePermission() {
  const { user } = useAuth()
  const role = user?.role

  return {
    isAdmin: esAdmin(role),
    isVoluntario: !esAdmin(role),
    puede: (recurso: Recurso) => puedeVer(role, recurso),
    home: () => homeSegunRol(role),
  }
}
