'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          Panel {user?.role === 'ADMIN' ? 'de Administración' : 'del Voluntario'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.nombre}</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </header>
  )
}
