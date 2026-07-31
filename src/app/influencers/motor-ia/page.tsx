"use client";

import { useState, useEffect } from "react";
import { consultaIAService } from "@/services/consultaIAService";
import { plantillasService } from "@/services/plantillasService";
import type { ConsultaIAInput, ConsultaIAResultado, InfluencerSugerido } from "@/types/consultaIA";
import type { Plantilla } from "@/types/plantilla";

export default function MotorIAPage() {
  const [descripcionPrompt, setDescripcionPrompt] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [rangoSeguidores, setRangoSeguidores] = useState("");
  const [cantidadSolicitada, setCantidadSolicitada] = useState<number>(20);

  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargandoPlantillas, setCargandoPlantillas] = useState(true);

  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [influencers, setInfluencers] = useState<InfluencerSugerido[]>([]);

  // Carga las plantillas disponibles al entrar a la página (necesarias
  // porque plantillaId es obligatorio en el POST /consultas-ia real).
  useEffect(() => {
    async function cargarPlantillas() {
      try {
        const data = await plantillasService.listar();
        setPlantillas(data);
      } catch (error) {
        console.error("No se pudieron cargar las plantillas:", error);
      } finally {
        setCargandoPlantillas(false);
      }
    }
    cargarPlantillas();
  }, []);

  const handleGenerarIA = async () => {
    setMensajeError("");
    setMensajeExito("");

    if (!descripcionPrompt.trim()) {
      setMensajeError("Debes escribir un prompt para realizar la búsqueda.");
      return;
    }
    if (!plantillaId) {
      setMensajeError("Debes seleccionar una plantilla.");
      return;
    }
    if (!rangoSeguidores) {
      setMensajeError("Debes seleccionar un rango de seguidores.");
      return;
    }

    setInfluencers([]);

    const payload: ConsultaIAInput = {
      descripcionPrompt,
      cantidadSolicitada: cantidadSolicitada || 1,
      rangoSeguidores,
      plantillaId,
    };

    try {
      setLoading(true);
      console.log("Payload enviado:", payload);
      const response: ConsultaIAResultado = await consultaIAService.generar(payload);
      setInfluencers(response.influencers || []);
      setMensajeExito("La búsqueda se realizó correctamente.");
      setTimeout(() => setMensajeExito(""), 3500);
    } catch (error: any) {
      console.error("Error completo:", error);
      console.error("Respuesta backend:", error.data);

      setMensajeError(
        error.data?.mensaje ||
        error.message ||
        "No fue posible generar la búsqueda mediante IA."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003D2D]">Motor IA de Captación</h1>
          <p className="text-gray-600 mt-2">
            Genera estrategias de impacto social mediante análisis inteligente de audiencias.
          </p>
        </div>

        {mensajeError && (
          <div className="mb-6 rounded-lg bg-red-100 border border-red-300 p-4 text-red-700">
            {mensajeError}
          </div>
        )}
        {mensajeExito && (
          <div className="mb-6 rounded-lg bg-green-100 border border-green-300 p-4 text-green-700">
            {mensajeExito}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="prompt-ai" className="block mb-2 font-medium text-gray-700">
            ★ Prompt Inteligente
          </label>
          <textarea
            id="prompt-ai"
            rows={6}
            value={descripcionPrompt}
            onChange={(e) => setDescripcionPrompt(e.target.value)}
            placeholder="Describe el perfil del influencer que deseas encontrar..."
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="plantilla" className="block mb-2 font-medium">Plantilla temática</label>
            <select
              id="plantilla"
              value={plantillaId}
              onChange={(e) => setPlantillaId(e.target.value)}
              className="w-full border rounded-lg p-3"
              disabled={cargandoPlantillas}
            >
              <option value="">
                {cargandoPlantillas ? "Cargando plantillas..." : "Seleccionar plantilla"}
              </option>
              {plantillas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="seguidores" className="block mb-2 font-medium">Seguidores</label>
            <select
              id="seguidores"
              value={rangoSeguidores}
              onChange={(e) => setRangoSeguidores(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Seleccionar rango</option>
              <option value="0 - 10k">0 - 10k</option>
              <option value="10k - 50k">10k - 50k</option>
              <option value="50k+">50k+</option>
            </select>
          </div>

          <div>
            <label htmlFor="cantidad" className="block mb-2 font-medium">Cantidad solicitada</label>
            <input
              id="cantidad"
              type="number"
              value={cantidadSolicitada || ""}
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                setCantidadSolicitada(val === "" ? 0 : Number(val));
              }}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <button
            onClick={handleGenerarIA}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generando..." : "Generar IA"}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-5">Resultados Generados</h2>

          {loading ? (
            <div className="border rounded-lg bg-gray-50 p-10 text-center">
              <p className="text-lg font-medium text-gray-700">
                Generando recomendaciones mediante IA...
              </p>
            </div>
          ) : influencers.length === 0 ? (
            <div className="border rounded-lg p-8 bg-gray-50 text-center">
              <p className="text-gray-500">
                Los influencers sugeridos por la IA aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {influencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#003D2D]">
                        {influencer.nombre}
                      </h3>
                      <p className="text-green-700 font-medium">@{influencer.usuarioIg}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-sm text-gray-500">Seguidores</p>
                      <p className="font-semibold">{influencer.seguidoresGemini.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Likes</p>
                      <p className="font-semibold">{influencer.likesGemini.toLocaleString()}</p>
                    </div>
                  </div>


                  <div>
                    <p className="text-sm text-gray-500 mb-2">Perfil de Instagram</p>

                    href={influencer.linkIg}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {influencer.linkIg}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}