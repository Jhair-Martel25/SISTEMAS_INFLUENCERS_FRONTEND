export default function GestionarReunionPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Gestionar Reunión
          </h1>

          <p className="text-gray-600 mt-2">
            Consulta y actualiza la información de la reunión programada.
          </p>
        </div>

        <form className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              INFLUENCER
            </label>

            <input
              type="text"
              value="Andrea Merino"
              className="w-full border rounded-lg p-3"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              VOLUNTARIO
            </label>

            <input
              type="text"
              value="Luis Vega"
              className="w-full border rounded-lg p-3"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              FECHA
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              HORA
            </label>

            <input
              type="time"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium">
              OBSERVACIONES
            </label>

            <textarea
              rows={4}
              className="w-full border rounded-lg p-3"
              placeholder="Agregar observaciones..."
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium">
              ESTADO
            </label>

            <select className="w-full border rounded-lg p-3">
              <option>Confirmada</option>
              <option>Pendiente</option>
              <option>Completada</option>
              <option>Cancelada</option>
            </select>
          </div>

        </form>

        <div className="flex justify-end gap-3 mt-8">

          <button className="bg-yellow-500 text-white px-5 py-2 rounded-lg">
            Reagendar
          </button>

          <button className="bg-red-600 text-white px-5 py-2 rounded-lg">
            Cancelar
          </button>

          <button className="bg-green-700 text-white px-5 py-2 rounded-lg">
            Guardar Cambios
          </button>

        </div>

      </div>
    </main>
  );
}