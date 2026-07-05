export default function RegistroInfluencerPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Registro de Influencer
          </h1>

          <p className="text-gray-600 mt-2">
            Ingresa los datos de perfil para añadirlo al sistema.
          </p>
        </div>

        <form className="space-y-8">

          {/* Bloque 1: Información Personal */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Información Personal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  NOMBRE COMPLETO
                </label>
                <input
                  type="text"
                  placeholder="Andrea Paz"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  USUARIO DE IG
                </label>
                <input
                  type="text"
                  placeholder="@usuario"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  TELÉFONO (OPCIONAL)
                </label>
                <input
                  type="text"
                  placeholder="+51..."
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  PAÍS
                </label>
                <input
                  type="text"
                  placeholder="Perú"
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  CIUDAD
                </label>
                <input
                  type="text"
                  placeholder="Lima"
                  className="w-full border rounded-lg p-3"
                />
              </div>

            </div>
          </div>

          {/* Bloque 2: Redes Sociales */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Redes Sociales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  SEGUIDORES
                </label>
                <input
                  type="text"
                  placeholder="Ej. 150k"
                  className="w-full border rounded-lg p-3"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ingresa el número total de seguidores en la red principal.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  ENGAGEMENT
                </label>
                <input
                  type="text"
                  placeholder="Ej. 4.5%"
                  className="w-full border rounded-lg p-3"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Porcentaje promedio de interacción sobre el total de seguidores.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  TEMÁTICA
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ambiental, Social..."
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  LINK DEL PERFIL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full border rounded-lg p-3"
                />
              </div>

            </div>
          </div>

          {/* Bloque 3: Gestión */}
          <div>
            <h2 className="text-lg font-semibold text-[#003D2D] mb-4 pb-2 border-b border-gray-100">
              Gestión
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  ESTADO INICIAL
                </label>

                <select className="w-full border rounded-lg p-3 bg-white">
                  <option>Pendiente</option>
                  <option>Validado</option>
                  <option>Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  VOLUNTARIO ENCARGADO DE LA VALIDACIÓN
                </label>

                <input
                  type="text"
                  list="lista-voluntarios"
                  placeholder="Escriba el nombre del voluntario..."
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                />

                <datalist id="lista-voluntarios">
                  <option value="Mateo Rivera" />
                  <option value="Mateo García" />
                  <option value="Mateo Pérez" />
                  <option value="Elena Salas" />
                  <option value="Carlos Pardo" />
                  <option value="Luis Mendoza" />
                  <option value="María Fernández" />
                  <option value="Ana Torres" />
                  <option value="José Ramírez" />
                  <option value="Lucía Herrera" />
                </datalist>

                <p className="text-xs text-gray-400 mt-1">
                  Escriba el nombre del voluntario. Mientras escribe, el sistema mostrará sugerencias disponibles.
                </p>
              </div>

            </div>
          </div>

        </form>

      <div className="flex justify-end gap-3 mt-8">
            <button type="button" className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 font-medium">
                Guardar
            </button>
        </div>

      </div>
    </main>
  );
}