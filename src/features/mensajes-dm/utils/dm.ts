import type { Influencer } from "@/types/influencer"

/**
 * Utilidades de los mensajes directos (DM) por redes sociales.
 *
 * Instagram, TikTok y Facebook no permiten enviar DMs por API, por eso el
 * envio es "asistido": se copia el mensaje, se abre el perfil y el usuario
 * lo pega y lo envia.
 */

export type RedSocialDm = "INSTAGRAM" | "TIKTOK" | "FACEBOOK"

export const REDES_DM: { value: RedSocialDm; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "FACEBOOK", label: "Facebook" },
]

export const LIMITE_DM = 1000

export const PLANTILLA_DM_INICIAL =
  "¡Hola {nombre}! 👋 Somos Sembrando Perú. Nos encanta el contenido que compartes y creemos que encajaría muy bien con el Reto 300, nuestra campaña de reforestación. ¿Te gustaría que te contemos más? Podemos coordinar una breve reunión cuando te quede cómodo."

/** Red del embajador (por defecto Instagram, igual que el backend). */
export function redDe(influencer: Influencer): RedSocialDm {
  const red = (influencer.redSocial ?? "INSTAGRAM").toUpperCase()
  return red === "TIKTOK" || red === "FACEBOOK" ? red : "INSTAGRAM"
}

export function etiquetaRed(red: RedSocialDm): string {
  return REDES_DM.find((r) => r.value === red)?.label ?? red
}

/** Link del perfil donde esta el boton "Enviar mensaje". */
export function linkChat(influencer: Influencer): string {
  const usuario = influencer.usuarioIg.replace(/^@/, "")
  const red = redDe(influencer)
  if (red === "INSTAGRAM") return `https://www.instagram.com/${usuario}/`
  if (red === "TIKTOK") return `https://www.tiktok.com/@${usuario}`
  return influencer.linkIg || `https://www.facebook.com/${usuario}`
}

/** Reemplaza {nombre} y {usuario} en la plantilla del DM. */
export function personalizarDm(plantilla: string, influencer: Influencer): string {
  return plantilla
    .replaceAll("{nombre}", influencer.nombre)
    .replaceAll("{usuario}", `@${influencer.usuarioIg}`)
}

export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
