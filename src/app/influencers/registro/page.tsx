"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { influencersService } from "@/services/influencersService";
import type {
  CrearInfluencerInput,
  EstadoValidacion,
} from "@/types/influencer";

interface FormData {
  nombre: string;
  usuarioIg: string;
  linkIg: string;
  email: string;
  phone: string;
  seguidores: string;
  cantidad_post: string;
  biografia: string;
  mensajePersonalizado: string;
  estadoValidacion: EstadoValidacion;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  nombre: "",
  usuarioIg: "",
  linkIg: "",
  email: "",
  phone: "",
  seguidores: "",
  cantidad_post: "",
  biografia: "",
  mensajePersonalizado: "",
  estadoValidacion: "PENDIENTE",
};

export default function RegistroInfluencerPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [statusMessage, setStatusMessage] =
    useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpia el error de ese campo apenas
    // el usuario vuelve a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (
    data: FormData
  ): FormErrors => {
    const newErrors: FormErrors = {};

    // Nombre
    if (!data.nombre.trim()) {
      newErrors.nombre =
        "El nombre completo es obligatorio.";
    }

    // Usuario de Instagram
    if (!data.usuarioIg.trim()) {
      newErrors.usuarioIg =
        "El usuario de Instagram es obligatorio.";
    } else if (
      !/^@?[a-zA-Z0-9._]{1,30}$/.test(
        data.usuarioIg.trim()
      )
    ) {
      newErrors.usuarioIg =
        "Ingresa un usuario de Instagram válido.";
    }

    // Link de Instagram
    if (!data.linkIg.trim()) {
      newErrors.linkIg =
        "El link de Instagram es obligatorio.";
    } else {
      try {
        const url = new URL(
          data.linkIg.trim()
        );

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          newErrors.linkIg =
            "El link debe iniciar con http:// o https://";
        }
      } catch {
        newErrors.linkIg =
          "Ingresa una URL válida de Instagram.";
      }
    }

    // Correo electrónico
    if (data.email.trim()) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          data.email.trim()
        )
      ) {
        newErrors.email =
          "Ingresa un correo electrónico válido.";
      }
    }

    // Teléfono
    if (
      data.phone.trim() &&
      !/^\+?[0-9\s-]{7,15}$/.test(
        data.phone.trim()
      )
    ) {
      newErrors.phone =
        "Ingresa un teléfono válido (solo números, espacios o guiones).";
    }

    // Seguidores
    if (data.seguidores.trim()) {
      if (
        !/^\d+(\.\d+)?[kKmM]?$/.test(
          data.seguidores.trim()
        )
      ) {
        newErrors.seguidores =
          "Formato inválido. Usa números, ej. 150k, 1.5k o 90000.";
      }
    }

    // Cantidad de publicaciones
    if (data.cantidad_post.trim()) {
      if (
        !/^\d+$/.test(
          data.cantidad_post.trim()
        )
      ) {
        newErrors.cantidad_post =
          "Ingresa únicamente un número entero.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSubmitStatus("idle");

    const validationErrors =
      validate(formData);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setSubmitStatus("error");

      setStatusMessage(
        "Revisa los campos marcados en rojo antes de continuar."
      );

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 4000);

      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CrearInfluencerInput = {
        nombre: formData.nombre.trim(),

        usuarioIg: formData.usuarioIg
          .trim()
          .replace(/^@/, ""),

        linkIg: formData.linkIg.trim(),

        email:
          formData.email.trim() || undefined,

        phone:
          formData.phone.trim() || undefined,

        seguidores:
          formData.seguidores.trim() || undefined,

        cantidad_post:
          formData.cantidad_post.trim() ||
          undefined,

        biografia:
          formData.biografia.trim() ||
          undefined,

        mensajePersonalizado:
          formData.mensajePersonalizado.trim() ||
          undefined,

        estadoValidacion:
          formData.estadoValidacion,
      };

      const influencer =
        await influencersService.crear(
          payload
        );

      console.log(
        "Influencer registrado:",
        influencer
      );

      setSubmitStatus("success");

      setStatusMessage(
        "Influencer registrado correctamente."
      );

      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error(
        "Error al registrar influencer:",
        error
      );

      setSubmitStatus("error");

      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage(
          "Ocurrió un error al registrar el influencer. Intenta nuevamente."
        );
      }
    } finally {
      setIsSubmitting(false);

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 4000);
    }
  };

const handleCancel = () => {
  setFormData(initialFormData);
  setErrors({});
  setSubmitStatus("idle");
  router.push("/influencers/gestion");
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

            {/* Nombre */}
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
                className={`w-full border rounded-lg p-3 ${errors.nombre
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              {errors.nombre && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Usuario Instagram */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                USUARIO DE IG
              </label>

              <input
                type="text"
                name="usuarioIg"
                value={formData.usuarioIg}
                onChange={handleChange}
                placeholder="@usuario"
                className={`w-full border rounded-lg p-3 ${errors.usuarioIg
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              {errors.usuarioIg && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.usuarioIg}
                </p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                CORREO ELECTRÓNICO
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={`w-full border rounded-lg p-3 ${errors.email
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                TELÉFONO (OPCIONAL)
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+51..."
                className={`w-full border rounded-lg p-3 ${errors.phone
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone}
                </p>
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

            {/* Seguidores */}
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
                className={`w-full border rounded-lg p-3 ${errors.seguidores
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              <p className="text-xs text-gray-400 mt-1">
                Ingresa el número total de seguidores en la red principal.
              </p>

              {errors.seguidores && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.seguidores}
                </p>
              )}
            </div>

            {/* Cantidad de publicaciones */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                CANTIDAD DE PUBLICACIONES
              </label>

              <input
                type="text"
                name="cantidad_post"
                value={formData.cantidad_post}
                onChange={handleChange}
                placeholder="Ej. 120"
                className={`w-full border rounded-lg p-3 ${errors.cantidad_post
                  ? "border-red-400"
                  : "border-gray-300"
                  }`}
              />

              <p className="text-xs text-gray-400 mt-1">
                Ingresa la cantidad total de publicaciones del perfil.
              </p>

              {errors.cantidad_post && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.cantidad_post}
                </p>
              )}
            </div>

            {/* Link de Instagram */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                LINK DEL PERFIL DE INSTAGRAM
              </label>

              <input
                type="url"
                name="linkIg"
                value={formData.linkIg}
                onChange={handleChange}
                placeholder="https://instagram.com/usuario"
                className={`w-full border rounded-lg p-3 ${errors.linkIg
                    ? "border-red-400"
                    : "border-gray-300"
                  }`}
              />

              <p className="text-xs text-gray-400 mt-1">
                Ingresa el enlace completo del perfil de Instagram.
              </p>

              {errors.linkIg && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.linkIg}
                </p>
              )}
            </div>

            {/* Biografía */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                BIOGRAFÍA
              </label>

              <textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleChange}
                placeholder="Biografía del influencer..."
                rows={4}
                className={`w-full border rounded-lg p-3 resize-none ${errors.biografia
                    ? "border-red-400"
                    : "border-gray-300"
                  }`}
              />

              {errors.biografia && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.biografia}
                </p>
              )}
            </div>

            {/* Mensaje personalizado */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                MENSAJE PERSONALIZADO
              </label>

              <textarea
                name="mensajePersonalizado"
                value={formData.mensajePersonalizado}
                onChange={handleChange}
                placeholder="Mensaje personalizado para el influencer..."
                rows={4}
                className={`w-full border rounded-lg p-3 resize-none ${errors.mensajePersonalizado
                    ? "border-red-400"
                    : "border-gray-300"
                  }`}
              />

              <p className="text-xs text-gray-400 mt-1">
                Mensaje que podrá utilizarse posteriormente para el
                contacto con el influencer.
              </p>

              {errors.mensajePersonalizado && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.mensajePersonalizado}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Bloque 3: Estado de validación */}
        <div>
          <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
            Gestión
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Estado de validación */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                ESTADO DE VALIDACIÓN
              </label>

              <select
                name="estadoValidacion"
                value={formData.estadoValidacion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              >
                <option value="PENDIENTE">
                  Pendiente
                </option>

                <option value="VALIDADO">
                  Validado
                </option>

                <option value="RECHAZADO">
                  Rechazado
                </option>
              </select>

              <p className="text-xs text-gray-400 mt-1">
                Selecciona el estado actual de validación del influencer.
              </p>
            </div>

          </div>
        </div>

        {/* Botones */}
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
            {isSubmitting
              ? "Guardando..."
              : "Guardar"}
          </button>

        </div>

      </form>

    </div>
  </main>
);
}