export type DiaSemana = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'

export interface Voluntario {
  id: string
  nombreCompleto: string
  correo: string
  fotoUrl?: string
  diasDisponibles: DiaSemana[]
  horaInicio: string // formato "HH:mm"
  horaFin: string // formato "HH:mm"
  createdAt?: string
  updatedAt?: string
}

export interface CrearVoluntarioInput {
  nombreCompleto: string
  correo: string
  fotoUrl?: string
  diasDisponibles: DiaSemana[]
  horaInicio: string
  horaFin: string
}

export type ActualizarVoluntarioInput = Partial<CrearVoluntarioInput>

export interface VoluntarioFiltros {
  busqueda?: string
  diaDisponible?: DiaSemana
  page?: number
  pageSize?: number
}
