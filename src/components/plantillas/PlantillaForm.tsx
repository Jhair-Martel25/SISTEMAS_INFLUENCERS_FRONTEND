"use client";

import { useEffect, useState } from "react";
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
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({
    nombre: "",
    asunto: "",
    contenido: "",
  });

  useEffect(() => {
    if (plantilla) {
      setNombre(plantilla.nombre);
      setAsunto(plantilla.asunto || "");
      setContenido(plantilla.contenido);
    } else {
      setNombre("");
      setAsunto("");
      setContenido("");
    }
  }, [plantilla]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrores({
      nombre: "",
      asunto: "",
      contenido: "",
    });

    const nuevosErrores = {
      nombre: "",
      asunto: "",
      contenido: "",
    };

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }
    if (!asunto.trim()) {
      nuevosErrores.asunto = "El asunto es obligatorio.";
    }
    if (!contenido.trim()) {
      nuevosErrores.contenido = "El contenido es obligatorio.";
    }

    if (
      nuevosErrores.nombre ||
      nuevosErrores.asunto ||
      nuevosErrores.contenido
    ) {
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({ nombre, asunto, contenido });
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
          value={contenido}
          onChange={(e) => {
            setContenido(e.target.value);
            if (errores.contenido) {
              setErrores((prev) => ({ ...prev, contenido: "" }));
            }
          }}
          className="w-full border rounded-lg p-3"
        />
        {errores.contenido && (
          <p className="mt-1 text-sm text-red-600">{errores.contenido}</p>
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