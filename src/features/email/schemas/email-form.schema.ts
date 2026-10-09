// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { z } from 'zod'

/**
 * Schema de validación del formulario de envío de email.
 *
 * Solo valida el formato de los campos; las reglas de negocio (influencer
 * validado, con email, sin reunión) las aplica el backend en POST /email/enviar.
 */
export const emailFormSchema = z.object({
  influencerId: z.string().min(1, 'Selecciona un embajador'),
  plantillaId: z.string().min(1, 'Selecciona una plantilla'),
})

export type EmailFormValues = z.infer<typeof emailFormSchema>