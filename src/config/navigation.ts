import type { Recurso } from './roles'

/**
 * Navegación del panel (única fuente de verdad de las secciones).
 *
 * Cada sección se describe UNA sola vez aquí (recurso, ruta, etiqueta y
 * descripción). El Sidebar, el Dashboard y el guard de rutas consumen esta
 * misma lista y la filtran por permiso, de modo que agregar o renombrar una
 * sección se hace en un solo lugar.
 *
 * Los iconos NO viven aquí: se resuelven en `components/layout/navigation-icons`
 * para que esta capa de configuración no dependa de librerías de UI.
 */

export interface ItemNavegacion {
  recurso: Recurso
  href: string
  label: string
  desc: string
}

export const NAVEGACION: ItemNavegacion[] = [
  {
    recurso: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'Analítica y KPIs del sistema',
  },
  {
    recurso: 'influencers',
    href: '/influencers',
    label: 'Influencers',
    desc: 'Administra y valida influencers',
  },
  {
    recurso: 'horarios',
    href: '/horarios',
    label: 'Horarios',
    desc: 'Configura tu horario semanal',
  },
  {
    recurso: 'disponibilidad',
    href: '/disponibilidades',
    label: 'Disponibilidad',
    desc: 'Gestiona tus bloques de disponibilidad',
  },
  {
    recurso: 'reuniones',
    href: '/reuniones/gestion',
    label: 'Reuniones',
    desc: 'Coordina y da seguimiento',
  },
  {
    recurso: 'usuarios',
    href: '/usuarios',
    label: 'Usuarios',
    desc: 'Administra usuarios y roles',
  },
  {
    recurso: 'plantillas',
    href: '/plantillas',
    label: 'Plantillas',
    desc: 'Gestiona plantillas de correo',
  },
  {
    recurso: 'email',
    href: '/email',
    label: 'Email',
    desc: 'Envía correos a influencers',
  },
]

/**
 * Devuelve el recurso al que pertenece una ruta (para el guard del layout).
 * Se deriva de la misma lista de navegación (coincide por prefijo más largo),
 * evitando duplicar el mapeo ruta → recurso.
 */
export function recursoDeRuta(pathname: string): Recurso | undefined {
  const match = NAVEGACION.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0]

  return match?.recurso
}
