export type EstadoReunion = 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada'

export type DiaSemanaCorto = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie'

export interface Reunion {
  id: string
  influencerId: string
  influencerNombre: string
  voluntarioId: string
  voluntarioNombre: string
  fecha: string // "YYYY-MM-DD"
  hora: string // "HH:mm"
  observaciones?: string
  estado: EstadoReunion
}

export interface CrearReunionInput {
  influencerId: string
  voluntarioId: string
  fecha: string
  hora: string
  observaciones?: string
}

export interface ActualizarReunionInput {
  fecha?: string
  hora?: string
  observaciones?: string
  estado?: EstadoReunion
}

/** Una celda de la agenda semanal (día + hora -> quién la ocupa). */
export interface SlotAgenda {
  hora: string
  dia: DiaSemanaCorto
  ocupado: boolean
  nombre?: string
  reunionId?: string
}

export interface AgendaSemanal {
  slots: SlotAgenda[]
}
