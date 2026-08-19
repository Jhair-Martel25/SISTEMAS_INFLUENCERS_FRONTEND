import { z } from 'zod'
import { ESTADO_REUNION, type EstadoReunion } from '@/types/api'

/**
 * Schemas Zod de la feature `reuniones`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. `estado` se deriva del canon en `@/types/api`.
 */

export const EstadoReunionEnum = z.enum(
  Object.values(ESTADO_REUNION) as [EstadoReunion, ...EstadoReunion[]],
)

export const ReunionSchema = z.object({
  id: z.string(),
  fechaHora: z.string(),
  duracionMinutos: z.number(),
  estado: EstadoReunionEnum,
  googleMeetLink: z.string().nullable(),
  googleCalendarEventId: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  disponibilidadCita: z.object({
    id: z.string(),
    voluntario: z.object({
      id: z.string(),
      nombre: z.string(),
      email: z.string().optional(),
    }),
  }),
  influencer: z.object({
    id: z.string(),
    nombre: z.string(),
    usuarioIg: z.string().nullable().optional(),
    email: z.string().optional(),
    phone: z.string().nullable().optional(),
  }),
})

export const ReunionListaSchema = z.array(ReunionSchema)
