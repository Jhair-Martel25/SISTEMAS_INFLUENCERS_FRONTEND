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
                        <button className="bg-[#003D2D] text-white px-5 py-3 rounded-xl">
                            + Nuevo voluntario
                        </button>
                        <button className="bg-[#003D2D] text-white px-5 py-3 rounded-xl">
                            + Agendar voluntario
                        </button>
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
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left">Voluntario</th>
                                <th className="p-4 text-left">Especialidad</th>
                                <th className="p-4 text-left">Estado</th>
                                <th className="p-4 text-left">Disponibilidad</th>
                                <th className="p-4 text-left">Influencers</th>
                                <th className="p-4 text-left">Rendimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="p-4">
                                    Mateo Rivera
                                </td>
                                <td className="p-4">
                                    Reforestación
                                </td>
                                <td className="p-4 text-green-600">
                                    Disponible
                                </td>
                                <td className="p-4">
                                    85%
                                </td>
                                <td className="p-4">
                                    12
                                </td>
                                <td className="p-4">
                                    ⭐⭐⭐⭐☆
                                </td>
                            </tr>
                            <tr className="border-t">
                                <td className="p-4">
                                    Elena Salas
                                </td>
                                <td className="p-4">
                                    Educación
                                </td>
                                <td className="p-4 text-red-500">
                                    Saturado
                                </td>
                                <td className="p-4">
                                    10%
                                </td>
                                <td className="p-4">
                                    28
                                </td>
                                <td className="p-4">
                                    ⭐⭐⭐⭐⭐
                                </td>
                            </tr>
                            <tr className="border-t">
                                <td className="p-4">
                                    Carlos Pardo
                                </td>
                                <td className="p-4">
                                    Medio Ambiente
                                </td>
                                <td className="p-4 text-gray-500">
                                    Inactivo
                                </td>
                                <td className="p-4">
                                    0%
                                </td>
                                <td className="p-4">
                                    0
                                </td>
                                <td className="p-4">
                                    ⭐☆☆☆☆
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}