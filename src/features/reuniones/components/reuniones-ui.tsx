"use client"

// Piezas visuales compartidas por la gestión de reuniones (admin y voluntario).

import { CheckCircle2, CircleSlash, Clock3, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EstadoReunion } from "@/types/api"
import type { Reunion } from "@/types/reunion"
import { zonaHorariaNavegador } from "@/lib/utils/date"

export const ESTILO_ESTADO: Record<
  EstadoReunion,
  { label: string; clase: string; punto: string; icono: React.ElementType }
> = {
  PENDIENTE: {
    label: "Programada",
    clase: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    punto: "bg-sky-500",
    icono: Clock3,
  },
  REALIZADA: {
    label: "Realizada",
    clase: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    punto: "bg-emerald-500",
    icono: CheckCircle2,
  },
  NO_ASISTIO: {
    label: "No realizada",
    clase: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    punto: "bg-amber-500",
    icono: CircleSlash,
  },
  CANCELADA: {
    label: "Cancelada",
    clase: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
    punto: "bg-rose-500",
    icono: XCircle,
  },
}

export function BadgeEstadoReunion({ estado, className }: { estado: EstadoReunion; className?: string }) {
  const e = ESTILO_ESTADO[estado]
  const Icono = e.icono
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        e.clase,
        className,
      )}
    >
      <Icono size={12} />
      {e.label}
    </span>
  )
}

export function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Avatar({ nombre, className }: { nombre: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        className,
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}

const zona = () => zonaHorariaNavegador()

export function claveDia(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona(), year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso))
}

export function partesFecha(r: Pick<Reunion, "fechaHora" | "duracionMinutos">) {
  const inicio = new Date(r.fechaHora)
  const fin = new Date(inicio.getTime() + (r.duracionMinutos ?? 30) * 60_000)
  const f = (o: Intl.DateTimeFormatOptions, d = inicio) => new Intl.DateTimeFormat("es-PE", { timeZone: zona(), ...o }).format(d)
  const hora = (d: Date) => f({ hour: "2-digit", minute: "2-digit", hour12: false }, d)
  return {
    dia: f({ day: "2-digit" }),
    mes: f({ month: "short" }).replace(".", "").toUpperCase(),
    diaSemana: f({ weekday: "long" }),
    fechaLarga: f({ weekday: "long", day: "numeric", month: "long" }),
    rango: `${hora(inicio)} – ${hora(fin)}`,
    inicio: inicio.getTime(),
    fin: fin.getTime(),
  }
}

/** "Hoy", "Mañana", "En 3 días", "Hace 2 días"… */
export function relativo(iso: string, ahora: number) {
  const dias = Math.round(
    (new Date(claveDia(iso)).getTime() - new Date(claveDia(new Date(ahora).toISOString())).getTime()) / 86_400_000,
  )
  if (dias === 0) return "Hoy"
  if (dias === 1) return "Mañana"
  if (dias === -1) return "Ayer"
  return dias > 0 ? `En ${dias} días` : `Hace ${-dias} días`
}

/** Se puede entrar a la videollamada 15 min antes y hasta que termina. */
export function puedeUnirse(r: Reunion, ahora: number) {
  const { inicio, fin } = partesFecha(r)
  return r.estado === "PENDIENTE" && Boolean(r.googleMeetLink) && ahora >= inicio - 15 * 60_000 && ahora <= fin
}

export function Indicador({
  titulo,
  valor,
  icono,
  tono,
  activo,
  onClick,
}: {
  titulo: string
  valor: number
  icono: React.ReactNode
  tono: string
  activo?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        activo && "ring-2 ring-primary/50",
      )}
    >
      <div>
        <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{valor}</p>
      </div>
      <span className={cn("flex size-10 items-center justify-center rounded-xl border", tono)}>{icono}</span>
    </button>
  )
}
