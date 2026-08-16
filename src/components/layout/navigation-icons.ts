import {
  BarChart3,
  FileText,
  Home,
  Mail,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import type { Recurso } from '@/config/roles'

/**
 * Iconos por recurso de navegación.
 *
 * Capa de presentación: mapea cada recurso (config/navigation) a su icono de
 * lucide-react. Mantener aquí evita que `config/` dependa de la librería de UI.
 */
export const ICONO_POR_RECURSO: Record<Recurso, LucideIcon> = {
  dashboard: Home,
  influencers: Users,
  reuniones: Video,
  agenda: BarChart3,
  usuarios: UserPlus,
  plantillas: FileText,
  email: Mail,
}
