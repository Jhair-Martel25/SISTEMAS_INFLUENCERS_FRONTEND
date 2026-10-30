import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ActualizarContactoEmpresaInput,
  ActualizarEmpresaInput,
  ContactoEmpresa,
  CrearContactoEmpresaInput,
  CrearEmpresaInput,
  Empresa,
  EmpresaBusqueda,
} from '@/types/empresa'

import {
  EmpresaBusquedaListaSchema,
  EmpresaDetalleSchema,
} from '../schemas/empresas.schema'
import { empresasService } from '../services/empresas.service'

/**
 * Hooks de la feature `empresas`.
 *
 * La búsqueda es server-side (`GET /empresas/buscar`) porque la base
 * corporativa puede tener miles de registros. El resto de mutaciones
 * invalidan la clave raíz `['empresas']` para refrescar listas y detalles.
 */

const CLAVE = ['empresas'] as const

/** Buscar empresas por nombre, RUC o CIIU. */
export function useBuscarEmpresas(
  q: string,
  limite = 20,
  enabled = true,
) {
  const termino = q.trim()

  return useQuery({
    queryKey: [...CLAVE, 'buscar', termino, limite],
    queryFn: async (): Promise<EmpresaBusqueda[]> => {
      const data = await empresasService.buscar({
        q: termino || undefined,
        limite,
      })
      return EmpresaBusquedaListaSchema.parse(data)
    },
    enabled,
    staleTime: 30_000,
  })
}

/** Detalle de una empresa (incluye contactos y prellenado). */
export function useEmpresa(id?: string) {
  return useQuery({
    queryKey: [...CLAVE, 'detalle', id],
    queryFn: async (): Promise<Empresa> => {
      const data = await empresasService.obtenerPorId(id as string)
      return EmpresaDetalleSchema.parse(data)
    },
    enabled: Boolean(id),
  })
}

/** Buscar una empresa por RUC bajo demanda (para autocompletar). */
export function useEmpresaPorRuc() {
  return useMutation({
    mutationFn: async (ruc: string): Promise<Empresa> => {
      const data = await empresasService.obtenerPorRuc(ruc)
      return EmpresaDetalleSchema.parse(data)
    },
  })
}

function useInvalidarEmpresas() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: CLAVE })
}

/** Registrar una empresa manualmente. */
export function useCrearEmpresa() {
  const invalidar = useInvalidarEmpresas()
  return useMutation({
    mutationFn: (input: CrearEmpresaInput) => empresasService.crear(input),
    onSuccess: invalidar,
  })
}

/** Actualizar los datos de una empresa. */
export function useActualizarEmpresa() {
  const invalidar = useInvalidarEmpresas()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarEmpresaInput
    }) => empresasService.actualizar(id, input),
    onSuccess: invalidar,
  })
}

// ---------------------------------------------------------------------------
// Contactos
// ---------------------------------------------------------------------------

/** Listar contactos de una empresa. */
export function useContactosEmpresa(empresaId?: string) {
  return useQuery({
    queryKey: [...CLAVE, 'contactos', empresaId],
    queryFn: async (): Promise<ContactoEmpresa[]> =>
      empresasService.listarContactos(empresaId as string),
    enabled: Boolean(empresaId),
  })
}

export function useCrearContactoEmpresa(empresaId: string) {
  const invalidar = useInvalidarEmpresas()
  return useMutation({
    mutationFn: (input: CrearContactoEmpresaInput) =>
      empresasService.crearContacto(empresaId, input),
    onSuccess: invalidar,
  })
}

export function useActualizarContactoEmpresa() {
  const invalidar = useInvalidarEmpresas()
  return useMutation({
    mutationFn: ({
      contactoId,
      input,
    }: {
      contactoId: string
      input: ActualizarContactoEmpresaInput
    }) => empresasService.actualizarContacto(contactoId, input),
    onSuccess: invalidar,
  })
}

export function useEliminarContactoEmpresa() {
  const invalidar = useInvalidarEmpresas()
  return useMutation({
    mutationFn: (contactoId: string) =>
      empresasService.eliminarContacto(contactoId),
    onSuccess: invalidar,
  })
}
