export default function DisponibilidadAgendaPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Disponibilidad y Agenda
          </h1>

          <p className="text-gray-600 mt-2">
            Consulta la disponibilidad semanal de los voluntarios y organiza las reuniones.
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Reuniones programadas</h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Voluntarios disponibles</h3>
            <p className="text-3xl font-bold mt-2">8</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-500 text-sm">Pendientes</h3>
            <p className="text-3xl font-bold mt-2">4</p>
          </div>

        </div>

        {/* Agenda semanal */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-xl font-semibold mb-6">
            Agenda Semanal
          </h2>

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

              <tr className="border-b">
                <td className="p-3 font-medium">09:00</td>
                <td className="p-3 bg-green-100 rounded">Andrea</td>
                <td className="p-3"></td>
                <td className="p-3 bg-blue-100 rounded">Carlos</td>
                <td className="p-3"></td>
                <td className="p-3 bg-green-100 rounded">Lucía</td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">11:00</td>
                <td></td>
                <td className="p-3 bg-yellow-100 rounded">María</td>
                <td></td>
                <td className="p-3 bg-green-100 rounded">José</td>
                <td></td>
              </tr>

              <tr>
                <td className="p-3 font-medium">15:00</td>
                <td className="p-3 bg-red-100 rounded">Ocupado</td>
                <td></td>
                <td className="p-3 bg-green-100 rounded">Pedro</td>
                <td></td>
                <td className="p-3 bg-blue-100 rounded">Ana</td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* Disponibilidad */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Disponibilidad de Voluntarios
          </h2>

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">Voluntario</th>
                <th className="text-left p-3">Horario</th>
                <th className="text-left p-3">Estado</th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b">
                <td className="p-3">Luis Vega</td>
                <td className="p-3">09:00 - 13:00</td>
                <td className="p-3 text-green-600">Disponible</td>
              </tr>

              <tr className="border-b">
                <td className="p-3">Marta Paz</td>
                <td className="p-3">10:00 - 17:00</td>
                <td className="p-3 text-yellow-600">Parcial</td>
              </tr>

              <tr>
                <td className="p-3">Fabio Ruiz</td>
                <td className="p-3">08:00 - 12:00</td>
                <td className="p-3 text-red-600">No disponible</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}