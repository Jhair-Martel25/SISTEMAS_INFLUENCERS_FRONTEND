import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { disponibilidadesService } from '../services/disponibilidades.service'
import { DisponibilidadListaSchema } from '../schemas/disponibilidad.schema'
import type {
  CrearDisponibilidadInput,
  DisponibilidadCita,
  DisponibilidadFiltros,
  GenerarDisponibilidadInput,
} from '@/types/disponibilidad'
import type { DataPaginated } from '@/types/api'

/**
 * Hooks de la feature `disponibilidades`.
 *
 * Envuelven los services con TanStack Query. Los queryFn validan la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan la clave del dominio
 * para que la lista se refresque automáticamente.
 */

/** Todos los bloques del usuario logueado (para administrar su agenda). */
export function useMisBloques(filtros?: DisponibilidadFiltros) {
  return useQuery({
    queryKey: ['disponibilidades', 'mios', filtros ?? {}],
    queryFn: async (): Promise<DataPaginated<DisponibilidadCita>> => {
      const data = await disponibilidadesService.listarMisBloques(filtros)
      return DisponibilidadListaSchema.parse(data)
    },
  })
}

/** Generar bloques de 60 min para hoy de la próxima semana según el horario. */
export function useGenerar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input?: GenerarDisponibilidadInput) =>
      disponibilidadesService.generar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
  })
}

/** Eliminar bloques vencidos sin reunión. */
export function useLimpiar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => disponibilidadesService.limpiar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
  })
}

/** Crear un bloque manual. */
export function useCrearDisponibilidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearDisponibilidadInput) =>
      disponibilidadesService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
  })
}

/** Activar/desactivar un bloque propio. */
export function useToggle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disponibilidadesService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
  })
}

/** Eliminar un bloque propio (no se puede si tiene reunión → 400). */
export function useEliminarDisponibilidad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disponibilidadesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
  })
}
