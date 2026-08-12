import {
  EnviarEmailRequest,
  EnviarEmailResponse,
} from "@/types/email";

// URL del backend (NestJS)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Envía un correo a un influencer usando una plantilla.
 * Requiere que el usuario autenticado tenga rol ADMIN.
 */
export async function enviarEmail(
  data: EnviarEmailRequest
): Promise<EnviarEmailResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const response = await fetch(`${API_URL}/email/enviar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "No se pudo enviar el correo");
  }

  return response.json();
}