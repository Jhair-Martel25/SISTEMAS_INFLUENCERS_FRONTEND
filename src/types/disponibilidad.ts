/**
 * Disponibilidades
 * ----------------
 * Bloques reales de cita de 60 min (o 20 min puntuales). Ver §3.7.
 *
 * Notas de fechas:
 *  - ENTRADA (crear): "YYYY-MM-DD HH:mm:ss" (hora Perú).
 *  - SALIDA  (listar): ISO 8601 con Z (convertir a zona local para mostrar).
 */

export interface VoluntarioDisponibilidad {
  id: string
  nombre: string
}

export interface DisponibilidadCita {
  id: string
  fechaHora: string
  disponible: boolean
  voluntarioId: string
  voluntarioNombre?: string
  /** Solo presente en GET /disponibilidades/disponibles (público). */
  voluntario?: VoluntarioDisponibilidad
}

/** Body de POST /disponibilidades (bloque manual). */
export interface CrearDisponibilidadInput {
  fechaHora: string
  disponible?: boolean
}

/** Body de POST /disponibilidades/generar. */
export interface GenerarDisponibilidadInput {
  zonaHoraria?: string
}

/** Query params de GET /disponibilidades/disponibles. */
export interface DisponibilidadFiltros {
  voluntarioId?: string
  disponible?: boolean
  desde?: string
  hasta?: string
}
