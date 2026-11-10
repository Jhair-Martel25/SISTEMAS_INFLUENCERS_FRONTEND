import type { ChartData, DashboardFiltros } from '@/types/dashboard'

/** Máximo de días que se pueden elegir en el filtro de rango. */
export const MAX_DIAS_RANGO = 7

/**
 * Rango de un mes del año, en instantes ISO (inicio y fin del mes en hora local).
 * `mes` va de 1 (enero) a 12 (diciembre).
 * El backend convierte cada valor con `new Date(...)`; al enviar instantes
 * locales evitamos que una fecha YYYY-MM-DD se corra de día por la zona horaria.
 */
export function rangoMes(anio: number, mes: number): DashboardFiltros {
  const inicio = new Date(anio, mes - 1, 1, 0, 0, 0, 0)
  const fin = new Date(anio, mes, 0, 23, 59, 59, 999)
  return {
    fechaInicio: inicio.toISOString(),
    fechaFin: fin.toISOString(),
  }
}

/** Fecha en formato YYYY-MM-DD. `mes` va de 1 a 12. */
export function fechaTexto(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Rango por defecto de un mes: del día 1 al día 7 (o al último día si el mes es más corto). */
export function rangoPrimerosDias(anio: number, mes: number): { desde: string; hasta: string } {
  const ultimo = new Date(anio, mes, 0).getDate()
  return {
    desde: fechaTexto(anio, mes, 1),
    hasta: fechaTexto(anio, mes, Math.min(MAX_DIAS_RANGO, ultimo)),
  }
}

/** Suma (o resta, con n negativo) días a una fecha YYYY-MM-DD. */
export function sumarDias(fecha: string, n: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia + n)).toISOString().slice(0, 10)
}

/** Cantidad de días entre dos fechas YYYY-MM-DD, incluyendo ambas. */
export function diasEnRango(desde: string, hasta: string): number {
  const [a, m, d] = desde.split('-').map(Number)
  const [a2, m2, d2] = hasta.split('-').map(Number)
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a, m - 1, d)) / 86400000) + 1
}

/** Instantes ISO (hora local) que cubren desde..hasta, ambos incluidos. */
export function filtrosDeDias(desde: string, hasta: string): DashboardFiltros {
  const [a, m, d] = desde.split('-').map(Number)
  const [a2, m2, d2] = hasta.split('-').map(Number)
  return {
    fechaInicio: new Date(a, m - 1, d, 0, 0, 0, 0).toISOString(),
    fechaFin: new Date(a2, m2 - 1, d2, 23, 59, 59, 999).toISOString(),
  }
}

/** Deja solo los días (labels YYYY-MM-DD) que caen dentro del rango. */
export function recortarDias(chart: ChartData | undefined, desde: string, hasta: string): ChartData | undefined {
  if (!chart) return undefined
  const indices = chart.labels
    .map((label, i) => (label >= desde && label <= hasta ? i : -1))
    .filter((i) => i >= 0)
  return {
    ...chart,
    labels: indices.map((i) => chart.labels[i]),
    datasets: chart.datasets.map((d) => ({
      ...d,
      data: indices.map((i) => d.data[i] ?? 0),
    })),
  }
}

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
