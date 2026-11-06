import type { DiaSemana } from '@/types/api'
import {
  DIAS_GRILLA,
  GRILLA_FIN_MIN,
  GRILLA_INICIO_MIN,
  GRILLA_PASO_MIN,
  type BloqueHorario,
} from '@/types/horario'

/**
 * Utilidades de la cuadrícula semanal (lunes a sábado, 08:00–22:00, 30 min).
 * La selección se representa como un Set de claves "DIA|minutos".
 */

export type SeleccionGrilla = Set<string>

/** Minuto de inicio de cada fila: 480 (08:00) … 1290 (21:30). */
export const FILAS_GRILLA: number[] = Array.from(
  { length: (GRILLA_FIN_MIN - GRILLA_INICIO_MIN) / GRILLA_PASO_MIN },
  (_, i) => GRILLA_INICIO_MIN + i * GRILLA_PASO_MIN,
)

export function clave(dia: DiaSemana, minuto: number) {
  return `${dia}|${minuto}`
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function aHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

/** Rangos guardados → celdas marcadas (recortadas al rango de la grilla). */
export function bloquesASeleccion(bloques: BloqueHorario[]): SeleccionGrilla {
  const sel: SeleccionGrilla = new Set()
  for (const b of bloques) {
    const inicio = Math.max(GRILLA_INICIO_MIN, aMinutos(b.horaInicio))
    const fin = Math.min(GRILLA_FIN_MIN, aMinutos(b.horaFin))
    for (const fila of FILAS_GRILLA) {
      if (fila >= inicio && fila + GRILLA_PASO_MIN <= fin) sel.add(clave(b.diaSemana, fila))
    }
  }
  return sel
}

/** Celdas marcadas → rangos continuos por día (lo que se guarda en el backend). */
export function seleccionABloques(sel: SeleccionGrilla): BloqueHorario[] {
  const bloques: BloqueHorario[] = []
  for (const dia of DIAS_GRILLA) {
    let inicio: number | null = null
    for (const fila of [...FILAS_GRILLA, GRILLA_FIN_MIN]) {
      const marcada = fila < GRILLA_FIN_MIN && sel.has(clave(dia.value, fila))
      if (marcada && inicio === null) inicio = fila
      if (!marcada && inicio !== null) {
        bloques.push({ diaSemana: dia.value, horaInicio: aHora(inicio), horaFin: aHora(fila) })
        inicio = null
      }
    }
  }
  return bloques
}

export function minutosDeBloques(bloques: BloqueHorario[]): number {
  return bloques.reduce((t, b) => t + Math.max(0, aMinutos(b.horaFin) - aMinutos(b.horaInicio)), 0)
}

/** 1500 → "25 horas", 450 → "7 h 30 min", 30 → "30 min". */
export function formatearHoras(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} ${h === 1 ? 'hora' : 'horas'}`
  return `${h} h ${m} min`
}

export function mismaSeleccion(a: SeleccionGrilla, b: SeleccionGrilla) {
  if (a.size !== b.size) return false
  for (const k of a) if (!b.has(k)) return false
  return true
}
