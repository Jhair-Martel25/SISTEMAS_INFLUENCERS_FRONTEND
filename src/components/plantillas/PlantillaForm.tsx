"use client";

import { useState } from "react";
import type { Plantilla, CrearPlantillaInput } from "@/types/plantilla"

interface Props {
  plantilla: Plantilla | null;
  onGuardar: (data: CrearPlantillaInput) => Promise<void>;
  onCancelar: () => void;
}

export default function PlantillaForm({
  plantilla,
  onGuardar,
  onCancelar,
}: Props) {
  const [nombre, setNombre] = useState(plantilla?.nombre ?? "");
  const [asunto, setAsunto] = useState(plantilla?.asunto ?? "");
  const [cuerpo, setCuerpo] = useState(plantilla?.cuerpo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({
    nombre: "",
    asunto: "",
    cuerpo: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrores({
      nombre: "",
      asunto: "",
      cuerpo: "",
    });

    const nuevosErrores = {
      nombre: "",
      asunto: "",
      cuerpo: "",
    };

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }
    if (!asunto.trim()) {
      nuevosErrores.asunto = "El asunto es obligatorio.";
    }
    if (!cuerpo.trim()) {
      nuevosErrores.cuerpo = "El contenido es obligatorio.";
    }

    if (
      nuevosErrores.nombre ||
      nuevosErrores.asunto ||
      nuevosErrores.cuerpo
    ) {
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({ nombre, asunto, cuerpo });
    } finally {
      setGuardando(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-5"
    >
      <h2 className="text-2xl font-bold text-[#003D2D]">
        {plantilla ? "Editar plantilla" : "Nueva plantilla"}
      </h2>

      <div>
        <label className="block mb-2 font-medium">Nombre</label>
        <input
          required
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (errores.nombre) {
              setErrores((prev) => ({ ...prev, nombre: "" }));
            }
          }}
          className="w-full border rounded-lg p-3"
        />
        {errores.nombre && (
          <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">Asunto</label>
        <input
          value={asunto}
          onChange={(e) => {
            setAsunto(e.target.value);
            if (errores.asunto) {
              setErrores((prev) => ({ ...prev, asunto: "" }));
            }
          }}
          className="w-full border rounded-lg p-3"
        />
        {errores.asunto && (
          <p className="mt-1 text-sm text-red-600">{errores.asunto}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">Contenido</label>
        <textarea
          required
          rows={6}
          value={cuerpo}
          onChange={(e) => {
            setCuerpo(e.target.value);
            if (errores.cuerpo) {
              setErrores((prev) => ({ ...prev, cuerpo: "" }));
            }
          }}
          className="w-full border rounded-lg p-3"
        />
        {errores.cuerpo && (
          <p className="mt-1 text-sm text-red-600">{errores.cuerpo}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 rounded-lg border"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className={`px-4 py-2 rounded-lg text-white transition ${guardando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#003D2D] hover:bg-[#00553f]"
            }`}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}