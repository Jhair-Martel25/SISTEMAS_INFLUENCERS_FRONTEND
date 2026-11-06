import { z } from 'zod'
import { DIA_SEMANA, type DiaSemana } from '@/types/api'

/**
 * Schemas Zod de la feature `horarios`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. `diaSemana` se deriva del canon en `@/types/api`
 * (una sola fuente de verdad).
 */

export const DiaSemanaEnum = z.enum(
  Object.values(DIA_SEMANA) as [DiaSemana, ...DiaSemana[]],
)

export const HorarioSchema = z.object({
  id: z.string(),
  diaSemana: DiaSemanaEnum,
  horaInicio: z.string(),
  horaFin: z.string(),
  voluntarioId: z.string().optional(),
  voluntario: z.object({
    nombre: z.string(),
  }).optional(),
})

export const HorarioResumenUsuarioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  email: z.string(),
  foto: z.string().nullable().optional(),
  estado: z.string(),
  rol: z.string(),
  horarios: z.array(
    z.object({
      id: z.string(),
      diaSemana: DiaSemanaEnum,
      horaInicio: z.string(),
      horaFin: z.string(),
    }),
  ),
  minutosSemanales: z.number(),
})

export const HorarioResumenListaSchema = z.array(HorarioResumenUsuarioSchema)

export const HorarioListaSchema = z.object({
  data: z.array(HorarioSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})
