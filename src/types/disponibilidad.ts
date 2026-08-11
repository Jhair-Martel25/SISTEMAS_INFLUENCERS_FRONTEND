export type DiaSemana =
  | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'

export const DIAS_SEMANA: { value: DiaSemana; corto: string }[] = [
  { value: 'LUNES', corto: 'Lun' },
  { value: 'MARTES', corto: 'Mar' },
  { value: 'MIERCOLES', corto: 'Mié' },
  { value: 'JUEVES', corto: 'Jue' },
  { value: 'VIERNES', corto: 'Vie' },
  { value: 'SABADO', corto: 'Sáb' },
  { value: 'DOMINGO', corto: 'Dom' },
]

export interface Horario {
  id: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  voluntarioId: string
}

export interface CrearHorarioInput {
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
}

export type ActualizarHorarioInput = Partial<CrearHorarioInput>

export interface DisponibilidadCita {
  id: string
  fechaHora: string
  disponible: boolean
  voluntarioId: string
  voluntarioNombre?: string
}

export interface DisponibilidadFiltros {
  voluntarioId?: string
  disponible?: boolean
  desde?: string
  hasta?: string
}