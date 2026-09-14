import { z } from 'zod'

/**
 * Schemas Zod de la feature `categorias`.
 *
 * Validan la respuesta de GET /categorias en runtime (contrato) antes de
 * cachearla con TanStack Query. La respuesta viene agrupada por tipo.
 */

export const CategoriaSchema = z.object({
  valor: z.string(),
  etiqueta: z.string(),
  orden: z.number(),
})

export const CategoriasResponseSchema = z.record(z.string(), z.array(CategoriaSchema))
