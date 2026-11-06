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
  /** ID del influencer que agenda (llega por el link del correo). */
  influencerId: string
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
  { value: 'NO_ASISTIO', label: 'No realizada' },
]

export function etiquetaEstadoReunion(estado: EstadoReunion): string {
  return ESTADOS_REUNION.find((e) => e.value === estado)?.label ?? estado
}

// ---------------------------------------------------------------------------
// Agenda pública: el invitado elige día y hora del horario de quien lo invitó
// ---------------------------------------------------------------------------

/** Query de GET /reuniones/agenda (llega en el enlace del correo). */
export interface AgendaPublicaQuery {
  influencerId?: string
  contactoId?: string
  voluntarioId?: string
}

export interface SlotAgenda {
  /** Fecha en hora de Perú (YYYY-MM-DD). */
  fecha: string
  /** Hora de inicio en hora de Perú (HH:mm). */
  hora: string
  /** Instante exacto en ISO (UTC). */
  inicio: string
  disponible: boolean
}

export interface AgendaPublica {
  voluntario: { id: string; nombre: string; foto?: string | null }
  invitado: { id: string; nombre: string } | null
  zonaHoraria: string
  duracionMinutos: number
  hoy: string
  dias: number
  slots: SlotAgenda[]
  /** Reunión programada que el invitado ya tiene (se cancelaría al reagendar). */
  reunionVigente?: {
    id: string
    fechaHora: string
    duracionMinutos: number
    conNombre: string
  } | null
}

/** Body de POST /reuniones/agendar-horario. */
export interface AgendarHorarioInput extends AgendaPublicaQuery {
  fecha: string
  hora: string
  zonaHoraria: string
  /** Bloques de 30 min consecutivos (1 = 30 min, 2 = 60 min). */
  bloques?: 1 | 2
  /** Confirmación de que se cancela la reunión vigente. */
  reemplazar?: boolean
}
