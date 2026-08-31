/**
 * Utilidades de fecha y zona horaria.
 *
 * Convenciones del backend (CONTEXTO_FRONTEND.md §2.5):
 *  - ENTRADA (crear disponibilidad): "YYYY-MM-DD HH:mm:ss" (hora Perú).
 *  - SALIDA  (reuniones/bloques): ISO 8601 con Z → convertir a zona local.
 */

export const ZONA_HORARIA_DEFAULT = 'America/Lima'

/** Zona horaria del navegador (para enviar en POST /reuniones). */
export function zonaHorariaNavegador(): string {
  if (typeof Intl === 'undefined') return ZONA_HORARIA_DEFAULT
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_HORARIA_DEFAULT
  } catch {
    return ZONA_HORARIA_DEFAULT
  }
}

/** Formatea un ISO 8601 a "15 ago 2026, 13:00" en la zona indicada. */
export function formatearFechaUI(
  iso: string,
  zona: string = ZONA_HORARIA_DEFAULT,
): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso

  const fechaTexto = new Intl.DateTimeFormat('es-PE', {
    timeZone: zona,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha)

  const horaTexto = new Intl.DateTimeFormat('es-PE', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)

  return `${fechaTexto}, ${horaTexto}`
}

/**
 * Convierte un Date a "YYYY-MM-DD HH:mm:ss" en la zona indicada, que es el
 * formato que espera el backend al crear disponibilidades. La zona por defecto
 * es la del navegador (el voluntario suele operar en su zona local).
 */
export function aFormatoAPI(date: Date, zona: string = zonaHorariaNavegador()): string {
  const partes = new Intl.DateTimeFormat('sv-SE', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ''

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}
