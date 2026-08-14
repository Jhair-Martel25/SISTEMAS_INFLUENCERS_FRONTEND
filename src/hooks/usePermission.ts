'use client'

import { useAuth } from '@/hooks/useAuth'
import {
  homeSegunRol,
  puedeVer,
  type Recurso,
} from '@/config/roles'

/**
 * Hook de permisos por rol.
 * Lee el estado del usuario logueado (Zustand) y expone utilidades para
 * consultar si puede ver un recurso, su rol y su ruta inicial.
 */
export function usePermission() {
  const { user, isAdmin, isVoluntario } = useAuth()
  const role = user?.role

  return {
    isAdmin,
    isVoluntario,
    puede: (recurso: Recurso) => puedeVer(role, recurso),
    home: () => homeSegunRol(role),
  }
}
