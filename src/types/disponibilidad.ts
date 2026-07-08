export type EstadoDisponibilidad = 'Disponible' | 'Parcial' | 'No disponible'

export interface Disponibilidad {
  id: string
  voluntarioId: string
  voluntarioNombre: string
  horaInicio: string // "HH:mm"
  horaFin: string // "HH:mm"
  estado: EstadoDisponibilidad
}

export interface DisponibilidadResumen {
  reunionesProgramadas: number
  voluntariosDisponibles: number
  pendientes: number
}

export interface ActualizarDisponibilidadInput {
  horaInicio?: string
  horaFin?: string
  estado?: EstadoDisponibilidad
}
