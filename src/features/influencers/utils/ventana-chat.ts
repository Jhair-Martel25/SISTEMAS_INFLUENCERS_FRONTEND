/**
 * Abre el chat/perfil de un influencer en una ventana lateral reutilizable.
 *
 * - La ventana se coloca a la derecha de la pantalla para trabajar "lado a
 *   lado" con el sistema.
 * - Si la ventana ya existe, se reutiliza (solo cambia de chat).
 * - Instagram y Facebook no permiten mostrarse dentro de la web (iframe),
 *   por eso se usa una ventana aparte.
 *
 * Devuelve `false` si el navegador bloqueó la ventana emergente.
 */

const NOMBRE_VENTANA = "sembrando-chat-dm"

let ventana: Window | null = null

export function abrirChatEnVentana(url: string, lateral = true): boolean {
  if (!lateral) {
    window.open(url, "_blank", "noopener,noreferrer")
    return true
  }

  // Reutilizar la ventana si sigue abierta.
  try {
    if (ventana && !ventana.closed) {
      ventana.location.href = url
      ventana.focus()
      return true
    }
  } catch {
    // Si el navegador no deja reutilizarla, se abre una nueva abajo.
  }

  const pantalla = window.screen as Screen & {
    availLeft?: number
    availTop?: number
  }
  const ancho = Math.max(420, Math.min(560, Math.round(pantalla.availWidth * 0.38)))
  const alto = pantalla.availHeight
  const left = (pantalla.availLeft ?? 0) + pantalla.availWidth - ancho
  const top = pantalla.availTop ?? 0

  ventana = window.open(
    url,
    NOMBRE_VENTANA,
    `popup=yes,width=${ancho},height=${alto},left=${left},top=${top}`,
  )

  return ventana !== null
}

/** Cierra la ventana lateral si sigue abierta. */
export function cerrarVentanaChat() {
  try {
    if (ventana && !ventana.closed) ventana.close()
  } catch {
    // ignorar
  }
  ventana = null
}
