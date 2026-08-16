import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { influencersService } from '../services/influencers.service'
import {
  InfluencerListaSchema,
  InfluencerSchema,
} from '../schemas/influencers.schema'
import type {
  ActualizarInfluencerInput,
  ContactarInfluencerInput,
  CrearInfluencerInput,
  Influencer,
  InfluencerFiltros,
} from '@/types/influencer'
import type { DataPaginated } from '@/types/api'

/**
 * Hooks de la feature `influencers`.
 *
 * Envuelven los services con TanStack Query. Los queryFn validan la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan las claves del dominio
 * para que las listas se refresquen automáticamente.
 */

/** Lista de influencers (paginada) con filtros. */
export function useInfluencers(filtros?: InfluencerFiltros) {
  return useQuery({
    queryKey: ['influencers', filtros ?? {}],
    queryFn: async (): Promise<DataPaginated<Influencer>> => {
      const data = await influencersService.listar(filtros)
      return InfluencerListaSchema.parse(data)
    },
  })
}

/** Detalle de un influencer. */
export function useInfluencer(id: string) {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async (): Promise<Influencer> => {
      const data = await influencersService.obtenerPorId(id)
      return InfluencerSchema.parse(data)
    },
    enabled: Boolean(id),
  })
}

/** Crear un influencer manualmente. */
export function useCrearInfluencer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearInfluencerInput) => influencersService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
    },
  })
}

/** Editar/validar un influencer (PATCH /:id/editar). */
export function useEditarInfluencer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarInfluencerInput
    }) => influencersService.editar(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
      queryClient.invalidateQueries({ queryKey: ['influencer', id] })
    },
  })
}

/** Cambiar estado de contacto (solo ADMIN). */
export function useContactarInfluencer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ContactarInfluencerInput
    }) => influencersService.contactar(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
      queryClient.invalidateQueries({ queryKey: ['influencer', id] })
    },
  })
}

/** Eliminar un influencer (solo ADMIN). */
export function useEliminarInfluencer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => influencersService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] })
    },
  })
}
