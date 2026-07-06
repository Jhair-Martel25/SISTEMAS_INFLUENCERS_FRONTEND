export default function GestionReunionesPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#003D2D]">
            Gestión de Reuniones
          </h1>

          <p className="text-gray-500 mt-2">
            Central de coordinación y seguimiento de reuniones entre influencers y voluntarios.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Calendario Semanal
            </h2>

            <p className="text-gray-500 text-sm mt-1 mb-6">
              Visualiza las reuniones programadas para la semana actual.
            </p>

            <div className="flex gap-2">
              <button className="px-5 py-2 rounded-xl bg-[#003D2D] text-white text-sm font-medium">
                Semana
              </button>

              <button className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                Mes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">LUN</p>
              <p className="font-bold">15</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">MAR</p>
              <p className="font-bold">16</p>
            </div>

            <div className="bg-[#003D2D] text-white rounded-xl p-4">
              <p className="text-sm">MIÉ</p>
              <p className="font-bold">17</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">JUE</p>
              <p className="font-bold">18</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">VIE</p>
              <p className="font-bold">19</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">SÁB</p>
              <p className="font-bold">20</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 hover:bg-green-50 hover:border-[#003D2D] transition-colors cursor-pointer">
              <p className="text-sm">DOM</p>
              <p className="font-bold">21</p>
            </div>

          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h2 className="text-xl font-semibold mb-4">
            Listado de Seguimiento
          </h2>

          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Influencer</th>
                <th className="text-left p-3">Voluntario</th>
                <th className="text-left p-3">Fecha y Hora</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3">Andrea Merino</td>
                <td className="p-3">Luis Vega</td>
                <td className="p-3">17 Oct 2023 - 09:00 AM</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    Confirmada
                  </span>
                </td>
                <td className="p-3">
                  <button className="px-4 py-2 rounded-lg bg-[#003D2D] text-white text-sm hover:bg-[#01281E] transition-colors">
                    Ver
                  </button>
                </td>
              </tr>

              <tr className="border-b hover:bg-blue-100 transition-colors">
                <td className="p-3">Jorge Rivera</td>
                <td className="p-3">Marta Paz</td>
                <td className="p-3">17 Oct 2023 - 11:30 AM</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    Completada
                  </span>
                </td>
                <td className="p-3">
                  <button className="px-4 py-2 rounded-lg bg-[#003D2D] text-white text-sm hover:bg-[#01281E] transition-colors">
                    Ver
                  </button>
                </td>
              </tr>

              <tr className="border-b hover:bg-red-100 transition-colors">
                <td className="p-3">Carla Salas</td>
                <td className="p-3">Fabio Ruiz</td>
                <td className="p-3">17 Oct 2023 - 03:00 PM</td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    Cancelada
                  </span>
                </td>
                <td className="p-3">
                  <button className="px-4 py-2 rounded-lg bg-[#003D2D] text-white text-sm hover:bg-[#01281E] transition-colors">
                    Ver
                  </button>
                </td>
              </tr>

            </tbody>

          </table>
        </div>

      </div>
    </main>
  );
}