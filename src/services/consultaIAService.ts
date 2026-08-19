import { apiClient } from "@/services/api";
import type {
  ConsultaIAInput,
  ConsultaIAResultado,
} from "@/types/consultaIA";

const BASE_PATH = "/consultas-ia";

interface ConsultaIAResponse {
  mensaje: string;
  data: ConsultaIAResultado;
}

interface ConsultaIAHistorialResponse {
  mensaje: string;
  data: ConsultaIAResultado[];
}

export const consultaIAService = {

  async generar(
    input: ConsultaIAInput
  ): Promise<ConsultaIAResultado> {

    const response = await apiClient.post<ConsultaIAResponse>(
      BASE_PATH,
      input
    );

    return response.data;

  },

  async listarHistorial(): Promise<ConsultaIAResultado[]> {

    const response = await apiClient.get<ConsultaIAHistorialResponse>(
      BASE_PATH
    );

    return response.data;

  },

};