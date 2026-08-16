import { z } from 'zod'
import { ESTADO_CONTACTO, ESTADO_VALIDACION, type EstadoContacto, type EstadoValidacion } from '@/types/api'

/**
 * Schemas Zod de la feature `influencers`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. Los valores de estado se derivan del canon en
 * `@/types/api` (una sola fuente de verdad).
 */

export const EstadoValidacionEnum = z.enum(
  Object.values(ESTADO_VALIDACION) as [EstadoValidacion, ...EstadoValidacion[]],
)
export const EstadoContactoEnum = z.enum(
  Object.values(ESTADO_CONTACTO) as [EstadoContacto, ...EstadoContacto[]],
)

export const InfluencerResumenUsuarioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
})

export const InfluencerSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  usuarioIg: z.string(),
  linkIg: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  seguidores: z.string().nullable().optional(),
  cantidad_post: z.string().nullable().optional(),
  biografia: z.string().nullable().optional(),
  mensajePersonalizado: z.string().nullable().optional(),
  estadoValidacion: EstadoValidacionEnum,
  estadoContacto: EstadoContactoEnum,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  validadoPor: InfluencerResumenUsuarioSchema.nullable().optional(),
})

export const InfluencerListaSchema = z.object({
  data: z.array(InfluencerSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})
