import { z } from 'zod'

/**
 * Schema de validación del formulario de plantilla (crear/editar).
 *
 * `descripcion` es opcional; el resto son obligatorios. El cuerpo soporta
 * los placeholders que el backend reemplaza al enviar.
 */
export const plantillaFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  descripcion: z.string(),
  asunto: z.string().trim().min(1, 'El asunto es obligatorio'),
  cuerpo: z.string().trim().min(1, 'El contenido es obligatorio'),
})

export type PlantillaFormValues = z.infer<typeof plantillaFormSchema>
