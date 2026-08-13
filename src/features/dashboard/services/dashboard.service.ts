import { apiClient } from '@/lib/http'
import type { DashboardData, DashboardFiltros } from '@/types/dashboard'

const BASE_PATH = '/dashboard'

export const dashboardService = {
  /** KPIs y gráficos del embudo (solo ADMIN). */
  async obtener(filtros?: DashboardFiltros): Promise<DashboardData> {
    return apiClient.get<DashboardData>(BASE_PATH, { params: filtros })
  },
}
