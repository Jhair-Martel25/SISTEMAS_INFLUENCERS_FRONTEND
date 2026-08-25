import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosService } from '../services/usuarios.service'
import { UsuarioListaSchema } from '../schemas/usuarios.schema'
import type {
  ActualizarPerfilInput,
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  Usuario,
  UsuarioFiltros,
} from '@/types/usuario'
import type { DataPaginated } from '@/types/api'

/**
 * Hooks de la feature `usuarios`.
 *
 * Envuelven los services con TanStack Query. Los queryFn validan la respuesta
 * con Zod antes de cachearla. Las mutaciones invalidan la clave del dominio
 * para que la lista se refresque automáticamente.
 */

/** Lista de usuarios (paginada) con filtros. Solo ADMIN. */
export function useUsuarios(filtros?: UsuarioFiltros) {
  return useQuery({
    queryKey: ['usuarios', filtros ?? {}],
    queryFn: async (): Promise<DataPaginated<Usuario>> => {
      const data = await usuariosService.listar(filtros)
      return UsuarioListaSchema.parse(data)
    },
  })
}

/** Crear un usuario (la contraseña temporal la asigna el backend). Solo ADMIN. */
export function useCrearUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CrearUsuarioInput) => usuariosService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

/** Actualizar un usuario (PATCH /:id, cuerpo parcial). Solo ADMIN. */
export function useActualizarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: ActualizarUsuarioInput
    }) => usuariosService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

/** Desactivar un usuario (baja lógica → INACTIVO). Solo ADMIN. */
export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuariosService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

/** Actualizar el perfil propio (correo y/o contraseña). ADMIN y VOLUNTARIO. */
export function useActualizarPerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ActualizarPerfilInput) =>
      usuariosService.actualizarPerfil(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}