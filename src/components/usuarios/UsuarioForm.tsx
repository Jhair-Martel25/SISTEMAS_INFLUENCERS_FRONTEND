"use client";

import { useEffect, useState } from "react";
import type {
  Usuario,
  CrearUsuarioInput,
  ActualizarUsuarioInput,
} from "@/types/usuario";

interface Props {
  usuario: Usuario | null;
  onGuardar: (
    data: CrearUsuarioInput | ActualizarUsuarioInput
  ) => Promise<void>;
  onCancelar: () => void;
}

export default function UsuarioForm({
  usuario,
  onGuardar,
  onCancelar,
}: Props) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [guardando, setGuardando] = useState(false);

  const [errores, setErrores] = useState({
    email: "",
    nombre: "",
    roleId: "",
  });

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email);
      setNombre(usuario.nombre);
      setRoleId(usuario.roleId);
    } else {
      setEmail("");
      setNombre("");
      setRoleId(2);
    }

    setErrores({
      email: "",
      nombre: "",
      roleId: "",
    });
  }, [usuario]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nuevosErrores = {
      email: "",
      nombre: "",
      roleId: "",
    };

    const emailLimpio = email.trim();
    const nombreLimpio = nombre.trim();

    if (!emailLimpio) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@sembrandoperu\.org$/.test(emailLimpio)) {
      nuevosErrores.email =
        "Ingresa un correo válido de @sembrandoperu.org.";
    }

    if (!nombreLimpio) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!roleId) {
      nuevosErrores.roleId = "Debes seleccionar un rol.";
    }

    if (
      nuevosErrores.email ||
      nuevosErrores.nombre ||
      nuevosErrores.roleId
    ) {
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);

    try {
      await onGuardar({
        email: emailLimpio,
        nombre: nombreLimpio,
        roleId,
      });
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
        {usuario ? "Editar usuario" : "Nuevo usuario"}
      </h2>

      <div>
        <label className="block mb-2 font-medium">
          Nombre completo
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);

            if (errores.nombre) {
              setErrores((prev) => ({
                ...prev,
                nombre: "",
              }));
            }
          }}
          className={`w-full border rounded-lg p-3 outline-none transition ${
            errores.nombre
              ? "border-red-500"
              : "border-gray-300 focus:border-[#003D2D]"
          }`}
          placeholder="Ej. Carlos Pérez"
        />

        {errores.nombre && (
          <p className="mt-1 text-sm text-red-600">
            {errores.nombre}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Correo electrónico
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);

            if (errores.email) {
              setErrores((prev) => ({
                ...prev,
                email: "",
              }));
            }
          }}
          className={`w-full border rounded-lg p-3 outline-none transition ${
            errores.email
              ? "border-red-500"
              : "border-gray-300 focus:border-[#003D2D]"
          }`}
          placeholder="usuario@sembrandoperu.org"
        />

        {errores.email && (
          <p className="mt-1 text-sm text-red-600">
            {errores.email}
          </p>
        )}

        {!usuario && (
          <p className="mt-1 text-xs text-gray-500">
            El usuario debe utilizar un correo @sembrandoperu.org.
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Rol
        </label>

        <select
          value={roleId}
          onChange={(e) => {
            setRoleId(Number(e.target.value));

            if (errores.roleId) {
              setErrores((prev) => ({
                ...prev,
                roleId: "",
              }));
            }
          }}
          className={`w-full border rounded-lg p-3 outline-none transition ${
            errores.roleId
              ? "border-red-500"
              : "border-gray-300 focus:border-[#003D2D]"
          }`}
        >
          <option value={2}>Voluntario</option>
          <option value={1}>Administrador</option>
        </select>

        {errores.roleId && (
          <p className="mt-1 text-sm text-red-600">
            {errores.roleId}
          </p>
        )}
      </div>

      {!usuario && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-sm text-gray-600">
            Se asignará una contraseña temporal al nuevo usuario.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={guardando}
          className={`px-4 py-2 rounded-lg text-white transition ${
            guardando
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