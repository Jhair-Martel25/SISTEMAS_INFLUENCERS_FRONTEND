import { z } from 'zod'

/**
 * Schemas Zod de la feature `dashboard`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. Ver CONTEXTO_FRONTEND.md §3.10.
 */

export const DashboardKpisSchema = z.object({
  totalInfluencers: z.number(),
  pendientes: z.number(),
  validados: z.number(),
  rechazados: z.number(),
  correoEnviado: z.number(),
  reunionAgendada: z.number(),
  sinContactar: z.number(),
  reunionesHoy: z.number(),
  reunionesSemana: z.number(),
  reunionesMes: z.number(),
})

export const ChartDatasetSchema = z.object({
  label: z.string(),
  data: z.array(z.number()),
})

export const ChartDataSchema = z.object({
  title: z.string(),
  labels: z.array(z.string()),
  datasets: z.array(ChartDatasetSchema),
})

export const DashboardChartsSchema = z.object({
  embudo: ChartDataSchema,
  topVoluntarios: ChartDataSchema,
  usoPlantillas: ChartDataSchema,
})

export const DashboardDataSchema = z.object({
  kpis: DashboardKpisSchema,
  charts: DashboardChartsSchema,
})

export type DashboardDataValidated = z.infer<typeof DashboardDataSchema>