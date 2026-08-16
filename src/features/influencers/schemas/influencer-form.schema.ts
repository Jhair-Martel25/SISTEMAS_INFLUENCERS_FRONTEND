import { z } from 'zod'
import { EstadoValidacionEnum } from './influencers.schema'

/**
 * Schema de validación del formulario de influencer (crear/editar).
 *
 * Valida solo el formato de los campos; las reglas de negocio las aplica
 * el backend. `usuarioIg` NO incluye el "@" (el backend guarda el handle).
 */
export const influencerFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  usuarioIg: z
    .string()
    .trim()
    .min(1, 'El usuario de Instagram es obligatorio'),
  linkIg: z
    .string()
    .trim()
    .min(1, 'El link del perfil es obligatorio')
    .url('Ingresa una URL válida'),
  email: z.string().trim().email('Ingresa un correo válido').or(z.literal('')),
  phone: z.string(),
  seguidores: z.string(),
  cantidad_post: z.string(),
  biografia: z.string(),
  mensajePersonalizado: z.string(),
  estadoValidacion: EstadoValidacionEnum,
})

export type InfluencerFormValues = z.infer<typeof influencerFormSchema>
