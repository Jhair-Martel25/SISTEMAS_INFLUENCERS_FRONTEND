export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO'

export interface Horario {
  id: string
  voluntarioId: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
}

export interface CrearHorarioInput {
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
}

export interface ActualizarHorarioInput {
  diaSemana?: DiaSemana
  horaInicio?: string
  horaFin?: string
}