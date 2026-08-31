/**
 * Dashboard (solo ADMIN)
 * ----------------------
 * Ver CONTEXTO_FRONTEND.md §3.10. GET /dashboard con filtros opcionales
 * `fechaInicio` y `fechaFin` en formato YYYY-MM-DD.
 */

export interface DashboardKpis {
  totalInfluencers: number
  pendientes: number
  validados: number
  rechazados: number
  correoEnviado: number
  reunionAgendada: number
  sinContactar: number
  reunionesHoy: number
  reunionesSemana: number
  reunionesMes: number
}

/** Dataset genérico de un gráfico (ya formateado por el backend). */
export interface ChartDataset {
  label: string
  data: number[]
}

export interface ChartData {
  title: string
  labels: string[]
  datasets: ChartDataset[]
}

export interface DashboardCharts {
  embudo: ChartData
  topVoluntarios: ChartData
  usoPlantillas: ChartData
}

export interface DashboardData {
  kpis: DashboardKpis
  charts: DashboardCharts
}

/** Query params de GET /dashboard. */
export interface DashboardFiltros {
  fechaInicio?: string
  fechaFin?: string
}
