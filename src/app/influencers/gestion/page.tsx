'use client'

/**
 * Vista: Gestión de Influencers
 * ------------------------------
 * Lista, busca, filtra, consulta y edita influencers.
 *
 * La información se obtiene desde el backend mediante:
 *   GET /influencers
 *
 * La edición se realiza mediante:
 *   PATCH /influencers/:id/editar
 *
 * Los datos utilizados aquí están alineados con:
 *   src/types/influencer.ts
 *   src/services/influencersService.ts
 */

import { Plus, Eye, Pencil, Search, X, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import type {
  Influencer,
  EstadoValidacion,
  ActualizarInfluencerInput,
} from '@/types/influencer'

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

function estiloEstado(estado: EstadoValidacion) {
  if (estado === 'VALIDADO') {
    return 'bg-green-100 text-green-700'
  }

  if (estado === 'PENDIENTE') {
    return 'bg-yellow-100 text-yellow-700'
  }

  return 'bg-red-100 text-red-700'
}

function textoEstado(estado: EstadoValidacion) {
  if (estado === 'VALIDADO') return '🟢 Validado'
  if (estado === 'RECHAZADO') return '🔴 Rechazado'
  return '🟡 Pendiente'
}

export default function GestionInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [totalResultados, setTotalResultados] = useState(0)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<
    EstadoValidacion | ''
  >('')

  const [tematicaFiltro, setTematicaFiltro] = useState('')
  const [seguidoresFiltro, setSeguidoresFiltro] = useState('')

  const [pagina, setPagina] = useState(1)

  const [viendoInfluencer, setViendoInfluencer] =
    useState<Influencer | null>(null)

  const [editandoInfluencer, setEditandoInfluencer] =
    useState<Influencer | null>(null)

  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  /**
   * Cargar influencers desde el backend.
   */
  useEffect(() => {
    let cancelado = false

    async function cargarInfluencers() {
      setCargando(true)
      setError(null)

      try {
        const filtros = {
          page: pagina,
          limit: LIMITE,
          ...(estadoFiltro
            ? { estadoValidacion: estadoFiltro }
            : {}),
          ...(tematicaFiltro
            ? { tematica: tematicaFiltro }
            : {}),
        }

        const respuesta = await influencersService.listar(filtros)

        console.log('RESPUESTA DEL SERVICIO:', respuesta)

        if (cancelado) return

        setInfluencers(respuesta.data)
        setTotalResultados(respuesta.meta.total)
      } catch (err) {
        if (cancelado) return

        console.error(
          'Error al cargar influencers:',
          err
        )

        setInfluencers([])
        setTotalResultados(0)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la lista de influencers.'
        )
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarInfluencers()

    return () => {
      cancelado = true
    }
  }, [pagina, estadoFiltro, tematicaFiltro])

  /**
   * Cuando cambia un filtro principal,
   * volvemos a la primera página.
   */
  function cambiarEstadoFiltro(
    nuevoEstado: EstadoValidacion | ''
  ) {
    setEstadoFiltro(nuevoEstado)
    setPagina(1)
  }

  function cambiarTematicaFiltro(
    nuevaTematica: string
  ) {
    setTematicaFiltro(nuevaTematica)
    setPagina(1)
  }

  function cambiarSeguidoresFiltro(
    nuevoFiltro: string
  ) {
    setSeguidoresFiltro(nuevoFiltro)
    setPagina(1)
  }

  /**
   * Filtro temporal de seguidores en el cliente.
   *
   * El tipo seguidores llega como string.
   * Se soportan valores como:
   * 150k
   * 90k
   * 10000
   * 1.5M
   */
  function seguidoresEnMiles(
    valor: string | undefined
  ) {
    if (!valor) return 0

    const texto = valor
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(',', '.')

    const numero = parseFloat(
      texto.replace(/[^0-9.]/g, '')
    )

    if (Number.isNaN(numero)) {
      return 0
    }

    if (texto.includes('m')) {
      return numero * 1000
    }

    if (texto.includes('k')) {
      return numero
    }

    return numero / 1000
  }

  const influencersMostrados =
    influencers.filter((influencer) => {
      if (!seguidoresFiltro) {
        return true
      }

      const seguidores =
        seguidoresEnMiles(influencer.seguidores)

      if (seguidoresFiltro === '0 - 10k') {
        return seguidores <= 10
      }

      if (seguidoresFiltro === '10k - 100k') {
        return seguidores > 10 && seguidores <= 100
      }

      if (seguidoresFiltro === '100k+') {
        return seguidores > 100
      }

      return true
    })

  const totalPaginas = Math.max(
    1,
    Math.ceil(totalResultados / LIMITE)
  )

  /**
   * Estadísticas de la página actual.
   */
  const totalInfluencers = totalResultados

  const totalPendientes = influencers.filter(
    (influencer) =>
      influencer.estadoValidacion === 'PENDIENTE'
  ).length

  const totalValidados = influencers.filter(
    (influencer) =>
      influencer.estadoValidacion === 'VALIDADO'
  ).length

  /**
   * Cambiar estado de validación.
   */
  async function cambiarEstado(
    id: string,
    nuevoEstado: EstadoValidacion
  ) {
    try {
      await influencersService.actualizar(id, {
        estadoValidacion: nuevoEstado,
      })

      setInfluencers((prev) =>
        prev.map((influencer) =>
          influencer.id === id
            ? {
                ...influencer,
                estadoValidacion: nuevoEstado,
              }
            : influencer
        )
      )

      if (viendoInfluencer?.id === id) {
        setViendoInfluencer((prev) =>
          prev
            ? {
                ...prev,
                estadoValidacion: nuevoEstado,
              }
            : null
        )
      }
    } catch (err) {
      console.error(
        'Error al actualizar el estado:',
        err
      )

      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado del influencer.'
      )
    }
  }

  /**
   * Guardar edición.
   */
  async function guardarEdicion(
    id: string,
    datos: ActualizarInfluencerInput
  ) {
    try {
      setGuardandoEdicion(true)

      const influencerActualizado =
        await influencersService.actualizar(
          id,
          datos
        )

      setInfluencers((prev) =>
        prev.map((influencer) =>
          influencer.id === id
            ? influencerActualizado
            : influencer
        )
      )

      setViendoInfluencer(
        influencerActualizado
      )

      setEditandoInfluencer(null)

      alert(
        'Influencer actualizado correctamente.'
      )
    } catch (err) {
      console.error(
        'Error al actualizar influencer:',
        err
      )

      alert(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el influencer.'
      )
    } finally {
      setGuardandoEdicion(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">

        {/* Encabezado */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
          >
            <ArrowLeft size={16} />
            Volver al Dashboard
          </Link>

          <h1 className="text-3xl font-bold">
            Gestión de Influencers
          </h1>

          <p className="text-gray-600 mt-2">
            Administra, consulta y valida los influencers registrados en el sistema.
          </p>
        </div>

        {/* Búsqueda y nuevo influencer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Buscar influencer..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(1)
              }}
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

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Total Influencers
            </p>

            <p className="text-2xl font-bold text-[#003D2D] mt-1">
              {totalInfluencers}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Pendientes
            </p>

            <p className="text-2xl font-bold text-[#003D2D] mt-1">
              {totalPendientes}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Validados
            </p>

            <p className="text-2xl font-bold text-[#003D2D] mt-1">
              {totalValidados}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <select
            className="border rounded-lg p-3"
            value={estadoFiltro}
            onChange={(e) =>
              cambiarEstadoFiltro(
                e.target.value as EstadoValidacion | ''
              )
            }
          >
            <option value="">
              Estado
            </option>

            <option value="PENDIENTE">
              Pendiente
            </option>

            <option value="VALIDADO">
              Validado
            </option>

            <option value="RECHAZADO">
              Rechazado
            </option>
          </select>

          <select
            className="border rounded-lg p-3"
            value={tematicaFiltro}
            onChange={(e) =>
              cambiarTematicaFiltro(
                e.target.value
              )
            }
          >
            <option value="">
              Temática
            </option>

            <option value="Ambiental">
              Ambiental
            </option>

            <option value="Social">
              Social
            </option>

            <option value="Educación">
              Educación
            </option>

            <option value="Moda">
              Moda
            </option>

            <option value="Tecnología">
              Tecnología
            </option>
          </select>

          <select
            className="border rounded-lg p-3"
            value={seguidoresFiltro}
            onChange={(e) =>
              cambiarSeguidoresFiltro(
                e.target.value
              )
            }
          >
            <option value="">
              Seguidores
            </option>

            <option value="0 - 10k">
              0 - 10k
            </option>

            <option value="10k - 100k">
              10k - 100k
            </option>

            <option value="100k+">
              100k+
            </option>
          </select>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-gray-50">

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Influencer
                </th>

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Seguidores
                </th>

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Publicaciones
                </th>

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>

                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {cargando && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-gray-500"
                  >
                    Cargando influencers...
                  </td>
                </tr>
              )}

              {!cargando &&
                influencersMostrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-gray-500"
                    >
                      No se encontraron influencers con esos filtros.
                    </td>
                  </tr>
                )}

              {!cargando &&
                influencersMostrados.map(
                  (influencer) => (
                    <tr
                      key={influencer.id}
                      className="border-b hover:bg-gray-50 transition-colors duration-150"
                    >

                      {/* Influencer */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                            {iniciales(
                              influencer.nombre
                            )}
                          </div>

                          <span className="text-gray-900">
                            {influencer.nombre}
                          </span>
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="p-3 text-gray-700">
                        {influencer.usuarioIg}
                      </td>

                      {/* Seguidores */}
                      <td className="p-3 text-gray-700">
                        {influencer.seguidores || '—'}
                      </td>

                      {/* Publicaciones */}
                      <td className="p-3 text-gray-700">
                        {influencer.cantidad_post || '—'}
                      </td>

                      {/* Estado */}
                      <td className="p-3">
                        <select
                          value={
                            influencer.estadoValidacion
                          }
                          onChange={(e) =>
                            cambiarEstado(
                              influencer.id,
                              e.target.value as EstadoValidacion
                            )
                          }
                          className={`border-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium ${estiloEstado(
                            influencer.estadoValidacion
                          )}`}
                        >
                          <option value="PENDIENTE">
                            🟡 Pendiente
                          </option>

                          <option value="VALIDADO">
                            🟢 Validado
                          </option>

                          <option value="RECHAZADO">
                            🔴 Rechazado
                          </option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="p-3">
                        <div className="flex items-center gap-3 text-gray-500">

                          <button
                            onClick={() =>
                              setViendoInfluencer(
                                influencer
                              )
                            }
                            className="hover:text-[#003D2D] transition-colors"
                            title="Ver influencer"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() =>
                              setEditandoInfluencer(
                                influencer
                              )
                            }
                            className="hover:text-[#003D2D] transition-colors"
                            title="Editar influencer"
                          >
                            <Pencil size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                )}

            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-end mt-6 gap-2">

          <button
            onClick={() =>
              setPagina((p) =>
                Math.max(1, p - 1)
              )
            }
            disabled={pagina === 1}
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {Array.from(
            { length: totalPaginas },
            (_, i) => i + 1
          ).map((numeroPagina) => (
            <button
              key={numeroPagina}
              onClick={() =>
                setPagina(numeroPagina)
              }
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
            onClick={() =>
              setPagina((p) =>
                Math.min(
                  totalPaginas,
                  p + 1
                )
              )
            }
            disabled={
              pagina === totalPaginas
            }
            className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Ver */}
      {viendoInfluencer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() =>
                setViendoInfluencer(null)
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              title="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-sm font-semibold">
                {iniciales(
                  viendoInfluencer.nombre
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {viendoInfluencer.nombre}
                </h2>

                <p className="text-sm text-gray-500">
                  {viendoInfluencer.usuarioIg}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <p className="text-gray-500">
                  Correo
                </p>

                <p className="font-medium break-all">
                  {viendoInfluencer.email || '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Teléfono
                </p>

                <p className="font-medium">
                  {viendoInfluencer.phone || '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Seguidores
                </p>

                <p className="font-medium">
                  {viendoInfluencer.seguidores || '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Publicaciones
                </p>

                <p className="font-medium">
                  {viendoInfluencer.cantidad_post || '—'}
                </p>
              </div>

              <div className="col-span-2">

                <p className="text-gray-500">
                  Biografía
                </p>

                <p className="font-medium whitespace-pre-wrap">
                  {viendoInfluencer.biografia || '—'}
                </p>

              </div>

              <div className="col-span-2">

                <p className="text-gray-500">
                  Mensaje personalizado
                </p>

                <p className="font-medium whitespace-pre-wrap">
                  {viendoInfluencer.mensajePersonalizado || '—'}
                </p>

              </div>

              <div className="col-span-2">

                <p className="text-gray-500">
                  Link de perfil
                </p>

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

                <p className="text-gray-500">
                  Estado de validación
                </p>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${estiloEstado(
                    viendoInfluencer.estadoValidacion
                  )}`}
                >
                  {textoEstado(
                    viendoInfluencer.estadoValidacion
                  )}
                </span>

              </div>

              <div>

                <p className="text-gray-500">
                  Estado de contacto
                </p>

                <p className="font-medium">
                  {viendoInfluencer.estadoContacto}
                </p>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editandoInfluencer && (
        <ModalEditarInfluencer
          influencer={editandoInfluencer}
          guardando={guardandoEdicion}
          onCancelar={() =>
            setEditandoInfluencer(null)
          }
          onGuardar={guardarEdicion}
        />
      )}
    </main>
  )
}

/**
 * Modal de edición.
 *
 * Solamente genera campos pertenecientes a
 * ActualizarInfluencerInput.
 */
function ModalEditarInfluencer({
  influencer,
  guardando,
  onCancelar,
  onGuardar,
}: {
  influencer: Influencer
  guardando: boolean
  onCancelar: () => void
  onGuardar: (
    id: string,
    datos: ActualizarInfluencerInput
  ) => Promise<void>
}) {
  const [form, setForm] =
    useState<ActualizarInfluencerInput>({
      nombre: influencer.nombre,
      usuarioIg: influencer.usuarioIg,
      linkIg: influencer.linkIg,
      email: influencer.email || '',
      phone: influencer.phone || '',
      seguidores: influencer.seguidores || '',
      cantidad_post:
        influencer.cantidad_post || '',
      biografia:
        influencer.biografia || '',
      mensajePersonalizado:
        influencer.mensajePersonalizado || '',
      estadoValidacion:
        influencer.estadoValidacion,
    })

  function actualizarCampo<
    K extends keyof ActualizarInfluencerInput
  >(
    campo: K,
    valor: ActualizarInfluencerInput[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  async function enviarFormulario(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    await onGuardar(
      influencer.id,
      form
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">

        <button
          onClick={onCancelar}
          disabled={guardando}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-40"
          title="Cerrar"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">
          Editar influencer
        </h2>

        <form
          onSubmit={enviarFormulario}
          className="space-y-4"
        >

          {/* Nombre */}
          <div>
            <label className="text-sm text-gray-600">
              Nombre completo
            </label>

            <input
              type="text"
              value={form.nombre || ''}
              onChange={(e) =>
                actualizarCampo(
                  'nombre',
                  e.target.value
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          {/* Usuario y red social */}
          <div>
            <label className="text-sm text-gray-600">
              Usuario de Instagram
            </label>

            <input
              type="text"
              value={form.usuarioIg || ''}
              onChange={(e) =>
                actualizarCampo(
                  'usuarioIg',
                  e.target.value
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="text-sm text-gray-600">
              Correo
            </label>

            <input
              type="email"
              value={form.email || ''}
              onChange={(e) =>
                actualizarCampo(
                  'email',
                  e.target.value
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm text-gray-600">
              Teléfono
            </label>

            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) =>
                actualizarCampo(
                  'phone',
                  e.target.value
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
            />
          </div>

          {/* Seguidores y publicaciones */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">
                Seguidores
              </label>

              <input
                type="text"
                value={form.seguidores || ''}
                onChange={(e) =>
                  actualizarCampo(
                    'seguidores',
                    e.target.value
                  )
                }
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Publicaciones
              </label>

              <input
                type="text"
                value={
                  form.cantidad_post || ''
                }
                onChange={(e) =>
                  actualizarCampo(
                    'cantidad_post',
                    e.target.value
                  )
                }
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>

          </div>

          {/* Biografía */}
          <div>
            <label className="text-sm text-gray-600">
              Biografía
            </label>

            <textarea
              value={form.biografia || ''}
              onChange={(e) =>
                actualizarCampo(
                  'biografia',
                  e.target.value
                )
              }
              rows={4}
              className="border rounded-lg p-2.5 w-full mt-1 resize-none"
            />
          </div>

          {/* Mensaje personalizado */}
          <div>
            <label className="text-sm text-gray-600">
              Mensaje personalizado
            </label>

            <textarea
              value={
                form.mensajePersonalizado || ''
              }
              onChange={(e) =>
                actualizarCampo(
                  'mensajePersonalizado',
                  e.target.value
                )
              }
              rows={4}
              className="border rounded-lg p-2.5 w-full mt-1 resize-none"
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-sm text-gray-600">
              Link de perfil
            </label>

            <input
              type="url"
              value={form.linkIg || ''}
              onChange={(e) =>
                actualizarCampo(
                  'linkIg',
                  e.target.value
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm text-gray-600">
              Estado de validación
            </label>

            <select
              value={
                form.estadoValidacion ||
                'PENDIENTE'
              }
              onChange={(e) =>
                actualizarCampo(
                  'estadoValidacion',
                  e.target.value as EstadoValidacion
                )
              }
              className="border rounded-lg p-2.5 w-full mt-1"
            >
              <option value="PENDIENTE">
                Pendiente
              </option>

              <option value="VALIDADO">
                Validado
              </option>

              <option value="RECHAZADO">
                Rechazado
              </option>
            </select>
          </div>

          {/* Botones */}
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
              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}