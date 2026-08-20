'use client'

/**
 * Vista: Gestión de Influencers
 * ------------------------------
 * Lista influencers reales del backend, con filtro por estado de
 * validación, paginación, vista de detalle y edición de campos.
 *
 * Endpoints usados:
 *   GET   /influencers
 *   PATCH /influencers/:id/editar
 */

import { Plus, Eye, Pencil, Search, X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Influencer, EstadoValidacion, EstadoContacto, ActualizarInfluencerInput } from '@/types/influencer'
import { influencersService } from '@/services/influencersService'

const LIMITE = 5

function iniciales(nombre: string) {
  if (!nombre) return '?'
  return nombre
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function estiloValidacion(estado: EstadoValidacion) {
  if (estado === 'VALIDADO') return 'bg-green-100 text-green-700'
  if (estado === 'PENDIENTE') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

function etiquetaValidacion(estado: EstadoValidacion) {
  if (estado === 'VALIDADO') return '🟢 Validado'
  if (estado === 'PENDIENTE') return '🟡 Pendiente'
  return '🔴 Rechazado'
}

function etiquetaContacto(estado: EstadoContacto) {
  const mapa: Record<EstadoContacto, string> = {
    SIN_CONTACTAR: 'Sin contactar',
    CORREO_ENVIADO: 'Correo enviado',
    FORMULARIO_LLENADO: 'Formulario llenado',
    REUNION_AGENDADA: 'Reunión agendada',
    RECHAZO_CONTACTO: 'Rechazó contacto',
  }
  return mapa[estado] ?? estado
}

export default function GestionInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [totalResultados, setTotalResultados] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoValidacion | ''>('')
  const [pagina, setPagina] = useState(1)

  const [viendoInfluencer, setViendoInfluencer] = useState<Influencer | null>(null)
  const [editandoInfluencer, setEditandoInfluencer] = useState<Influencer | null>(null)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const respuesta = await influencersService.listar({
          page: pagina,
          limit: LIMITE,
          estadoValidacion: estadoFiltro || undefined,
        })

        if (!cancelado) {
          setInfluencers(respuesta.data)
          setTotalResultados(respuesta.meta.total)
        }
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'Error al cargar influencers.')
          setInfluencers([])
          setTotalResultados(0)
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    const timeoutId = setTimeout(cargar, 300)
    return () => {
      cancelado = true
      clearTimeout(timeoutId)
    }
  }, [estadoFiltro, pagina])

  const totalPaginas = Math.max(1, Math.ceil(totalResultados / LIMITE))

  const influencersMostrados = influencers.filter((inf) => {
    if (!busqueda.trim()) return true
    const texto = busqueda.trim().toLowerCase()
    return (
      inf.nombre.toLowerCase().includes(texto) ||
      inf.usuarioIg.toLowerCase().includes(texto) ||
      (inf.email ?? '').toLowerCase().includes(texto)
    )
  })

  const totalPendientes = influencers.filter((i) => i.estadoValidacion === 'PENDIENTE').length
  const totalValidados = influencers.filter((i) => i.estadoValidacion === 'VALIDADO').length
  const totalRechazados = influencers.filter((i) => i.estadoValidacion === 'RECHAZADO').length

  async function cambiarEstadoRapido(id: string, nuevoEstado: EstadoValidacion) {
    try {
      const actualizado = await influencersService.editar(id, { estadoValidacion: nuevoEstado })
      setInfluencers((prev) => prev.map((inf) => (inf.id === id ? actualizado : inf)))
      if (viendoInfluencer?.id === id) setViendoInfluencer(actualizado)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el estado.')
    }
  }

  async function guardarEdicion(id: string, datos: ActualizarInfluencerInput) {
    try {
      setGuardandoEdicion(true)
      const actualizado = await influencersService.editar(id, datos)
      setInfluencers((prev) => prev.map((inf) => (inf.id === id ? actualizado : inf)))
      setViendoInfluencer(actualizado)
      setEditandoInfluencer(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el influencer.')
    } finally {
      setGuardandoEdicion(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
          >
            <ArrowLeft size={16} />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Gestión de Influencers</h1>
          <p className="text-gray-600 mt-2">
            Administra, consulta y valida los influencers registrados en el sistema.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border rounded-lg p-3 pl-10 w-full"
            />
          </div>
          <Link
            href="/influencers/registro"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Influencer
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total (esta página)</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{influencers.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalPendientes}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Validados</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalValidados}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Rechazados</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalRechazados}</p>
          </div>
        </div>

        <div className="mb-6">
          <select
            className="border rounded-lg p-3"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoValidacion | '')
              setPagina(1)
            }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VALIDADO">Validado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguidores</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Publicaciones</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Validación</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">Cargando influencers...</td>
                </tr>
              )}

              {!cargando && influencersMostrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No se encontraron influencers con esos filtros.
                  </td>
                </tr>
              )}

              {!cargando && influencersMostrados.map((inf) => (
                <tr key={inf.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {iniciales(inf.nombre)}
                      </div>
                      <div>
                        <p className="text-gray-900">{inf.nombre}</p>
                        <p className="text-xs text-gray-500">@{inf.usuarioIg}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{inf.email || '—'}</td>
                  <td className="p-3 text-gray-700">{inf.seguidores || '—'}</td>
                  <td className="p-3 text-gray-700">{inf.cantidad_post || '—'}</td>
                  <td className="p-3">
                    <select
                      value={inf.estadoValidacion}
                      onChange={(e) => cambiarEstadoRapido(inf.id, e.target.value as EstadoValidacion)}
                      className={`border-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium ${estiloValidacion(inf.estadoValidacion)}`}
                    >
                      <option value="PENDIENTE">🟡 Pendiente</option>
                      <option value="VALIDADO">🟢 Validado</option>
                      <option value="RECHAZADO">🔴 Rechazado</option>
                    </select>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{etiquetaContacto(inf.estadoContacto)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3 text-gray-500">
                      <button
                        onClick={() => setViendoInfluencer(inf)}
                        className="hover:text-[#003D2D] transition-colors"
                        title="Ver"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEditandoInfluencer(inf)}
                        className="hover:text-[#003D2D] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
            <button
              key={numeroPagina}
              onClick={() => setPagina(numeroPagina)}
              className={
                numeroPagina === pagina
                  ? 'bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium'
                  : 'border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150'
              }
            >
              {numeroPagina}
            </button>
          ))}

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>

      {viendoInfluencer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViendoInfluencer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-sm font-semibold">
                {iniciales(viendoInfluencer.nombre)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{viendoInfluencer.nombre}</h2>
                <p className="text-sm text-gray-500">@{viendoInfluencer.usuarioIg}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Correo</p>
                <p className="font-medium break-all">{viendoInfluencer.email || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Teléfono</p>
                <p className="font-medium">{viendoInfluencer.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Seguidores</p>
                <p className="font-medium">{viendoInfluencer.seguidores || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Publicaciones</p>
                <p className="font-medium">{viendoInfluencer.cantidad_post || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Biografía</p>
                <p className="font-medium whitespace-pre-wrap">{viendoInfluencer.biografia || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Mensaje personalizado</p>
                <p className="font-medium whitespace-pre-wrap">{viendoInfluencer.mensajePersonalizado || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Link de Instagram</p>
                <a
                  href={viendoInfluencer.linkIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#003D2D] underline break-all"
                >
                  {viendoInfluencer.linkIg}
                </a>
              </div>
              <div>
                <p className="text-gray-500">Validación</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${estiloValidacion(viendoInfluencer.estadoValidacion)}`}>
                  {etiquetaValidacion(viendoInfluencer.estadoValidacion)}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Contacto</p>
                <p className="font-medium mt-1">{etiquetaContacto(viendoInfluencer.estadoContacto)}</p>
              </div>
              {viendoInfluencer.validadoPor && (
                <div className="col-span-2">
                  <p className="text-gray-500">Validado por</p>
                  <p className="font-medium">{viendoInfluencer.validadoPor.nombre}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setEditandoInfluencer(viendoInfluencer)}
                className="bg-[#003D2D] text-white px-4 py-2 rounded-lg hover:bg-[#00553f] transition-colors flex items-center gap-2"
              >
                <Pencil size={16} />
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {editandoInfluencer && (
        <ModalEditarInfluencer
          influencer={editandoInfluencer}
          guardando={guardandoEdicion}
          onCancelar={() => setEditandoInfluencer(null)}
          onGuardar={guardarEdicion}
        />
      )}
    </main>
  )
}

function ModalEditarInfluencer({
  influencer,
  guardando,
  onCancelar,
  onGuardar,
}: {
  influencer: Influencer
  guardando: boolean
  onCancelar: () => void
  onGuardar: (id: string, datos: ActualizarInfluencerInput) => Promise<void>
}) {
  const [form, setForm] = useState<ActualizarInfluencerInput>({
    nombre: influencer.nombre,
    usuarioIg: influencer.usuarioIg,
    linkIg: influencer.linkIg,
    email: influencer.email || '',
    phone: influencer.phone || '',
    seguidores: influencer.seguidores || '',
    cantidad_post: influencer.cantidad_post || '',
    biografia: influencer.biografia || '',
    mensajePersonalizado: influencer.mensajePersonalizado || '',
    estadoValidacion: influencer.estadoValidacion,
  })

  function actualizarCampo<K extends keyof ActualizarInfluencerInput>(
    campo: K,
    valor: ActualizarInfluencerInput[K]
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onGuardar(influencer.id, form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCancelar}
          disabled={guardando}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-40"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Editar influencer</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Nombre completo</label>
            <input
              type="text"
              value={form.nombre || ''}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Usuario de Instagram</label>
              <input
                type="text"
                value={form.usuarioIg || ''}
                onChange={(e) => actualizarCampo('usuarioIg', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Correo</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => actualizarCampo('email', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Teléfono</label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => actualizarCampo('phone', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Seguidores</label>
              <input
                type="text"
                value={form.seguidores || ''}
                onChange={(e) => actualizarCampo('seguidores', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Publicaciones</label>
            <input
              type="text"
              value={form.cantidad_post || ''}
              onChange={(e) => actualizarCampo('cantidad_post', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Biografía</label>
            <textarea
              value={form.biografia || ''}
              onChange={(e) => actualizarCampo('biografia', e.target.value)}
              rows={3}
              className="border rounded-lg p-2.5 w-full mt-1 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Mensaje personalizado</label>
            <textarea
              value={form.mensajePersonalizado || ''}
              onChange={(e) => actualizarCampo('mensajePersonalizado', e.target.value)}
              rows={3}
              className="border rounded-lg p-2.5 w-full mt-1 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Link de Instagram</label>
            <input
              type="url"
              value={form.linkIg || ''}
              onChange={(e) => actualizarCampo('linkIg', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Estado de validación</label>
            <select
              value={form.estadoValidacion || 'PENDIENTE'}
              onChange={(e) => actualizarCampo('estadoValidacion', e.target.value as EstadoValidacion)}
              className="border rounded-lg p-2.5 w-full mt-1"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="VALIDADO">Validado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              disabled={guardando}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}