"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  Eye,
  UserRound,
  Users,
  Loader2,
  MoreHorizontal,
  Search,
  Video,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/usePermission"
import { useAuth } from "@/hooks/useAuth"
import type { EstadoReunion } from "@/types/api"
import type { ActualizarEstadoReunionInput, Reunion } from "@/types/reunion"

import { useActualizarEstadoReunion, useReuniones } from "../hooks/useReuniones"
import {
  Avatar,
  BadgeEstadoReunion,
  ESTILO_ESTADO,
  Indicador,
  claveDia,
  partesFecha,
  puedeUnirse,
  relativo,
} from "./reuniones-ui"

type Vista = "PROXIMAS" | "PASADAS" | "TODAS"
const TODOS = "todos"

/**
 * Gestión de reuniones.
 * - ADMIN: tabla de todas las reuniones con indicadores, filtros y acciones rápidas.
 * - VOLUNTARIO: su agenda (próxima reunión destacada + lista por día).
 * Las reuniones programadas cuya hora ya pasó las marca el backend como
 * "No realizada" automáticamente.
 */
export function ReunionList() {
  const { isAdmin } = usePermission()
  const { user } = useAuth()
  // ADMIN puede alternar entre todas las reuniones y solo las suyas.
  const [soloMias, setSoloMias] = useState(false)
  const vistaEquipo = isAdmin && !soloMias
  const router = useRouter()
  const [ahora] = useState(() => Date.now())
  const [vista, setVista] = useState<Vista>("PROXIMAS")
  const [estado, setEstado] = useState<EstadoReunion | "">("")
  const [voluntarioId, setVoluntarioId] = useState("")
  const [buscar, setBuscar] = useState("")

  const { data, isLoading, isError, error } = useReuniones()
  const actualizar = useActualizarEstadoReunion()
  const reuniones = useMemo(
    () =>
      isAdmin && soloMias
        ? (data ?? []).filter((r) => r.disponibilidadCita.voluntario.id === user?.id)
        : (data ?? []),
    [data, isAdmin, soloMias, user?.id],
  )

  const conteo = useMemo(() => {
    const hoy = claveDia(new Date(ahora).toISOString())
    return {
      proximas: reuniones.filter((r) => r.estado === "PENDIENTE").length,
      hoy: reuniones.filter((r) => r.estado === "PENDIENTE" && claveDia(r.fechaHora) === hoy).length,
      REALIZADA: reuniones.filter((r) => r.estado === "REALIZADA").length,
      NO_ASISTIO: reuniones.filter((r) => r.estado === "NO_ASISTIO").length,
      CANCELADA: reuniones.filter((r) => r.estado === "CANCELADA").length,
    }
  }, [reuniones, ahora])

  const voluntarios = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of reuniones) m.set(r.disponibilidadCita.voluntario.id, r.disponibilidadCita.voluntario.nombre)
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [reuniones])

  const filtradas = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    const lista = reuniones.filter((r) => {
      const futura = r.estado === "PENDIENTE"
      if (vista === "PROXIMAS" && !futura) return false
      if (vista === "PASADAS" && futura) return false
      if (estado && r.estado !== estado) return false
      if (voluntarioId && r.disponibilidadCita.voluntario.id !== voluntarioId) return false
      if (
        texto &&
        ![r.influencer.nombre, r.influencer.email ?? "", r.influencer.usuarioIg ?? "", r.disponibilidadCita.voluntario.nombre]
          .join(" ")
          .toLowerCase()
          .includes(texto)
      )
        return false
      return true
    })
    // Próximas: la más cercana primero. Historial: la más reciente primero.
    return lista.sort((a, b) =>
      vista === "PROXIMAS"
        ? a.fechaHora.localeCompare(b.fechaHora)
        : b.fechaHora.localeCompare(a.fechaHora),
    )
  }, [reuniones, vista, estado, voluntarioId, buscar])

  function cambiarEstado(r: Reunion, nuevo: ActualizarEstadoReunionInput["estado"]) {
    actualizar.mutate(
      { id: r.id, input: { estado: nuevo } },
      {
        onSuccess: () => toast.success(`Reunión con ${r.influencer.nombre}: ${ESTILO_ESTADO[nuevo].label.toLowerCase()}.`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo actualizar la reunión."),
      },
    )
  }

  function filtrarPorIndicador(v: Vista, e: EstadoReunion | "") {
    setVista(v)
    setEstado(e)
  }

  const indicadores = (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Indicador
        titulo="Programadas"
        valor={conteo.proximas}
        icono={<CalendarClock size={18} />}
        tono={ESTILO_ESTADO.PENDIENTE.clase}
        activo={vista === "PROXIMAS" && !estado}
        onClick={() => filtrarPorIndicador("PROXIMAS", "")}
      />
      <Indicador
        titulo="Para hoy"
        valor={conteo.hoy}
        icono={<CalendarDays size={18} />}
        tono="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
        onClick={() => filtrarPorIndicador("PROXIMAS", "")}
      />
      <Indicador
        titulo="Realizadas"
        valor={conteo.REALIZADA}
        icono={<CheckCircle2 size={18} />}
        tono={ESTILO_ESTADO.REALIZADA.clase}
        activo={estado === "REALIZADA"}
        onClick={() => filtrarPorIndicador("PASADAS", "REALIZADA")}
      />
      <Indicador
        titulo="No realizadas"
        valor={conteo.NO_ASISTIO}
        icono={<CircleSlash size={18} />}
        tono={ESTILO_ESTADO.NO_ASISTIO.clase}
        activo={estado === "NO_ASISTIO"}
        onClick={() => filtrarPorIndicador("PASADAS", "NO_ASISTIO")}
      />
      <Indicador
        titulo="Canceladas"
        valor={conteo.CANCELADA}
        icono={<XCircle size={18} />}
        tono={ESTILO_ESTADO.CANCELADA.clase}
        activo={estado === "CANCELADA"}
        onClick={() => filtrarPorIndicador("PASADAS", "CANCELADA")}
      />
    </div>
  )

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-fit gap-1 rounded-xl bg-muted/70 p-1 text-sm">
        {(
          [
            ["PROXIMAS", "Próximas"],
            ["PASADAS", "Historial"],
            ["TODAS", "Todas"],
          ] as [Vista, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setVista(v)
              setEstado("")
            }}
            className={cn(
              "rounded-lg px-4 py-1.5 font-medium transition-colors",
              vista === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-64">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder={vistaEquipo ? "Buscar embajador o voluntario…" : "Buscar embajador…"}
            className="h-9 pl-9"
          />
        </div>
        <Select value={estado || TODOS} onValueChange={(v) => setEstado(v === TODOS ? "" : (v as EstadoReunion))}>
          <SelectTrigger className="h-9 sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {(Object.keys(ESTILO_ESTADO) as EstadoReunion[]).map((e) => (
              <SelectItem key={e} value={e}>
                {ESTILO_ESTADO[e].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {vistaEquipo && (
          <Select value={voluntarioId || TODOS} onValueChange={(v) => setVoluntarioId(v === TODOS ? "" : v)}>
            <SelectTrigger className="h-9 sm:w-52">
              <SelectValue placeholder="Voluntario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los voluntarios</SelectItem>
              {voluntarios.map(([id, nombre]) => (
                <SelectItem key={id} value={id}>
                  {nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )

  const acciones = (r: Reunion) => (
    <div className="flex items-center justify-end gap-1">
      {puedeUnirse(r, ahora) && (
        <Button asChild size="sm" className="h-8 gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800">
          <a href={r.googleMeetLink!} target="_blank" rel="noopener noreferrer">
            <Video size={14} />
            Unirse
          </a>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="Ver detalle"
        title="Ver detalle"
        onClick={() => router.push(`/reuniones/gestionar/${r.id}`)}
      >
        <Eye size={16} />
      </Button>
      {r.estado !== "REALIZADA" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Cambiar estado" disabled={actualizar.isPending}>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => cambiarEstado(r, "REALIZADA")}>
              <CheckCircle2 size={14} className="text-emerald-600" /> Marcar como realizada
            </DropdownMenuItem>
            {r.estado !== "NO_ASISTIO" && (
              <DropdownMenuItem onClick={() => cambiarEstado(r, "NO_ASISTIO")}>
                <CircleSlash size={14} className="text-amber-600" /> Marcar como no realizada
              </DropdownMenuItem>
            )}
            {r.estado !== "CANCELADA" && (
              <DropdownMenuItem onClick={() => cambiarEstado(r, "CANCELADA")}>
                <XCircle size={14} className="text-rose-600" /> Cancelar reunión
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )

  const estadoVacio = (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <CalendarCheck2 size={22} />
      </span>
      <p className="font-medium">No hay reuniones en esta vista</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cuando un embajador agende desde el correo de invitación, la reunión aparecerá aquí.
      </p>
    </div>
  )

  const cuerpo = isError ? (
    <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {error instanceof Error ? error.message : "No se pudieron cargar las reuniones."}
    </p>
  ) : isLoading ? (
    <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 size={16} className="animate-spin" />
      Cargando reuniones…
    </div>
  ) : vistaEquipo ? (
    <TablaAdmin reuniones={filtradas} ahora={ahora} acciones={acciones} vacio={estadoVacio} />
  ) : (
    <AgendaVoluntario reuniones={filtradas} ahora={ahora} acciones={acciones} vacio={estadoVacio} />
  )

  const proxima = !vistaEquipo
    ? reuniones
        .filter((r) => r.estado === "PENDIENTE")
        .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0]
    : undefined

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title={vistaEquipo ? "Gestión de reuniones" : "Mis reuniones"}
        description={
          vistaEquipo
            ? "Seguimiento de todas las reuniones entre embajadores y voluntarios."
            : "Tus reuniones agendadas con embajadores y empresas."
        }
        backHref="/dashboard"
      />

      {isAdmin && (
        <div className="flex w-full gap-1 rounded-2xl border bg-card p-1.5 shadow-sm sm:w-fit">
          {(
            [
              [false, "Todas las reuniones", Users],
              [true, "Mis reuniones", UserRound],
            ] as [boolean, string, React.ElementType][]
          ).map(([valor, label, Icono]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSoloMias(valor)
                setVoluntarioId("")
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
                soloMias === valor
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icono size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {proxima && <ProximaReunion reunion={proxima} ahora={ahora} onVer={() => router.push(`/reuniones/gestionar/${proxima.id}`)} />}
      {indicadores}
      <section className="flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-sm sm:p-5">
        {toolbar}
        {cuerpo}
        {!isLoading && filtradas.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {filtradas.length} reunión{filtradas.length === 1 ? "" : "es"} · Las reuniones programadas pasan a
            &quot;No realizada&quot; automáticamente cuando termina su horario.
          </p>
        )}
      </section>
    </div>
  )
}

function CeldaFecha({ r, ahora }: { r: Reunion; ahora: number }) {
  const p = partesFecha(r)
  const rel = relativo(r.fechaHora, ahora)
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex w-12 shrink-0 flex-col items-center rounded-xl border py-1.5",
          r.estado === "PENDIENTE" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "bg-muted/40",
        )}
      >
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground">{p.mes}</span>
        <span className="text-lg leading-none font-bold">{p.dia}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold capitalize">{p.diaSemana}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{p.rango}</p>
        {r.estado === "PENDIENTE" && (
          <span
            className={cn(
              "mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              rel === "Hoy" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-muted text-muted-foreground",
            )}
          >
            {rel}
          </span>
        )}
      </div>
    </div>
  )
}

function TablaAdmin({
  reuniones,
  ahora,
  acciones,
  vacio,
}: {
  reuniones: Reunion[]
  ahora: number
  acciones: (r: Reunion) => React.ReactNode
  vacio: React.ReactNode
}) {
  if (reuniones.length === 0) return <>{vacio}</>
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            <th className="px-4 py-3">Fecha y hora</th>
            <th className="px-4 py-3">Embajador</th>
            <th className="px-4 py-3">Voluntario</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reuniones.map((r) => (
            <tr key={r.id} className="border-b transition-colors last:border-b-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <CeldaFecha r={r} ahora={ahora} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar nombre={r.influencer.nombre} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.influencer.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.influencer.email || (r.influencer.usuarioIg ? `@${r.influencer.usuarioIg}` : "Sin correo")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    nombre={r.disponibilidadCita.voluntario.nombre}
                    className="size-7 bg-slate-100 text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <span className="truncate text-sm">{r.disponibilidadCita.voluntario.nombre}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <BadgeEstadoReunion estado={r.estado} />
              </td>
              <td className="px-4 py-3">{acciones(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgendaVoluntario({
  reuniones,
  ahora,
  acciones,
  vacio,
}: {
  reuniones: Reunion[]
  ahora: number
  acciones: (r: Reunion) => React.ReactNode
  vacio: React.ReactNode
}) {
  const grupos = useMemo(() => {
    const m = new Map<string, Reunion[]>()
    for (const r of reuniones) m.set(claveDia(r.fechaHora), [...(m.get(claveDia(r.fechaHora)) ?? []), r])
    return [...m.values()]
  }, [reuniones])
  if (reuniones.length === 0) return <>{vacio}</>
  return (
    <div className="flex flex-col gap-5">
      {grupos.map((lista) => {
        const p = partesFecha(lista[0])
        return (
          <div key={claveDia(lista[0].fechaHora)} className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <span className="capitalize">{p.fechaLarga}</span> · {relativo(lista[0].fechaHora, ahora)}
            </p>
            {lista.map((r) => {
              const pr = partesFecha(r)
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-background p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", ESTILO_ESTADO[r.estado].punto)} />
                    <span className="text-sm font-bold tabular-nums">{pr.rango}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar nombre={r.influencer.nombre} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.influencer.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.influencer.email || (r.influencer.usuarioIg ? `@${r.influencer.usuarioIg}` : "Sin correo")}
                      </p>
                    </div>
                  </div>
                  <BadgeEstadoReunion estado={r.estado} />
                  {acciones(r)}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function ProximaReunion({ reunion, ahora, onVer }: { reunion: Reunion; ahora: number; onVer: () => void }) {
  const p = partesFecha(reunion)
  const minutos = Math.round((p.inicio - ahora) / 60_000)
  const falta =
    minutos <= 0
      ? "En curso"
      : minutos < 60
        ? `Empieza en ${minutos} min`
        : minutos < 24 * 60
          ? `Empieza en ${Math.floor(minutos / 60)} h ${minutos % 60} min`
          : relativo(reunion.fechaHora, ahora)
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003D2D] to-emerald-800 p-6 text-white shadow-md">
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10">
            <span className="text-[10px] font-bold tracking-wider text-emerald-200">{p.mes}</span>
            <span className="text-xl leading-none font-bold">{p.dia}</span>
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-200 uppercase">Tu próxima reunión · {falta}</p>
            <p className="mt-1 text-xl font-bold">{reunion.influencer.nombre}</p>
            <p className="text-sm text-emerald-100 capitalize">
              {p.fechaLarga} · {p.rango}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {reunion.googleMeetLink && (
            <Button asChild className="bg-white text-[#003D2D] hover:bg-emerald-50">
              <a href={reunion.googleMeetLink} target="_blank" rel="noopener noreferrer">
                <Video size={16} />
                Unirse a la videollamada
              </a>
            </Button>
          )}
          <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={onVer}>
            <Eye size={16} />
            Ver detalle
          </Button>
        </div>
      </div>
    </section>
  )
}
