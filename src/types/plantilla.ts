/**
 * Plantillas de correo
 * --------------------
 * Ver CONTEXTO_FRONTEND.md §3.3. Las plantillas tienen placeholders que el
 * backend reemplaza al enviar: {{nombre_influencer}}, {{nombre_voluntario}},
 * {{link_agendamiento}}.
 */

export interface Plantilla {
  id: string
  nombre: string
  descripcion?: string | null
  asunto: string
  cuerpo: string
  createdAt?: string
  updatedAt?: string
}

/** Body de POST /plantillas. */
export interface CrearPlantillaInput {
  nombre: string
  descripcion?: string
  asunto: string
  cuerpo: string
}

/** Body de PATCH /plantillas/:id (cuerpo parcial). */
export type ActualizarPlantillaInput = Partial<CrearPlantillaInput>
