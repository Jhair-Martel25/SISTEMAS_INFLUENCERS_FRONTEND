/**
 * Plantillas de correo
 * --------------------
 * Ver CONTEXTO_FRONTEND.md §3.3. Las plantillas tienen placeholders que el
 * backend reemplaza al enviar: {{nombre_influencer}}, {{nombre_voluntario}},
 * {{link_agendamiento}}.
 */

/** Diseños visuales disponibles (deben coincidir con DISENOS_CORREO del backend). */
export const DISENOS_CORREO = ['CLASICO', 'REFORESTA', 'SELVA_CENTRAL', 'REFORESTA_EDUCA'] as const
export type DisenoCorreo = (typeof DISENOS_CORREO)[number]

export const DISENO_CORREO_INFO: Record<
  DisenoCorreo,
  { label: string; descripcion: string; miniatura?: string }
> = {
  CLASICO: {
    label: 'Clásico Sembrando Perú',
    descripcion: 'Cabecera verde con titular, texto y botón de agendamiento.',
  },
  REFORESTA: {
    label: 'Reforesta con nosotros',
    descripcion: 'Pieza gráfica del Reto 300 + texto editable + botón "Agenda tu cita".',
    miniatura: '/images/plantillas/reforesta-con-nosotros.jpg',
  },
  SELVA_CENTRAL: {
    label: 'Selva central · Reto 300',
    descripcion: 'Diseño en HTML: titular, cifras de aporte, foto de campo y "Agenda tu cita".',
    miniatura: '/images/plantillas/selva-central.jpg',
  },
  REFORESTA_EDUCA: {
    label: 'Reforesta y educa',
    descripcion: 'Diseño en HTML: reforestación + educación, aporte desde S/ 6,000 y certificado de donación.',
    miniatura: '/images/plantillas/reforesta-educa.jpg',
  },
}

/** Los diseños de campaña están pensados para empresas (vista previa con {empresa}). */
export function tipoPreviaDeDiseno(diseno: DisenoCorreo): 'INFLUENCER' | 'EMPRESA' {
  return diseno === 'CLASICO' ? 'INFLUENCER' : 'EMPRESA'
}

export function normalizarDiseno(valor?: string | null): DisenoCorreo {
  return (DISENOS_CORREO as readonly string[]).includes(valor ?? '')
    ? (valor as DisenoCorreo)
    : 'CLASICO'
}

export interface Plantilla {
  id: string
  nombre: string
  descripcion?: string | null
  asunto: string
  cuerpo: string
  /** Diseño visual del correo. Ausente en backends antiguos → CLASICO. */
  diseno?: string | null
  createdAt?: string
  updatedAt?: string
}

/** Body de POST /plantillas. */
export interface CrearPlantillaInput {
  nombre: string
  descripcion?: string
  asunto: string
  cuerpo: string
  diseno?: DisenoCorreo
}

/** Body de PATCH /plantillas/:id (cuerpo parcial). */
export type ActualizarPlantillaInput = Partial<CrearPlantillaInput>
