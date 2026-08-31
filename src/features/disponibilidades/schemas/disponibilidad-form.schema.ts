import { z } from 'zod'

/**
 * Schema del formulario de creación manual de un bloque de disponibilidad.
 *
 * El input es `datetime-local` (hora local del voluntario). El componente
 * lo convierte a "YYYY-MM-DD HH:mm:ss" y envía `zonaHoraria` del navegador.
 */
export const disponibilidadFormSchema = z.object({
  fechaHora: z
    .string()
    .min(1, 'Selecciona la fecha y hora del bloque')
    .refine((valor) => !Number.isNaN(new Date(valor).getTime()), {
      message: 'Ingresa una fecha y hora válidas.',
    }),
})

export type DisponibilidadFormValues = z.infer<typeof disponibilidadFormSchema>
