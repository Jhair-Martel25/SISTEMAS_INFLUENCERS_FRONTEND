import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reunionesService } from '../services/reuniones.service'
import {
  ReunionListaSchema,
  ReunionSchema,
} from '../schemas/reuniones.schema'
import type {
  ActualizarEstadoReunionInput,
  Reunion,
  ReunionFiltros,
} from '@/types/reunion'

/**
 * Hooks de la feature `reuniones`.
 *
 * Envuelven los services con TanStack Query. Los queryFn validan la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan la clave del dominio.
 */

/** ADMIN ve todas; VOLUNTARIO ve las suyas. */
export function useReuniones(filtros?: ReunionFiltros) {
  return useQuery({
    queryKey: ['reuniones', filtros ?? {}],
    queryFn: async (): Promise<Reunion[]> => {
      const data = await reunionesService.listar(filtros)
      return ReunionListaSchema.parse(data)
    },
  })
}

/** Detalle de una reunión. */
export function useReunion(id: string) {
  return useQuery({
    queryKey: ['reunion', id],
    queryFn: async (): Promise<Reunion> => {
      const data = await reunionesService.obtenerPorId(id)
      return ReunionSchema.parse(data)
    },
    enabled: Boolean(id),
  })
}

/** Actualizar el estado de una reunión (REALIZADA, CANCELADA, NO_ASISTIO). */
export function useActualizarEstadoReunion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarEstadoReunionInput
    }) => reunionesService.actualizarEstado(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reuniones'] })
      queryClient.invalidateQueries({ queryKey: ['reunion', id] })
    },
  })
}
