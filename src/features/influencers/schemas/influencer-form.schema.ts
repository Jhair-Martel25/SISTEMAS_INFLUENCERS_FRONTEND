import { z } from 'zod'
import { EstadoValidacionEnum } from './influencers.schema'

/**
 * Schema de validacion del formulario de influencer (crear/editar).
 *
 * Valida solo el formato de los campos; las reglas de negocio las aplica
 * el backend. `usuarioIg` NO incluye el "@" (el backend guarda el handle,
 * asi que si el usuario lo escribe con @ se lo quitamos automaticamente).
 */

const USUARIO_IG_REGEX = /^[a-zA-Z0-9._]{1,30}$/
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,20}$/

export const influencerFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre es demasiado largo (maximo 120 caracteres)'),
  usuarioIg: z
    .string()
    .trim()
    .min(1, 'El usuario de Instagram es obligatorio')
    .transform((valor) => valor.replace(/^@+/, ''))
    .refine((valor) => USUARIO_IG_REGEX.test(valor), {
      message:
        'Usa solo letras, numeros, puntos y guiones bajos (sin el @, maximo 30 caracteres)',
    }),
  linkIg: z
    .string()
    .trim()
    .min(1, 'El link del perfil es obligatorio')
    .url('Ingresa una URL valida'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo valido')
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .refine((valor) => valor === '' || TELEFONO_REGEX.test(valor), {
      message:
        'Ingresa un telefono valido (numeros, espacios, +, - y parentesis)',
    }),
  seguidores: z.string().trim(),
  cantidad_post: z.string().trim(),
  biografia: z
    .string()
    .trim()
    .max(500, 'Maximo 500 caracteres'),
  mensajePersonalizado: z
    .string()
    .trim()
    .max(1000, 'Maximo 1000 caracteres'),
  estadoValidacion: EstadoValidacionEnum,
})

export type InfluencerFormValues = z.infer<typeof influencerFormSchema>