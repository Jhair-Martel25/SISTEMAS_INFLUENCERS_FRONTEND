import { z } from 'zod'
import { ESTADO_USUARIO, type EstadoUsuario } from '@/types/api'

/**
 * Schemas Zod de la feature `usuarios`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. Los valores de estado se derivan del canon en
 * `@/types/api` (una sola fuente de verdad).
 */

export const EstadoUsuarioEnum = z.enum(
  Object.values(ESTADO_USUARIO) as [EstadoUsuario, ...EstadoUsuario[]],
)

export const UsuarioSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombre: z.string(),
  estado: EstadoUsuarioEnum,
  roleId: z.number(),
  createdAt: z.string().optional(),
})

export const UsuarioListaSchema = z.object({
  data: z.array(UsuarioSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})