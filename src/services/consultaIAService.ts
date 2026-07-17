import { apiClient } from "@/services/api";
import type {
  ConsultaIAInput,
  ConsultaIAResultado,
} from "@/types/consultaIA";

const BASE_PATH = "/consultas-ia";

export const consultaIAService = {

  async generar(
    input: ConsultaIAInput
  ): Promise<ConsultaIAResultado> {

    return apiClient.post<ConsultaIAResultado>(
      BASE_PATH,
      input
    );

  },

  async listarHistorial(): Promise<ConsultaIAResultado[]> {

    return apiClient.get<ConsultaIAResultado[]>(
      BASE_PATH
    );

  },

};