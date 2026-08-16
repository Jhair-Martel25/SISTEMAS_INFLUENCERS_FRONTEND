"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { horarioVoluntarioService } from "@/services/horarioVoluntarioService";
import { ApiError } from "@/services/api";
import type { DiaSemana } from "@/types/horario";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const DIAS: { corto: string; valor: DiaSemana }[] = [
    { corto: "Lun", valor: "LUNES" },
    { corto: "Mar", valor: "MARTES" },
    { corto: "Mié", valor: "MIERCOLES" },
    { corto: "Jue", valor: "JUEVES" },
    { corto: "Vie", valor: "VIERNES" },
    { corto: "Sáb", valor: "SABADO" },
    { corto: "Dom", valor: "DOMINGO" },
];

interface HorarioAcumulado {
    diaCorto: string;
    diaSemana: DiaSemana;
    horaInicio: string;
    horaFin: string;
}

export default function RegistroVoluntarioPage() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Día que se está configurando en este momento
    const [diaActual, setDiaActual] = useState<{ corto: string; valor: DiaSemana } | null>(null);
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");

    // Tabla de horarios ya agregados
    const [horariosAcumulados, setHorariosAcumulados] = useState<HorarioAcumulado[]>([]);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mostrarExito, setMostrarExito] = useState(false);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const seleccionarDia = (dia: { corto: string; valor: DiaSemana }) => {
        setDiaActual(dia);
        setError(null);
    };

    const agregarHorario = () => {
        setError(null);

        if (!diaActual) {
            setError("Selecciona un día antes de agregarlo.");
            return;
        }
        if (!horaInicio || !horaFin) {
            setError("Completa la hora de inicio y la hora de fin para este día.");
            return;
        }
        if (horaInicio >= horaFin) {
            setError("La hora de inicio debe ser antes que la hora de fin.");
            return;
        }
        if (horariosAcumulados.some((h) => h.diaSemana === diaActual.valor)) {
            setError(`Ya agregaste un horario para los ${diaActual.corto}. Quítalo de la tabla si quieres cambiarlo.`);
            return;
        }

        setHorariosAcumulados([
            ...horariosAcumulados,
            {
                diaCorto: diaActual.corto,
                diaSemana: diaActual.valor,
                horaInicio,
                horaFin,
            },
        ]);

        // Limpiar para el siguiente día
        setDiaActual(null);
        setHoraInicio("");
        setHoraFin("");
    };

    const quitarHorario = (diaSemana: DiaSemana) => {
        setHorariosAcumulados(horariosAcumulados.filter((h) => h.diaSemana !== diaSemana));
    };

    const guardarVoluntario = async () => {
        setError(null);

        if (horariosAcumulados.length === 0) {
            setError("Agrega al menos un día con su horario antes de guardar.");
            return;
        }

        setGuardando(true);
        try {
            await Promise.all(
                horariosAcumulados.map((h) =>
                    horarioVoluntarioService.crear({
                        diaSemana: h.diaSemana,
                        horaInicio: h.horaInicio,
                        horaFin: h.horaFin,
                    })
                )
            );
            setMostrarExito(true);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof ApiError
                    ? err.message
                    : "No se pudo guardar el horario del voluntario."
            );
        } finally {
            setGuardando(false);
        }
    };

    const cerrarExitoYRegresar = () => {
        setMostrarExito(false);
        router.push("/voluntarios/gestion");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-green-50 py-10 px-6">
            <div className="max-w-6xl mx-auto">
               {/* Encabezado */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-sm text-gray-500">
                            Voluntarios &gt; Nuevo Registro
                        </p>
                        <h1 className="text-4xl font-bold text-[#003D2D] mt-2">
                            Registro de Voluntario -
                            <br />
                            Sembrando Perú
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                            Cancelar
                        </Button>

                        <Button onClick={guardarVoluntario} disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar Voluntario"}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Información Personal */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            👤
                        </span>
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField
                            label="Nombre completo"
                            placeholder="Ej. Juan Pérez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <InputField
                            label="Correo corporativo"
                            type="email"
                            placeholder="juan@sembrandoperu.org"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                    </div>
                    <div className="mt-8">
                        <label className="block mb-3 text-sm font-medium text-gray-700">
                            Fotografía de perfil
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center text-gray-500 hover:border-[#003D2D] transition">
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleImage}
                                className="hidden"
                                id="foto"
                            />
                            <label htmlFor="foto" className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-36 h-36 rounded-full object-cover" />
                                ) : (
                                    <>
                                        <span className="text-4xl">☁️</span>
                                        <span className="font-medium">
                                            Arrastra una imagen o haz clic para subir
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            JPG, PNG hasta 5MB
                                        </span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Disponibilidad */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            📅
                        </span>
                        Disponibilidad
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 mb-8">
                        Selecciona un día, define su horario y agrégalo a la lista. Repite para cada día disponible.
                    </p>

                    {/* Paso 1: elegir el día */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            1. Elige un día
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {DIAS.map((dia) => {
                                const yaAgregado = horariosAcumulados.some((h) => h.diaSemana === dia.valor);
                                const seleccionado = diaActual?.valor === dia.valor;
                                return (
                                    <button
                                        key={dia.valor}
                                        type="button"
                                        disabled={yaAgregado}
                                        onClick={() => seleccionarDia(dia)}
                                        className={`px-5 py-2 rounded-lg transition-all duration-300 ${
                                            yaAgregado
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border"
                                                : seleccionado
                                                ? "bg-[#003D2D] text-white"
                                                : "border hover:border-[#003D2D]"
                                        }`}
                                    >
                                        {dia.corto}
                                        {yaAgregado && " ✓"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Paso 2: hora para el día elegido */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            2. Define el horario {diaActual ? `para ${diaActual.corto}` : ""}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    Hora de inicio
                                </label>
                                <input
                                    type="time"
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                    disabled={!diaActual}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D2D] transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    Hora de fin
                                </label>
                                <input
                                    type="time"
                                    value={horaFin}
                                    onChange={(e) => setHoraFin(e.target.value)}
                                    disabled={!diaActual}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D2D] transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={agregarHorario}
                                disabled={!diaActual}
                                className="bg-[#003D2D] text-white px-5 py-3 rounded-xl hover:bg-[#0B5E47] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                + Agregar día
                            </button>
                        </div>
                    </div>

                    {/* Tabla de horarios acumulados */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            3. Días agregados
                        </label>
                        {horariosAcumulados.length === 0 ? (
                            <p className="text-sm text-gray-400 border border-dashed rounded-xl px-4 py-6 text-center">
                                Todavía no has agregado ningún día.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-medium">Día</th>
                                            <th className="text-left px-4 py-3 font-medium">Hora inicio</th>
                                            <th className="text-left px-4 py-3 font-medium">Hora fin</th>
                                            <th className="text-right px-4 py-3 font-medium">Quitar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {horariosAcumulados.map((h) => (
                                            <tr key={h.diaSemana}>
                                                <td className="px-4 py-3 font-medium text-gray-800">{h.diaCorto}</td>
                                                <td className="px-4 py-3 text-gray-600">{h.horaInicio}</td>
                                                <td className="px-4 py-3 text-gray-600">{h.horaFin}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => quitarHorario(h.diaSemana)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                    >
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de éxito */}
            {mostrarExito && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                            ✅
                        </div>
                        <h3 className="text-xl font-bold text-[#003D2D] mb-2">
                            Voluntario registrado exitosamente
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Se guardaron {horariosAcumulados.length} día(s) de disponibilidad.
                        </p>
                        <Button onClick={cerrarExitoYRegresar} className="w-full">
                            Aceptar
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}