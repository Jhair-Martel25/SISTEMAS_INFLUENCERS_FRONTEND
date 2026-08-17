'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { DisponibilidadCita } from '@/types/disponibilidad'
import { disponibilidadService } from '@/services/disponibilidadService'
import { reunionesService } from '@/services/horariosService'

function formatearBloqueCompleto(iso: string) {
  const fecha = new Date(iso)
  const fechaTexto = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'short' })
  const horaTexto = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return `${fechaTexto} - ${horaTexto}`
}

function claveDia(iso: string) {
  const fecha = new Date(iso)
  return fecha.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function etiquetaDiaCorta(iso: string) {
  const fecha = new Date(iso)
  const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '')
  const diaNumero = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  return { diaSemana, diaNumero }
}

function formatearHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export default function AgendarReunionPage() {
  const [bloques, setBloques] = useState<DisponibilidadCita[]>([])
  const [cargandoBloques, setCargandoBloques] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [disponibilidadCitaId, setDisponibilidadCitaId] = useState('')
  const [duracionMinutos, setDuracionMinutos] = useState(20)

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<{ fechaHora: string; googleMeetLink: string | null } | null>(null)

  useEffect(() => {
    let cancelado = false

    async function cargarBloques() {
      setCargandoBloques(true)
      setErrorCarga(null)
      try {
        const data = await disponibilidadService.listarDisponibles()
        const ahora = Date.now()
        const bloquesFuturos = data
          .filter((b) => new Date(b.fechaHora).getTime() > ahora)
          .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
        if (!cancelado) {
          setBloques(bloquesFuturos)
          if (bloquesFuturos.length > 0) setDiaSeleccionado(claveDia(bloquesFuturos[0].fechaHora))
        }
      } catch {
        if (!cancelado) setErrorCarga('No se pudo cargar la disponibilidad en este momento.')
      } finally {
        if (!cancelado) setCargandoBloques(false)
      }
    }

    cargarBloques()
    return () => {
      cancelado = true
    }
  }, [])

  const dias = useMemo(() => {
    const mapa = new Map<string, DisponibilidadCita[]>()
    for (const b of bloques) {
      const clave = claveDia(b.fechaHora)
      if (!mapa.has(clave)) mapa.set(clave, [])
      mapa.get(clave)!.push(b)
    }
    return Array.from(mapa.entries())
  }, [bloques])

  const bloquesDelDia = dias.find(([clave]) => clave === diaSeleccionado)?.[1] ?? []
  const bloqueElegido = bloques.find((b) => b.id === disponibilidadCitaId) ?? null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !disponibilidadCitaId) {
      setError('Completa tu correo y elige un horario.')
      return
    }

    setEnviando(true)
    try {
      const reunion = await reunionesService.agendar({
        email,
        disponibilidadCitaId,
        duracionMinutos,
        zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setExito({ fechaHora: reunion.fechaHora, googleMeetLink: reunion.googleMeetLink })

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sp_ultima_reunion', JSON.stringify({ fechaHora: reunion.fechaHora, id: reunion.id }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agendar la reunión. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 text-2xl">
            OK
          </div>
          <h1 className="text-2xl font-bold text-[#003D2D] mb-2">Reunión confirmada</h1>
          <p className="text-gray-500 mb-6">
            Te enviamos los detalles a tu correo. Nos vemos el <span className="font-medium text-gray-900">{formatearBloqueCompleto(exito.fechaHora)}</span>.
          </p>
          {exito.googleMeetLink ? (
            <a href={exito.googleMeetLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#003D2D] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#01281E] transition-colors mb-4">
              Ver enlace de la reunión
            </a>
          ) : null}
          <div>
            <Link href="/" className="text-sm text-[#003D2D] hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#003D2D] text-center mb-2">Agendar una Reunión</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Usa el correo con el que recibiste la invitación y elige un horario disponible.
        </p>

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo-real@ejemplo.com"
          className="w-full border rounded-lg p-3 mb-5"
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Elige un día</label>

        {cargandoBloques ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-5 p-3 border rounded-lg">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-[#003D2D] rounded-full" />
            Cargando disponibilidad...
          </div>
        ) : errorCarga ? (
          <p className="text-sm text-red-600 mb-5 p-3 border border-red-200 bg-red-50 rounded-lg">{errorCarga}</p>
        ) : dias.length === 0 ? (
          <p className="text-sm text-gray-500 mb-5 p-3 border rounded-lg bg-gray-50">No hay horarios disponibles en este momento.</p>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1 scrollbar-hide">
              {dias.map(([clave, bloquesDia]) => {
                const { diaSemana, diaNumero } = etiquetaDiaCorta(bloquesDia[0].fechaHora)
                const activo = clave === diaSeleccionado
                return (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => {
                      setDiaSeleccionado(clave)
                      setDisponibilidadCitaId('')
                    }}
                    className={`shrink-0 flex flex-col items-center justify-center rounded-xl px-3.5 py-2.5 min-w-[64px] transition-colors ${
                      activo ? 'bg-[#003D2D] text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-[11px] font-medium uppercase leading-none mb-1 capitalize">{diaSemana}</span>
                    <span className="text-sm font-semibold leading-none capitalize">{diaNumero}</span>
                  </button>
                )
              })}
            </div>

            <label className="block mb-2 text-sm font-medium text-gray-700">Elige una hora</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {bloquesDelDia.map((b) => {
                const activo = b.id === disponibilidadCitaId
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setDisponibilidadCitaId(b.id)}
                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                      activo
                        ? 'bg-[#003D2D] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#003D2D]'
                    }`}
                  >
                    <Clock size={12} className={activo ? 'text-white' : 'text-gray-400'} />
                    {formatearHora(b.fechaHora)}
                  </button>
                )
              })}
            </div>

            {bloqueElegido ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 text-sm text-green-800 capitalize">
                {formatearBloqueCompleto(bloqueElegido.fechaHora)}
              </div>
            ) : null}
          </>
        )}

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Duración (minutos)</label>
        <input
          type="number"
          min={10}
          value={duracionMinutos}
          onChange={(e) => setDuracionMinutos(Number(e.target.value))}
          className="w-full border rounded-lg p-3 mb-6"
        />

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={enviando || !disponibilidadCitaId}
          className="w-full bg-[#003D2D] text-white py-3 rounded-xl font-medium hover:bg-[#01281E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? 'Agendando...' : 'Confirmar reunión'}
        </button>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-[#003D2D] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </form>
    </main>
  )
}