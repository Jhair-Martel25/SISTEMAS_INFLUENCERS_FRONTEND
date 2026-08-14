'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Send } from 'lucide-react'
import { usePermission } from '@/hooks/usePermission'
import { NAVEGACION } from '@/config/navigation'
import { ICONO_POR_RECURSO } from './navigation-icons'

export function Sidebar() {
  const pathname = usePathname()
  const { puede } = usePermission()

  const items = NAVEGACION.filter((item) => puede(item.recurso))

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#003D2D] to-[#0B5E47] flex items-center justify-center">
          <Send size={16} className="text-white" />
        </div>
        <span className="font-bold text-[#003D2D]">Sembrando Perú</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ href, label, recurso }) => {
          const Icon = ICONO_POR_RECURSO[recurso]
          const activo =
            pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activo
                  ? 'bg-[#003D2D]/10 text-[#003D2D]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
