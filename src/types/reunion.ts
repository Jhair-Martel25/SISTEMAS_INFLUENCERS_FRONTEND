export type EstadoReunion = 'PENDIENTE' | 'REALIZADA' | 'CANCELADA' | 'NO_ASISTIO'

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

export interface AgendarReunionInput {
  email: string
  disponibilidadCitaId: string
  duracionMinutos?: number
  zonaHoraria?: string
}

export interface ActualizarEstadoReunionInput {
  estado: 'REALIZADA' | 'CANCELADA' | 'NO_ASISTIO'
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