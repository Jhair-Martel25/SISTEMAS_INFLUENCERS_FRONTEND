export type RangoSeguidores = '0-10k' | '10k-50k' | '50k+'

export interface ConsultaIAInput {
  prompt: string
  objetivoBusqueda?: string
  rangoSeguidores?: RangoSeguidores
  cantidadMinima?: number
}

export interface InfluencerSugerido {
  nombreCompleto: string
  usuarioIG: string
  seguidores: string
  engagement: string
  tematica: string
  linkPerfil: string
  justificacion: string
}

export interface ConsultaIAResultado {
  id: string
  input: ConsultaIAInput
  sugerencias: InfluencerSugerido[]
  createdAt: string
}
