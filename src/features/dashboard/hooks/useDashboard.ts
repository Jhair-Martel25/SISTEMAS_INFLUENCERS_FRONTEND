import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { DashboardDataSchema } from '../schemas/dashboard.schema'
import { datosDemo } from '../demo/datosDemo'
import type { DashboardData, DashboardFiltros } from '@/types/dashboard'

/** Intervalo de actualización del dashboard (tiempo real aproximado). */
const INTERVALO_ACTUALIZACION_MS = 60_000

/**
 * Modo de prueba: con NEXT_PUBLIC_DASHBOARD_DEMO=true se muestran datos ficticios
 * en lugar de llamar al backend. Solo para desarrollo; no afecta la base de datos.
 */
const MODO_DEMO = process.env.NEXT_PUBLIC_DASHBOARD_DEMO === 'true'

/**
 * KPIs y gráficos del dashboard (solo ADMIN).
 * Se refresca cada minuto y al volver a la pestaña.
 */
export function useDashboard(filtros?: DashboardFiltros) {
  return useQuery({
    queryKey: ['dashboard', filtros ?? {}, MODO_DEMO],
    queryFn: async (): Promise<DashboardData> => {
      if (MODO_DEMO) return datosDemo(filtros)
      const data = await dashboardService.obtener(filtros)
      return DashboardDataSchema.parse(data)
    },
    refetchInterval: MODO_DEMO ? false : INTERVALO_ACTUALIZACION_MS,
    refetchOnWindowFocus: !MODO_DEMO,
  })
}
