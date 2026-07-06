export default function DisponibilidadAgendaPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#003D2D]">
            Disponibilidad y Agenda
          </h1>

          <p className="text-gray-600 mt-2">
            Consulta la disponibilidad semanal de los voluntarios y organiza las reuniones.
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">📅 Reuniones programadas</h3>
            <p className="text-4xl font-bold text-[#003D2D]">12</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">👥 Voluntarios disponibles</h3>
            <p className="text-4xl font-bold text-[#003D2D]">8</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">⏳ Pendientes</h3>
            <p className="text-4xl font-bold text-[#003D2D]">4</p>
          </div>

        </div>

        {/* Agenda semanal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">

          <h2 className="text-xl font-semibold">
            Agenda semanal
          </h2>

          <p className="text-gray-500 text-sm mt-1 mb-6">
            Visualiza las reuniones programadas durante la semana.
          </p>

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gray-100">

                <th className="p-3 text-left">Hora</th>
                <th className="p-3">Lun</th>
                <th className="p-3">Mar</th>
                <th className="p-3">Mié</th>
                <th className="p-3">Jue</th>
                <th className="p-3">Vie</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium">09:00</td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Andrea</span></td>
                <td className="p-3"></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Carlos</span></td>
                <td className="p-3"></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Lucía</span></td>
              </tr>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium">11:00</td>
                <td></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">María</span></td>
                <td></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">José</span></td>
                <td></td>
              </tr>

              <tr>
                <td className="p-3 font-medium">15:00</td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">Ocupado</span></td>
                <td></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Pedro</span></td>
                <td></td>
                <td className="p-3"><span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Ana</span></td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* Disponibilidad */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">

          <h2 className="text-xl font-semibold">
            Disponibilidad de voluntarios
          </h2>

          <p className="text-gray-500 text-sm mt-1 mb-6">
            Consulta los horarios registrados para asignar reuniones.
          </p>

          <table className="w-full">

            <thead>

              <tr className="border-b hover:bg-gray-50 transition-colors">

                <th className="text-left p-3">Voluntario</th>
                <th className="text-left p-3">Horario</th>
                <th className="text-left p-3">Estado</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">Luis Vega</td>
                <td className="p-3">
                  09:00 - 13:00
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    Disponible
                  </span>
                </td>
              </tr>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">Marta Paz</td>
                <td className="p-3">
                  10:00 - 17:00
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    Parcial
                  </span>
                </td>
              </tr>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">Fabio Ruiz</td>
                <td className="p-3">
                  08:00 - 12:00
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    No disponible
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}