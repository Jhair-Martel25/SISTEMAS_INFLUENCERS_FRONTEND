/**
 * Categorías (catálogos para combos)
 * -----------------------------------
 * Ver CONTEXTO_FRONTEND.md §3.11. GET /categorias devuelve los valores
 * agrupados por tipo para poblar selects/badges dinámicamente.
 */

/** Tipos de catálogo que expone el backend. */
export const TIPO_CATEGORIA = {
  ESTADO_VALIDACION: 'ESTADO_VALIDACION',
  ESTADO_CONTACTO: 'ESTADO_CONTACTO',
  ESTADO_REUNION: 'ESTADO_REUNION',
  TEMATICA: 'TEMATICA',
  DIA_SEMANA: 'DIA_SEMANA',
} as const

export type TipoCategoria = keyof typeof TIPO_CATEGORIA

/** Ítem de GET /categorias (agrupado por tipo). */
export interface Categoria {
  valor: string
  etiqueta: string
  orden: number
}

/** Ítem de GET /categorias/admin (plano, incluye id). */
export interface CategoriaAdmin extends Categoria {
  id: string
  tipo: TipoCategoria
}

/** Respuesta de GET /categorias: mapa tipo → lista de categorías. */
export type CategoriasResponse = Partial<Record<TipoCategoria, Categoria[]>>
