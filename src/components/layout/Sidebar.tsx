'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Send } from 'lucide-react'
import { usePermission } from '@/hooks/usePermission'
import { NAVEGACION } from '@/config/navigation'
import { ICONO_POR_RECURSO } from './navigation-icons'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { puede } = usePermission()

  const items = NAVEGACION.filter((item) => puede(item.recurso))

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-mint to-primary">
          <Send size={16} className="text-primary-foreground" />
        </div>
        <span className="font-semibold text-white">Sembrando Perú</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ href, label, recurso }) => {
          const Icon = ICONO_POR_RECURSO[recurso]
          const activo =
            pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activo
                  ? 'bg-sidebar-primary text-white'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white',
              )}
            >
              {activo && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-mint" />
              )}
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
