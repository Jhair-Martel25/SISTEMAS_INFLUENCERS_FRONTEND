'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">
          Panel {user?.role === 'ADMIN' ? 'de Administración' : 'del Voluntario'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.nombre}</span>
        <span className="text-[10px] uppercase tracking-wider bg-[#003D2D]/10 text-[#003D2D] px-3 py-1 rounded-full font-medium">
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </header>
  )
}
