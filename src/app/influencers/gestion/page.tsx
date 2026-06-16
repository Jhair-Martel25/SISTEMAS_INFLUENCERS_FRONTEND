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

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Buscar influencer..."
            className="border rounded-lg p-3 w-80"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
            + Nuevo Influencer
          </button>
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
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Influencer</th>
                <th className="p-3 text-left">Temática</th>
                <th className="p-3 text-left">Seguidores</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-3">Andrea Paz</td>
                <td className="p-3">Ambiental</td>
                <td className="p-3">150k</td>
                <td className="p-3">Pendiente</td>
                <td className="p-3">Ver | Editar</td>
              </tr>

              <tr className="border-b">
                <td className="p-3">Carlos Rivera</td>
                <td className="p-3">Social</td>
                <td className="p-3">90k</td>
                <td className="p-3">Validado</td>
                <td className="p-3">Ver | Editar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
