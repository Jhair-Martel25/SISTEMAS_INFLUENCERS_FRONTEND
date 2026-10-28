import { z } from 'zod'
import { TIPO_EMBAJADOR, type TipoEmbajador } from '@/types/empresa'

/**
 * Schemas Zod del módulo `empresas`.
 *
 * - `Empresa*Schema` validan las respuestas del backend antes de cachearlas.
 * - `empresaFormSchema` y `contactoEmpresaFormSchema` validan los formularios.
 */

export const TipoEmbajadorEnum = z.enum([
  TIPO_EMBAJADOR.EMPRESA,
  TIPO_EMBAJADOR.INFLUENCER,
])

export const ContactoEmpresaSchema = z.object({
  id: z.string(),
  nombres: z.string(),
  apellidos: z.string().nullable(),
  nombreCompleto: z.string(),
  cargo: z.string().nullable(),
  area: z.string().nullable(),
  email: z.string().nullable(),
  telefono: z.string().nullable(),
  whatsapp: z.string().nullable(),
  linkedin: z.string().nullable(),
  principal: z.boolean(),
  influencerId: z.string().nullable(),
})

export const EmpresaBusquedaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  ruc: z.string().nullable(),
  ciiu: z.string().nullable(),
  tipoEmpresaCiiu: z.string().nullable(),
  sector: z.string().nullable(),
  departamento: z.string().nullable(),
  provincia: z.string().nullable(),
  distrito: z.string().nullable(),
  totalContactos: z.number(),
})

export const EmpresaBusquedaListaSchema = z.array(EmpresaBusquedaSchema)

export const EmpresaPrefillSchema = z.object({
  tipoEmbajador: TipoEmbajadorEnum,
  empresaId: z.string(),
  empresa: z.string(),
  ruc: z.string().nullable(),
  ciiu: z.string().nullable(),
  tipoEmpresaCiiu: z.string().nullable(),
  sector: z.string().nullable(),
  descripcion: z.string().nullable(),
  email: z.string().nullable(),
  emailCorporativo: z.string().nullable(),
  phone: z.string().nullable(),
  ubigeo: z.string().nullable(),
  departamento: z.string().nullable(),
  provincia: z.string().nullable(),
  distrito: z.string().nullable(),
  direccion: z.string().nullable(),
  sitioWeb: z.string().nullable(),
})

export const EmpresaDetalleSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  ruc: z.string().nullable(),
  ciiu: z.string().nullable(),
  tipoEmpresaCiiu: z.string().nullable(),
  sector: z.string().nullable(),
  ranking: z.number().nullable(),
  descripcion: z.string().nullable(),
  direccion: z.string().nullable(),
  sitioWeb: z.string().nullable(),
  telefono1: z.string().nullable(),
  telefono2: z.string().nullable(),
  telefono3: z.string().nullable(),
  fax1: z.string().nullable(),
  emailCorporativo: z.string().nullable(),
  departamento: z.string().nullable(),
  provincia: z.string().nullable(),
  distrito: z.string().nullable(),
  ubigeo: z.string().nullable(),
  activa: z.boolean(),
  origen: z.enum(['BASE_DATOS', 'MANUAL']),
  contactos: z.array(ContactoEmpresaSchema),
  prefill: EmpresaPrefillSchema,
})

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

const SOLO_DIGITOS = /^\d+$/
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,25}$/

const textoOpcional = (max: number, mensaje: string) =>
  z.string().trim().max(max, mensaje).optional().or(z.literal(''))

const correoOpcional = z
  .string()
  .trim()
  .max(180, 'Maximo 180 caracteres')
  .refine((valor) => !valor || z.email().safeParse(valor).success, {
    message: 'Ingresa un correo valido',
  })

const telefonoOpcional = z
  .string()
  .trim()
  .refine((valor) => !valor || TELEFONO_REGEX.test(valor), {
    message: 'Ingresa un telefono valido',
  })

const urlOpcional = z
  .string()
  .trim()
  .max(300, 'Maximo 300 caracteres')
  .refine((valor) => !valor || z.url().safeParse(valor).success, {
    message: 'Ingresa una URL valida (incluye https://)',
  })

export const empresaFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'La razon social es obligatoria')
      .max(200, 'Maximo 200 caracteres'),
    ruc: z
      .string()
      .trim()
      .refine((valor) => !valor || /^\d{11}$/.test(valor), {
        message: 'El RUC debe tener exactamente 11 digitos',
      }),
    ciiu: z
      .string()
      .trim()
      .refine((valor) => !valor || /^\d{1,6}$/.test(valor), {
        message: 'El CIIU debe contener solo digitos (maximo 6)',
      }),
    tipoEmpresaCiiu: textoOpcional(200, 'Maximo 200 caracteres'),
    sector: textoOpcional(200, 'Maximo 200 caracteres'),
    ranking: z
      .string()
      .trim()
      .refine((valor) => !valor || SOLO_DIGITOS.test(valor), {
        message: 'El ranking debe ser un numero entero',
      }),
    descripcion: textoOpcional(1000, 'Maximo 1000 caracteres'),
    direccion: textoOpcional(300, 'Maximo 300 caracteres'),
    sitioWeb: urlOpcional,
    telefono1: telefonoOpcional,
    telefono2: telefonoOpcional,
    telefono3: telefonoOpcional,
    fax1: telefonoOpcional,
    emailCorporativo: correoOpcional,
    ubigeo: z
      .string()
      .trim()
      .refine((valor) => !valor || /^\d{2,6}$/.test(valor), {
        message: 'El ubigeo debe tener entre 2 y 6 digitos',
      }),
    departamento: textoOpcional(100, 'Maximo 100 caracteres'),
    provincia: textoOpcional(100, 'Maximo 100 caracteres'),
    distrito: textoOpcional(100, 'Maximo 100 caracteres'),

    // Contacto principal (opcional al registrar una empresa nueva)
    contactoNombres: textoOpcional(120, 'Maximo 120 caracteres'),
    contactoApellidos: textoOpcional(120, 'Maximo 120 caracteres'),
    contactoCargo: textoOpcional(120, 'Maximo 120 caracteres'),
    contactoArea: textoOpcional(120, 'Maximo 120 caracteres'),
    contactoEmail: correoOpcional,
    contactoTelefono: telefonoOpcional,
    contactoWhatsapp: telefonoOpcional,
  })
  .superRefine((valores, ctx) => {
    const hayContacto = [
      valores.contactoNombres,
      valores.contactoApellidos,
      valores.contactoCargo,
      valores.contactoArea,
      valores.contactoEmail,
      valores.contactoTelefono,
      valores.contactoWhatsapp,
    ].some((valor) => Boolean(valor?.trim()))

    if (hayContacto && !valores.contactoNombres?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactoNombres'],
        message: 'Indica el nombre del contacto principal',
      })
    }
  })

export type EmpresaFormValues = z.infer<typeof empresaFormSchema>

export const contactoEmpresaFormSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios')
    .max(120, 'Maximo 120 caracteres'),
  apellidos: textoOpcional(120, 'Maximo 120 caracteres'),
  cargo: textoOpcional(120, 'Maximo 120 caracteres'),
  area: textoOpcional(120, 'Maximo 120 caracteres'),
  email: correoOpcional,
  telefono: telefonoOpcional,
  whatsapp: telefonoOpcional,
  linkedin: urlOpcional,
  notas: textoOpcional(1000, 'Maximo 1000 caracteres'),
  principal: z.boolean(),
})

export type ContactoEmpresaFormValues = z.infer<
  typeof contactoEmpresaFormSchema
>

/** Helper para tipar selects de tipo de embajador. */
export function esTipoEmbajador(valor: string): valor is TipoEmbajador {
  return valor === TIPO_EMBAJADOR.EMPRESA || valor === TIPO_EMBAJADOR.INFLUENCER
}
