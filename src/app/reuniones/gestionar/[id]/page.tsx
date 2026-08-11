'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import { ArrowLeft, Video } from 'lucide-react'
import type { Reunion, EstadoReunion } from '@/types/reunion'
import { etiquetaEstadoReunion } from '@/types/reunion'
import { reunionesService } from '@/services/horariosService'

const MOCK_REUNION: Reunion = {
  id: 'mock-id',
  fechaHora: '2026-07-31T15:00:00.000Z',
  duracionMinutos: 20,
  estado: 'PENDIENTE',
  googleMeetLink: 'https://meet.jit.si/Reto300-8a6b51b2-16da-44e5-b050-8e835f8f1199',
  disponibilidadCita: { id: 'disp-mock', voluntario: { id: 'v1', nombre: 'Pedro Rojas', email: 'pedro@sembrandoperu.org' } },
  influencer: { id: 'i1', nombre: 'Herrera Clavijo', usuarioIg: 'Herrera', email: 'cristianronaldosalazarlopez@gmail.com' },
}

const ACCIONES_ESTADO: { estado: EstadoReunion; label: string; color: string }[] = [
  { estado: 'REALIZADA', label: 'Marcar como realizada', color: 'bg-green-700 hover:bg-green-800' },
  { estado: 'NO_ASISTIO', label: 'Marcar no asistio', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { estado: 'CANCELADA', label: 'Cancelar reunion', color: 'bg-red-600 hover:bg-red-700' },
]

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function formatearHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export default function GestionarReunionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)

  const [reunion, setReunion] = useState<Reunion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [usandoMock, setUsandoMock] = useState(true)
  const [actualizando, setActualizando] = useState<EstadoReunion | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const data = await reunionesService.obtenerPorId(id)
        if (!cancelado) {
          setReunion(data)
          setUsandoMock(false)
        }
      } catch {
        if (!cancelado) {
          setReunion({ ...MOCK_REUNION, id })
          setUsandoMock(true)
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [id])

  async function cambiarEstado(nuevoEstado: 'REALIZADA' | 'CANCELADA' | 'NO_ASISTIO') {
    if (!reunion) return
    setActualizando(nuevoEstado)
    setError(null)

    try {
      const actualizada = await reunionesService.actualizarEstado(reunion.id, { estado: nuevoEstado })
      setReunion(actualizada)
    } catch (err) {
      if (usandoMock) {
        setReunion({ ...reunion, estado: nuevoEstado })
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado.')
      }
    } finally {
      setActualizando(null)
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#003D2D] border-t-transparent rounded-full" />
      </main>
    )
  }

  if (!reunion) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Reunion no encontrada.</p>
      </main>
    )
  }

  const esFinal = reunion.estado === 'REALIZADA'

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

        <Link href="/reuniones/gestion" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors mb-6">
          <ArrowLeft size={16} /> Volver a Gestion de Reuniones
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#003D2D]">Gestionar Reunion</h1>
              <p className="text-gray-500 mt-2">Consulta el estado de la reunion y actualizalo si corresponde.</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${reunion.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : reunion.estado === 'REALIZADA' ? 'bg-green-100 text-green-700' : reunion.estado === 'CANCELADA' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
              {etiquetaEstadoReunion(reunion.estado)}
            </span>
          </div>

          {usandoMock ? (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 mb-6 inline-block">
              Mostrando datos de ejemplo (maqueta) - se conectara a la API real.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-500">INFLUENCER</label>
              <p className="border rounded-lg p-3 bg-gray-50">{reunion.influencer.nombre}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-500">VOLUNTARIO</label>
              <p className="border rounded-lg p-3 bg-gray-50">{reunion.disponibilidadCita.voluntario.nombre}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-500">FECHA</label>
              <p className="border rounded-lg p-3 bg-gray-50 capitalize">{formatearFecha(reunion.fechaHora)}</p>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-500">HORA</label>
              <p className="border rounded-lg p-3 bg-gray-50">{formatearHora(reunion.fechaHora)} - {reunion.duracionMinutos} min</p>
            </div>

            <div className="col-span-2">
              <label className="block mb-2 font-medium text-sm text-gray-500">ENLACE DE LA REUNION</label>
              {reunion.googleMeetLink ? (
                <a href={reunion.googleMeetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border rounded-lg p-3 bg-gray-50 text-[#003D2D] hover:underline w-fit">
                  <Video size={16} /> {reunion.googleMeetLink}
                </a>
              ) : (
                <p className="border rounded-lg p-3 bg-gray-50 text-gray-400">Sin enlace generado</p>
              )}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
          ) : null}

          {esFinal ? (
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              Esta reunion ya fue marcada como realizada y no puede cambiar de estado.
            </p>
          ) : (
            <div className="flex flex-wrap justify-end gap-3">
              {ACCIONES_ESTADO.filter((a) => a.estado !== reunion.estado).map((accion) => (
                <button
                  key={accion.estado}
                  onClick={() => cambiarEstado(accion.estado as 'REALIZADA' | 'CANCELADA' | 'NO_ASISTIO')}
                  disabled={actualizando !== null}
                  className={`text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${accion.color}`}
                >
                  {actualizando === accion.estado ? 'Guardando...' : accion.label}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}