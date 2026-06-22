export default function LoginPage() {
    return (
        <main className="min-h-screen flex">
            {/* Panel Izquierdo */}
            <div className="hidden md:flex md:w-1/2 relative text-white p-12 flex-col justify-end bg-cover bg-center" 
            style={{backgroundImage: "url('/images/login-background.jpg')",}}
            >
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    Gestiona
                    <br />
                    influencers
                    <br />
                    de impacto social
                </h1>
                <p className="text-lg">
                    Automatiza validaciones, campañas, agendas y seguimiento con nuestra plataforma inteligente diseñada para el cambio.
                </p>
            </div>
            {/* Panel Derecho */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                <div className="w-full max-w-md p-8">
                    <div className="mb-8">

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-green-800">
                                Sembrando Perú
                            </h2>
                        </div>

                        <h1 className="text-4xl font-bold">
                            Bienvenido
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Ingresa tus credenciales para acceder a la plataforma.
                        </p>

                    </div>
                    <form className="space-y-6">
                        <div>
                            <label className="block mb-2 font-medium">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                className="w-full border rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                placeholder="********"
                                className="w-full border rounded-lg p-3"
                            />
                        </div>
                        <div className="flex justify-between items-center">

                            <label className="flex items-center gap-2">
                                <input type="checkbox" />
                                Recordarme
                            </label>
                            <a
                                href="#"
                                className="text-green-700 hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-900 text-white py-3 rounded-lg font-medium hover:bg-green-800"
                        >
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}