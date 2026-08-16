import { z } from 'zod'

/**
 * Schemas Zod de la feature `plantillas`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. La lista NO está paginada (array plano).
 */

export const PlantillaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  asunto: z.string(),
  cuerpo: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const PlantillaListaSchema = z.array(PlantillaSchema)
