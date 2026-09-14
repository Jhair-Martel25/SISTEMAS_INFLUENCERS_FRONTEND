import { useQuery } from '@tanstack/react-query'
import { categoriasService } from '../services/categorias.service'
import { CategoriasResponseSchema } from '../schemas/categorias.schema'
import type { CategoriasResponse, TipoCategoria } from '@/types/categoria'

/**
 * Hooks de la feature `categorias`.
 *
 * Envuelven el service con TanStack Query. El queryFn valida la respuesta
 * con Zod antes de cachearla.
 */

/** Catalogos agrupados por tipo (para poblar selects/badges). */
export function useCategorias(tipo?: TipoCategoria | TipoCategoria[]) {
  return useQuery({
    queryKey: ['categorias', tipo ?? 'todas'],
    queryFn: async (): Promise<CategoriasResponse> => {
      const data = await categoriasService.listar(tipo)
      return CategoriasResponseSchema.parse(data) as CategoriasResponse
    },
  })
}
