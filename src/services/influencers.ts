
/**
 * Servicio de Influencers
 * ------------------------
 * Se encarga de comunicarse con el backend para obtener la lista de
 * influencers: arma la URL con los filtros (estado, página, límite),
 * agrega el token de sesión, y traduce los errores HTTP en mensajes
 * claros para el resto de la app.
 */

import type { Influencer, EstadoInfluencer } from "@/types/influencer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const ESTADO_VALIDACION_MAP: Record<EstadoInfluencer, string> = {
  Pendiente: "PENDIENTE",
  Validado: "VALIDADO",
  Rechazado: "RECHAZADO",
};

export interface FiltrosInfluencers {
  busqueda?: string;
  estado?: EstadoInfluencer | "";
  page: number;
  limit: number;
}

export interface RespuestaInfluencers {
  mensaje: string;
  data: {
    data: Influencer[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

function adaptarInfluencer(item: any): Influencer {
  return {
    id: item.id,

    nombreCompleto: item.nombre,
    usuarioIG: item.usuarioIg,

    correo: item.email ?? "",
    telefono: item.phone ?? "",

    pais: "",
    ciudad: "",

    seguidores: item.seguidores ?? "",
    engagement: "",

    tematica:
      item.consultaIa?.plantilla?.nombre ??
      "",

    linkPerfil: item.linkIg,

    estado:
      item.estadoValidacion === "VALIDADO"
        ? "Validado"
        : item.estadoValidacion === "RECHAZADO"
          ? "Rechazado"
          : "Pendiente",

    redSocial: "Instagram",

    scoreIA: 0,

    voluntarioEncargadoId:
      item.validadoPor?.id,

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listarInfluencers(
  filtros: FiltrosInfluencers
): Promise<RespuestaInfluencers> {
  const params = new URLSearchParams();
  params.set("page", String(filtros.page));
  params.set("limit", String(filtros.limit));

  if (filtros.estado) {
    params.set("estadoValidacion", ESTADO_VALIDACION_MAP[filtros.estado]);
  }

  const token = localStorage.getItem("sp_token");

  const res = await fetch(`${API_URL}/influencers?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    throw new Error("Sesión inválida o expirada. Vuelve a iniciar sesión.");
  }
  if (!res.ok) {
    throw new Error("No se pudo obtener la lista de influencers.");
  }

  const json = await res.json();

  return {
    mensaje: json.mensaje,
    data: {
      data: json.data.data.map(adaptarInfluencer),
      meta: json.data.meta,
    },
  };
}

export async function actualizarEstadoInfluencer(
  id: string,
  estado: EstadoInfluencer
) {
  const token = localStorage.getItem("sp_token");

  const res = await fetch(`${API_URL}/influencers/${id}/editar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      estadoValidacion: ESTADO_VALIDACION_MAP[estado],
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo actualizar el estado.");
  }

  return res.json();
}