"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { enviarEmail } from "@/services/emailService";
import { listarInfluencers } from "@/services/influencers";
import { plantillasService } from "@/services/plantillasService";
import type { Influencer } from "@/types/influencer";
import type { Plantilla } from "@/types/plantilla";

export default function EmailPage() {
  const router = useRouter();

  const [influencerId, setInfluencerId] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setErrorCarga("");
      try {
        const [respuestaInfluencers, listaPlantillas] = await Promise.all([
          listarInfluencers({ page: 1, limit: 100 }),
          plantillasService.listar(),
        ]);
        setInfluencers(respuestaInfluencers.data);
        setPlantillas(listaPlantillas);
      } catch (error) {
        console.error(error);
        setErrorCarga("No se pudieron cargar los influencers o las plantillas.");
      } finally {
        setCargando(false);
      }
    }
    void cargarDatos();
  }, []);

  const handleEnviar = async () => {
    if (!influencerId || !plantillaId) {
      alert("Debes seleccionar un influencer y una plantilla.");
      return;
    }

    try {
      setEnviando(true);

      const resultado = await enviarEmail({
        influencerId,
        plantillaId,
      });

      if (resultado.exitoso) {
        alert(`Correo enviado correctamente a ${resultado.email}`);
        setInfluencerId("");
        setPlantillaId("");
      } else {
        alert(resultado.error || "No se pudo enviar el correo.");
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Ocurrió un error al enviar el correo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Enviar Email
        </h1>

        <p className="text-gray-600 mb-6">
          Solo los administradores pueden enviar correos a los influencers.
        </p>

        {errorCarga && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {errorCarga}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Influencer
            </label>
            <select
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              disabled={cargando}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">
                {cargando ? "Cargando influencers..." : "Selecciona un influencer"}
              </option>
              {influencers.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.nombre} (@{inf.usuarioIg})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla
            </label>
            <select
              value={plantillaId}
              onChange={(e) => setPlantillaId(e.target.value)}
              disabled={cargando}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">
                {cargando ? "Cargando plantillas..." : "Selecciona una plantilla"}
              </option>
              {plantillas.map((pla) => (
                <option key={pla.id} value={pla.id}>
                  {pla.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleEnviar}
            disabled={enviando || cargando}
            className="px-5 py-3 rounded-lg bg-green-700 text-white hover:bg-green-800 transition disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar Email"}
          </button>
        </div>
      </div>
    </div>
  );
}