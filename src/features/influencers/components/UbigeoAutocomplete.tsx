"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Loader2, MapPin, X, CheckCircle2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { InfluencerFormValues } from "../schemas/influencer-form.schema"
import { ubigeoService } from "../services/ubigeo.service"
import type { UbigeoItem } from "@/types/ubigeo"

interface UbigeoAutocompleteProps {
  form: UseFormReturn<InfluencerFormValues>
  disabled?: boolean
}

export function UbigeoAutocomplete({ form, disabled }: UbigeoAutocompleteProps) {
  const currentUbigeo = form.watch("ubigeo") || ""
  const currentDep = form.watch("departamento") || ""
  const currentProv = form.watch("provincia") || ""
  const currentDist = form.watch("distrito") || ""

  const [textoBusqueda, setTextoBusqueda] = useState<string>("")
  const [sugerencias, setSugerencias] = useState<UbigeoItem[]>([])
  const [mostrarDropdown, setMostrarDropdown] = useState<boolean>(false)
  const [cargando, setCargando] = useState<boolean>(false)
  const [indiceResaltado, setIndiceResaltado] = useState<number>(-1)

  const contenedorRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inicializadoRef = useRef<boolean>(false)

  // Si viene con ubigeo inicial (ej: modo edición), resolver la etiqueta si no está lista
  useEffect(() => {
    if (inicializadoRef.current) return

    if (currentUbigeo) {
      inicializadoRef.current = true
      // Si ya tiene departamento y provincia, construimos una etiqueta inicial
      if (currentDep && currentProv) {
        const distTexto = currentDist ? `${currentDist} - ` : ""
        setTextoBusqueda(`${distTexto}${currentProv}, ${currentDep} (${currentUbigeo})`)
      } else {
        // Consultar el backend para obtener etiqueta y autocompletar departamento y provincia
        ubigeoService
          .obtenerPorCodigo(currentUbigeo)
          .then((item) => {
            if (item) {
              setTextoBusqueda(item.etiqueta)
              form.setValue("departamento", item.departamento, { shouldDirty: false })
              form.setValue("provincia", item.provincia, { shouldDirty: false })
              if (item.distrito) {
                form.setValue("distrito", item.distrito, { shouldDirty: false })
              }
            } else {
              setTextoBusqueda(currentUbigeo)
            }
          })
          .catch(() => {
            setTextoBusqueda(currentUbigeo)
          })
      }
    }
  }, [currentUbigeo, currentDep, currentProv, currentDist, form])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function manejarClickAfuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setMostrarDropdown(false)
      }
    }

    document.addEventListener("mousedown", manejarClickAfuera)
    return () => document.removeEventListener("mousedown", manejarClickAfuera)
  }, [])

  // Búsqueda en tiempo real con debounce de 300ms
  useEffect(() => {
    const termino = textoBusqueda.trim()

    // Si el término coincide exactamente con la etiqueta seleccionada o tiene menos de 2 caracteres, no buscar
    if (
      !mostrarDropdown ||
      termino.length < 2 ||
      (currentUbigeo && textoBusqueda.includes(`(${currentUbigeo})`))
    ) {
      setSugerencias([])
      return
    }

    const timer = setTimeout(async () => {
      setCargando(true)
      try {
        const resultados = await ubigeoService.autocompletar(termino, 10)
        setSugerencias(resultados || [])
        setIndiceResaltado(-1)
      } catch (error) {
        console.error("Error al buscar ubigeo:", error)
        setSugerencias([])
      } finally {
        setCargando(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [textoBusqueda, mostrarDropdown, currentUbigeo])

  const seleccionarOpcion = useCallback(
    (item: UbigeoItem) => {
      setTextoBusqueda(item.etiqueta)
      setMostrarDropdown(false)
      setSugerencias([])
      setIndiceResaltado(-1)

      // Actualizar valores en el formulario de React Hook Form
      form.setValue("ubigeo", item.codigo, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("departamento", item.departamento, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("provincia", item.provincia, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("distrito", item.distrito || "", {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [form],
  )

  const limpiarSeleccion = useCallback(() => {
    setTextoBusqueda("")
    setSugerencias([])
    setMostrarDropdown(false)
    setIndiceResaltado(-1)

    form.setValue("ubigeo", "", { shouldValidate: true, shouldDirty: true })
    form.setValue("departamento", "", { shouldValidate: true, shouldDirty: true })
    form.setValue("provincia", "", { shouldValidate: true, shouldDirty: true })
    form.setValue("distrito", "", { shouldValidate: true, shouldDirty: true })

    inputRef.current?.focus()
  }, [form])

  // Al perder el foco (onBlur), si el usuario ingresó un código numérico directo (2 a 6 dígitos)
  const manejarBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    // Si el foco se movió a la lista de sugerencias, no cerrar de inmediato
    if (listaRef.current && listaRef.current.contains(e.relatedTarget as Node)) {
      return
    }

    const texto = textoBusqueda.trim()

    // Si es un código numérico y aún no ha sido seleccionado formalmente
    if (/^\d{2,6}$/.test(texto) && texto !== currentUbigeo) {
      try {
        const item = await ubigeoService.obtenerPorCodigo(texto)
        if (item) {
          seleccionarOpcion(item)
          return
        }
      } catch {
        // Código no encontrado, mantener lo ingresado
      }
    }

    // Si limpió completamente el input de texto
    if (!texto && currentUbigeo) {
      limpiarSeleccion()
    }

    setTimeout(() => {
      setMostrarDropdown(false)
    }, 150)
  }

  // Navegación accesible con teclado
  const manejarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarDropdown || sugerencias.length === 0) {
      if (e.key === "ArrowDown" && textoBusqueda.trim().length >= 2) {
        setMostrarDropdown(true)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIndiceResaltado((prev) =>
        prev < sugerencias.length - 1 ? prev + 1 : 0,
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIndiceResaltado((prev) =>
        prev > 0 ? prev - 1 : sugerencias.length - 1,
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (indiceResaltado >= 0 && indiceResaltado < sugerencias.length) {
        seleccionarOpcion(sugerencias[indiceResaltado])
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setMostrarDropdown(false)
    }
  }

  // Auto-scroll para el elemento resaltado con el teclado
  useEffect(() => {
    if (indiceResaltado >= 0 && listaRef.current) {
      const elemento = listaRef.current.children[indiceResaltado] as HTMLElement
      if (elemento) {
        elemento.scrollIntoView({ block: "nearest" })
      }
    }
  }, [indiceResaltado])

  const tieneUbicacionSeleccionada = Boolean(currentUbigeo && currentDep)

  return (
    <div className="space-y-3">
      {/* Input de Ubigeo con autocompletado */}
      <FormField
        control={form.control}
        name="ubigeo"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium">Ubigeo</FormLabel>
              {tieneUbicacionSeleccionada && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ubigeo verificado ({currentUbigeo})
                </span>
              )}
            </div>

            <div ref={contenedorRef} className="relative">
              <div className="relative flex items-center">
                <MapPin className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    ref={inputRef}
                    type="text"
                    disabled={disabled}
                    value={textoBusqueda}
                    placeholder="Ej: 150122 o Miraflores, Lima..."
                    className={cn(
                      "pl-9 pr-16 h-9 transition-colors",
                      tieneUbicacionSeleccionada &&
                        "border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20",
                    )}
                    onChange={(e) => {
                      setTextoBusqueda(e.target.value)
                      setMostrarDropdown(true)
                    }}
                    onFocus={() => {
                      if (textoBusqueda.trim().length >= 2) {
                        setMostrarDropdown(true)
                      }
                    }}
                    onBlur={manejarBlur}
                    onKeyDown={manejarKeyDown}
                    autoComplete="off"
                  />
                </FormControl>

                <div className="absolute right-2.5 flex items-center gap-1">
                  {cargando && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {textoBusqueda && !disabled && (
                    <button
                      type="button"
                      onClick={limpiarSeleccion}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                      title="Limpiar ubicación"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista flotante de sugerencias */}
              {mostrarDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
                  {cargando && sugerencias.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando en catálogo oficial INEI...
                    </div>
                  ) : sugerencias.length > 0 ? (
                    <ul ref={listaRef} role="listbox" className="space-y-0.5">
                      {sugerencias.map((item, index) => {
                        const esResaltado = index === indiceResaltado
                        const titulo = item.distrito || item.provincia || item.departamento
                        const subtitulo = [item.provincia, item.departamento]
                          .filter(Boolean)
                          .filter((val, idx, arr) => arr.indexOf(val) === idx)
                          .join(", ")

                        return (
                          <li
                            key={item.codigo}
                            role="option"
                            aria-selected={esResaltado}
                            onClick={() => seleccionarOpcion(item)}
                            onMouseEnter={() => setIndiceResaltado(index)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                              esResaltado
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted/70",
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
                            <span className="ml-2 font-mono text-xs rounded bg-muted px-1.5 py-0.5 font-semibold text-muted-foreground">
                              {item.codigo}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : textoBusqueda.trim().length >= 2 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No se encontraron resultados para &quot;{textoBusqueda}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            <FormMessage />
            <p className="text-[11px] text-muted-foreground">
              Ingresa el código UBIGEO de 6 dígitos o escribe el nombre del distrito/provincia.
            </p>
          </FormItem>
        )}
      />

      {/* Campos informativos autocompletados (Departamento, Provincia, Distrito) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Departamento
              </FormLabel>
              <FormControl>
                <Input
                  readOnly
                  tabIndex={-1}
                  placeholder="Autocompletado"
                  className="bg-muted/40 cursor-default select-none text-muted-foreground h-8 text-xs font-medium"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provincia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Provincia
              </FormLabel>
              <FormControl>
                <Input
                  readOnly
                  tabIndex={-1}
                  placeholder="Autocompletado"
                  className="bg-muted/40 cursor-default select-none text-muted-foreground h-8 text-xs font-medium"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distrito"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Distrito
              </FormLabel>
              <FormControl>
                <Input
                  readOnly
                  tabIndex={-1}
                  placeholder="Autocompletado"
                  className="bg-muted/40 cursor-default select-none text-muted-foreground h-8 text-xs font-medium"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
