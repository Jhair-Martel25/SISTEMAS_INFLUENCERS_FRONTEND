export default function MotorIAPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Motor IA de Captación
                    </h1>

                    <p className="text-gray-600 mt-2">
                        Genera estrategias de impacto social mediante análisis inteligente de audiencias.
                    </p>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-medium">
                        ★ Prompt Inteligente
                    </label>
                    <textarea
                        rows={6}
                        placeholder="Describe el perfil de influencer que deseas encontrar..."
                        className="w-full border rounded-lg p-3"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block mb-2 font-medium">
                            Objetivo de Búsqueda
                        </label>

                        <select className="w-full border rounded-lg p-3">
                            <option>Seleccionar objetivo</option>
                            <option>Reforestación</option>
                            <option>Medio ambiente</option>
                            <option>Impacto Social</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">
                            Seguidores
                        </label>

                        <select className="w-full border rounded-lg p-3">
                            <option>Seleccionar rango</option>
                            <option>0 - 10k</option>
                            <option>10k - 50k</option>
                            <option>50k+</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">
                            Cantidad mínima
                        </label>
                        <input
                            type="number"
                            placeholder="20"
                            className="w-full border rounded-lg p-3"
                        />
                    </div>
                </div>
                <div className="flex justify-end mb-8">
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg">
                        Generar IA
                    </button>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Resultados Generados
                    </h2>
                    <div className="border rounded-lg p-6 bg-gray-50 min-h-[250px]">
                        <p className="text-gray-500">
                            Los influencers sugeridos por la IA aparecerán aquí.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}