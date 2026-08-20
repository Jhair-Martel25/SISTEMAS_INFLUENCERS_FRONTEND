/**
 * Servicio de Influencers
 * ------------------------
 * Comunica el frontend con los endpoints reales del backend:
 * GET /influencers, POST /influencers, PATCH /influencers/:id/editar
 */

import type {
  Influencer,
  InfluencerFiltros,
  InfluencersResponse,
  CrearInfluencerInput,
  ActualizarInfluencerInput,
} from "@/types/influencer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RespuestaListado {
  mensaje: string;
  data: InfluencersResponse;
}

interface RespuestaInfluencer {
  mensaje: string;
  data: Influencer;
}

function headersConToken(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("sp_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error("Sesión inválida o expirada. Vuelve a iniciar sesión.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.mensaje || "Ocurrió un error al comunicarse con el servidor.");
  }
  return res.json();
}

export const influencersService = {
  async listar(filtros: InfluencerFiltros): Promise<InfluencersResponse> {
    const params = new URLSearchParams();
    if (filtros.page) params.set("page", String(filtros.page));
    if (filtros.limit) params.set("limit", String(filtros.limit));
    if (filtros.estadoValidacion) params.set("estadoValidacion", filtros.estadoValidacion);
    if (filtros.estadoContacto) params.set("estadoContacto", filtros.estadoContacto);

    const res = await fetch(`${API_URL}/influencers?${params.toString()}`, {
      headers: headersConToken(),
    });

    const json = await manejarRespuesta<RespuestaListado>(res);
    return json.data;
  },

  async obtenerPorId(id: string): Promise<Influencer> {
    const res = await fetch(`${API_URL}/influencers/${id}`, {
      headers: headersConToken(),
    });
    const json = await manejarRespuesta<RespuestaInfluencer>(res);
    return json.data;
  },

  async crear(input: CrearInfluencerInput): Promise<Influencer> {
    const res = await fetch(`${API_URL}/influencers`, {
      method: "POST",
      headers: headersConToken(),
      body: JSON.stringify(input),
    });
    const json = await manejarRespuesta<RespuestaInfluencer>(res);
    return json.data;
  },

  async editar(id: string, input: ActualizarInfluencerInput): Promise<Influencer> {
    const res = await fetch(`${API_URL}/influencers/${id}/editar`, {
      method: "PATCH",
      headers: headersConToken(),
      body: JSON.stringify(input),
    });
    const json = await manejarRespuesta<RespuestaInfluencer>(res);
    return json.data;
  },
};