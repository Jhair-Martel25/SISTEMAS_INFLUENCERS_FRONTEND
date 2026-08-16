import { z } from 'zod'

/**
 * Schema de validación del formulario de usuario (crear/editar).
 *
 * `roleId` se maneja como string en el formulario (por el `Select` de
 * shadcn) y se convierte a número al construir el payload.
 * El dominio @sembrandoperu.org se valida aquí para feedback inmediato;
 * el backend lo re-valida (doble seguridad).
 */
export const usuarioFormSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido')
    .refine(
      (valor) => valor.toLowerCase().endsWith('@sembrandoperu.org'),
      'Debe ser un correo @sembrandoperu.org',
    ),
  roleId: z.string().min(1, 'Debes seleccionar un rol'),
})

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>
