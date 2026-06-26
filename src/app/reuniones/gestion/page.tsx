export default function GestionReunionesPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Gestión de Reuniones
          </h1>

          <p className="text-gray-600 mt-2">
            Central de coordinación y seguimiento de impacto ambiental.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Calendario Semanal
            </h2>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-100 rounded">
                Semana
              </button>

              <button className="px-4 py-2 bg-gray-100 rounded">
                Mes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">

            <div className="border p-3 rounded">
              <p className="text-sm">LUN</p>
              <p className="font-bold">15</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">MAR</p>
              <p className="font-bold">16</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">MIÉ</p>
              <p className="font-bold">17</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">JUE</p>
              <p className="font-bold">18</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">VIE</p>
              <p className="font-bold">19</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">SÁB</p>
              <p className="font-bold">20</p>
            </div>

            <div className="border p-3 rounded">
              <p className="text-sm">DOM</p>
              <p className="font-bold">21</p>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Listado de Seguimiento
          </h2>

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Influencer</th>
                <th className="text-left p-3">Voluntario</th>
                <th className="text-left p-3">Fecha y Hora</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="p-3">Andrea Merino</td>
                <td className="p-3">Luis Vega</td>
                <td className="p-3">17 Oct 2023 - 09:00 AM</td>
                <td className="p-3 text-green-600">
                  Confirmada
                </td>
                <td className="p-3">
                  Ver
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3">Jorge Rivera</td>
                <td className="p-3">Marta Paz</td>
                <td className="p-3">17 Oct 2023 - 11:30 AM</td>
                <td className="p-3 text-green-700">
                  Completada
                </td>
                <td className="p-3">
                  Ver
                </td>
              </tr>

              <tr>
                <td className="p-3">Carla Salas</td>
                <td className="p-3">Fabio Ruiz</td>
                <td className="p-3">17 Oct 2023 - 03:00 PM</td>
                <td className="p-3 text-red-600">
                  Cancelada
                </td>
                <td className="p-3">
                  Ver
                </td>
              </tr>

            </tbody>

          </table>
        </div>

      </div>
    </main>
  );
}