import { apiClient } from '@/services/api'
import type { Plantilla, CrearPlantillaInput, ActualizarPlantillaInput } from '@/types/plantilla'

const BASE_PATH = '/plantillas'

interface PlantillasResponse {
  mensaje: string;
  data: Plantilla[];
}

function adaptarPlantilla(item: any): Plantilla {
  return {
    id: item.id,
    nombre: item.nombre,

    // El backend aún no devuelve este dato.
    // Temporalmente colocamos un valor por defecto.
    tipo: "correo",

    asunto: item.asunto,

    // El backend lo llama "cuerpo"
    contenido: item.cuerpo,
  };
}

export const plantillasService = {
  async listar(): Promise<Plantilla[]> {
    const response = await apiClient.get<PlantillasResponse>(BASE_PATH);

    return response.data.map(adaptarPlantilla);
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
