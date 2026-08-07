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
    asunto: item.asunto,
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
    const payload = {
      nombre: input.nombre,
      descripcion: "",
      asunto: input.asunto,
      cuerpo: input.contenido,
    };

    const response = await apiClient.post<any>(BASE_PATH, payload);

    return adaptarPlantilla(response);
  },

  async actualizar(
    id: string,
    input: ActualizarPlantillaInput
  ): Promise<Plantilla> {

    const payload = {
      nombre: input.nombre,
      descripcion: "",
      asunto: input.asunto,
      cuerpo: input.contenido,
    };

    const response = await apiClient.patch<any>(
      `${BASE_PATH}/${id}`,
      payload
    );

    return adaptarPlantilla(response);
  },

  async eliminar(id: string): Promise<void> {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`)
  },
}
