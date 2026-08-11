"use client";

import { useEffect, useState } from "react";
import { usuariosService } from "@/services/usuariosService";
import UsuarioForm from "@/components/usuarios/UsuarioForm";
import type {
  Usuario,
  CrearUsuarioInput,
  ActualizarUsuarioInput,
  UsuarioFiltros,
  UsuariosResponse,
} from "@/types/usuario";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [estadoFiltro, setEstadoFiltro] = useState<
    UsuarioFiltros["estado"] | ""
  >("");

  const [roleFiltro, setRoleFiltro] = useState<number | "">("");

  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  const limite = 10;

  async function cargarUsuarios() {
    try {
      setLoading(true);
      setError("");

      const filtros: UsuarioFiltros = {
        page: pagina,
        limit: limite,
      };

      if (estadoFiltro) {
        filtros.estado = estadoFiltro;
      }

      if (roleFiltro !== "") {
        filtros.roleId = roleFiltro;
      }

      const respuesta: UsuariosResponse =
        await usuariosService.listar(filtros);

      setUsuarios(respuesta.data);
      setTotal(respuesta.meta.total);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarUsuarios();
  }, [pagina, estadoFiltro, roleFiltro]);

  function mostrarMensajeExito(mensaje: string) {
    setMensajeExito(mensaje);

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  }

  function handleNuevoUsuario() {
    setUsuarioSeleccionado(null);
    setMostrarFormulario(true);
  }

  function handleEditar(usuario: Usuario) {
    setUsuarioSeleccionado(usuario);
    setMostrarFormulario(true);
  }

  async function handleGuardar(
    data: CrearUsuarioInput | ActualizarUsuarioInput
  ) {
    try {
      setGuardando(true);

      if (usuarioSeleccionado) {
        await usuariosService.actualizar(
          usuarioSeleccionado.id,
          data as ActualizarUsuarioInput
        );

        mostrarMensajeExito("Usuario actualizado correctamente.");
      } else {
        await usuariosService.crear(data as CrearUsuarioInput);

        mostrarMensajeExito("Usuario creado correctamente.");
      }

      setMostrarFormulario(false);
      setUsuarioSeleccionado(null);

      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el usuario.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleDesactivar(usuario: Usuario) {
    const confirmar = confirm(
      `¿Deseas desactivar al usuario ${usuario.nombre}?`
    );

    if (!confirmar) return;

    try {
      setError("");

      await usuariosService.desactivar(usuario.id);

      mostrarMensajeExito("Usuario desactivado correctamente.");

      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError("No fue posible desactivar el usuario.");
    }
  }

  function cerrarFormulario() {
    if (guardando) return;

    setMostrarFormulario(false);
    setUsuarioSeleccionado(null);
  }

  function obtenerNombreRol(roleId: number) {
    if (roleId === 1) return "Administrador";
    if (roleId === 2) return "Voluntario";

    return `Rol ${roleId}`;
  }

  const totalPaginas = Math.ceil(total / limite);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#003D2D]">
              Gestión de Usuarios
            </h1>

            <p className="text-gray-600 mt-2">
              Administra los usuarios registrados en el sistema.
            </p>
          </div>

          <button
            onClick={handleNuevoUsuario}
            className="rounded-lg bg-[#003D2D] px-5 py-2 text-white font-medium hover:bg-[#00553f] transition"
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Estado
              </label>

              <select
                value={estadoFiltro}
                onChange={(e) => {
                  setPagina(1);
                  setEstadoFiltro(
                    e.target.value as UsuarioFiltros["estado"] | ""
                  );
                }}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Rol
              </label>

              <select
                value={roleFiltro}
                onChange={(e) => {
                  setPagina(1);

                  const value = e.target.value;

                  setRoleFiltro(value === "" ? "" : Number(value));
                }}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Todos</option>
                <option value={1}>Administrador</option>
                <option value={2}>Voluntario</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setEstadoFiltro("");
                  setRoleFiltro("");
                  setPagina(1);
                }}
                className="w-full md:w-auto px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="mb-6 rounded-lg border border-green-300 bg-green-100 p-3 text-green-700">
            {mensajeExito}
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <p className="text-gray-600">
            Cargando usuarios...
          </p>
        )}

        {/* Tabla */}
        {!loading && !error && usuarios.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No existen usuarios registrados con los filtros seleccionados.
          </div>
        )}

        {!loading && usuarios.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#003D2D] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Nombre
                    </th>

                    <th className="px-4 py-3 text-left">
                      Correo
                    </th>

                    <th className="px-4 py-3 text-left">
                      Rol
                    </th>

                    <th className="px-4 py-3 text-left">
                      Estado
                    </th>

                    <th className="px-4 py-3 text-left">
                      Fecha de registro
                    </th>

                    <th className="px-4 py-3 text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {usuario.nombre}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {usuario.email}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {obtenerNombreRol(usuario.roleId)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            usuario.estado === "ACTIVO"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {usuario.estado === "ACTIVO"
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {usuario.createdAt
                          ? new Date(
                              usuario.createdAt
                            ).toLocaleDateString("es-PE")
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditar(usuario)}
                            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 transition"
                          >
                            Editar
                          </button>

                          {usuario.estado === "ACTIVO" && (
                            <button
                              onClick={() =>
                                handleDesactivar(usuario)
                              }
                              className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 transition"
                            >
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4">
                <button
                  onClick={() =>
                    setPagina((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={pagina === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>

                <span className="text-sm text-gray-600">
                  Página {pagina} de {totalPaginas}
                </span>

                <button
                  onClick={() =>
                    setPagina((prev) =>
                      Math.min(prev + 1, totalPaginas)
                    )
                  }
                  disabled={pagina === totalPaginas}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <UsuarioForm
              usuario={usuarioSeleccionado}
              onGuardar={handleGuardar}
              onCancelar={cerrarFormulario}
            />
          </div>
        )}
      </div>
    </main>
  );
}