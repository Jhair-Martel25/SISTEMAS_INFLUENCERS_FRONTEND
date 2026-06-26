import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

export default function RegistroVoluntarioPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-sm text-gray-500">
                            Voluntarios &gt; Nuevo Registro
                        </p>
                        <h1 className="text-4xl font-bold text-[#003D2D] mt-2">
                            Registro de Voluntario -
                            <br />
                            Sembrando Perú
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost">
                            Cancelar
                        </Button>
                        <Button>
                            Guardar Voluntario
                        </Button>
                    </div>
                </div>
                {/* Información Personal */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            👤
                        </span>
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField
                            label="Nombre completo"
                            placeholder="Ej. Juan Pérez"
                        />
                        <InputField
                            label="Correo corporativo"
                            type="email"
                            placeholder="juan.perez@ejemplo.com"
                        />
                    </div>
                    <div className="mt-8">
                        <label className="block mb-3 text-sm font-medium text-gray-700">
                            Fotografía de perfil
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center text-gray-500 hover:border-[#003D2D] transition">
                            <div className="text-5xl mb-3">
                                ☁️
                            </div>
                            <p>
                                Arrastra una imagen o
                                <span className="text-[#003D2D] font-medium">
                                    {" "}haz clic para subir
                                </span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                JPG, PNG hasta 5MB
                            </p>
                        </div>
                    </div>
                </div>
                {/* Disponibilidad */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            📅
                        </span>
                        Disponibilidad
                    </h2>
                    {/* Días disponibles */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Días disponibles
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2 rounded-lg border">Lun</button>
                            <button className="px-5 py-2 rounded-lg bg-[#003D2D] text-white">
                                Mar
                            </button>
                            <button className="px-5 py-2 rounded-lg bg-[#003D2D] text-white">
                                Mié
                            </button>
                            <button className="px-5 py-2 rounded-lg bg-[#003D2D] text-white">
                                Jue
                            </button>
                            <button className="px-5 py-2 rounded-lg border">
                                Vie
                            </button>
                            <button className="px-5 py-2 rounded-lg border">
                                Sáb
                            </button>
                            <button className="px-5 py-2 rounded-lg border">
                                Dom
                            </button>
                        </div>
                    </div>
                    {/* Horas y reuniones */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Máximo de horas por día
                            </label>
                            <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
                                <span className="text-gray-500">
                                    1h
                                </span>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    Actual: 4h
                                </span>
                                <span className="text-gray-500">
                                    8h+
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Máximo reuniones/semana
                            </label>
                            <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
                                <button className="w-10 h-10 rounded-lg bg-white shadow">
                                    −
                                </button>
                                <span className="text-3xl font-bold text-[#003D2D]">
                                    05
                                </span>
                                <button className="w-10 h-10 rounded-lg bg-white shadow">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}