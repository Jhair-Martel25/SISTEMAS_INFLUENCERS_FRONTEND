'use client'

/**
 * Vista: Gestión de Influencers
 * ------------------------------
 * Muestra la lista de influencers registrados con búsqueda, filtros
 * (estado, temática, seguidores), paginación y estados de carga/error.
 * El filtro de Estado y la paginación ya consumen el GET real del backend
 * (vía services/influencers.ts); Temática y Seguidores filtran temporalmente
 * en el cliente porque aún no están confirmados como parámetros del backend.
 * Si la API falla, cae a datos mock para no dejar la pantalla en blanco.
 */


import { Plus, Eye, Pencil, Search, X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

import Link from 'next/link'
import type { Influencer, EstadoInfluencer, RedSocial } from '@/types/influencer'
import { listarInfluencers, actualizarEstadoInfluencer, } from "@/services/influencers";
// Datos simulados (mock) mientras se conecta el listado real del backend.
// Más adelante esto se reemplaza por influencersService.listar() en un useEffect
const MOCK_INFLUENCERS: Influencer[] = [
  {
    id: '1',
    nombreCompleto: 'Andrea Paz',
    usuarioIG: '@andreapaz',
    redSocial: 'Instagram',
    scoreIA: 92,
    correo: 'andrea@example.com',
    pais: 'Perú',
    ciudad: 'Lima',
    seguidores: '150k',
    engagement: '4.5%',
    tematica: 'Ambiental',
    linkPerfil: 'https://instagram.com/andreapaz',
    estado: 'Validado',
  },
  {
    id: '2',
    nombreCompleto: 'Carlos Rivera',
    usuarioIG: '@carlosrivera',
    redSocial: 'TikTok',
    scoreIA: 85,
    correo: 'carlos@example.com',
    pais: 'Perú',
    ciudad: 'Arequipa',
    seguidores: '90k',
    engagement: '3.8%',
    tematica: 'Social',
    linkPerfil: 'https://tiktok.com/@carlosrivera',
    estado: 'Pendiente',
  },
  {
    id: '3',
    nombreCompleto: 'María Fernández',
    usuarioIG: '@mariafernandez',
    redSocial: 'Instagram',
    scoreIA: 91,
    correo: 'maria@example.com',
    pais: 'Perú',
    ciudad: 'Lima',
    seguidores: '150k',
    engagement: '5.2%',
    tematica: 'Moda',
    linkPerfil: 'https://instagram.com/mariafernandez',
    estado: 'Validado',
  },
  {
    id: '4',
    nombreCompleto: 'Diego Salazar',
    usuarioIG: '@diegosalazar',
    redSocial: 'YouTube',
    scoreIA: 78,
    correo: 'diego@example.com',
    pais: 'Perú',
    ciudad: 'Trujillo',
    seguidores: '210k',
    engagement: '4.5%',
    tematica: 'Tecnología',
    linkPerfil: 'https://youtube.com/@diegosalazar',
    estado: 'Rechazado',
  },
]

const PAGE_SIZE = 5

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function estiloEstado(estado: EstadoInfluencer) {
  if (estado === 'Validado') return 'bg-green-100 text-green-700'
  if (estado === 'Pendiente') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function GestionInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoInfluencer | "">("");
  const [tematicaFiltro, setTematicaFiltro] = useState("");
  const [seguidoresFiltro, setSeguidoresFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const LIMITE = 5;

  const [viendoInfluencer, setViendoInfluencer] = useState<Influencer | null>(null)
  const [editandoInfluencer, setEditandoInfluencer] = useState<Influencer | null>(null)

  async function cambiarEstado(
    id: string,
    nuevoEstado: EstadoInfluencer
  ) {
    try {
      await actualizarEstadoInfluencer(id, nuevoEstado);

      setInfluencers((prev) =>
        prev.map((inf) =>
          inf.id === id
            ? { ...inf, estado: nuevoEstado }
            : inf
        )
      );

      console.log("Estado actualizado correctamente.");
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
        const respuesta = await listarInfluencers({
          busqueda,
          estado: estadoFiltro,
          page: pagina,
          limit: LIMITE,
        })

        if (!cancelado) {
          console.log("Primer influencer:", respuesta.data.data[0])

          setInfluencers(respuesta.data.data)
          setTotalResultados(respuesta.data.meta.total)
        }
      } catch (err) {
        if (!cancelado) {
          // Fallback temporal: si el backend aún no responde, usa el mock
          // para no dejar la pantalla en blanco durante el desarrollo.
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

    // Debounce de 400ms para no disparar un fetch en cada tecla de búsqueda
    const timeoutId = setTimeout(cargar, 400);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [busqueda, estadoFiltro, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(totalResultados / LIMITE));

  // Filtro temporal en el cliente para Temática y Seguidores, mientras se confirma
  // si el backend los soporta como query params (no aparecían en el Swagger de GET /influencers).
  const influencersMostrados = influencers.filter((inf) => {
    const coincideTematica = !tematicaFiltro || inf.tematica === tematicaFiltro;

    const seguidoresNum = parseInt(inf.seguidores.replace(/[^0-9]/g, ""), 10);
    let coincideSeguidores = true;
    if (seguidoresFiltro === "0 - 10k") coincideSeguidores = seguidoresNum <= 10;
    if (seguidoresFiltro === "10k - 100k")
      coincideSeguidores = seguidoresNum > 10 && seguidoresNum <= 100;
    if (seguidoresFiltro === "100k+") coincideSeguidores = seguidoresNum > 100;

    return coincideTematica && coincideSeguidores;
  });

  const totalInfluencers = influencers.length
  const totalPendientes = influencers.filter((i) => i.estado === 'Pendiente').length
  const totalValidados = influencers.filter((i) => i.estado === 'Validado').length
  const scorePromedio =
    influencers.reduce((acumulado, i) => acumulado + i.scoreIA, 0) / totalInfluencers

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
            href="/influencers/registro"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Influencer
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Score IA promedio</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">
              {scorePromedio.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            className="border rounded-lg p-3"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoInfluencer | "")
              setPagina(1)
            }}
          >
            <option value="">Estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Validado">Validado</option>
            <option value="Rechazado">Rechazado</option>
          </select>

          <select
            className="border rounded-lg p-3"
            value={tematicaFiltro}
            onChange={(e) => setTematicaFiltro(e.target.value)}
          >
            <option value="">Temática</option>
            <option value="Ambiental">Ambiental</option>
            <option value="Social">Social</option>
            <option value="Educación">Educación</option>
            <option value="Moda">Moda</option>
            <option value="Tecnología">Tecnología</option>
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
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Red Social</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguidores</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score IA</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
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
                        {iniciales(inf.nombreCompleto)}
                      </div>
                      <span className="text-gray-900">{inf.nombreCompleto}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{inf.redSocial}</td>
                  <td className="p-3 text-gray-700">{inf.seguidores}</td>
                  <td className="p-3 text-gray-700">{inf.engagement}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#20D18F] h-2 rounded-full"
                          style={{ width: `${inf.scoreIA}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{inf.scoreIA}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={inf.estado}
                      onChange={(e) =>
                        cambiarEstado(inf.id, e.target.value as EstadoInfluencer)
                      }
                      className={`border-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium ${estiloEstado(inf.estado)}`}
                    >
                      <option value="Pendiente">🟡 Pendiente</option>
                      <option value="Validado">🟢 Validado</option>
                      <option value="Rechazado">🔴 Rechazado</option>
                    </select>
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
                {iniciales(viendoInfluencer.nombreCompleto)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{viendoInfluencer.nombreCompleto}</h2>
                <p className="text-sm text-gray-500">{viendoInfluencer.usuarioIG}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Correo</p>
                <p className="font-medium">{viendoInfluencer.correo}</p>
              </div>
              <div>
                <p className="text-gray-500">Teléfono</p>
                <p className="font-medium">{viendoInfluencer.telefono || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">País / Ciudad</p>
                <p className="font-medium">
                  {viendoInfluencer.pais} / {viendoInfluencer.ciudad}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Red social</p>
                <p className="font-medium">{viendoInfluencer.redSocial}</p>
              </div>
              <div>
                <p className="text-gray-500">Seguidores</p>
                <p className="font-medium">{viendoInfluencer.seguidores}</p>
              </div>
              <div>
                <p className="text-gray-500">Engagement</p>
                <p className="font-medium">{viendoInfluencer.engagement}</p>
              </div>
              <div>
                <p className="text-gray-500">Temática</p>
                <p className="font-medium">{viendoInfluencer.tematica}</p>
              </div>
              <div>
                <p className="text-gray-500">Score IA</p>
                <p className="font-medium">{viendoInfluencer.scoreIA}</p>
              </div>
              <div className="col-span-2">

                <p className="text-gray-500">Link de perfil</p>
                <a

                  href={viendoInfluencer.linkPerfil}

                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#003D2D] underline break-all"
                >

                  {viendoInfluencer.linkPerfil}
                </a>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Estado</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${estiloEstado(viendoInfluencer.estado)}`}
                >
                  {viendoInfluencer.estado}
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
            <label className="text-sm text-gray-600">Nombre completo</label>
            <input
              type="text"
              value={form.nombreCompleto}
              onChange={(e) => actualizarCampo('nombreCompleto', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Usuario IG</label>
              <input
                type="text"
                value={form.usuarioIG}
                onChange={(e) => actualizarCampo('usuarioIG', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Red social</label>
              <select
                value={form.redSocial}
                onChange={(e) => actualizarCampo('redSocial', e.target.value as RedSocial)}
                className="border rounded-lg p-2.5 w-full mt-1"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Correo</label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => actualizarCampo('correo', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">País</label>
              <input
                type="text"
                value={form.pais}
                onChange={(e) => actualizarCampo('pais', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Ciudad</label>
              <input
                type="text"
                value={form.ciudad}
                onChange={(e) => actualizarCampo('ciudad', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Seguidores</label>
              <input
                type="text"
                value={form.seguidores}
                onChange={(e) => actualizarCampo('seguidores', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Engagement</label>
              <input
                type="text"
                value={form.engagement}
                onChange={(e) => actualizarCampo('engagement', e.target.value)}
                className="border rounded-lg p-2.5 w-full mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Temática</label>
            <input
              type="text"
              value={form.tematica}
              onChange={(e) => actualizarCampo('tematica', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Link de perfil</label>
            <input
              type="url"
              value={form.linkPerfil}
              onChange={(e) => actualizarCampo('linkPerfil', e.target.value)}
              className="border rounded-lg p-2.5 w-full mt-1"
            />
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
