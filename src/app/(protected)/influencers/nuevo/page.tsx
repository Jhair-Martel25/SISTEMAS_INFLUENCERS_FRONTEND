"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  nombre: string;
  usuarioIG: string;
  correo: string;
  telefono: string;
  pais: string;
  ciudad: string;
  seguidores: string;
  engagement: string;
  tematica: string;
  linkPerfil: string;
  estadoInicial: string;
  voluntarioEncargado: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  nombre: "",
  usuarioIG: "",
  correo: "",
  telefono: "",
  pais: "",
  ciudad: "",
  seguidores: "",
  engagement: "",
  tematica: "",
  linkPerfil: "",
  estadoInicial: "Pendiente",
  voluntarioEncargado: "",
};

export default function RegistroInfluencerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el error de ese campo apenas el usuario vuelve a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    // Nombre completo (obligatorio)
    if (!data.nombre.trim()) {
      newErrors.nombre = "El nombre completo es obligatorio.";
    }

    // Usuario de IG (obligatorio, debe empezar con @)
    if (!data.usuarioIG.trim()) {
      newErrors.usuarioIG = "El usuario de Instagram es obligatorio.";
    } else if (!/^@[a-zA-Z0-9._]{1,30}$/.test(data.usuarioIG.trim())) {
      newErrors.usuarioIG = "Debe empezar con @ y contener solo letras, números, puntos o guiones bajos.";
    }

    // Correo (obligatorio, formato válido)
    if (!data.correo.trim()) {
      newErrors.correo = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim())) {
      newErrors.correo = "Ingresa un correo electrónico válido.";
    }

    // Teléfono (opcional, pero si se llena debe tener formato razonable)
    if (data.telefono.trim() && !/^\+?[0-9\s-]{7,15}$/.test(data.telefono.trim())) {
      newErrors.telefono = "Ingresa un teléfono válido (solo números, espacios o guiones).";
    }

    // País (obligatorio)
    if (!data.pais.trim()) {
      newErrors.pais = "El país es obligatorio.";
    }

    // Ciudad (obligatorio)
    if (!data.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es obligatoria.";
    }

    // Seguidores (obligatorio, formato tipo 150k, 1.5k, 90000)
    if (!data.seguidores.trim()) {
      newErrors.seguidores = "El número de seguidores es obligatorio.";
    } else if (!/^\d+(\.\d+)?[kKmM]?$/.test(data.seguidores.trim())) {
      newErrors.seguidores = "Formato inválido. Usa números, ej. 150k, 1.5k o 90000.";
    }

    // Engagement (obligatorio, formato tipo 4.5%)
    if (!data.engagement.trim()) {
      newErrors.engagement = "El engagement es obligatorio.";
    } else if (!/^\d+(\.\d+)?%$/.test(data.engagement.trim())) {
      newErrors.engagement = "Formato inválido. Usa un porcentaje, ej. 4.5%.";
    }

    // Temática (obligatorio)
    if (!data.tematica.trim()) {
      newErrors.tematica = "La temática es obligatoria.";
    }

   
    // Link del perfil (obligatorio, debe ser una URL válida con protocolo http/https)
     if (!data.linkPerfil.trim()) {
       newErrors.linkPerfil = "El link del perfil es obligatorio.";
      } else {
        try {
       const url = new URL(data.linkPerfil.trim());
       if (url.protocol !== "http:" && url.protocol !== "https:") {
      newErrors.linkPerfil = "El link debe iniciar con http:// o https://";
      }
     } catch {
    newErrors.linkPerfil = "Ingresa una URL válida (debe empezar con https://).";
     }
}

    // Voluntario encargado (obligatorio)
    if (!data.voluntarioEncargado.trim()) {
      newErrors.voluntarioEncargado = "Debes asignar un voluntario encargado.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus("error");
      setStatusMessage("Revisa los campos marcados en rojo antes de continuar.");
      setTimeout(() => setSubmitStatus("idle"), 4000);
      return;
    }

    setIsSubmitting(true);

    // Estructura final lista para enviar al backend (aún sin conectar)
    const payload = {
      nombre: formData.nombre.trim(),
      usuarioIG: formData.usuarioIG.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono.trim() || null,
      pais: formData.pais.trim(),
      ciudad: formData.ciudad.trim(),
      seguidores: formData.seguidores.trim(),
      engagement: formData.engagement.trim(),
      tematica: formData.tematica.trim(),
      linkPerfil: formData.linkPerfil.trim(),
      estadoInicial: formData.estadoInicial,
      voluntarioEncargado: formData.voluntarioEncargado.trim(),
    };

    try {
      // Aquí iría la conexión real al backend, por ejemplo:
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/influencers`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) throw new Error("Error al registrar el influencer");

      // Por ahora, simulamos el envío con un delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Payload listo para enviar al backend:", payload);

      setSubmitStatus("success");
      setStatusMessage("Influencer registrado correctamente.");
      setFormData(initialFormData);
      setErrors({});
    } catch {
      setSubmitStatus("error");
      setStatusMessage("Ocurrió un error al registrar el influencer. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 4000);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitStatus("idle");
    router.push("/influencers");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Registro de Influencer
          </h1>

          <p className="text-gray-600 mt-2">
            Ingresa los datos de perfil para añadirlo al sistema.
          </p>
        </div>

        {/* Banner de éxito / error */}
        {submitStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {statusMessage}
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>

          {/* Bloque 1: Información Personal */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Información Personal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  NOMBRE COMPLETO
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Andrea Paz"
                  className={`w-full border rounded-lg p-3 ${
                    errors.nombre ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  USUARIO DE IG
                </label>
                <input
                  type="text"
                  name="usuarioIG"
                  value={formData.usuarioIG}
                  onChange={handleChange}
                  placeholder="@usuario"
                  className={`w-full border rounded-lg p-3 ${
                    errors.usuarioIG ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.usuarioIG && (
                  <p className="text-xs text-red-500 mt-1">{errors.usuarioIG}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  className={`w-full border rounded-lg p-3 ${
                    errors.correo ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.correo && (
                  <p className="text-xs text-red-500 mt-1">{errors.correo}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  TELÉFONO (OPCIONAL)
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+51..."
                  className={`w-full border rounded-lg p-3 ${
                    errors.telefono ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  PAÍS
                </label>
                <input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  placeholder="Perú"
                  className={`w-full border rounded-lg p-3 ${
                    errors.pais ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.pais && (
                  <p className="text-xs text-red-500 mt-1">{errors.pais}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  CIUDAD
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Lima"
                  className={`w-full border rounded-lg p-3 ${
                    errors.ciudad ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.ciudad && (
                  <p className="text-xs text-red-500 mt-1">{errors.ciudad}</p>
                )}
              </div>

            </div>
          </div>

          {/* Bloque 2: Redes Sociales */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Redes Sociales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  SEGUIDORES
                </label>
                <input
                  type="text"
                  name="seguidores"
                  value={formData.seguidores}
                  onChange={handleChange}
                  placeholder="Ej. 150k"
                  className={`w-full border rounded-lg p-3 ${
                    errors.seguidores ? "border-red-400" : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ingresa el número total de seguidores en la red principal.
                </p>
                {errors.seguidores && (
                  <p className="text-xs text-red-500 mt-1">{errors.seguidores}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  ENGAGEMENT
                </label>
                <input
                  type="text"
                  name="engagement"
                  value={formData.engagement}
                  onChange={handleChange}
                  placeholder="Ej. 4.5%"
                  className={`w-full border rounded-lg p-3 ${
                    errors.engagement ? "border-red-400" : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Porcentaje promedio de interacción sobre el total de seguidores.
                </p>
                {errors.engagement && (
                  <p className="text-xs text-red-500 mt-1">{errors.engagement}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  TEMÁTICA
                </label>
                <input
                  type="text"
                  name="tematica"
                  value={formData.tematica}
                  onChange={handleChange}
                  placeholder="Ej. Ambiental, Social..."
                  className={`w-full border rounded-lg p-3 ${
                    errors.tematica ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.tematica && (
                  <p className="text-xs text-red-500 mt-1">{errors.tematica}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  LINK DEL PERFIL
                </label>
                <input
                  type="url"
                  name="linkPerfil"
                  value={formData.linkPerfil}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={`w-full border rounded-lg p-3 ${
                    errors.linkPerfil ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.linkPerfil && (
                  <p className="text-xs text-red-500 mt-1">{errors.linkPerfil}</p>
                )}
              </div>

            </div>
          </div>

          {/* Bloque 3: Gestión */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Gestión
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  ESTADO INICIAL
                </label>

                <select
                  name="estadoInicial"
                  value={formData.estadoInicial}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 bg-white"
                >
                  <option>Pendiente</option>
                  <option>Validado</option>
                  <option>Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  VOLUNTARIO ENCARGADO DE LA VALIDACIÓN
                </label>

                <input
                  type="text"
                  name="voluntarioEncargado"
                  list="lista-voluntarios"
                  value={formData.voluntarioEncargado}
                  onChange={handleChange}
                  placeholder="Escriba el nombre del voluntario..."
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                    errors.voluntarioEncargado ? "border-red-400" : "border-gray-300"
                  }`}
                />

                <datalist id="lista-voluntarios">
                  <option value="Mateo Rivera" />
                  <option value="Mateo García" />
                  <option value="Mateo Pérez" />
                  <option value="Elena Salas" />
                  <option value="Carlos Pardo" />
                  <option value="Luis Mendoza" />
                  <option value="María Fernández" />
                  <option value="Ana Torres" />
                  <option value="José Ramírez" />
                  <option value="Lucía Herrera" />
                </datalist>

                <p className="text-xs text-gray-400 mt-1">
                  Escriba el nombre del voluntario. Mientras escribe, el sistema mostrará sugerencias disponibles.
                </p>
                {errors.voluntarioEncargado && (
                  <p className="text-xs text-red-500 mt-1">{errors.voluntarioEncargado}</p>
                )}
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}