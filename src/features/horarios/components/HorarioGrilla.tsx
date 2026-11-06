"use client"

import { useEffect, useRef } from "react"
import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DiaSemana } from "@/types/api"
import { DIAS_GRILLA, GRILLA_PASO_MIN } from "@/types/horario"
import { FILAS_GRILLA, aHora, clave, type SeleccionGrilla } from "../utils/grilla"

interface Props {
  seleccion: SeleccionGrilla
  /** Si se pasa, la grilla es editable (clic o arrastre para marcar). */
  onChange?: (seleccion: SeleccionGrilla) => void
  /** Celdas con reunión agendada: no se pueden desmarcar. */
  bloqueadas?: Set<string>
  /** Se llama cuando se intenta quitar una celda bloqueada. */
  onBloqueada?: (clave: string) => void
  className?: string
}

/**
 * Cuadrícula semanal lunes–sábado, 08:00–22:00 en bloques de 30 minutos.
 *
 * Edición: clic en una celda para marcar/desmarcar; arrastrar pinta varias
 * celdas con el mismo modo. Clic en el nombre del día o en la hora alterna
 * la columna o la fila completa.
 */
export function HorarioGrilla({ seleccion, onChange, bloqueadas, onBloqueada, className }: Props) {
  const editable = Boolean(onChange)
  const arrastre = useRef<{ modo: "marcar" | "desmarcar"; sel: SeleccionGrilla } | null>(null)

  useEffect(() => {
    if (!editable) return
    const terminar = () => {
      arrastre.current = null
    }
    window.addEventListener("pointerup", terminar)
    window.addEventListener("pointercancel", terminar)
    return () => {
      window.removeEventListener("pointerup", terminar)
      window.removeEventListener("pointercancel", terminar)
    }
  }, [editable])

  function aplicar(k: string, modo: "marcar" | "desmarcar", base: SeleccionGrilla) {
    const nueva = new Set(base)
    if (modo === "marcar") nueva.add(k)
    else nueva.delete(k)
    return nueva
  }

  const esBloqueada = (k: string) => Boolean(bloqueadas?.has(k))

  function iniciar(k: string) {
    if (!onChange) return
    if (seleccion.has(k) && esBloqueada(k)) {
      onBloqueada?.(k)
      return
    }
    const modo = seleccion.has(k) ? "desmarcar" : "marcar"
    const nueva = aplicar(k, modo, seleccion)
    arrastre.current = { modo, sel: nueva }
    onChange(nueva)
  }

  function continuar(k: string) {
    if (!onChange || !arrastre.current) return
    const { modo, sel } = arrastre.current
    if ((modo === "marcar") === sel.has(k)) return
    if (modo === "desmarcar" && esBloqueada(k)) return
    const nueva = aplicar(k, modo, sel)
    arrastre.current = { modo, sel: nueva }
    onChange(nueva)
  }

  function alternarGrupo(claves: string[]) {
    if (!onChange) return
    const todas = claves.every((k) => seleccion.has(k))
    const nueva = new Set(seleccion)
    let protegida: string | null = null
    for (const k of claves) {
      if (todas) {
        if (esBloqueada(k)) protegida = k
        else nueva.delete(k)
      } else nueva.add(k)
    }
    onChange(nueva)
    if (protegida) onBloqueada?.(protegida)
  }

  const columnas = "grid-cols-[92px_repeat(6,minmax(96px,1fr))]"

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border bg-card shadow-sm",
        editable && "select-none",
        className,
      )}
    >
      <div className="min-w-[700px]">
        {/* Encabezado de días */}
        <div className={cn("sticky top-0 z-10 grid border-b bg-card", columnas)}>
          <div className="border-r" />
          {DIAS_GRILLA.map((dia) => {
            const claves = FILAS_GRILLA.map((f) => clave(dia.value, f))
            const marcadas = claves.filter((k) => seleccion.has(k)).length
            return (
              <button
                key={dia.value}
                type="button"
                disabled={!editable}
                onClick={() => alternarGrupo(claves)}
                title={editable ? `Marcar/desmarcar todo el ${dia.largo.toLowerCase()}` : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 border-r px-2 py-4 last:border-r-0",
                  editable && "cursor-pointer transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                )}
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
                  {dia.corto}
                </span>
                <span className="text-sm font-bold text-foreground">{dia.largo}</span>
                <span
                  className={cn(
                    "text-[10px] font-medium tabular-nums",
                    marcadas ? "text-emerald-700 dark:text-emerald-400" : "text-transparent",
                  )}
                >
                  {marcadas ? `${(marcadas * GRILLA_PASO_MIN) / 60} h` : "0 h"}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filas de 30 minutos */}
        {FILAS_GRILLA.map((fila) => {
          const enPunto = fila % 60 === 0
          const clavesFila = DIAS_GRILLA.map((d) => clave(d.value, fila))
          return (
            <div
              key={fila}
              className={cn(
                "grid",
                columnas,
                enPunto ? "border-t border-border" : "border-t border-border/40",
              )}
            >
              <button
                type="button"
                disabled={!editable}
                onClick={() => alternarGrupo(clavesFila)}
                className={cn(
                  "flex items-center justify-center border-r px-1 text-[10.5px] font-medium tabular-nums text-muted-foreground",
                  editable && "cursor-pointer hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30",
                )}
              >
                {aHora(fila)} - {aHora(fila + GRILLA_PASO_MIN)}
              </button>
              {DIAS_GRILLA.map((dia) => (
                <Celda
                  key={dia.value}
                  dia={dia.value}
                  fila={fila}
                  marcada={seleccion.has(clave(dia.value, fila))}
                  bloqueada={esBloqueada(clave(dia.value, fila))}
                  editable={editable}
                  onIniciar={iniciar}
                  onContinuar={continuar}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Celda({
  dia,
  fila,
  marcada,
  bloqueada,
  editable,
  onIniciar,
  onContinuar,
}: {
  dia: DiaSemana
  fila: number
  marcada: boolean
  bloqueada: boolean
  editable: boolean
  onIniciar: (k: string) => void
  onContinuar: (k: string) => void
}) {
  const k = clave(dia, fila)
  return (
    <div
      role={editable ? "checkbox" : undefined}
      aria-checked={editable ? marcada : undefined}
      aria-label={`${dia} ${aHora(fila)}`}
      tabIndex={editable ? 0 : undefined}
      onPointerDown={(e) => {
        if (!editable) return
        e.preventDefault()
        ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
        onIniciar(k)
      }}
      onPointerEnter={() => editable && onContinuar(k)}
      onKeyDown={(e) => {
        if (editable && (e.key === " " || e.key === "Enter")) {
          e.preventDefault()
          onIniciar(k)
        }
      }}
      className={cn(
        "h-10 border-r px-1 py-[3px] last:border-r-0",
        editable && "cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500",
      )}
    >
      <div
        title={bloqueada ? "Reunión agendada en este horario" : undefined}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-md transition-colors",
          marcada && bloqueada
            ? "border-l-[5px] border-amber-300 bg-amber-600 text-white shadow-sm dark:bg-amber-700"
            : marcada
              ? "border-l-[5px] border-slate-500 bg-slate-800 shadow-sm dark:border-slate-400 dark:bg-slate-700"
              : editable
                ? "hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30"
                : "",
        )}
      >
        {marcada && bloqueada && <Lock size={13} />}
      </div>
    </div>
  )
}
