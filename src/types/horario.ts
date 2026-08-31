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
