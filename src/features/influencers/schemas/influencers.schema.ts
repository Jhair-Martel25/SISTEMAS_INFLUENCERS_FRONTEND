import { z } from 'zod'
import { ESTADO_CONTACTO, ESTADO_VALIDACION, type EstadoContacto, type EstadoValidacion } from '@/types/api'
import { TIPO_EMBAJADOR } from '@/types/empresa'

/**
 * Schemas Zod de la feature `influencers`.
 *
 * Validan la respuesta del backend en runtime (contrato) antes de cachearla
 * con TanStack Query. Los valores de estado se derivan del canon en
 * `@/types/api` (una sola fuente de verdad).
 */

export const EstadoValidacionEnum = z.enum(
  Object.values(ESTADO_VALIDACION) as [EstadoValidacion, ...EstadoValidacion[]],
)
export const EstadoContactoEnum = z.enum(
  Object.values(ESTADO_CONTACTO) as [EstadoContacto, ...EstadoContacto[]],
)

export const TipoEmbajadorEnum = z.enum([
  TIPO_EMBAJADOR.EMPRESA,
  TIPO_EMBAJADOR.INFLUENCER,
])

export const EmpresaRegistradaResumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  ruc: z.string().nullable(),
  ciiu: z.string().nullable(),
  tipoEmpresaCiiu: z.string().nullable(),
})

export const InfluencerResumenUsuarioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
})

export const InfluencerSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  usuarioIg: z.string(),
  linkIg: z.string(),
  tipoEmbajador: TipoEmbajadorEnum.optional(),
  empresaId: z.string().nullable().optional(),
  // Los influencers personales no tienen una empresa vinculada y el backend
  // histórico puede omitir esta propiedad en lugar de devolver null.
  empresaRegistrada: EmpresaRegistradaResumenSchema.nullable().optional(),
  empresa: z.string().nullable().optional(),
  ruc: z.string().nullable().optional(),
  ciiu: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  sitioWeb: z.string().nullable().optional(),
  ubigeo: z.string().nullable().optional(),
  departamento: z.string().nullable().optional(),
  provincia: z.string().nullable().optional(),
  distrito: z.string().nullable().optional(),
  cargo: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  redSocial: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  seguidores: z.string().nullable().optional(),
  cantidad_post: z.string().nullable().optional(),
  biografia: z.string().nullable().optional(),
  mensajePersonalizado: z.string().nullable().optional(),
  estadoValidacion: EstadoValidacionEnum,
  estadoContacto: EstadoContactoEnum,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  validadoPor: InfluencerResumenUsuarioSchema.nullable().optional(),
})

export const InfluencerListaSchema = z.object({
  data: z.array(InfluencerSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
})
