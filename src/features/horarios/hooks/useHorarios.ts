import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { horariosService } from '../services/horarios.service'
import { HorarioListaSchema } from '../schemas/horarios.schema'
import type {
  ActualizarHorarioInput,
  CrearHorarioInput,
  Horario,
  HorarioFiltros,
} from '@/types/horario'
import type { DataPaginated } from '@/types/api'

/**
 * Hooks de la feature `horarios`.
 *
 * Envuelven los services con TanStack Query. Los queryFn validan la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan la clave del dominio
 * para que las listas se refresquen automáticamente.
 */

/** ADMIN ve todos; VOLUNTARIO ve solo los suyos. */
export function useHorarios(
  filtros?: HorarioFiltros,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['horarios', filtros ?? {}],
    queryFn: async (): Promise<DataPaginated<Horario>> => {
      const data = await horariosService.listar(filtros)
      return HorarioListaSchema.parse(data)
    },
    enabled: options?.enabled,
  })
}

/** Solo los horarios del voluntario autenticado. */
export function useMisHorarios(
  filtros?: HorarioFiltros,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['horarios', 'mios', filtros ?? {}],
    queryFn: async (): Promise<DataPaginated<Horario>> => {
      const data = await horariosService.listarMisHorarios(filtros)
      return HorarioListaSchema.parse(data)
    },
    enabled: options?.enabled,
  })
}

/** Registrar el horario de un día (un horario por día → 400 si ya existe). */
export function useCrearHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearHorarioInput) => horariosService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
    },
  })
}

/** Actualizar un horario propio (PATCH /:id, cuerpo parcial). */
export function useActualizarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarHorarioInput
    }) => horariosService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
    },
  })
}

/** Eliminar un horario propio. */
export function useEliminarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => horariosService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
    },
  })
}
