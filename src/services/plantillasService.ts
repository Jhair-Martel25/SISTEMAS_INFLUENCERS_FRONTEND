import { apiClient } from '@/services/api'
import type { Plantilla, CrearPlantillaInput, ActualizarPlantillaInput } from '@/types/plantilla'

const BASE_PATH = '/plantillas'

export const plantillasService = {
  async listar(): Promise<Plantilla[]> {
    return apiClient.get<Plantilla[]>(BASE_PATH)
  },

  async obtenerPorId(id: string): Promise<Plantilla> {
    return apiClient.get<Plantilla>(`${BASE_PATH}/${id}`)
  },

  async crear(input: CrearPlantillaInput): Promise<Plantilla> {
    return apiClient.post<Plantilla>(BASE_PATH, input)
  },

  async actualizar(id: string, input: ActualizarPlantillaInput): Promise<Plantilla> {
    return apiClient.put<Plantilla>(`${BASE_PATH}/${id}`, input)
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
