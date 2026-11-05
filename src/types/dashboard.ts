/**
 * Dashboard (solo ADMIN)
 * ----------------------
 * GET /dashboard con filtros opcionales `fechaInicio` y `fechaFin` (YYYY-MM-DD).
 * Los gráficos opcionales aún no los envía el backend; la UI muestra un estado vacío.
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
  /** Promedio diario de correos por semana. labels: "Semana 1", "Semana 2"... */
  correosPorSemana?: ChartData
  /**
   * Correos por día del mes. labels: días ("1", "2"...), un dataset por usuario.
   * La suma de todos los datasets de un día no debe pasar de 300.
   */
  correosPorUsuarioDia?: ChartData
  /** labels: "Empresas", "Influencers". */
  contactados?: ChartData
  /** Reuniones agendadas por semana del mes. labels: "Semana 1"... */
  reunionesPorSemana?: ChartData
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
