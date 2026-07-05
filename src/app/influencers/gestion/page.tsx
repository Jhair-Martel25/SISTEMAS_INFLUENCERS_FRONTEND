import { Plus, Eye, Pencil } from "lucide-react";
export default function GestionInfluencersPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Influencers</h1>

          <p className="text-gray-600 mt-2">
            Administra, consulta y valida los influencers registrados en el
            sistema.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar influencer..."
            className="border rounded-lg p-3 w-full md:w-80"
          />
         <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2">
            <Plus size={18} />
            Nuevo Influencer
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total Influencers</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">2</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">1</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Validados</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">1</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Score IA promedio</p>
            <p className="text-2xl font-bold text-[#003D2D] mt-1">88.5</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select className="border rounded-lg p-3">
            <option>Estado</option>
            <option>Pendiente</option>
            <option>Validado</option>
            <option>Rechazado</option>
          </select>

          <select className="border rounded-lg p-3">
            <option>Temática</option>
            <option>Ambiental</option>
            <option>Social</option>
            <option>Educación</option>
          </select>

          <select className="border rounded-lg p-3">
            <option>Seguidores</option>
            <option>0 - 10k</option>
            <option>10k - 100k</option>
            <option>100k+</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
             <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Red Social</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguidores</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score IA</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
        <tbody>
              <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      AP
                    </div>
                    <span className="text-gray-900">Andrea Paz</span>
                  </div>
                </td>
                <td className="p-3 text-gray-700">Instagram</td>
                <td className="p-3 text-gray-700">150k</td>
                <td className="p-3 text-gray-700">4.5%</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#20D18F] h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">92</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    🟢 Validado
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button className="hover:text-[#003D2D] transition-colors" title="Ver">
                      <Eye size={16} />
                    </button>
                    <button className="hover:text-[#003D2D] transition-colors" title="Editar">
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#003D2D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      CR
                    </div>
                    <span className="text-gray-900">Carlos Rivera</span>
                  </div>
                </td>
                <td className="p-3 text-gray-700">TikTok</td>
                <td className="p-3 text-gray-700">90k</td>
                <td className="p-3 text-gray-700">3.8%</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#20D18F] h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">85</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    🟡 Pendiente
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button className="hover:text-[#003D2D] transition-colors" title="Ver">
                      <Eye size={16} />
                    </button>
                    <button className="hover:text-[#003D2D] transition-colors" title="Editar">
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            Anterior
          </button>

          <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium">
            1
          </button>

          <button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            2
          </button>

          <button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            Siguiente
          </button>
        </div>
      </div>
    </main>
  );
}

