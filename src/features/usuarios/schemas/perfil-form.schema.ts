import { z } from 'zod'

/**
 * Schema de validación del formulario "Mi perfil" (autoservicio, disponible
 * para ADMIN y VOLUNTARIO).
 *
 * La contraseña nueva es opcional: si el usuario deja los tres campos de
 * contraseña vacíos, no se cambia nada. Si escribe una contraseña nueva, se
 * exige la actual (para confirmar identidad) y que coincida con la
 * confirmación. Los nombres de los campos de contraseña coinciden con el
 * contrato real del backend (PATCH /usuarios/datos-personales).
 */
export const perfilFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'El correo es obligatorio')
      .email('Ingresa un correo válido')
      .refine(
        (valor) => valor.toLowerCase().endsWith('@sembrandoperu.org'),
        'Debe ser un correo @sembrandoperu.org',
      ),
    passwordActual: z.string().optional().or(z.literal('')),
    passwordNueva: z.string().optional().or(z.literal('')),
    confirmarPasswordNueva: z.string().optional().or(z.literal('')),
  })
  .superRefine((valores, ctx) => {
    if (!valores.passwordNueva) return

    if (valores.passwordNueva.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
        path: ['passwordNueva'],
      })
    }

    if (!valores.passwordActual) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresa tu contraseña actual para poder cambiarla',
        path: ['passwordActual'],
      })
    }

    if (valores.confirmarPasswordNueva !== valores.passwordNueva) {
      ctx.addIssue({
        code: 'custom',
        message: 'Las contraseñas no coinciden',
        path: ['confirmarPasswordNueva'],
      })
    }
  })

export type PerfilFormValues = z.infer<typeof perfilFormSchema>