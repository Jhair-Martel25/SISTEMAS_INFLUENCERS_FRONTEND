"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Clock,
  Copy,
  Grid3x3,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { DIAS_GRILLA, type HorarioResumenUsuario } from "@/types/horario"
import { useResumenHorarios } from "../hooks/useHorarios"
import { bloquesASeleccion, formatearHoras } from "../utils/grilla"
import { HorarioGrilla } from "./HorarioGrilla"

type Filtro = "TODOS" | "PROGRAMADO" | "SIN_HORARIO"

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function etiquetaRol(rol: string) {
  return rol === "ADMIN" ? "Administrador" : rol === "VOLUNTARIO" ? "Voluntario" : rol
}

/** Vista ADMIN: horario semanal de todos los usuarios en tarjetas. */
export function HorariosAdminVista({ embebido = false }: { embebido?: boolean } = {}) {
  const { data, isLoading, isError, error } = useResumenHorarios()
  const [buscar, setBuscar] = useState("")
  const [filtro, setFiltro] = useState<Filtro>("TODOS")
  const [verGrilla, setVerGrilla] = useState<HorarioResumenUsuario | null>(null)

  const usuarios = useMemo(() => data ?? [], [data])
  const programados = usuarios.filter((u) => u.horarios.length > 0)
  const horasTotales = usuarios.reduce((t, u) => t + u.minutosSemanales, 0)

  const filtrados = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    return usuarios.filter((u) => {
      if (filtro === "PROGRAMADO" && u.horarios.length === 0) return false
      if (filtro === "SIN_HORARIO" && u.horarios.length > 0) return false
      if (texto && !u.nombre.toLowerCase().includes(texto) && !u.email.toLowerCase().includes(texto))
        return false
      return true
    })
  }, [usuarios, buscar, filtro])

  return (
    <div className={embebido ? "flex flex-col gap-6" : "mx-auto flex max-w-7xl flex-col gap-6"}>
      {!embebido && <PageHeader
        title="Horarios del equipo"
        description="Consulta el horario semanal de reuniones de todos los usuarios (lunes a sábado, 8:00 a. m. – 10:00 p. m.)."
        backHref="/dashboard"
      />}

      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Resumen icono={<Users size={18} />} titulo="Usuarios" valor={String(usuarios.length)} />
        <Resumen
          icono={<CheckCircle2 size={18} />}
          titulo="Con horario programado"
          valor={`${programados.length} de ${usuarios.length}`}
        />
        <Resumen icono={<Clock size={18} />} titulo="Horas disponibles del equipo" valor={formatearHoras(horasTotales)} oscuro />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="h-9 pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted/60 p-1 text-xs">
          {(
            [
              ["TODOS", `Todos (${usuarios.length})`],
              ["PROGRAMADO", `Programado (${programados.length})`],
              ["SIN_HORARIO", `Sin horario (${usuarios.length - programados.length})`],
            ] as [Filtro, string][]
          ).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFiltro(valor)}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                filtro === valor ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "No se pudieron cargar los horarios."}
        </p>
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Cargando horarios…
        </div>
      ) : filtrados.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay usuarios que coincidan con el filtro.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtrados.map((u) => (
            <TarjetaHorarioUsuario key={u.id} usuario={u} onVerGrilla={() => setVerGrilla(u)} />
          ))}
        </div>
      )}

      <Dialog open={Boolean(verGrilla)} onOpenChange={(open) => !open && setVerGrilla(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Horario de {verGrilla?.nombre}</DialogTitle>
            <DialogDescription>
              {verGrilla ? `${formatearHoras(verGrilla.minutosSemanales)} disponibles · ${verGrilla.email}` : null}
            </DialogDescription>
          </DialogHeader>
          {verGrilla && <HorarioGrilla seleccion={bloquesASeleccion(verGrilla.horarios)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Resumen({
  icono,
  titulo,
  valor,
  oscuro,
}: {
  icono: React.ReactNode
  titulo: string
  valor: string
  oscuro?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border p-4",
        oscuro ? "border-slate-900 bg-slate-900 text-white" : "bg-card",
      )}
    >
      <div>
        <p className={cn("text-[10px] font-semibold tracking-[0.16em] uppercase", oscuro ? "text-slate-400" : "text-muted-foreground")}>
          {titulo}
        </p>
        <p className="mt-1 text-2xl font-bold">{valor}</p>
      </div>
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          oscuro ? "bg-white/10" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        )}
      >
        {icono}
      </span>
    </div>
  )
}

/** Tarjeta por usuario (estilo "vista de horario"). */
function TarjetaHorarioUsuario({
  usuario,
  onVerGrilla,
}: {
  usuario: HorarioResumenUsuario
  onVerGrilla: () => void
}) {
  const programado = usuario.horarios.length > 0
  const activo = usuario.estado === "ACTIVO"
  const esAdmin = usuario.rol === "ADMIN"

  async function copiarCorreo() {
    try {
      await navigator.clipboard.writeText(usuario.email)
      toast.success("Correo copiado.")
    } catch {
      toast.error("No se pudo copiar el correo.")
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Cabecera */}
      <div className="flex items-start gap-4 bg-gradient-to-br from-emerald-50/80 via-card to-card p-5 dark:from-emerald-950/20">
        <div className="relative shrink-0">
          <Avatar className="size-14 rounded-xl">
            {usuario.foto && <AvatarImage src={usuario.foto} alt={usuario.nombre} className="object-cover" />}
            <AvatarFallback className="rounded-xl bg-emerald-100 text-base font-semibold text-emerald-800">
              {iniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-card",
              activo ? "bg-emerald-500" : "bg-slate-400",
            )}
            title={activo ? "Activo" : "Inactivo"}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold tracking-wide uppercase">{usuario.nombre}</h3>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={13} className="shrink-0" />
            <span className="truncate">{usuario.email}</span>
            <button
              type="button"
              onClick={() => void copiarCorreo()}
              className="shrink-0 rounded p-0.5 hover:bg-muted hover:text-foreground"
              aria-label="Copiar correo"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                esAdmin
                  ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
              )}
            >
              <span className={cn("size-1.5 rounded-full", esAdmin ? "bg-sky-500" : "bg-amber-500")} />
              {etiquetaRol(usuario.rol)}
            </span>
            <span className="rounded-full border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {activo ? "ACTIVO" : "INACTIVO"}
            </span>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-2 text-right dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">HORAS DISPONIBLES</p>
          <p className="text-lg font-bold whitespace-nowrap">{formatearHoras(usuario.minutosSemanales)}</p>
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            {esAdmin ? <ShieldCheck size={15} /> : <UserRound size={15} />}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">ROL EN EL SISTEMA</p>
            <p className="truncate text-sm font-semibold uppercase">{etiquetaRol(usuario.rol)}</p>
          </div>
        </div>
      </div>

      {/* Horario semanal */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">Horario semanal</p>
            <p className="text-xs text-muted-foreground">Distribución de horarios por día</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              programado
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <CheckCircle2 size={12} />
            {programado ? "Programado" : "Sin programar"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {DIAS_GRILLA.map((dia) => {
            const tramos = usuario.horarios.filter((h) => h.diaSemana === dia.value)
            const vacio = tramos.length === 0
            return (
              <div
                key={dia.value}
                className={cn(
                  "flex min-h-[86px] flex-col gap-2 rounded-xl border p-2.5",
                  vacio ? "border-dashed bg-muted/30" : "bg-background",
                )}
              >
                <p className={cn("text-[11px] font-bold tracking-wider", vacio ? "text-muted-foreground/60" : "text-foreground")}>
                  {dia.corto}
                </p>
                {vacio ? (
                  <p className="m-auto text-[11px] text-muted-foreground/70">Sin actividad</p>
                ) : (
                  tramos.map((t) => (
                    <span
                      key={t.id}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-900 tabular-nums dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                      <Clock size={12} className="shrink-0 text-emerald-600" />
                      {t.horaInicio} — {t.horaFin}
                    </span>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-2.5">
        <span className="text-[11px] text-muted-foreground">Programación semanal</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={onVerGrilla} disabled={!programado}>
          <Grid3x3 size={13} />
          Ver cuadrícula
        </Button>
      </div>
    </article>
  )
}
