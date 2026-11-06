"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  CalendarX2,
  Clock,
  Eraser,
  Info,
  Loader2,
  Power,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import type { DisponibilidadCita } from "@/types/disponibilidad"
import { formatearFechaUI, zonaHorariaNavegador } from "@/lib/utils/date"
import {
  useEliminarDisponibilidad,
  useGenerar,
  useLimpiar,
  useMisBloques,
  useToggle,
} from "../hooks/useDisponibilidades"
import { DisponibilidadForm } from "./DisponibilidadForm"

type EstadoBloque = "DISPONIBLE" | "RESERVADO" | "PAUSADO" | "VENCIDO"
type Filtro = "PROXIMOS" | EstadoBloque | "TODOS"

const ESTADOS: Record<
  EstadoBloque,
  { label: string; descripcion: string; chip: string; punto: string }
> = {
  DISPONIBLE: {
    label: "Disponible",
    descripcion: "Los embajadores pueden reservarlo",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    punto: "bg-emerald-500",
  },
  RESERVADO: {
    label: "Reservado",
    descripcion: "Tiene una reunión agendada",
    chip: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
    punto: "bg-sky-500",
  },
  PAUSADO: {
    label: "Pausado",
    descripcion: "Lo desactivaste; no se muestra para reservar",
    chip: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    punto: "bg-amber-500",
  },
  VENCIDO: {
    label: "Vencido",
    descripcion: "Ya pasó; puedes limpiarlo",
    chip: "border-border bg-muted/60 text-muted-foreground",
    punto: "bg-slate-400",
  },
}

function estadoDe(b: DisponibilidadCita, ahora: number): EstadoBloque {
  if (new Date(b.fechaHora).getTime() < ahora) return "VENCIDO"
  if (b.reservado) return "RESERVADO"
  if (b.disponible === false) return "PAUSADO"
  return "DISPONIBLE"
}

function claveDia(iso: string, zona: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso))
}

function tituloDia(iso: string, zona: string) {
  const texto = new Intl.DateTimeFormat("es-PE", { timeZone: zona, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function hora(iso: string, zona: string) {
  return new Intl.DateTimeFormat("es-PE", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso))
}

function etiquetaRelativa(iso: string, zona: string, ahora: number) {
  const hoy = claveDia(new Date(ahora).toISOString(), zona)
  const manana = claveDia(new Date(ahora + 86_400_000).toISOString(), zona)
  const dia = claveDia(iso, zona)
  return dia === hoy ? "Hoy" : dia === manana ? "Mañana" : null
}

export function DisponibilidadList({ embebido = false }: { embebido?: boolean } = {}) {
  const zona = zonaHorariaNavegador()
  const [filtro, setFiltro] = useState<Filtro>("PROXIMOS")
  const [creando, setCreando] = useState(false)
  const [limpiando, setLimpiando] = useState(false)
  const [eliminando, setEliminando] = useState<DisponibilidadCita | null>(null)
  // Marca de tiempo fija por render de datos (evita cálculos impuros en cada render).
  const [ahora] = useState(() => Date.now())

  const { data, isLoading, isError, error } = useMisBloques({ page: 1, limit: 500 })
  const generar = useGenerar()
  const limpiar = useLimpiar()
  const toggle = useToggle()
  const eliminar = useEliminarDisponibilidad()

  const bloques = useMemo(
    () => (data?.data ?? []).map((b) => ({ ...b, estado: estadoDe(b, ahora) })),
    [data, ahora],
  )

  const conteo = useMemo(() => {
    const c: Record<EstadoBloque, number> = { DISPONIBLE: 0, RESERVADO: 0, PAUSADO: 0, VENCIDO: 0 }
    for (const b of bloques) c[b.estado]++
    return c
  }, [bloques])

  const filtrados = bloques.filter((b) =>
    filtro === "TODOS" ? true : filtro === "PROXIMOS" ? b.estado !== "VENCIDO" : b.estado === filtro,
  )

  const porDia = useMemo(() => {
    const grupos = new Map<string, typeof filtrados>()
    for (const b of filtrados) {
      const k = claveDia(b.fechaHora, zona)
      grupos.set(k, [...(grupos.get(k) ?? []), b])
    }
    return [...grupos.entries()]
  }, [filtrados, zona])

  const proximo = bloques.find((b) => b.estado === "DISPONIBLE")

  function manejarGenerar() {
    generar.mutate(
      { zonaHoraria: zona },
      {
        onSuccess: (res) =>
          toast.success(
            res.creados > 0
              ? `Se crearon ${res.creados} bloques nuevos${res.existentes ? ` (${res.existentes} ya existían)` : ""}.`
              : "No había bloques nuevos por crear: ya estaban generados.",
          ),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "No se pudieron generar los bloques. Configura tu horario primero."),
      },
    )
  }

  function manejarToggle(b: DisponibilidadCita) {
    toggle.mutate(b.id, {
      onSuccess: () => toast.success(b.disponible === false ? "Bloque activado." : "Bloque pausado."),
      onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo actualizar el bloque."),
    })
  }

  const filtros: { valor: Filtro; label: string; total: number }[] = [
    { valor: "PROXIMOS", label: "Próximos", total: bloques.length - conteo.VENCIDO },
    { valor: "DISPONIBLE", label: "Disponibles", total: conteo.DISPONIBLE },
    { valor: "RESERVADO", label: "Reservados", total: conteo.RESERVADO },
    { valor: "PAUSADO", label: "Pausados", total: conteo.PAUSADO },
    { valor: "VENCIDO", label: "Vencidos", total: conteo.VENCIDO },
    { valor: "TODOS", label: "Todos", total: bloques.length },
  ]

  return (
    <div className={embebido ? "flex flex-col gap-6" : "mx-auto flex max-w-6xl flex-col gap-6"}>
      {!embebido && <PageHeader
        title="Mi disponibilidad"
        description="Estos son los bloques que los embajadores ven para agendar una reunión contigo."
        backHref="/dashboard"
        actions={
          <Button onClick={() => setCreando(true)}>
            <CalendarPlus size={16} />
            Nuevo bloque
          </Button>
        }
      />}
      {embebido && (
        <div className="flex justify-end">
          <Button onClick={() => setCreando(true)}>
            <CalendarPlus size={16} />
            Nuevo bloque
          </Button>
        </div>
      )}

      {/* Cómo funciona */}
      <ol className="grid gap-3 md:grid-cols-3">
        <Paso n={1} titulo="Define tu horario" texto="Marca en Horarios los días y horas en que puedes reunirte.">
          <Link href="/horarios" className="text-xs font-semibold text-primary hover:underline">
            Ir a mi horario →
          </Link>
        </Paso>
        <Paso n={2} titulo="Genera tus bloques" texto="Crea bloques de 60 min para el mismo día de la próxima semana según tu horario.">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={manejarGenerar} disabled={generar.isPending}>
            {generar.isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Generar desde mi horario
          </Button>
        </Paso>
        <Paso n={3} titulo="Recibe reservas" texto="Cuando un embajador reserva, el bloque pasa a Reservado y se crea la reunión." />
      </ol>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador icono={<CalendarCheck2 size={18} />} label="Disponibles" valor={conteo.DISPONIBLE} estado="DISPONIBLE" activo={filtro === "DISPONIBLE"} onClick={() => setFiltro("DISPONIBLE")} />
        <Indicador icono={<CalendarClock size={18} />} label="Reservados" valor={conteo.RESERVADO} estado="RESERVADO" activo={filtro === "RESERVADO"} onClick={() => setFiltro("RESERVADO")} />
        <Indicador icono={<Power size={18} />} label="Pausados" valor={conteo.PAUSADO} estado="PAUSADO" activo={filtro === "PAUSADO"} onClick={() => setFiltro("PAUSADO")} />
        <Indicador icono={<CalendarX2 size={18} />} label="Vencidos" valor={conteo.VENCIDO} estado="VENCIDO" activo={filtro === "VENCIDO"} onClick={() => setFiltro("VENCIDO")} />
      </div>

      {proximo && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <Clock size={16} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
          <span>
            Tu próximo bloque libre es el{" "}
            <strong>{tituloDia(proximo.fechaHora, zona).toLowerCase()}</strong> a las{" "}
            <strong>{hora(proximo.fechaHora, zona)}</strong>.
          </span>
        </div>
      )}

      {/* Agenda */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-1 text-xs">
            {filtros.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 font-medium transition-colors",
                  filtro === f.valor ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label} <span className="tabular-nums opacity-70">({f.total})</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLimpiando(true)} disabled={conteo.VENCIDO === 0}>
            <Eraser size={14} />
            Limpiar vencidos
          </Button>
        </div>

        {isError ? (
          <p className="p-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "No se pudieron cargar tus bloques."}
          </p>
        ) : isLoading ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Cargando disponibilidad…
          </div>
        ) : porDia.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <CalendarPlus size={28} className="text-muted-foreground" />
            <p className="font-medium">No hay bloques en esta vista</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Genera bloques desde tu horario o crea uno manualmente con &quot;Nuevo bloque&quot;.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {porDia.map(([k, lista]) => {
              const relativa = etiquetaRelativa(lista[0].fechaHora, zona, ahora)
              return (
                <div key={k} className="grid gap-3 p-4 md:grid-cols-[200px_1fr]">
                  <div className="flex items-baseline gap-2 md:flex-col md:gap-0.5">
                    <p className="font-semibold">{tituloDia(lista[0].fechaHora, zona)}</p>
                    <p className="text-xs text-muted-foreground">
                      {relativa ? `${relativa} · ` : ""}
                      {lista.length} bloque{lista.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                    {lista.map((b) => {
                      const info = ESTADOS[b.estado]
                      return (
                        <div
                          key={b.id}
                          className={cn("group flex items-center gap-2 rounded-xl border px-3 py-2", info.chip)}
                          title={info.descripcion}
                        >
                          <span className={cn("size-2 shrink-0 rounded-full", info.punto)} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold tabular-nums">{hora(b.fechaHora, zona)}</p>
                            <p className="text-[11px] opacity-80">{info.label}</p>
                          </div>
                          {b.estado !== "VENCIDO" && b.estado !== "RESERVADO" && (
                            <button
                              type="button"
                              onClick={() => manejarToggle(b)}
                              disabled={toggle.isPending}
                              className="rounded-md p-1 opacity-70 hover:bg-background/70 hover:opacity-100"
                              aria-label={b.estado === "PAUSADO" ? "Activar bloque" : "Pausar bloque"}
                              title={b.estado === "PAUSADO" ? "Activar" : "Pausar"}
                            >
                              <Power size={14} />
                            </button>
                          )}
                          {b.estado !== "RESERVADO" && (
                            <button
                              type="button"
                              onClick={() => setEliminando(b)}
                              className="rounded-md p-1 text-destructive opacity-60 hover:bg-background/70 hover:opacity-100"
                              aria-label="Eliminar bloque"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
          <Info size={12} />
          {(Object.keys(ESTADOS) as EstadoBloque[]).map((e) => (
            <span key={e} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", ESTADOS[e].punto)} />
              <strong className="font-medium">{ESTADOS[e].label}:</strong> {ESTADOS[e].descripcion}
            </span>
          ))}
          <span className="ml-auto">Horas en tu zona: {zona}</span>
        </div>
      </section>

      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo bloque</DialogTitle>
            <DialogDescription>Crea un bloque puntual de disponibilidad (fuera de tu horario habitual).</DialogDescription>
          </DialogHeader>
          <DisponibilidadForm onSuccess={() => setCreando(false)} onCancel={() => setCreando(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={limpiando}
        onOpenChange={(open) => !open && setLimpiando(false)}
        title="Limpiar bloques vencidos"
        description="Se eliminarán los bloques vencidos que no tengan reunión. Esta acción no se puede deshacer."
        confirmLabel="Limpiar"
        destructive
        isPending={limpiar.isPending}
        onConfirm={() =>
          limpiar.mutate(undefined, {
            onSuccess: (res) => {
              toast.success(res.eliminados > 0 ? `${res.eliminados} bloque(s) vencido(s) eliminados.` : "No había bloques vencidos para limpiar.")
              setLimpiando(false)
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo limpiar la disponibilidad."),
          })
        }
      />

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar bloque"
        description={eliminando ? `¿Seguro que deseas eliminar el bloque del ${formatearFechaUI(eliminando.fechaHora, zona)}?` : undefined}
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Bloque eliminado correctamente.")
              setEliminando(null)
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo eliminar el bloque."),
          })
        }}
      />
    </div>
  )
}

function Paso({ n, titulo, texto, children }: { n: number; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-xl border bg-card p-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{n}</span>
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <p className="text-sm font-semibold">{titulo}</p>
        <p className="text-xs text-muted-foreground">{texto}</p>
        {children}
      </div>
    </li>
  )
}

function Indicador({
  icono,
  label,
  valor,
  estado,
  activo,
  onClick,
}: {
  icono: React.ReactNode
  label: string
  valor: number
  estado: EstadoBloque
  activo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-sm",
        activo && "ring-2 ring-primary/40",
      )}
    >
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{valor}</p>
      </div>
      <span className={cn("flex size-10 items-center justify-center rounded-xl border", ESTADOS[estado].chip)}>{icono}</span>
    </button>
  )
}
