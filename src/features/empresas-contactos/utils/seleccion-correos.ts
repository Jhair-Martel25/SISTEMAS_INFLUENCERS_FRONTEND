export interface DestinatarioItem {
  id: string
  rawId: string
  tipo: 'EMPRESA' | 'CONTACTO'
  nombre: string
  subtitulo: string
  cargo: string
  empresa: string
  email: string
  estadoCorreo: 'ENVIADO' | 'PENDIENTE'
  sector: string
}

const CLAVE_SELECCION = 'sp_correos_seleccionados'

export function guardarSeleccionCorreos(items: DestinatarioItem[]) {
  try {
    window.sessionStorage.setItem(CLAVE_SELECCION, JSON.stringify(items))
  } catch {
    // Sin acceso a sessionStorage: la selección no se conserva al cambiar de vista.
  }
}

export function leerSeleccionCorreos(): DestinatarioItem[] {
  try {
    const raw = window.sessionStorage.getItem(CLAVE_SELECCION)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DestinatarioItem[]) : []
  } catch {
    return []
  }
}

export function limpiarSeleccionCorreos() {
  try {
    window.sessionStorage.removeItem(CLAVE_SELECCION)
  } catch {
    // Nada que limpiar si el storage no está disponible.
  }
}
