'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EmpresaBusqueda } from '@/types/empresa'
import { useBuscarEmpresas } from '../hooks/useEmpresas'

interface EmpresaSearchProps {
  /** Empresa actualmente seleccionada (null si aun no se elige). */
  seleccionada: EmpresaBusqueda | null
  onSelect: (empresa: EmpresaBusqueda | null) => void
  /** Abre el formulario para registrar una empresa que no esta en la base. */
  onRegistrarManual?: () => void
  disabled?: boolean
  error?: string
}

function ubicacion(empresa: EmpresaBusqueda) {
  return [empresa.distrito, empresa.provincia, empresa.departamento]
    .filter(Boolean)
    .join(', ')
}

/**
 * Autocompletado de empresas por nombre, RUC o CIIU.
 *
 * Consulta `GET /empresas/buscar` con debounce. Si hay una empresa
 * seleccionada muestra una ficha con sus datos y permite cambiarla.
 */
export function EmpresaSearch({
  seleccionada,
  onSelect,
  onRegistrarManual,
  disabled,
  error,
}: EmpresaSearchProps) {
  const [texto, setTexto] = useState('')
  const [termino, setTermino] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(-1)

  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setTermino(texto.trim()), 300)
    return () => clearTimeout(timer)
  }, [texto])

  const { data, isFetching, isError, error: errorBusqueda } = useBuscarEmpresas(
    termino,
    20,
    abierto && !disabled,
  )

  const resultados = data ?? []

  useEffect(() => {
    function alHacerClickFuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alHacerClickFuera)
    return () => document.removeEventListener('mousedown', alHacerClickFuera)
  }, [])

  function elegir(empresa: EmpresaBusqueda) {
    onSelect(empresa)
    setTexto('')
    setTermino('')
    setAbierto(false)
    setResaltado(-1)
  }

  function quitar() {
    onSelect(null)
    setTexto('')
    setTermino('')
  }

  function alPresionarTecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || resultados.length === 0) return

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setResaltado((prev) => (prev < resultados.length - 1 ? prev + 1 : 0))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setResaltado((prev) => (prev > 0 ? prev - 1 : resultados.length - 1))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (resaltado >= 0 && resaltado < resultados.length) {
        elegir(resultados[resaltado])
      }
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      setAbierto(false)
    }
  }

  if (seleccionada) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-50/50 p-3.5 dark:bg-emerald-500/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 size={18} />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="truncate">{seleccionada.nombre}</span>
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    seleccionada.ruc ? `RUC ${seleccionada.ruc}` : null,
                    seleccionada.sector ?? seleccionada.tipoEmpresaCiiu,
                    seleccionada.ciiu ? `CIIU ${seleccionada.ciiu}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Sin datos corporativos'}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    ubicacion(seleccionada),
                    `${seleccionada.totalContactos} ${
                      seleccionada.totalContactos === 1
                        ? 'contacto'
                        : 'contactos'
                    }`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={quitar}
              >
                <X size={14} />
                Cambiar
              </Button>
            )}
          </div>
        </div>
        {onRegistrarManual && !disabled && (
          <button
            type="button"
            onClick={onRegistrarManual}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Plus size={13} />
            Registrar otra empresa manualmente
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={contenedorRef} className="relative">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <Input
            value={texto}
            disabled={disabled}
            onChange={(e) => {
              setTexto(e.target.value)
              setAbierto(true)
              setResaltado(-1)
            }}
            onFocus={() => setAbierto(true)}
            onKeyDown={alPresionarTecla}
            placeholder="Buscar empresa por nombre, RUC o CIIU..."
            className="pl-9 pr-9"
            autoComplete="off"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {abierto && !disabled && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
            {isError ? (
              <div className="p-3 text-center text-xs text-destructive">
                {errorBusqueda instanceof Error
                  ? errorBusqueda.message
                  : 'No se pudo buscar empresas.'}
              </div>
            ) : resultados.length > 0 ? (
              <ul role="listbox" className="space-y-0.5">
                {resultados.map((empresa, indice) => (
                  <li
                    key={empresa.id}
                    role="option"
                    aria-selected={indice === resaltado}
                    onClick={() => elegir(empresa)}
                    onMouseEnter={() => setResaltado(indice)}
                    className={cn(
                      'flex cursor-pointer items-start justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      indice === resaltado
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted/70',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {empresa.nombre}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[
                          empresa.ruc ? `RUC ${empresa.ruc}` : null,
                          empresa.sector ?? empresa.tipoEmpresaCiiu,
                          ubicacion(empresa),
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Sin datos corporativos'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {empresa.totalContactos}
                    </span>
                  </li>
                ))}
              </ul>
            ) : isFetching ? (
              <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Buscando empresas...
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {termino
                  ? `No se encontraron empresas para "${termino}".`
                  : 'Escribe para buscar en la base corporativa.'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {onRegistrarManual && !disabled && (
        <button
          type="button"
          onClick={onRegistrarManual}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <Plus size={13} />
          Registrar empresa manualmente
        </button>
      )}
    </div>
  )
}
