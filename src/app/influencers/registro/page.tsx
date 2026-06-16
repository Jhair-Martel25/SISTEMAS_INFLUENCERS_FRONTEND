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
        

        <form className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              NOMBRE COMPLETO
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              USUARIO DE IG
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              CORREO ELECTRÓNICO
            </label>

            <input
              type="email"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              TELÉFONO (OPCIONAL)
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

        </form>

      </div>
    </main>
  );
}