import { z } from 'zod'

/**
 * Schemas Zod de la feature `disponibilidades`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. Ambos endpoints (mis-bloques y disponibles) devuelven
 * un arreglo plano; los campos difieren según el endpoint, por eso casi todo
 * es opcional en el schema.
 */

export const VoluntarioDisponibilidadSchema = z.object({
  id: z.string(),
  nombre: z.string(),
})

export const DisponibilidadCitaSchema = z.object({
  id: z.string(),
  fechaHora: z.string(),
  disponible: z.boolean().optional(),
  voluntarioId: z.string().optional(),
  voluntarioNombre: z.string().optional(),
  voluntario: VoluntarioDisponibilidadSchema.optional(),
})

/** Envoltorio paginado de GET /disponibilidades/disponibles y /mis-bloques. */
export const DisponibilidadListaSchema = z.object({
  data: z.array(DisponibilidadCitaSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})
