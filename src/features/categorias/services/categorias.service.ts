import { apiClient } from '@/lib/http'
import type {
  CategoriaAdmin,
  CategoriasResponse,
  TipoCategoria,
} from '@/types/categoria'

const BASE_PATH = '/categorias'

export const categoriasService = {
  /** Categorías agrupadas por tipo (para combos). */
  async listar(tipo?: TipoCategoria | TipoCategoria[]): Promise<CategoriasResponse> {
    return apiClient.get<CategoriasResponse>(BASE_PATH, {
      params: tipo ? { tipo: Array.isArray(tipo) ? tipo.join(',') : tipo } : undefined,
    })
  },

  /** Todas las categorías en plano, incluyendo id (solo ADMIN). */
  async listarAdmin(): Promise<CategoriaAdmin[]> {
    return apiClient.get<CategoriaAdmin[]>(`${BASE_PATH}/admin`)
  },
}
