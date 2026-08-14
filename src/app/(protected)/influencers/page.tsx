'use client'

import { Plus, Eye, Pencil, Search, X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

import Link from 'next/link'
import type { EstadoValidacion } from '@/types/api'
import type { Influencer } from '@/types/influencer'
import { ESTADO_VALIDACION } from '@/types/api'
import { etiquetaEstado } from '@/lib/utils/format'
import { influencersService } from '@/features/influencers/services/influencers.service'

const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: '1',
    nombre: 'Andrea Paz',
    usuarioIg: 'andreapaz',
    linkIg: 'https://instagram.com/andreapaz',
    email: 'andrea@example.com',
    seguidores: '150000',
    cantidad_post: '120',
    estadoValidacion: 'VALIDADO',
    estadoContacto: 'SIN_CONTACTAR',
  },
  {
    id: '2',
    nombre: 'Carlos Rivera',
    usuarioIg: 'carlosrivera',
    linkIg: 'https://instagram.com/carlosrivera',
    email: 'carlos@example.com',
    seguidores: '90000',
    cantidad_post: '80',
    estadoValidacion: 'PENDIENTE',
    estadoContacto: 'SIN_CONTACTAR',
  },
  {
    id: '3',
    nombre: 'María Fernández',
    usuarioIg: 'mariafernandez',
    linkIg: 'https://instagram.com/mariafernandez',
    email: 'maria@example.com',
    seguidores: '150000',
    cantidad_post: '150',
    estadoValidacion: 'VALIDADO',
    estadoContacto: 'SIN_CONTACTAR',
  },
  {
    id: '4',
    nombre: 'Diego Salazar',
    usuarioIg: 'diegosalazar',
    linkIg: 'https://instagram.com/diegosalazar',
    email: 'diego@example.com',
    seguidores: '210000',
    cantidad_post: '200',
    estadoValidacion: 'RECHAZADO',
    estadoContacto: 'SIN_CONTACTAR',
  },
]

const LIMITE = 5

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function estiloEstado(estado: EstadoValidacion) {
  if (estado === 'VALIDADO') return 'bg-green-100 text-green-700'
  if (estado === 'PENDIENTE') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function GestionInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoValidacion | "">("");
  const [seguidoresFiltro, setSeguidoresFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  const [viendoInfluencer, setViendoInfluencer] = useState<Influencer | null>(null)
  const [editandoInfluencer, setEditandoInfluencer] = useState<Influencer | null>(null)

  async function cambiarEstado(
    id: string,
    nuevoEstado: EstadoValidacion
  ) {
    try {
      await influencersService.editar(id, { estadoValidacion: nuevoEstado });

      setInfluencers((prev) =>
        prev.map((inf) =>
          inf.id === id
            ? { ...inf, estadoValidacion: nuevoEstado }
            : inf
        )
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el estado del influencer.");
    }
  }

  function guardarEdicion(actualizado: Influencer) {
    setInfluencers((prev) =>
      prev.map((inf) => (inf.id === actualizado.id ? actualizado : inf))
    )
    setEditandoInfluencer(null)
  }

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await influencersService.listar({
          estadoValidacion: estadoFiltro || undefined,
          page: pagina,
          limit: LIMITE,
        })

        if (!cancelado) {
          setInfluencers(respuesta.data)
          setTotalResultados(respuesta.meta.total)
        }
      } catch (err) {
        if (!cancelado) {
          console.warn("Fallo la conexión real, usando datos mock:", err);
          setInfluencers(MOCK_INFLUENCERS);
          setTotalResultados(MOCK_INFLUENCERS.length);
          setError(
            err instanceof Error ? err.message : "Error al cargar influencers."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    const timeoutId = setTimeout(cargar, 400);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [busqueda, estadoFiltro, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(totalResultados / LIMITE));

  // Filtro de seguidores en el cliente (rango sobre el string de seguidores).
  const influencersMostrados = influencers.filter((inf) => {
    const seguidoresNum = parseInt((inf.seguidores ?? '0').replace(/[^0-9]/g, ""), 10);
    let coincideSeguidores = true;
    if (seguidoresFiltro === "0 - 10k") coincideSeguidores = seguidoresNum <= 10000;
    if (seguidoresFiltro === "10k - 100k")
      coincideSeguidores = seguidoresNum > 10000 && seguidoresNum <= 100000;
    if (seguidoresFiltro === "100k+") coincideSeguidores = seguidoresNum > 100000;

    return coincideSeguidores;
  });

  const totalInfluencers = influencers.length
  const totalPendientes = influencers.filter((i) => i.estadoValidacion === 'PENDIENTE').length
  const totalValidados = influencers.filter((i) => i.estadoValidacion === 'VALIDADO').length

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
            href="/influencers/nuevo"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Influencer
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Influencers</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalInfluencers}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalPendientes}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Validados</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">{totalValidados}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select
            className="border rounded-lg p-3"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoValidacion | "")
              setPagina(1)
            }}
          >
            <option value="">Estado</option>
            {Object.values(ESTADO_VALIDACION).map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstado(estado, 'validacion')}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-3"
            value={seguidoresFiltro}
            onChange={(e) => setSeguidoresFiltro(e.target.value)}
          >
            <option value="">Seguidores</option>
            <option value="0 - 10k">0 - 10k</option>
            <option value="10k - 100k">10k - 100k</option>
            <option value="100k+">100k+</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instagram</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguidores</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Publicaciones</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Validación</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!cargando && influencersMostrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No se encontraron influencers con esos filtros.
                  </td>
                </tr>
              )}

              {influencersMostrados.map((inf: Influencer) => (
                <tr
                  key={inf.id}
                  className="border-b hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {iniciales(inf.nombre)}
                      </div>
                      <span className="text-gray-900">{inf.nombre}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">@{inf.usuarioIg}</td>
                  <td className="p-3 text-gray-700">{inf.seguidores ?? '—'}</td>
                  <td className="p-3 text-gray-700">{inf.cantidad_post ?? '—'}</td>
                  <td className="p-3">
                    <select
                      value={inf.estadoValidacion}
                      onChange={(e) =>
                        cambiarEstado(inf.id, e.target.value as EstadoValidacion)
                      }
                      className={`border-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium ${estiloEstado(inf.estadoValidacion)}`}
                    >
                      {Object.values(ESTADO_VALIDACION).map((estado) => (
                        <option key={estado} value={estado}>
                          {etiquetaEstado(estado, 'validacion')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-gray-700">
                    {etiquetaEstado(inf.estadoContacto, 'contacto')}
                  </td>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
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
                <p className="font-medium">{viendoInfluencer.email || '—'}</p>
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
                <p className="text-gray-500">Link de perfil</p>
                <a
                  href={viendoInfluencer.linkIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#003D2D] underline break-all"
                >
                  {viendoInfluencer.linkIg}
                </a>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Estado de validación</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${estiloEstado(viendoInfluencer.estadoValidacion)}`}
                >
                  {etiquetaEstado(viendoInfluencer.estadoValidacion, 'validacion')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {editandoInfluencer && (
        <ModalEditarInfluencer
          influencer={editandoInfluencer}
          onCancelar={() => setEditandoInfluencer(null)}
          onGuardar={guardarEdicion}
        />
      )}
    </main>
  )
}

function ModalEditarInfluencer({
  influencer,
  onCancelar,
  onGuardar,
}: {
  influencer: Influencer
  onCancelar: () => void
  onGuardar: (actualizado: Influencer) => void
}) {
  const [form, setForm] = useState<Influencer>(influencer)

  function actualizarCampo<K extends keyof Influencer>(campo: K, valor: Influencer[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCancelar}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Editar influencer</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onGuardar(form)
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-gray-600">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Usuario IG</label>
              <input
                type="text"
                value={form.usuarioIg}
                onChange={(e) => actualizarCampo('usuarioIg', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => actualizarCampo('email', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Seguidores</label>
              <input
                type="text"
                value={form.seguidores ?? ''}
                onChange={(e) => actualizarCampo('seguidores', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Publicaciones</label>
              <input
                type="text"
                value={form.cantidad_post ?? ''}
                onChange={(e) => actualizarCampo('cantidad_post', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Link de perfil</label>
            <input
              type="url"
              value={form.linkIg}
              onChange={(e) => actualizarCampo('linkIg', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Estado de validación</label>
            <select
              value={form.estadoValidacion}
              onChange={(e) =>
                actualizarCampo('estadoValidacion', e.target.value as EstadoValidacion)
              }
              className="border rounded-lg p-2.5 w-full mt-1"
            >
              {Object.values(ESTADO_VALIDACION).map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstado(estado, 'validacion')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
