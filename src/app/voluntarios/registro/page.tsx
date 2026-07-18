"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

export default function RegistroVoluntarioPage() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };
    const toggleDia = (dia: string) => {
        if (diasSeleccionados.includes(dia)) {
            setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
        } else {
            setDiasSeleccionados([...diasSeleccionados, dia]);
        }
    };
    const guardarVoluntario = () => {
        const voluntario = {
            nombre,
            correo,
            foto,
            diasDisponibles: diasSeleccionados,
            horaInicio,
            horaFin,
        };
        console.log("Datos del voluntario:", voluntario);
    };
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-green-50 py-10 px-6">
            <div className="max-w-6xl mx-auto">
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
                    <div className="flex gap-4">
                        <Button variant="ghost">
                            Cancelar
                        </Button>

                        <Button onClick={guardarVoluntario}>
                            Guardar Voluntario
                        </Button>
                    </div>
                </div>
                {/* Información Personal */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 mb-8">
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
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <InputField
                            label="Correo corporativo"
                            type="email"
                            placeholder="juan@sembrandoperu.org"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                    </div>
                    <div className="mt-8">
                        <label className="block mb-3 text-sm font-medium text-gray-700">
                            Fotografía de perfil
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl h-52 flex flex-col items-center justify-center text-gray-500 hover:border-[#003D2D] transition">
                            {/* Input oculto que procesa el archivo */}
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleImage}
                                className="hidden"
                                id="foto"
                            />

                            {/* Label que hace de botón visible */}
                            <label htmlFor="foto" className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-36 h-36 rounded-full object-cover"/>
                                ) : (
                                    <>
                                        <span className="text-4xl">☁️</span>
                                        <span className="font-medium">
                                            Arrastra una imagen o haz clic para subir
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            JPG, PNG hasta 5MB
                                        </span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
                {/* Disponibilidad */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            📅
                        </span>
                        Disponibilidad
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 mb-8">
                        Selecciona los días y el horario en el que el voluntario estará disponible para participar en actividades.
                    </p>
                    {/* Días disponibles */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Días disponibles
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => toggleDia("Lun")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Lun") ? "bg-[#003D2D] text-white" : "border"} `} >Lun</button>
                            <button type="button" onClick={() => toggleDia("Mar")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Mar") ? "bg-[#003D2D] text-white" : "border"} `} >Mar</button>
                            <button type="button" onClick={() => toggleDia("Mié")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Mié") ? "bg-[#003D2D] text-white" : "border"} `} >Mié</button>
                            <button type="button" onClick={() => toggleDia("Jue")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Jue") ? "bg-[#003D2D] text-white" : "border"} `} >Jue</button>
                            <button type="button" onClick={() => toggleDia("Vie")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Vie") ? "bg-[#003D2D] text-white" : "border"} `} >Vie</button>
                            <button type="button" onClick={() => toggleDia("Sáb")} className={`px-5 py-2 rounded-lg transition-all duration-300 ${diasSeleccionados.includes("Sáb") ? "bg-[#003D2D] text-white" : "border"} `} >Sáb</button>
                        </div>
                    </div>
                    {/* Horario disponible */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Horario disponible
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    Hora de inicio
                                </label>
                                <input
                                    type="time"
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D2D] transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    Hora de fin
                                </label>
                                <input
                                    type="time"
                                    value={horaFin}
                                    onChange={(e) => setHoraFin(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D2D] transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}