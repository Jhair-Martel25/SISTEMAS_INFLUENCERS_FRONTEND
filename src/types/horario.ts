import type { DiaSemana } from './api'

/**
 * Horarios
 * --------
 * Horario teórico semanal del voluntario. Ver CONTEXTO_FRONTEND.md §3.6.
 * A partir de él se generan los bloques de disponibilidad.
 */

export interface Horario {
  id: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  /** Presente en GET /horarios (ADMIN); ausente en GET /horarios/mis-horarios. */
  voluntarioId?: string
  voluntario?: {
    nombre: string
  }
}

/** Body de POST /horarios. */
export interface CrearHorarioInput {
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
}

/** Body de PATCH /horarios/:id (cuerpo parcial). */
export type ActualizarHorarioInput = Partial<CrearHorarioInput>

/** Query params de GET /horarios y GET /horarios/mis-horarios. */
export interface HorarioFiltros {
  page?: number
  limit?: number
}

export const DIAS_SEMANA: { value: DiaSemana; corto: string }[] = [
  { value: 'LUNES', corto: 'Lun' },
  { value: 'MARTES', corto: 'Mar' },
  { value: 'MIERCOLES', corto: 'Mié' },
  { value: 'JUEVES', corto: 'Jue' },
  { value: 'VIERNES', corto: 'Vie' },
  { value: 'SABADO', corto: 'Sáb' },
  { value: 'DOMINGO', corto: 'Dom' },
]

// ---------------------------------------------------------------------------
// Horario semanal en cuadrícula (lunes a sábado, 08:00–22:00, bloques de 30 min)
// ---------------------------------------------------------------------------

/** Tramo continuo de un día. */
export interface BloqueHorario {
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
}

/** Body de PUT /horarios/mis-horarios: reemplaza el horario completo. */
export interface GuardarMisHorariosInput {
  bloques: BloqueHorario[]
}

/** Item de GET /horarios/resumen (ADMIN). */
export interface HorarioResumenUsuario {
  id: string
  nombre: string
  email: string
  foto?: string | null
  estado: string
  rol: string
  horarios: (BloqueHorario & { id: string })[]
  minutosSemanales: number
}

/** Días habilitados en la cuadrícula. */
export const DIAS_GRILLA: { value: DiaSemana; corto: string; largo: string }[] = [
  { value: 'LUNES', corto: 'LUN', largo: 'Lunes' },
  { value: 'MARTES', corto: 'MAR', largo: 'Martes' },
  { value: 'MIERCOLES', corto: 'MIÉ', largo: 'Miércoles' },
  { value: 'JUEVES', corto: 'JUE', largo: 'Jueves' },
  { value: 'VIERNES', corto: 'VIE', largo: 'Viernes' },
  { value: 'SABADO', corto: 'SÁB', largo: 'Sábado' },
]

export const GRILLA_INICIO_MIN = 8 * 60
export const GRILLA_FIN_MIN = 22 * 60
export const GRILLA_PASO_MIN = 30
