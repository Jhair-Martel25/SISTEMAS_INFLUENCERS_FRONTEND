'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Video, Eye } from 'lucide-react'
import type { Reunion, EstadoReunion } from '@/types/reunion'
import { etiquetaEstadoReunion } from '@/types/reunion'
import { reunionesService } from '@/services/horariosService'

const MOCK_REUNIONES: Reunion[] = [
  {
    id: 'b4e51594-864f-45ae-89b1-ecd4d5f112b3',
    fechaHora: '2026-07-31T15:00:00.000Z',
    duracionMinutos: 20,
    estado: 'PENDIENTE',
    googleMeetLink: 'https://meet.jit.si/Reto300-8a6b51b2-16da-44e5-b050-8e835f8f1199',
    disponibilidadCita: { id: '73a0035a-6200-4e42-8f81-e3d29d7745d9', voluntario: { id: '484a0ae7-dddf-48bc-b34d-330557ae32b3', nombre: 'Pedro Rojas' } },
    influencer: { id: '41e503c1-a604-48ac-957b-1d7579489dee', nombre: 'Herrera Clavijo', usuarioIg: 'Herrera', email: 'cristianronaldosalazarlopez@gmail.com' },
  },
  {
    id: 'f238fffa-bffc-4d57-93dc-f9ffe71e32d1',
    fechaHora: '2026-07-27T13:00:00.000Z',
    duracionMinutos: 20,
    estado: 'PENDIENTE',
    googleMeetLink: 'https://meet.jit.si/Reto300-example',
    disponibilidadCita: { id: '8bc22e24-26f0-49a1-894b-28214f9aa71a', voluntario: { id: 'v2', nombre: 'Marta Paz' } },
    influencer: { id: 'i2', nombre: 'Jorge Rivera', usuarioIg: 'jrivera' },
  },
  {
    id: '1b027f9b-cfb6-4c1f-81a5-406862c1a2b3',
    fechaHora: '2026-07-29T14:00:00.000Z',
    duracionMinutos: 20,
    estado: 'REALIZADA',
    googleMeetLink: 'https://meet.jit.si/Reto300-realizada',
    disponibilidadCita: { id: '48112a05-9cc0-444d-8650-6ea3d00305aa', voluntario: { id: 'v3', nombre: 'Fabio Ruiz' } },
    influencer: { id: 'i3', nombre: 'Carla Salas', usuarioIg: 'csalas' },
  },
]

const FILTROS: { value: EstadoReunion | 'TODAS'; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'REALIZADA', label: 'Realizadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
  { value: 'NO_ASISTIO', label: 'No asistio' },
]

function estiloEstado(estado: EstadoReunion) {
  if (estado === 'PENDIENTE') return 'bg-yellow-100 text-yellow-700'
  if (estado === 'REALIZADA') return 'bg-green-100 text-green-700'
  if (estado === 'CANCELADA') return 'bg-red-100 text-red-700'
  return 'bg-gray-200 text-gray-600'
}

function formatearFechaHora(iso: string) {
  const fecha = new Date(iso)
  const fechaTexto = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  const horaTexto = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return `${fechaTexto} - ${horaTexto}`
}

export default function GestionReunionesPage() {
  const [reuniones, setReuniones] = useState<Reunion[]>(MOCK_REUNIONES)
  const [cargando, setCargando] = useState(true)
  const [usandoMock, setUsandoMock] = useState(true)
  const [filtro, setFiltro] = useState<EstadoReunion | 'TODAS'>('TODAS')

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const data = await reunionesService.listar(filtro === 'TODAS' ? undefined : { estado: filtro })
        if (!cancelado) {
          setReuniones(data)
          setUsandoMock(false)
        }
      } catch {
        if (!cancelado) {
          setReuniones(filtro === 'TODAS' ? MOCK_REUNIONES : MOCK_REUNIONES.filter((r) => r.estado === filtro))
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
  }, [filtro])

  const totalPendientes = reuniones.filter((r) => r.estado === 'PENDIENTE').length
  const totalRealizadas = reuniones.filter((r) => r.estado === 'REALIZADA').length

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003D2D]">Gestion de Reuniones</h1>
          <p className="text-gray-500 mt-2">Central de coordinacion y seguimiento de reuniones entre influencers y voluntarios.</p>
          {usandoMock ? (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 mt-3 inline-block">
              Mostrando datos de ejemplo (maqueta) - se conectara a la API real.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm flex items-center gap-2"><Calendar size={16} /> Total reuniones</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{reuniones.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm">Pendientes</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{totalPendientes}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm">Realizadas</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{totalRealizadas}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filtro === f.value ? 'bg-[#003D2D] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h2 className="text-xl font-semibold">Listado de Seguimiento</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">Consulta el estado actual de las reuniones programadas.</p>

          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-[#003D2D] border-t-transparent rounded-full" />
            </div>
          ) : reuniones.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay reuniones para este filtro.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-center p-3">Influencer</th>
                  <th className="text-center p-3">Voluntario</th>
                  <th className="text-center p-3">Fecha y Hora</th>
                  <th className="text-center p-3">Meet</th>
                  <th className="text-center p-3">Estado</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reuniones.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="text-center p-3">{r.influencer.nombre}</td>
                    <td className="text-center p-3">{r.disponibilidadCita.voluntario.nombre}</td>
                    <td className="text-center p-3">{formatearFechaHora(r.fechaHora)}</td>
                    <td className="text-center p-3">
                      {r.googleMeetLink ? (
                        <a href={r.googleMeetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#003D2D] hover:underline text-sm">
                          <Video size={14} /> Unirse
                        </a>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="text-center p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estiloEstado(r.estado)}`}>{etiquetaEstadoReunion(r.estado)}</span>
                    </td>
                    <td className="text-center p-3">
                      <Link href={`/reuniones/gestionar/${r.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003D2D] text-white text-sm hover:bg-[#01281E] transition-colors">
                        <Eye size={14} /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  )
}