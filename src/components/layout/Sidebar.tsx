'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  Home,
  Mail,
  Send,
  Sparkles,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ADMIN: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/influencers/gestion', label: 'Influencers', icon: Users },
  { href: '/influencers/motor-ia', label: 'Motor IA', icon: Sparkles },
  { href: '/reuniones/gestion', label: 'Reuniones', icon: Video },
  { href: '/usuarios', label: 'Usuarios', icon: UserPlus },
  { href: '/plantillas', label: 'Plantillas', icon: FileText },
  { href: '/email', label: 'Email', icon: Mail },
  { href: '/reuniones/agenda', label: 'Agenda', icon: BarChart3 },
]

const NAV_VOLUNTARIO: NavItem[] = [
  { href: '/influencers/gestion', label: 'Influencers', icon: Users },
  { href: '/influencers/motor-ia', label: 'Motor IA', icon: Sparkles },
  { href: '/reuniones/gestion', label: 'Reuniones', icon: Video },
  { href: '/reuniones/agenda', label: 'Agenda', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const items = isAdmin ? NAV_ADMIN : NAV_VOLUNTARIO

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#003D2D] to-[#0B5E47] flex items-center justify-center">
          <Send size={16} className="text-white" />
        </div>
        <span className="font-bold text-[#003D2D]">Sembrando Perú</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
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
