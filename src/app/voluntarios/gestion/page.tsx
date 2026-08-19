"use client";

import { useEffect, useState } from "react";
import { Plus, CalendarPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usuariosService } from "@/services/usuariosService";
import { horarioVoluntarioService } from "@/services/horarioVoluntarioService";
import RutaProtegida from "@/components/auth/RutaProtegida";
import { ApiError } from "@/services/api";
import type { Usuario } from "@/types/usuario";
import type { Horario, DiaSemana } from "@/types/horario";

const ABREVIATURA_DIA: Record<DiaSemana, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIERCOLES: "Mié",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sáb",
    DOMINGO: "Dom",
};

const ORDEN_DIA: Record<DiaSemana, number> = {
    LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6, DOMINGO: 7,
};

function iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

export default function GestionVoluntariosPage() {
    const router = useRouter();
    const [voluntarios, setVoluntarios] = useState<Usuario[]>([]);
    const [horariosPorVoluntario, setHorariosPorVoluntario] = useState<Record<string, Horario[]>>({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function cargarDatos() {
            setCargando(true);
            setError(null);
            try {
                const [listaVoluntarios, listaHorarios] = await Promise.all([
                    usuariosService.listarVoluntarios(),
                    horarioVoluntarioService.listar(),
                ]);

                setVoluntarios(listaVoluntarios);

                const agrupado: Record<string, Horario[]> = {};
                for (const horario of listaHorarios) {
                    if (!agrupado[horario.voluntarioId]) {
                        agrupado[horario.voluntarioId] = [];
                    }
                    agrupado[horario.voluntarioId].push(horario);
                }
                for (const id in agrupado) {
                    agrupado[id].sort((a, b) => ORDEN_DIA[a.diaSemana] - ORDEN_DIA[b.diaSemana]);
                }
                setHorariosPorVoluntario(agrupado);
            } catch (err) {
                console.error(err);
                setError(
                    err instanceof ApiError
                        ? err.message
                        : "No se pudieron cargar los voluntarios."
                );
            } finally {
                setCargando(false);
            }
        }
        void cargarDatos();
    }, []);

        return (
        <RutaProtegida rolesPermitidos={["ADMIN"]}>
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#003D2D] transition-colors duration-150 mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#003D2D]">
                            Gestión de Voluntarios
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Consulta los voluntarios registrados y su disponibilidad configurada.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/voluntarios/registro")}
                            className="bg-[#003D2D] text-white px-5 py-3 rounded-xl hover:bg-[#0B5E47] transition-colors duration-200 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Nuevo voluntario
                        </button>
                        <button
                            onClick={() => router.push("/reuniones/agenda")}
                            className="bg-white text-[#003D2D] border border-[#003D2D] px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                        >
                            <CalendarPlus size={18} />
                            Agendar voluntario
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Voluntario</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponibilidad (días y horario)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-400">
                                        Cargando voluntarios...
                                    </td>
                                </tr>
                            ) : voluntarios.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-400">
                                        No hay voluntarios registrados todavía.
                                    </td>
                                </tr>
                            ) : (
                                voluntarios.map((voluntario) => {
                                    const horarios = horariosPorVoluntario[voluntario.id] ?? [];
                                    return (
                                        <tr key={voluntario.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                                        {iniciales(voluntario.nombre)}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900">{voluntario.nombre}</p>
                                                        <p className="text-xs text-gray-500">{voluntario.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                                    voluntario.estado === "ACTIVO"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {voluntario.estado === "ACTIVO" ? "🟢 Activo" : "⚪ Inactivo"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {horarios.length === 0 ? (
                                                    <span className="text-sm text-gray-400">Sin horario configurado</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {horarios.map((h) => (
                                                            <span
                                                                key={h.id}
                                                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md whitespace-nowrap"
                                                            >
                                                                {ABREVIATURA_DIA[h.diaSemana]} {h.horaInicio}-{h.horaFin}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
        </RutaProtegida>
    );
}