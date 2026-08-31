import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { DashboardDataSchema } from '../schemas/dashboard.schema'
import type { DashboardData, DashboardFiltros } from '@/types/dashboard'

/**
 * Hooks de la feature `dashboard`.
 *
 * Envuelven el service con TanStack Query. El queryFn valida la respuesta
 * con Zod antes de cachearla.
 */

/** KPIs y gráficos del dashboard (solo ADMIN). */
export function useDashboard(filtros?: DashboardFiltros) {
  return useQuery({
    queryKey: ['dashboard', filtros ?? {}],
    queryFn: async (): Promise<DashboardData> => {
      const data = await dashboardService.obtener(filtros)
      return DashboardDataSchema.parse(data)
    },
  })
}