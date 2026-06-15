export default function RegistroInfluencerPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8">

        <h1 className="text-3xl font-bold mb-8">
          Registro de Influencer
        </h1>

        <form className="grid grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 font-medium">
              Nombre Completo
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Usuario Instagram
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Correo Electrónico
            </label>

            <input
              type="email"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Teléfono
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