'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, Hourglass } from 'lucide-react'
import type { DisponibilidadCita } from '@/types/disponibilidad'
import { disponibilidadesService } from '@/features/disponibilidades/services/disponibilidades.service'
import { reunionesService } from '@/features/reuniones/services/reuniones.service'

function formatearBloque(iso: string) {
  const fecha = new Date(iso)
  const fechaTexto = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'short' })
  const horaTexto = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return `${fechaTexto} - ${horaTexto}`
}

export default function DisponibilidadAgendaPage() {
  const [bloques, setBloques] = useState<DisponibilidadCita[]>([])
  const [reunionesPendientes, setReunionesPendientes] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [ultimaReunion] = useState<{ fechaHora: string; id: string } | null>(() => {
    if (typeof window === 'undefined') return null
    const guardada = window.localStorage.getItem('sp_ultima_reunion')
    if (!guardada) return null
    try {
      return JSON.parse(guardada) as { fechaHora: string; id: string }
    } catch {
      return null
    }
  })

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)

      const [bloquesRes, reunionesRes] = await Promise.allSettled([
        disponibilidadesService.listarDisponibles(),
        reunionesService.listar({ estado: 'PENDIENTE' }),
      ])

      if (!cancelado) {
        if (bloquesRes.status === 'fulfilled') {
          setBloques(bloquesRes.value)
        } else {
          console.error('Error cargando bloques disponibles:', bloquesRes.reason)
        }

        if (reunionesRes.status === 'fulfilled') {
          setReunionesPendientes(reunionesRes.value.length)
        } else {
          // La lista de reuniones requiere login (ADMIN/VOLUNTARIO).
          // Como esta página es pública, es normal que falle si nadie inició sesión.
          setReunionesPendientes(null)
        }

        setCargando(false)
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [])

  const voluntariosConBloques = new Set(bloques.map((b) => b.voluntarioId)).size

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003D2D]">Disponibilidad y Agenda</h1>
          <p className="text-gray-600 mt-2">Consulta la disponibilidad real de los voluntarios y organiza las reuniones.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm flex items-center gap-2"><Calendar size={16} /> Reuniones pendientes</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{reunionesPendientes === null ? '(inicia sesión)' : reunionesPendientes}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm flex items-center gap-2"><Users size={16} /> Voluntarios con bloques disponibles</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{cargando ? '...' : voluntariosConBloques}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-500 text-sm flex items-center gap-2"><Hourglass size={16} /> Bloques disponibles</h3>
            <p className="text-4xl font-bold text-[#003D2D] mt-1">{cargando ? '...' : bloques.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold">Tu ultima reunion agendada</h2>
          <p className="text-gray-500 text-sm mt-1 mb-4">Registrada en este navegador.</p>

          {ultimaReunion ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-green-800 font-medium">{formatearBloque(ultimaReunion.fechaHora)}</p>
              <Link href={`/reuniones/gestionar/${ultimaReunion.id}`} className="text-sm text-[#003D2D] hover:underline">
                Ver detalle
              </Link>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Aun no has agendado ninguna reunion desde este navegador.{' '}
              <Link href="/reuniones/agendar" className="text-[#003D2D] hover:underline">Agendar una ahora</Link>
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-semibold">Bloques disponibles</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">Proximos bloques de 20 min abiertos para agendar.</p>

          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-[#003D2D] border-t-transparent rounded-full" />
            </div>
          ) : bloques.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No hay bloques disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bloques.map((b) => (
                <div key={b.id} className="border border-gray-200 rounded-xl p-3 text-center hover:border-[#003D2D] transition-colors">
                  <p className="text-sm font-medium text-gray-800 capitalize">{formatearBloque(b.fechaHora)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}