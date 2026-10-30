'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, MapPin, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ubigeoService } from '@/features/influencers/services/ubigeo.service'
import type { UbigeoItem } from '@/types/ubigeo'

export interface UbigeoValores {
  ubigeo?: string
  departamento?: string
  provincia?: string
  distrito?: string
}

interface UbigeoSelectorProps {
  value: UbigeoValores
  onChange: (patch: Partial<UbigeoValores>) => void
  disabled?: boolean
}

/**
 * Selector de ubigeo controlado (reutilizable fuera del formulario de
 * influencers). Busca en el catálogo INEI por código o por texto y escribe
 * departamento / provincia / distrito en el objeto que recibe.
 */
export function UbigeoSelector({
  value,
  onChange,
  disabled,
}: UbigeoSelectorProps) {
  const [texto, setTexto] = useState(() => {
    const codigo = value.ubigeo ?? ''
    const dep = value.departamento ?? ''
    const prov = value.provincia ?? ''
    const dist = value.distrito ?? ''
    if (!codigo) return ''
    if (dep && prov) {
      return `${dist ? `${dist} - ` : ''}${prov}, ${dep} (${codigo})`
    }
    return codigo
  })
  const [sugerencias, setSugerencias] = useState<UbigeoItem[]>([])
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [resaltado, setResaltado] = useState(-1)

  const contenedorRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)
  const inicializadoRef = useRef(false)

  const ubigeo = value.ubigeo ?? ''
  const departamento = value.departamento ?? ''
  const provincia = value.provincia ?? ''
  const distrito = value.distrito ?? ''

  // Completa la etiqueta cuando ya viene un ubigeo sin sus textos.
  useEffect(() => {
    if (inicializadoRef.current) return
    inicializadoRef.current = true

    if (!ubigeo || (departamento && provincia)) return

    ubigeoService
      .obtenerPorCodigo(ubigeo)
      .then((item) => {
        setTexto(item.etiqueta)
        onChange({
          departamento: item.departamento,
          provincia: item.provincia,
          distrito: item.distrito ?? '',
        })
      })
      .catch(() => {
        // Si el catalogo no responde se mantiene el codigo escrito.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubigeo, departamento, provincia, distrito])

  // Cerrar al hacer click fuera.
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

  // Búsqueda con debounce.
  useEffect(() => {
    const termino = texto.trim()
    if (
      !abierto ||
      termino.length < 2 ||
      (ubigeo && texto.includes(`(${ubigeo})`))
    ) {
      const timer = setTimeout(() => setSugerencias([]), 0)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(async () => {
      setCargando(true)
      try {
        const resultados = await ubigeoService.autocompletar(termino, 10)
        setSugerencias(resultados ?? [])
        setResaltado(-1)
      } catch {
        setSugerencias([])
      } finally {
        setCargando(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [texto, abierto, ubigeo])

  const seleccionar = useCallback(
    (item: UbigeoItem) => {
      setTexto(item.etiqueta)
      setAbierto(false)
      setSugerencias([])
      setResaltado(-1)
      onChange({
        ubigeo: item.codigo,
        departamento: item.departamento,
        provincia: item.provincia,
        distrito: item.distrito ?? '',
      })
    },
    [onChange],
  )

  const limpiar = useCallback(() => {
    setTexto('')
    setSugerencias([])
    setAbierto(false)
    setResaltado(-1)
    onChange({
      ubigeo: '',
      departamento: '',
      provincia: '',
      distrito: '',
    })
  }, [onChange])

  async function alPerderFoco(evento: React.FocusEvent<HTMLInputElement>) {
    if (listaRef.current?.contains(evento.relatedTarget as Node)) return

    const termino = texto.trim()
    if (/^\d{2,6}$/.test(termino) && termino !== ubigeo) {
      try {
        const item = await ubigeoService.obtenerPorCodigo(termino)
        if (item) {
          seleccionar(item)
          return
        }
      } catch {
        // El código no existe: se mantiene lo escrito.
      }
    }

    if (!termino && ubigeo) limpiar()
    setTimeout(() => setAbierto(false), 150)
  }

  function alPresionarTecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || sugerencias.length === 0) {
      if (evento.key === 'ArrowDown' && texto.trim().length >= 2) {
        setAbierto(true)
      }
      return
    }

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setResaltado((prev) => (prev < sugerencias.length - 1 ? prev + 1 : 0))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setResaltado((prev) => (prev > 0 ? prev - 1 : sugerencias.length - 1))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (resaltado >= 0 && resaltado < sugerencias.length) {
        seleccionar(sugerencias[resaltado])
      }
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      setAbierto(false)
    }
  }

  useEffect(() => {
    if (resaltado >= 0 && listaRef.current) {
      const elemento = listaRef.current.children[resaltado] as HTMLElement
      elemento?.scrollIntoView({ block: 'nearest' })
    }
  }, [resaltado])

  const tieneUbicacion = Boolean(ubigeo && departamento)

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium">Ubigeo</span>
          {tieneUbicacion && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verificado ({ubigeo})
            </span>
          )}
        </div>

        <div ref={contenedorRef} className="relative">
          <div className="relative flex items-center">
            <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              disabled={disabled}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value)
                setAbierto(true)
              }}
              onFocus={() => {
                if (texto.trim().length >= 2) setAbierto(true)
              }}
              onBlur={alPerderFoco}
              onKeyDown={alPresionarTecla}
              placeholder="Ej: 150122 o Miraflores, Lima..."
              className={cn(
                'h-9 pl-9 pr-10',
                tieneUbicacion &&
                  'border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20',
              )}
              autoComplete="off"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {cargando && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {texto && !disabled && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Limpiar ubicación"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {abierto && (
            <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
              {cargando && sugerencias.length === 0 ? (
                <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando en el catálogo INEI...
                </div>
              ) : sugerencias.length > 0 ? (
                <ul ref={listaRef} role="listbox" className="space-y-0.5">
                  {sugerencias.map((item, indice) => {
                    const titulo =
                      item.distrito || item.provincia || item.departamento
                    const subtitulo = [item.provincia, item.departamento]
                      .filter(Boolean)
                      .filter((valor, i, arr) => arr.indexOf(valor) === i)
                      .join(', ')

                    return (
                      <li
                        key={item.codigo}
                        role="option"
                        aria-selected={indice === resaltado}
                        onClick={() => seleccionar(item)}
                        onMouseEnter={() => setResaltado(indice)}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          indice === resaltado
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted/70',
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {titulo}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {subtitulo}
                          </span>
                        </div>
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                          {item.codigo}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : texto.trim().length >= 2 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No se encontraron resultados para &quot;{texto}&quot;
                </div>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">
          Escribe el código UBIGEO o el distrito/provincia. Se completa solo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(
          [
            ['Departamento', departamento],
            ['Provincia', provincia],
            ['Distrito', distrito],
          ] as const
        ).map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <span className="mb-1 block text-xs text-muted-foreground">
              {etiqueta}
            </span>
            <Input
              readOnly
              tabIndex={-1}
              value={valor}
              placeholder="Autocompletado"
              className="h-8 cursor-default select-none bg-muted/40 text-xs font-medium text-muted-foreground"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
