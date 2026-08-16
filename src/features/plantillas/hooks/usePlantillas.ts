import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { plantillasService } from '../services/plantillas.service'
import { PlantillaListaSchema } from '../schemas/plantillas.schema'
import type {
  ActualizarPlantillaInput,
  CrearPlantillaInput,
  Plantilla,
} from '@/types/plantilla'

/**
 * Hooks de la feature `plantillas`.
 *
 * Envuelven los services con TanStack Query. El queryFn valida la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan la clave del dominio
 * para que la lista se refresque automáticamente.
 */

/** Lista de plantillas (sin paginar). */
export function usePlantillas() {
  return useQuery({
    queryKey: ['plantillas'],
    queryFn: async (): Promise<Plantilla[]> => {
      const data = await plantillasService.listar()
      return PlantillaListaSchema.parse(data)
    },
  })
}

/** Crear una plantilla de correo. */
export function useCrearPlantilla() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearPlantillaInput) => plantillasService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
  })
}

/** Actualizar una plantilla (PATCH /:id, cuerpo parcial). */
export function useActualizarPlantilla() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarPlantillaInput
    }) => plantillasService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
  })
}

/** Eliminar una plantilla (solo ADMIN). */
export function useEliminarPlantilla() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => plantillasService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] })
    },
  })
}
