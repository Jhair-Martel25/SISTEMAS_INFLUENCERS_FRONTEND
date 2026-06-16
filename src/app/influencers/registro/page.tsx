export default function RegistroInfluencerPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8">

        <div className="mb-8">
            <h1 className="text-3xl font-bold">
                Registro de Influencer
            </h1>
            
            <p className="text-gray-600 mt-2">
                Ingresa los datos de perfil para añadirlo al sistema
            </p>
        </div>
        

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              NOMBRE COMPLETO 
            </label>

            <input
              type="text"
              placeholder="Andrea Paz"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              USUARIO DE IG 
            </label>

            <input
              type="url"
              placeholder="@usuario"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              CORREO ELECTRÓNICO 
            </label>

            <input
              type="email"
              required
              placeholder="correo@ejemplo.com"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              TELÉFONO (OPCIONAL)
            </label>

            <input
              type="text"
              placeholder="+51..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              PAÍS
            </label>

            <input
              type="text"
              placeholder="Perú"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              CIUDAD
            </label>

            <input
              type="text"
              placeholder="Lima"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              SEGUIDORES 
            </label>

            <input
              type="text"
              placeholder="Ej. 150k"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              ENGAGEMENT 
            </label>

            <input
              type="text"
              placeholder="Ej. 4.5%"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              TEMÁTICA 
            </label>

            <input
              type="text"
              placeholder="Ej. Ambiental, Social..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              LINK DEL PERFIL
            </label>

            <input
              type="text"
              placeholder="https://..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              ESTADO INICIAL 
            </label>

            <input
              type="text"
              placeholder="Hidden"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              VOLUNTARIO ENCARGADO DE LA VALIDACIÓN 
            </label>

            <input
              type="text"
              placeholder="Hidden"
              className="w-full border rounded-lg p-3"
            />
          </div>
          </form>
        
        <div className="flex justify-end gap-3 mt-8">
            <button type="button" className="px-5 py-2 border border-gray-300 rounded-lg">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg">Guardar</button>
        </div>
      </div>
    </main>
  );
}