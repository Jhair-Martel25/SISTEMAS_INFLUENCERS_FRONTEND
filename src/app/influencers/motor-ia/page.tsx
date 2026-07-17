"use client";

import { useState } from "react";
import { consultaIAService } from "@/services/consultaIAService";
import type {
  ConsultaIAInput,
  ConsultaIAResultado,
  InfluencerSugerido,
  RangoSeguidores,
} from "@/types/consultaIA";

export default function MotorIAPage() {
  const [prompt, setPrompt] = useState("");
  const [objetivoBusqueda, setObjetivoBusqueda] = useState("");
  const [rangoSeguidores, setRangoSeguidores] = useState<RangoSeguidores | "">("");
  const [cantidadMinima, setCantidadMinima] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [resultado, setResultado] = useState<ConsultaIAResultado | null>(null);
  const [sugerencias, setSugerencias] = useState<InfluencerSugerido[]>([]);

  const handleGenerarIA = async () => {
    setMensajeError("");
    setMensajeExito("");
    
    if (!prompt.trim()) {
      setMensajeError("Debes escribir un prompt para realizar la búsqueda.");
      return;
    }

    // 💡 SOLUCIÓN: Limpiar resultados previos antes de la nueva carga
    setResultado(null);
    setSugerencias([]);

    const payload: ConsultaIAInput = {
      prompt,
      objetivoBusqueda: objetivoBusqueda || undefined,
      rangoSeguidores: rangoSeguidores || undefined,
      cantidadMinima: cantidadMinima || 20, // Previene enviar 0 o NaN
    };

    try {
      setLoading(true);
      const response = await consultaIAService.generar(payload);
      setResultado(response);
      setSugerencias(response.sugerencias || []);
      setMensajeExito("La búsqueda se realizó correctamente.");
      
      setTimeout(() => {
        setMensajeExito("");
      }, 3500);
    } catch (error) {
      console.error(error);
      setMensajeError("No fue posible generar la búsqueda mediante IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003D2D]">Motor IA de Captación</h1>
          <p className="text-gray-600 mt-2">
            Genera estrategias de impacto social mediante análisis inteligente de audiencias.
          </p>
        </div>

        {/* Mensajes */}
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

        {/* Prompt */}
        <div className="mb-6">
          <label htmlFor="prompt-ai" className="block mb-2 font-medium text-gray-700">
            ★ Prompt Inteligente
          </label>
          <textarea
            id="prompt-ai"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe el perfil del influencer que deseas encontrar..."
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="objetivo" className="block mb-2 font-medium">Objetivo de Búsqueda</label>
            <select
              id="objetivo"
              value={objetivoBusqueda}
              onChange={(e) => setObjetivoBusqueda(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Seleccionar objetivo</option>
              <option value="Reforestación">Reforestación</option>
              <option value="Medio ambiente">Medio ambiente</option>
              <option value="Impacto Social">Impacto Social</option>
            </select>
          </div>

          <div>
            <label htmlFor="seguidores" className="block mb-2 font-medium">Seguidores</label>
            <select
              id="seguidores"
              value={rangoSeguidores}
              onChange={(e) => setRangoSeguidores(e.target.value as RangoSeguidores | "")}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Seleccionar rango</option>
              <option value="0-10k">0 - 10k</option>
              <option value="10k-50k">10k - 50k</option>
              <option value="50k+">50k+</option>
            </select>
          </div>

          <div>
            <label htmlFor="cantidad" className="block mb-2 font-medium">Cantidad mínima</label>
            <input
              id="cantidad"
              type="number"
              value={cantidadMinima || ""}
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                setCantidadMinima(val === "" ? 0 : Number(val));
              }}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleGenerarIA}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generando..." : "Generar IA"}
          </button>
        </div>

        {/* Resultados */}
        <div>
          <h2 className="text-xl font-semibold mb-5">Resultados Generados</h2>
          
          {loading ? (
            <div className="border rounded-lg bg-gray-50 p-10 text-center">
              <p className="text-lg font-medium text-gray-700">
                Generando recomendaciones mediante IA...
              </p>
            </div>
          ) : sugerencias.length === 0 ? (
            <div className="border rounded-lg p-8 bg-gray-50 text-center">
              <p className="text-gray-500">
                Los influencers sugeridos por la IA aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sugerencias.map((influencer, index) => (
                <div
                  key={influencer.usuarioIG || index} // 💡 MEJORA: Usar ID único si existe en vez de index
                  className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#003D2D]">
                        {influencer.nombreCompleto}
                      </h3>
                      <p className="text-green-700 font-medium">@{influencer.usuarioIG}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-sm text-gray-500">Seguidores</p>
                      <p className="font-semibold">{influencer.seguidores}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Engagement</p>
                      <p className="font-semibold">{influencer.engagement}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Temática</p>
                    <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 mt-2 text-sm">
                      {influencer.tematica}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Perfil</p>
                    <a
                      href={influencer.linkPerfil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {influencer.linkPerfil}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Justificación de la IA</p>
                    <p className="bg-gray-50 border rounded-lg p-4 text-gray-700 leading-relaxed">
                      {influencer.justificacion}
                    </p>
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