"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { plantillasService } from "@/features/plantillas/services/plantillas.service";
import type { Plantilla, CrearPlantillaInput, } from "@/types/plantilla";
import PlantillaForm from "@/components/plantillas/PlantillaForm";

export default function GestionPlantillas() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [plantillaSeleccionada, setPlantillaSeleccionada,] = useState<Plantilla | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function cargarPlantillas() {
    try {
      setLoading(true);
      setError("");
      const data = await plantillasService.listar();
      setPlantillas(data);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las plantillas.");
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(plantilla: Plantilla) {
    setPlantillaSeleccionada(plantilla);
    setMostrarFormulario(true);
  }

  async function handleEliminar(id: string) {
    const confirmar = confirm(
      "¿Deseas eliminar esta plantilla?"
    );
    if (!confirmar) return;
    try {
      await plantillasService.eliminar(id);

      setMensajeExito("Plantilla eliminada correctamente.");

      await cargarPlantillas();

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("No fue posible eliminar la plantilla.");
    }
  }

  // CORRECCIÓN: Tipo cambiado a CrearPlantillaInput
  async function handleGuardar(data: CrearPlantillaInput) {
    try {
      if (plantillaSeleccionada) {
        await plantillasService.actualizar(
          plantillaSeleccionada.id,
          data
        );

        setMensajeExito("Plantilla actualizada correctamente.");
      } else {
        await plantillasService.crear(data);

        setMensajeExito("Plantilla creada correctamente.");
      }

      setMostrarFormulario(false);
      setPlantillaSeleccionada(null);

      await cargarPlantillas();

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la plantilla.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Patrón legacy de carga; se migrará a TanStack Query en Fase 2.
    void cargarPlantillas();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
     <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003D2D]">
              Gestión de Plantillas
            </h1>

            <p className="text-gray-600 mt-2">
              Administra las plantillas utilizadas por el sistema.
            </p>
          </div>

          <button
            onClick={() => {
              setPlantillaSeleccionada(null);
              setMostrarFormulario(true);
            }}
            className="rounded-lg bg-[#003D2D] px-5 py-2 text-white font-medium hover:bg-[#00553f] transition"
          >
            + Nueva plantilla
          </button>
        </div>

        {/* CORRECCIÓN: Renderizado condicional del Formulario (ej. como Modal de Tailwind) */}
        {mostrarFormulario && (
          <div className="bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <PlantillaForm
                plantilla={plantillaSeleccionada}
                onGuardar={handleGuardar}
                onCancelar={() => {
                  setMostrarFormulario(false);
                  setPlantillaSeleccionada(null);
                }}
              />
            </div>
          </div>
        )}

        {loading && <p className="mt-6 text-gray-600">Cargando información...</p>}

        {error && (
          <div className="mt-6 rounded-md border border-red-300 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {mensajeExito && (
          <div className="mt-6 rounded-md border border-green-300 bg-green-100 p-3 text-green-700">
            {mensajeExito}
          </div>
        )}

        {!loading && !error && plantillas.length === 0 && (
          <p className="mt-6 text-gray-500"> No existen plantillas registradas. </p>
        )}

        {!loading && !error && plantillas.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#003D2D] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Asunto</th>
                  <th className="px-4 py-3 text-left">Contenido</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map((plantilla) => (
                  <tr key={plantilla.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{plantilla.nombre}</td>
                    <td className="px-4 py-3">{plantilla.asunto || "-"}</td>
                    <td className="px-4 py-3 max-w-sm truncate">{plantilla.cuerpo}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditar(plantilla)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(plantilla.id)}
                          className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}