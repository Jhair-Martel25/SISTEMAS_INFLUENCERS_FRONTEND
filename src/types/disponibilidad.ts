/**
 * Disponibilidades
 * ----------------
 * Bloques reales de cita de 60 min (o 20 min puntuales). Ver §3.7 y §4.3.
 *
 * Notas de fechas (CONTEXTO §4.3):
 *  - ENTRADA (crear): "YYYY-MM-DD HH:mm:ss" (hora local del voluntario) + `zonaHoraria`.
 *  - SALIDA  (listar): ISO 8601 con Z (UTC) → convertir a la zona del que mira.
 */

export interface VoluntarioDisponibilidad {
  id: string
  nombre: string
}

export interface DisponibilidadCita {
  id: string
  fechaHora: string
  /** Presente en mis-bloques; ausente en /disponibles (público). */
  disponible?: boolean
  /** Presente en GET /horarios (ADMIN); ausente en mis-bloques/disponibles. */
  voluntarioId?: string
  voluntarioNombre?: string
  /** Solo presente en GET /disponibilidades/disponibles (público). */
  voluntario?: VoluntarioDisponibilidad
}

/** Body de POST /disponibilidades (bloque manual). */
export interface CrearDisponibilidadInput {
  fechaHora: string
  disponible?: boolean
  /** Zona del navegador del voluntario (el backend convierte a UTC). */
  zonaHoraria?: string
}

/** Body de POST /disponibilidades/generar. */
export interface GenerarDisponibilidadInput {
  zonaHoraria?: string
}

/** Query params de GET /disponibilidades/disponibles y /mis-bloques. */
export interface DisponibilidadFiltros {
  voluntarioId?: string
  disponible?: boolean
  desde?: string
  hasta?: string
  /** Zona del navegador (el backend interpreta desde/hasta en esa zona). */
  zonaHoraria?: string
  page?: number
  limit?: number
}
