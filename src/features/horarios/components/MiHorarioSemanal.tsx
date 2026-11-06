"use client"

import { useMemo, useState } from "react"
import {
  CalendarClock,
  Clock,
  Eraser,
  Loader2,
  MousePointerClick,
  Plus,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { DIAS_GRILLA } from "@/types/horario"
import { useGuardarMisHorarios, useMisHorarios } from "../hooks/useHorarios"
import {
  bloquesASeleccion,
  formatearHoras,
  minutosDeBloques,
  mismaSeleccion,
  seleccionABloques,
  type SeleccionGrilla,
} from "../utils/grilla"
import { HorarioGrilla } from "./HorarioGrilla"

/**
 * Horario de reuniones del usuario (lunes a sábado, 08:00–22:00).
 * Vista en cuadrícula; "Nuevo horario" / "Cambiar horario" activa la edición.
 */
export function MiHorarioSemanal({ embebido = false }: { embebido?: boolean } = {}) {
  const { data, isLoading, isError, error } = useMisHorarios({ page: 1, limit: 200 })
  const guardar = useGuardarMisHorarios()

  const guardada = useMemo(() => bloquesASeleccion(data?.data ?? []), [data])
  const [borrador, setBorrador] = useState<SeleccionGrilla | null>(null)
  const editando = borrador !== null
  const seleccion = borrador ?? guardada

  const bloques = useMemo(() => seleccionABloques(seleccion), [seleccion])
  const minutos = minutosDeBloques(bloques)
  const hayCambios = editando && !mismaSeleccion(borrador, guardada)
  const tieneHorario = guardada.size > 0

  function guardarCambios() {
    if (!borrador) return
    guardar.mutate(
      { bloques: seleccionABloques(borrador) },
      {
        onSuccess: () => {
          toast.success("Horario guardado correctamente.")
          setBorrador(null)
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "No se pudo guardar el horario."),
      },
    )
  }

  return (
    <div className={embebido ? "flex flex-col gap-6" : "mx-auto flex max-w-7xl flex-col gap-5"}>
      {!embebido && <PageHeader
        title="Mi horario de reuniones"
        description="Marca los bloques en los que puedes atender reuniones (lunes a sábado, de 8:00 a. m. a 10:00 p. m.)."
        backHref="/dashboard"
      />}

      <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-b from-emerald-50/70 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between dark:from-emerald-950/20">
        <div className="flex flex-wrap items-center gap-2">
          {!editando ? (
            <Button
              onClick={() => setBorrador(new Set(guardada))}
              disabled={isLoading}
              className="bg-emerald-800 text-white hover:bg-emerald-900"
            >
              {tieneHorario ? <CalendarClock size={16} /> : <Plus size={16} />}
              {tieneHorario ? "Cambiar horario" : "Nuevo horario"}
            </Button>
          ) : (
            <>
              <Button
                onClick={guardarCambios}
                disabled={!hayCambios || guardar.isPending}
                className="bg-emerald-800 text-white hover:bg-emerald-900"
              >
                {guardar.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar horario
              </Button>
              <Button variant="outline" onClick={() => setBorrador(null)} disabled={guardar.isPending}>
                <X size={16} />
                Cancelar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setBorrador(new Set())}
                disabled={guardar.isPending || seleccion.size === 0}
                className="text-destructive hover:text-destructive"
              >
                <Eraser size={16} />
                Limpiar todo
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick size={14} />
                Haz clic o arrastra sobre las celdas. Clic en un día u hora para marcar toda la columna o fila.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-6 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-md sm:min-w-52">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">HORAS DISPONIBLES</p>
            <p className="text-2xl font-bold">{formatearHoras(minutos)}</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <Clock size={18} />
          </span>
        </div>
      </div>

      {isError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "No se pudo cargar tu horario."}
        </p>
      ) : isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2 rounded-2xl border text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Cargando horario…
        </div>
      ) : (
        <>
          {!editando && !tieneHorario && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Aún no tienes un horario. Pulsa <strong>Nuevo horario</strong> y marca tus bloques disponibles.
            </p>
          )}
          <HorarioGrilla
            seleccion={seleccion}
            onChange={editando ? setBorrador : undefined}
            className={cn(editando && "ring-2 ring-emerald-600/30")}
          />
          {bloques.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">Resumen:</span>
              {bloques.map((b) => (
                <span
                  key={`${b.diaSemana}-${b.horaInicio}`}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  {DIAS_GRILLA.find((d) => d.value === b.diaSemana)?.largo}{" "}
                  {b.horaInicio} – {b.horaFin}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
