/**
 * Tipos: Consulta IA
 * -------------------
 * Refleja exactamente el DTO y la respuesta reales del backend
 * (CreateConsultaIaDto y ConsultasIaService.ejecutarPrompt).
 */

export interface ConsultaIAInput {
  descripcionPrompt: string
  cantidadSolicitada: number
  rangoSeguidores: string
  plantillaId: string
}

export interface InfluencerSugerido {
  id: string
  nombre: string
  usuarioIg: string
  linkIg: string
  seguidoresGemini: number
  likesGemini: number
}

export interface ConsultaIAResultado {
  consulta: {
    id: string
    descripcionPrompt: string
    cantidadSolicitada: number
    rangoSeguidores: string
    estado: string
    fecha: string
    voluntarioId: string
    plantillaId: string
  }
  influencers: InfluencerSugerido[]
}