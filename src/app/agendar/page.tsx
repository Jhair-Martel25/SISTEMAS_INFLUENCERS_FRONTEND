'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { DisponibilidadCita } from '@/types/disponibilidad'
import { disponibilidadesService } from '@/features/disponibilidades/services/disponibilidades.service'
import { reunionesService } from '@/features/reuniones/services/reuniones.service'

function formatearBloque(iso: string) {
  const fecha = new Date(iso)
  const fechaTexto = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'short' })
  const horaTexto = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return `${fechaTexto} - ${horaTexto}`
}

export default function AgendarReunionPage() {
  const [bloques, setBloques] = useState<DisponibilidadCita[]>([])
  const [cargandoBloques, setCargandoBloques] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

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
        const data = await disponibilidadesService.listarDisponibles()
        if (!cancelado) setBloques(data)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !disponibilidadCitaId) {
      setError('Completa tu correo y elige un bloque de disponibilidad.')
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
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 text-2xl">
            OK
          </div>
          <h1 className="text-2xl font-bold text-[#003D2D] mb-2">Reunión confirmada</h1>
          <p className="text-gray-500 mb-6">
            Te enviamos los detalles a tu correo. Nos vemos el <span className="font-medium text-gray-900">{formatearBloque(exito.fechaHora)}</span>.
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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#003D2D] text-center mb-2">Agendar una Reunión</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Usa el correo con el que recibiste la invitación y elige un bloque disponible para confirmar tu reunión.
        </p>

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-correo-real@ejemplo.com"
          className="w-full border rounded-lg p-3 mb-4"
          required
        />

        <label className="block mb-1.5 text-sm font-medium text-gray-700">Bloque de disponibilidad</label>

        {cargandoBloques ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 p-3 border rounded-lg">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-[#003D2D] rounded-full" />
            Cargando disponibilidad...
          </div>
        ) : errorCarga ? (
          <p className="text-sm text-red-600 mb-4 p-3 border border-red-200 bg-red-50 rounded-lg">{errorCarga}</p>
        ) : bloques.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4 p-3 border rounded-lg bg-gray-50">No hay bloques disponibles en este momento.</p>
        ) : (
          <select
            value={disponibilidadCitaId}
            onChange={(e) => setDisponibilidadCitaId(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4"
            required
          >
            <option value="">Selecciona un horario</option>
            {bloques.map((b) => (
              <option key={b.id} value={b.id}>
                {formatearBloque(b.fechaHora)}
              </option>
            ))}
          </select>
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
          disabled={enviando || bloques.length === 0}
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