'use client'

import { Moon, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useTema } from '@/hooks/useTema'

/** Botón para cambiar entre modo claro y oscuro. */
export function ThemeToggle({ className }: { className?: string }) {
  const { esOscuro, alternar } = useTema()
  const label = esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {esOscuro ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

/** Rutas públicas (sin el encabezado del panel), donde el botón va flotante. */
const RUTAS_PUBLICAS = ['/', '/login', '/agendar']

/** Botón flotante para las páginas públicas (login, agendar…). */
export function ThemeToggleFlotante() {
  const pathname = usePathname()
  const publica = RUTAS_PUBLICAS.some((r) => (r === '/' ? pathname === '/' : pathname?.startsWith(r)))
  if (!publica) return null
  return <ThemeToggle className="fixed bottom-6 left-6 z-50 size-11 shadow-lg" />
}
