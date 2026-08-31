import { z } from 'zod'
import { DiaSemanaEnum } from './horarios.schema'

const HORA_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Schema de validación del formulario de horario (crear/editar).
 *
 * Valida el formato de los campos; las reglas de negocio las aplica el
 * backend (un horario por día → 400 si ya existe).
 */
export const horarioFormSchema = z
  .object({
    diaSemana: DiaSemanaEnum,
    horaInicio: z
      .string()
      .trim()
      .regex(HORA_HHMM, 'Usa el formato HH:mm (ej. 08:00)'),
    horaFin: z
      .string()
      .trim()
      .regex(HORA_HHMM, 'Usa el formato HH:mm (ej. 13:00)'),
  })
  .refine((valores) => valores.horaInicio < valores.horaFin, {
    message: 'La hora de inicio debe ser anterior a la de fin.',
    path: ['horaFin'],
  })

export type HorarioFormValues = z.infer<typeof horarioFormSchema>
