import { z } from 'zod'
import { EstadoValidacionEnum, TipoEmbajadorEnum } from './influencers.schema'

/**
 * Schema de validacion del formulario de influencer/embajador (crear/editar).
 *
 * - `INFLUENCER`: perfil personal. Requiere usuario o link de Instagram
 *   (el backend deriva el que falte).
 * - `EMPRESA`: requiere una empresa seleccionada y, opcionalmente, uno de
 *   sus contactos. El backend completa los datos corporativos.
 *
 * `usuarioIg` NO incluye el "@" (se lo quitamos automaticamente).
 */

const USUARIO_IG_REGEX = /^[a-zA-Z0-9._]{1,30}$/
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,20}$/
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const influencerFormSchema = z
  .object({
    tipoEmbajador: TipoEmbajadorEnum,
    empresaId: z
      .string()
      .trim()
      .refine((valor) => !valor || UUID_REGEX.test(valor), {
        message: 'Selecciona una empresa valida',
      })
      .optional()
      .or(z.literal('')),
    contactoEmpresaId: z
      .string()
      .trim()
      .refine((valor) => !valor || UUID_REGEX.test(valor), {
        message: 'Selecciona un contacto valido',
      })
      .optional()
      .or(z.literal('')),
    nombre: z
      .string()
      .trim()
      .min(1, 'El nombre es obligatorio')
      .max(120, 'El nombre es demasiado largo (maximo 120 caracteres)'),
    usuarioIg: z
      .string()
      .trim()
      .transform((valor) => valor.replace(/^@+/, ''))
      .refine((valor) => !valor || USUARIO_IG_REGEX.test(valor), {
        message:
          'Usa solo letras, numeros, puntos y guiones bajos (sin el @, maximo 30 caracteres)',
      }),
    linkIg: z
      .string()
      .trim()
      .refine((valor) => !valor || z.url().safeParse(valor).success, {
        message: 'Ingresa una URL valida',
      }),
    empresa: z.string().trim().max(120, 'Maximo 120 caracteres').optional().or(z.literal('')),
    ruc: z.string().trim().max(20, 'Maximo 20 caracteres').optional().or(z.literal('')),
    ciiu: z.string().trim().max(20, 'Maximo 20 caracteres').optional().or(z.literal('')),
    sector: z.string().trim().max(120, 'Maximo 120 caracteres').optional().or(z.literal('')),
    descripcion: z.string().trim().max(500, 'Maximo 500 caracteres').optional().or(z.literal('')),
    direccion: z.string().trim().max(300, 'Maximo 300 caracteres').optional().or(z.literal('')),
    sitioWeb: z
      .string()
      .trim()
      .refine((valor) => !valor || z.url().safeParse(valor).success, {
        message: 'Ingresa una URL valida (incluye https://)',
      }),
    ubigeo: z.string().trim().max(20, 'Maximo 20 caracteres').optional().or(z.literal('')),
    departamento: z.string().trim().max(100, 'Maximo 100 caracteres').optional().or(z.literal('')),
    provincia: z.string().trim().max(100, 'Maximo 100 caracteres').optional().or(z.literal('')),
    distrito: z.string().trim().max(100, 'Maximo 100 caracteres').optional().or(z.literal('')),
    cargo: z.string().trim().max(100, 'Maximo 100 caracteres').optional().or(z.literal('')),
    area: z.string().trim().max(100, 'Maximo 100 caracteres').optional().or(z.literal('')),
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
  .superRefine((valores, ctx) => {
    if (!valores.usuarioIg && !valores.linkIg) {
      ctx.addIssue({
        code: 'custom',
        path: ['usuarioIg'],
        message:
          'Indica el usuario de Instagram o el link del perfil (al menos uno)',
      })
    }

    if (valores.tipoEmbajador === 'EMPRESA' && !valores.empresaId) {
      ctx.addIssue({
        code: 'custom',
        path: ['empresaId'],
        message: 'Selecciona la empresa del embajador',
      })
    }
  })

export type InfluencerFormValues = z.infer<typeof influencerFormSchema>
