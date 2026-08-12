import { apiClient } from '@/services/api'
import type {
  Reunion,
  EstadoReunion,
  AgendarReunionInput,
  ActualizarEstadoReunionInput,
} from '@/types/reunion'
import type {
  Horario,
  CrearHorarioInput,
  ActualizarHorarioInput,
} from '@/types/disponibilidad'

const REUNIONES_PATH = '/reuniones'
const HORARIOS_PATH = '/horarios'

interface ApiEnvelope<T> {
  data: T
  mensaje: string
}

export const reunionesService = {
  async listar(filtros?: { estado?: EstadoReunion }): Promise<Reunion[]> {
    const res = await apiClient.get<ApiEnvelope<Reunion[]>>(REUNIONES_PATH, { params: filtros })
    return res.data
  },
  async obtenerPorId(id: string): Promise<Reunion> {
    const res = await apiClient.get<ApiEnvelope<Reunion>>(`${REUNIONES_PATH}/${id}`)
    return res.data
  },
  async agendar(input: AgendarReunionInput): Promise<Reunion> {
    const res = await apiClient.post<ApiEnvelope<Reunion>>(REUNIONES_PATH, input)
    return res.data
  },
  async actualizarEstado(id: string, input: ActualizarEstadoReunionInput): Promise<Reunion> {
    const res = await apiClient.patch<ApiEnvelope<Reunion>>(`${REUNIONES_PATH}/${id}/estado`, input)
    return res.data
  },
}

export const horariosService = {
  async listar(): Promise<Horario[]> {
    const res = await apiClient.get<ApiEnvelope<Horario[]>>(HORARIOS_PATH)
    return res.data
  },
  async listarMisHorarios(): Promise<Horario[]> {
    const res = await apiClient.get<ApiEnvelope<Horario[]>>(`${HORARIOS_PATH}/mis-horarios`)
    return res.data
  },
  async crear(input: CrearHorarioInput): Promise<Horario> {
    const res = await apiClient.post<ApiEnvelope<Horario>>(HORARIOS_PATH, input)
    return res.data
  },
  async actualizar(id: string, input: ActualizarHorarioInput): Promise<Horario> {
    const res = await apiClient.patch<ApiEnvelope<Horario>>(`${HORARIOS_PATH}/${id}`, input)
    return res.data
  },
  async eliminar(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(`${HORARIOS_PATH}/${id}`)
  },
}