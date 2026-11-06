'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  TriangleAlert,
  Globe2,
  Loader2,
  Video,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/http'
import { reunionesService } from '@/features/reuniones/services/reuniones.service'
import type { AgendaPublica, SlotAgenda } from '@/types/reunion'

/**
 * Página pública de agendamiento.
 *
 * La persona que recibió el correo ve la disponibilidad (el horario de
 * reuniones) de quien la invitó y reserva un día y una hora. Las horas ya
 * reservadas o pasadas aparecen deshabilitadas. Hora de Perú.
 */

const DIAS_CORTOS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fechaUTC(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
function sumarDias(fecha: string, n: number) {
  const f = fechaUTC(fecha)
  f.setUTCDate(f.getUTCDate() + n)
  return f.toISOString().slice(0, 10)
}
/** Lunes de la semana de `fecha`. */
function lunesDe(fecha: string) {
  const dow = fechaUTC(fecha).getUTCDay()
  return sumarDias(fecha, dow === 0 ? -6 : 1 - dow)
}
function finDe(hora: string, minutos: number) {
  const [h, m] = hora.split(':').map(Number)
  const t = h * 60 + m + minutos
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
function fechaLarga(fecha: string) {
  const f = fechaUTC(fecha)
  return `${DIAS_LARGOS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`
}
/** "viernes 6 de noviembre, 16:00" en hora de Perú. */
function fechaHoraLegible(iso: string) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-8 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <Image src="/images/logo.png" alt="Sembrando Perú" width={44} height={44} className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-wide text-[#003D2D]">SEMBRANDO PERÚ</p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-emerald-700">PERSONAS · TERRITORIOS · OPORTUNIDADES</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Marco>
      <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-[#003D2D]">{titulo}</h1>
        <p className="text-gray-500">{texto}</p>
      </div>
    </Marco>
  )
}

function AgendarReunion() {
  const sp = useSearchParams()
  const query = useMemo(
    () => ({
      influencerId: sp.get('influencerId') ?? undefined,
      contactoId: sp.get('contactoId') ?? undefined,
      voluntarioId: sp.get('voluntarioId') ?? undefined,
    }),
    [sp],
  )
  const enlaceValido = Boolean(query.influencerId || query.contactoId || query.voluntarioId)

  const [agenda, setAgenda] = useState<AgendaPublica | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [semana, setSemana] = useState(0)
  // 1 o 2 bloques seguidos del mismo día (30 o 60 minutos).
  const [elegidos, setElegidos] = useState<SlotAgenda[]>([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<{
    slot: SlotAgenda
    minutos: number
    link: string | null
    cancelada: string | null
  } | null>(null)
  // Aviso: ya tiene una reunión; confirmar que se cancelará al agendar otra.
  const [avisoReemplazo, setAvisoReemplazo] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    if (!enlaceValido) return
    let cancelado = false
    reunionesService
      .agendaPublica(query)
      .then((data) => {
        if (cancelado) return
        setAgenda(data)
        setErrorCarga(null)
        // Abre la primera semana que tenga horarios libres.
        const primero = data.slots.find((s) => s.disponible)
        if (primero) {
          const diff = (fechaUTC(lunesDe(primero.fecha)).getTime() - fechaUTC(lunesDe(data.hoy)).getTime()) / (7 * 86_400_000)
          setSemana(Math.max(0, Math.round(diff)))
        }
      })
      .catch((e) => !cancelado && setErrorCarga(e instanceof Error ? e.message : 'No se pudo cargar la agenda.'))
      .finally(() => !cancelado && setCargando(false))
    return () => {
      cancelado = true
    }
  }, [query, enlaceValido, recarga])

  const totalSemanas = agenda
    ? Math.floor(
        (fechaUTC(lunesDe(sumarDias(agenda.hoy, agenda.dias - 1))).getTime() - fechaUTC(lunesDe(agenda.hoy)).getTime()) /
          (7 * 86_400_000),
      ) + 1
    : 1

  const vista = useMemo(() => {
    if (!agenda) return null
    const lunes = sumarDias(lunesDe(agenda.hoy), semana * 7)
    const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i))
    const porClave = new Map(agenda.slots.map((s) => [`${s.fecha}|${s.hora}`, s]))
    const horas = [...new Set(agenda.slots.filter((s) => dias.includes(s.fecha)).map((s) => s.hora))].sort()
    // Rellena huecos entre la primera y la última hora para una cuadrícula continua.
    const filas: string[] = []
    if (horas.length) {
      for (let h = horas[0]; h <= horas[horas.length - 1]; h = finDe(h, 30)) filas.push(h)
    }
    const libres = agenda.slots.filter((s) => s.disponible && dias.includes(s.fecha)).length
    return { dias, filas, porClave, libres }
  }, [agenda, semana])

  const zonaInvitado = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Lima'
  const otraZona = agenda && zonaInvitado !== agenda.zonaHoraria
  const horaLocal = (iso: string) =>
    new Intl.DateTimeFormat('es-PE', { timeZone: zonaInvitado, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

  const elegido = elegidos[0] ?? null
  const minutosElegidos = elegidos.length * (agenda?.duracionMinutos ?? 30)

  /**
   * Clic en un bloque:
   * - sin selección → lo elige;
   * - bloque seguido (antes o después) del elegido → amplía a 60 min;
   * - bloque ya elegido → lo quita;
   * - cualquier otro → reemplaza la selección.
   */
  function alternarSlot(slot: SlotAgenda) {
    setError(null)
    setElegidos((actual) => {
      if (actual.some((s) => s.inicio === slot.inicio)) return actual.filter((s) => s.inicio !== slot.inicio)
      if (actual.length === 1 && actual[0].fecha === slot.fecha) {
        const paso = (agenda?.duracionMinutos ?? 30)
        if (finDe(actual[0].hora, paso) === slot.hora) return [actual[0], slot]
        if (finDe(slot.hora, paso) === actual[0].hora) return [slot, actual[0]]
      }
      return [slot]
    })
  }

  async function confirmar(reemplazar = false) {
    if (!elegido) return
    if (agenda?.reunionVigente && !reemplazar) {
      setAvisoReemplazo(true)
      return
    }
    setAvisoReemplazo(false)
    setEnviando(true)
    setError(null)
    try {
      const reunion = await reunionesService.agendarHorario({
        ...query,
        fecha: elegido.fecha,
        hora: elegido.hora,
        bloques: elegidos.length === 2 ? 2 : 1,
        reemplazar,
        zonaHoraria: zonaInvitado,
      })
      setExito({
        slot: elegido,
        minutos: minutosElegidos,
        link: reunion.googleMeetLink,
        cancelada: reemplazar && agenda?.reunionVigente ? agenda.reunionVigente.fechaHora : null,
      })
    } catch (e) {
      // El backend detectó una reunión vigente (p. ej. agendada en otra pestaña).
      if (e instanceof ApiError && e.status === 409) {
        setAvisoReemplazo(true)
        setRecarga((r) => r + 1)
        return
      }
      setError(e instanceof Error ? e.message : 'No se pudo agendar la reunión. Intenta nuevamente.')
      setElegidos([])
      setRecarga((r) => r + 1)
    } finally {
      setEnviando(false)
    }
  }

  if (!enlaceValido) {
    return <Aviso titulo="Enlace no válido" texto="Para agendar tu reunión, abre el enlace que recibiste en el correo de invitación." />
  }

  if (exito && agenda) {
    return (
      <Marco>
        <div className="mx-auto w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CalendarCheck2 size={30} />
          </span>
          <h1 className="text-2xl font-bold text-[#003D2D]">¡Reunión confirmada!</h1>
          <p className="mt-2 text-gray-500">
            Tu reunión con <strong className="text-gray-900">{agenda.voluntario.nombre}</strong> quedó agendada para el
          </p>
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-lg font-semibold text-emerald-900">
            {fechaLarga(exito.slot.fecha)} · {exito.slot.hora} – {finDe(exito.slot.hora, exito.minutos)}
            <span className="block text-xs font-normal text-emerald-700">Hora de Perú</span>
          </p>
          {exito.cancelada && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Tu reunión anterior del {fechaHoraLegible(exito.cancelada)} fue cancelada.
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">Te enviamos los detalles y el enlace de la videollamada a tu correo.</p>
          {exito.link && (
            <a
              href={exito.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003D2D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#01281E]"
            >
              <Video size={16} />
              Abrir enlace de la reunión
            </a>
          )}
          <div className="mt-4">
            <a href="https://mail.google.com/" className="text-sm font-medium text-[#003D2D] hover:underline">
              Volver al inicio
            </a>
          </div>
        </div>
      </Marco>
    )
  }

  if (cargando) {
    return (
      <Marco>
        <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Cargando agenda…
        </div>
      </Marco>
    )
  }

  if (errorCarga || !agenda || !vista) {
    return <Aviso titulo="No pudimos abrir la agenda" texto={errorCarga ?? 'Intenta nuevamente en unos minutos.'} />
  }

  const lunes = vista.dias[0]
  const sabado = vista.dias[5]
  const rango = `${fechaUTC(lunes).getUTCDate()} ${MESES[fechaUTC(lunes).getUTCMonth()]} – ${fechaUTC(sabado).getUTCDate()} ${MESES[fechaUTC(sabado).getUTCMonth()]}`
  const sinHorario = agenda.slots.length === 0

  return (
    <Marco>
      {/* Encabezado */}
      <section className="flex flex-col gap-5 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {agenda.voluntario.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agenda.voluntario.foto} alt={agenda.voluntario.nombre} className="size-14 rounded-2xl object-cover" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-800">
              {iniciales(agenda.voluntario.nombre)}
            </span>
          )}
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">Agenda tu reunión</p>
            <h1 className="text-2xl font-bold text-[#003D2D]">con {agenda.voluntario.nombre}</h1>
            {agenda.invitado && <p className="text-sm text-gray-500">Invitación para {agenda.invitado.nombre}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700">
          <span className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1.5"><Clock size={14} /> 30 o 60 minutos</span>
          <span className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1.5"><Video size={14} /> Videollamada</span>
          <span className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1.5"><Globe2 size={14} /> Hora de Perú (GMT-5)</span>
        </div>
      </section>

      {agenda.reunionVigente && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p>
            Ya tienes una reunión programada el <strong>{fechaHoraLegible(agenda.reunionVigente.fechaHora)}</strong> con{' '}
            {agenda.reunionVigente.conNombre}. Si eliges otro horario, esa reunión <strong>se cancelará</strong> y quedará la
            nueva.
          </p>
        </div>
      )}

      {sinHorario ? (
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <CalendarDays size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="font-semibold text-gray-900">{agenda.voluntario.nombre} aún no tiene horarios disponibles.</p>
          <p className="mt-1 text-sm text-gray-500">Responde al correo de invitación y coordinaremos una fecha contigo.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Cuadrícula */}
          <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Elige un horario disponible de {agenda.voluntario.nombre.split(' ')[0]}</p>
                <p className="text-xs text-gray-500">
                  Semana del {rango} · {vista.libres} horario{vista.libres === 1 ? '' : 's'} libre{vista.libres === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSemana((s) => Math.max(0, s - 1))}
                  disabled={semana === 0}
                  className="flex size-9 items-center justify-center rounded-xl border hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Semana anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setSemana((s) => Math.min(totalSemanas - 1, s + 1))}
                  disabled={semana >= totalSemanas - 1}
                  className="flex size-9 items-center justify-center rounded-xl border hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Semana siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {vista.filas.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-500">No hay horarios en esta semana. Prueba con la siguiente.</p>
            ) : (
              <div className="max-h-[560px] overflow-auto">
                <div className="min-w-[640px]">
                  <div className="sticky top-0 z-10 grid grid-cols-[84px_repeat(6,minmax(80px,1fr))] border-b bg-white">
                    <div />
                    {vista.dias.map((d) => {
                      const f = fechaUTC(d)
                      const esHoy = d === agenda.hoy
                      return (
                        <div key={d} className="flex flex-col items-center gap-0.5 border-l py-3">
                          <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-400">{DIAS_CORTOS[f.getUTCDay()]}</span>
                          <span
                            className={cn(
                              'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                              esHoy ? 'bg-[#003D2D] text-white' : 'text-gray-900',
                            )}
                          >
                            {f.getUTCDate()}
                          </span>
                          <span className="text-[10px] text-gray-400">{MESES[f.getUTCMonth()]}</span>
                        </div>
                      )
                    })}
                  </div>
                  {vista.filas.map((h) => (
                    <div
                      key={h}
                      className={cn(
                        'grid grid-cols-[84px_repeat(6,minmax(80px,1fr))]',
                        h.endsWith(':00') ? 'border-t' : 'border-t border-gray-100',
                      )}
                    >
                      <div className="flex items-center justify-center text-[11px] font-medium text-gray-400 tabular-nums">
                        {h} - {finDe(h, 30)}
                      </div>
                      {vista.dias.map((d) => {
                        const slot = vista.porClave.get(`${d}|${h}`)
                        const activo = elegidos.some((s) => s.fecha === d && s.hora === h)
                        return (
                          <div key={d} className="h-11 border-l p-1">
                            {slot ? (
                              <button
                                type="button"
                                disabled={!slot.disponible || enviando}
                                onClick={() => alternarSlot(slot)}
                                title={slot.disponible ? `${fechaLarga(d)} · ${h}` : 'No disponible'}
                                className={cn(
                                  'flex h-full w-full items-center justify-center rounded-lg text-xs font-semibold transition-all',
                                  activo
                                    ? 'border-l-[5px] border-emerald-400 bg-slate-800 text-white shadow-md'
                                    : slot.disponible
                                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100'
                                      : 'cursor-not-allowed bg-gray-100 text-gray-300 line-through',
                                )}
                              >
                                {activo ? <Check size={15} /> : h}
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 border-t bg-gray-50 px-5 py-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-emerald-300 bg-emerald-50" /> Disponible</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-slate-800" /> Tu elección</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-gray-200" /> Ya reservado</span>
            </div>
          </section>

          {/* Resumen */}
          <aside className="flex h-fit flex-col gap-4 rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-semibold tracking-[0.16em] text-gray-400 uppercase">Tu reunión</p>
            {elegido ? (
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-sm text-slate-300">{fechaLarga(elegido.fecha)}</p>
                <p className="text-2xl font-bold">
                  {elegido.hora} – {finDe(elegido.hora, minutosElegidos)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Hora de Perú · {minutosElegidos} minutos</p>
                {otraZona && <p className="mt-2 text-xs text-emerald-300">En tu zona: {horaLocal(elegido.inicio)}</p>}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">
                Selecciona un horario disponible en la cuadrícula.
              </p>
            )}
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {elegidos.length === 2
                ? 'Reunión de 60 minutos (2 bloques). Toca un bloque elegido para quitarlo.'
                : 'Cada bloque dura 30 min. ¿Necesitas más tiempo? Elige también el bloque siguiente o el anterior (máximo 2).'}
            </p>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              type="button"
              onClick={() => void confirmar(false)}
              disabled={!elegido || enviando}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#003D2D] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#01281E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck2 size={16} />}
              {enviando ? 'Agendando…' : 'Confirmar reunión'}
            </button>
            <p className="text-center text-[11px] text-gray-400">Recibirás el enlace de la videollamada en tu correo.</p>
            <Link href="/" className="text-center text-xs text-[#003D2D] hover:underline">
              Volver al inicio
            </Link>
          </aside>
        </div>
      )}

      {avisoReemplazo && agenda.reunionVigente && elegido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-xl">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <TriangleAlert size={22} />
            </span>
            <h2 className="text-lg font-bold text-gray-900">¿Cambiar tu reunión?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Si agendas en esta fecha, la reunión anteriormente agendada será cancelada.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-[11px] font-semibold tracking-wider text-red-700 uppercase">Se cancela</p>
                <p className="font-medium text-gray-900 line-through decoration-red-400">
                  {fechaHoraLegible(agenda.reunionVigente.fechaHora)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">Nueva reunión</p>
                <p className="font-medium text-gray-900">
                  {fechaLarga(elegido.fecha)} · {elegido.hora} – {finDe(elegido.hora, minutosElegidos)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAvisoReemplazo(false)}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Mantener la anterior
              </button>
              <button
                type="button"
                onClick={() => void confirmar(true)}
                disabled={enviando}
                className="rounded-xl bg-[#003D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#01281E] disabled:opacity-50"
              >
                Sí, agendar y cancelar la anterior
              </button>
            </div>
          </div>
        </div>
      )}
    </Marco>
  )
}

export default function AgendarReunionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50" />}>
      <AgendarReunion />
    </Suspense>
  )
}
