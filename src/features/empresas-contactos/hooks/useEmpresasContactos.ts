import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { empresasContactosService } from '../services/empresas-contactos.service'
import type { ActualizarContactoInput, ActualizarEmpresaInput, CrearContactoInput } from '@/types/empresa-contacto'

export function useEmpresas(buscar: string) {
  return useQuery({ queryKey: ['empresas-contactos', buscar], queryFn: () => empresasContactosService.listar(buscar) })
}

function useRefreshEmpresas() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['empresas-contactos'] })
}

export function useActualizarEmpresa() {
  const refresh = useRefreshEmpresas()
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: ActualizarEmpresaInput }) => empresasContactosService.actualizar(id, input), onSuccess: refresh })
}
export function useCrearContacto() {
  const refresh = useRefreshEmpresas()
  return useMutation({ mutationFn: ({ empresaId, input }: { empresaId: string; input: CrearContactoInput }) => empresasContactosService.crearContacto(empresaId, input), onSuccess: refresh })
}
export function useActualizarContacto() {
  const refresh = useRefreshEmpresas()
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: ActualizarContactoInput }) => empresasContactosService.actualizarContacto(id, input), onSuccess: refresh })
}
export function useEliminarContacto() {
  const refresh = useRefreshEmpresas()
  return useMutation({ mutationFn: (id: string) => empresasContactosService.eliminarContacto(id), onSuccess: refresh })
}

export function useEnviarCorreoContacto() {
  return useMutation({ mutationFn: (input: { email: string; nombreDestino: string; asunto: string; mensaje: string }) => empresasContactosService.enviarCorreoContacto(input) })
}

export function useEnviarCorreosEmpresariales() {
  const refresh = useRefreshEmpresas()
  return useMutation({ mutationFn: (input: { contactoIds: string[]; asunto: string; contenido: string }) => empresasContactosService.enviarCorreosEmpresariales(input), onSuccess: refresh })
}
