import type { EstadoReunion } from './api'

/**
 * Reuniones
 * ---------
 * Entidad tal como la devuelve el backend (GET /reuniones, POST /reuniones).
 * Ver CONTEXTO_FRONTEND.md §3.8.
 *
 * ⚠️ El campo se llama `googleMeetLink` por herencia, pero el link real es de
 * Jitsi (meet.jit.si). En la UI mostrarlo como "link de la videollamada".
 */

export interface VoluntarioResumen {
  id: string
  nombre: string
  email?: string
}

export interface InfluencerResumen {
  id: string
  nombre: string
  usuarioIg?: string | null
  email?: string
  phone?: string | null
}

export interface DisponibilidadCitaResumen {
  id: string
  voluntario: VoluntarioResumen
}

export interface Reunion {
  id: string
  fechaHora: string
  duracionMinutos: number
  estado: EstadoReunion
  googleMeetLink: string | null
  googleCalendarEventId?: string | null
  createdAt?: string
  disponibilidadCita: DisponibilidadCitaResumen
  influencer: InfluencerResumen
}

/** Body de POST /reuniones (público — lo usa el influencer). */
export interface AgendarReunionInput {
  email: string
  disponibilidadCitaId: string
  duracionMinutos?: number
  zonaHoraria?: string
}

/** Body de PATCH /reuniones/:id/estado. */
export interface ActualizarEstadoReunionInput {
  estado: Exclude<EstadoReunion, 'PENDIENTE'>
}

/** Query params de GET /reuniones. */
export interface ReunionFiltros {
  estado?: EstadoReunion
}

export const ESTADOS_REUNION: { value: EstadoReunion; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'REALIZADA', label: 'Realizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'NO_ASISTIO', label: 'No asistió' },
]

export function etiquetaEstadoReunion(estado: EstadoReunion): string {
  return ESTADOS_REUNION.find((e) => e.value === estado)?.label ?? estado
}
