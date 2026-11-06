'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Modo claro / oscuro de toda la aplicación.
 *
 * El tema se guarda en localStorage y se aplica como clase `dark` en <html>
 * (Tailwind usa `@custom-variant dark (&:is(.dark *))`). Un script en el
 * <head> del layout lo aplica antes de pintar para evitar parpadeos.
 */

export type Tema = 'claro' | 'oscuro'
export const CLAVE_TEMA = 'sp-tema'

function temaActual(): Tema {
  return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'
}

function suscribir(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

export function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'oscuro')
  document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Sin almacenamiento (modo privado): el tema dura solo esta sesión.
  }
}

export function useTema() {
  const tema = useSyncExternalStore<Tema>(suscribir, temaActual, () => 'claro')
  const alternar = useCallback(() => aplicarTema(temaActual() === 'oscuro' ? 'claro' : 'oscuro'), [])
  return { tema, alternar, esOscuro: tema === 'oscuro' }
}

/** Script que se ejecuta en <head> antes de pintar (evita el destello claro). */
export const SCRIPT_TEMA_INICIAL = `(function(){try{var t=localStorage.getItem('${CLAVE_TEMA}');if(t==='oscuro'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`
