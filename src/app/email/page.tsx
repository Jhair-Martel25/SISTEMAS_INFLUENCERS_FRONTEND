"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emailService } from "@/features/email/services/email.service";

export default function EmailPage() {
  const router = useRouter();

  const [influencerId, setInfluencerId] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Datos simulados mientras el backend expone los endpoints
  const influencers = [
    { id: "1", nombre: "Cristian Salazar" },
    { id: "2", nombre: "Yamile Nicole" },
    { id: "3", nombre: "Pedro Rojas" },
  ];

  const plantillas = [
    { id: "1", nombre: "Invitación a reunión" },
    { id: "2", nombre: "Seguimiento de contacto" },
    { id: "3", nombre: "Confirmación de reunión" },
  ];

  const handleEnviar = async () => {
    if (!influencerId || !plantillaId) {
      alert("Debes seleccionar un influencer y una plantilla.");
      return;
    }

    try {
      setEnviando(true);

      const resultado = await emailService.enviar({
        influencerId,
        plantillaId,
      });

      if (resultado.exitoso) {
        alert(`Correo enviado correctamente a ${resultado.email}`);
      } else {
        alert(resultado.error || "No se pudo enviar el correo.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al enviar el correo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Enviar Email
        </h1>

        <p className="text-gray-600 mb-6">
          Solo los administradores pueden enviar correos a los influencers.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Influencer
            </label>
            <select
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Selecciona un influencer</option>
              {influencers.map((inf) => (
                <option key={inf.id} value={inf.id}>
                  {inf.nombre}
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Selecciona una plantilla</option>
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
            disabled={enviando}
            className="px-5 py-3 rounded-lg bg-green-700 text-white hover:bg-green-800 transition disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar Email"}
          </button>
        </div>
      </div>
    </div>
  );
}