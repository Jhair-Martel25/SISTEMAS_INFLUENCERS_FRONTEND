import type { DashboardFiltros } from '@/types/dashboard'

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

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
