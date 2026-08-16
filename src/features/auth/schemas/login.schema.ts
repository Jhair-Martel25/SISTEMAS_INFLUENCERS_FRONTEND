import { z } from 'zod'

/**
 * Schema de validación del formulario de login.
 *
 * Valida solo el formato de los campos; las reglas de negocio
 * (p. ej. dominio @sembrandoperu.org) las aplica el backend.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
