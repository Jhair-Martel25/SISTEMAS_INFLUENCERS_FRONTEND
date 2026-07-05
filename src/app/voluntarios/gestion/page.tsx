import { Plus, CalendarPlus } from "lucide-react";

export default function GestionVoluntariosPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#003D2D]">
                            Gestión de Voluntarios
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Administra disponibilidad, asignaciones y rendimiento del equipo.
                        </p>
                    </div>
                    <div className="flex gap-3">
                         <button className="bg-[#003D2D] text-white px-5 py-3 rounded-xl hover:bg-[#0B5E47] transition-colors duration-200 flex items-center gap-2">
                            <Plus size={18} />
                            Nuevo voluntario
                        </button>
                        <button className="bg-white text-[#003D2D] border border-[#003D2D] px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                            <CalendarPlus size={18} />
                            Agendar voluntario
                        </button>
                    </div>
                    
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Disponibles</p>
                        <p className="text-2xl font-bold text-[#003D2D] mt-1">1</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Saturados</p>
                        <p className="text-2xl font-bold text-[#003D2D] mt-1">1</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Inactivos</p>
                        <p className="text-2xl font-bold text-[#003D2D] mt-1">1</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500">Rendimiento promedio</p>
                        <p className="text-2xl font-bold text-[#003D2D] mt-1">76%</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                        <select className="border rounded-xl p-3">
                            <option>Estado</option>
                            <option>Disponible</option>
                            <option>Saturado</option>
                            <option>Inactivo</option>
                        </select>
                        <select className="border rounded-xl p-3">
                            <option>Especialidad</option>
                            <option>Reforestación</option>
                            <option>Educación</option>
                            <option>Medio Ambiente</option>
                        </select>
                        <select className="border rounded-xl p-3">
                            <option>Nivel</option>
                            <option>Junior</option>
                            <option>Intermedio</option>
                            <option>Senior</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Voluntario</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Especialidad</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponibilidad</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencers</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rendimiento</th>
                            </tr>
                         </thead>
          <tbody>
                            <tr className="border-t hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                            MR
                                        </div>
                                        <span className="text-gray-900">Mateo Rivera</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-700">
                                    Reforestación
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                        🟢 Disponible
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#20D18F] h-2 rounded-full" style={{ width: "85%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">85%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#003D2D] h-2 rounded-full" style={{ width: "60%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">12/20</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "88%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">88%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-t hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                            ES
                                        </div>
                                        <span className="text-gray-900">Elena Salas</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-700">
                                    Educación
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                        🔴 Saturado
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#20D18F] h-2 rounded-full" style={{ width: "10%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">10%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#003D2D] h-2 rounded-full" style={{ width: "100%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">28/28</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "100%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">100%</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-t hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                            CP
                                        </div>
                                        <span className="text-gray-900">Carlos Pardo</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-700">
                                    Medio Ambiente
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                        ⚪ Inactivo
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#20D18F] h-2 rounded-full" style={{ width: "0%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">0%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div className="bg-[#003D2D] h-2 rounded-full" style={{ width: "0%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">0/15</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "20%" }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">20%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}