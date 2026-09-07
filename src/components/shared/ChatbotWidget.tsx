"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, HelpCircle, Mail, RefreshCw } from "lucide-react";

interface Mensaje {
  id: number;
  autor: "bot" | "usuario";
  texto: string;
  opcionesSugeridas?: string[];
  esFallo?: boolean;
}

interface EntradaConocimiento {
  palabrasClave: string[];
  respuesta: string;
}

const SOPORTE_CONFIG = {
  email: "soporte@sembrandoperu.org",
  telefono: "+51 999 999 999",
};

const OPCIONES_INICIALES = [
  "¿Cómo funciona la plataforma?",
  "¿Cómo creo o cambio mi contraseña?",
  "¿Qué roles de usuario existen?",
  "¿Cómo agenda una reunión un influencer?",
  "Contacto con Soporte",
];

const BASE_CONOCIMIENTO: EntradaConocimiento[] = [
  {
    palabrasClave: ["que es", "sistema de influencers", "plataforma", "para que sirve", "funciona"],
    respuesta:
      "El Sistema de Influencers es la plataforma web interna de Sembrando Perú para gestionar influencers de impacto social: valida y administra influencers, organiza horarios, agenda reuniones y gestiona comunicaciones.",
  },
  {
    palabrasClave: ["quien puede usar", "quienes pueden", "acceso", "usar la plataforma"],
    respuesta:
      "Solo puede usarla el personal de Sembrando Perú con rol ADMIN o VOLUNTARIO, usando un correo del dominio @sembrandoperu.org. Los influencers no tienen cuenta propia.",
  },
  {
    palabrasClave: ["como consigo", "crear cuenta", "registro", "nueva cuenta", "registrarme"],
    respuesta:
      "No hay registro público. Un ADMIN debe crear tu cuenta desde la sección Usuarios. Te asignará una contraseña temporal que debes cambiar luego desde tu Perfil.",
  },
  {
    palabrasClave: ["cambiar contrasena", "cambiar mi contrasena", "nueva contrasena", "creo o cambio mi contrasena"],
    respuesta:
      'Entra a la sección "Perfil" en el menú lateral, completa tu contraseña actual y la nueva contraseña para guardar los cambios.',
  },
  {
    palabrasClave: ["cambiar correo", "cambiar email", "cambiar mi correo"],
    respuesta:
      'Desde la sección "Perfil". Debe ser un correo con dominio @sembrandoperu.org que no esté en uso por otra cuenta.',
  },
  {
    palabrasClave: ["olvide mi contrasena", "olvide contrasena", "recuperar contrasena"],
    respuesta:
      "Por ahora no hay recuperación automática por correo. Debes contactar a un ADMIN para que gestione el cambio de tu contraseña.",
  },
  {
    palabrasClave: ["diferencia entre admin", "admin y voluntario", "roles", "que roles"],
    respuesta:
      "El ADMIN tiene acceso completo (Dashboard, Usuarios, Emails, etc.). El VOLUNTARIO se enfoca en Influencers, Horarios, Disponibilidad, Reuniones, Plantillas y su Perfil.",
  },
  {
    palabrasClave: ["como agenda", "agendar reunion", "influencer agenda", "reunion influencer"],
    respuesta:
      "El influencer recibe un enlace público por correo con su identificador único y agenda directamente su bloque de reunión, sin necesidad de crear una cuenta.",
  },
  {
    palabrasClave: ["secciones", "que secciones tiene", "menu", "que puedo hacer"],
    respuesta:
      "Las secciones son: Dashboard (ADMIN), Influencers, Horarios, Disponibilidad, Reuniones, Usuarios (ADMIN), Plantillas, Email (ADMIN) y Perfil.",
  },
  {
    palabrasClave: ["dashboard"],
    respuesta:
      "El Dashboard muestra analítica y KPIs generales del sistema. Solo está disponible para usuarios con rol ADMIN.",
  },
  {
    palabrasClave: ["contacto con soporte", "soporte", "contacto", "ayuda directa", "hablar con alguien"],
    respuesta:
      `Puedes contactar al equipo de soporte de Sembrando Perú a través de:\n\n✉️ Correo: ${SOPORTE_CONFIG.email}\n📞 WhatsApp / Teléfono: ${SOPORTE_CONFIG.telefono}`,
  },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarRespuesta(pregunta: string): { respuesta: string; esFallo: boolean } {
  const preguntaNormalizada = normalizar(pregunta);

  let mejorCoincidencia: EntradaConocimiento | null = null;
  let mejorPuntaje = 0;

  for (const entrada of BASE_CONOCIMIENTO) {
    let puntaje = 0;
    for (const palabraClave of entrada.palabrasClave) {
      if (preguntaNormalizada.includes(normalizar(palabraClave))) {
        puntaje += palabraClave.split(" ").length;
      }
    }
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorCoincidencia = entrada;
    }
  }

  if (mejorCoincidencia && mejorPuntaje > 0) {
    return { respuesta: mejorCoincidencia.respuesta, esFallo: false };
  }

  return {
    respuesta:
      "Disculpa, no pude entender tu pregunta. Puedes intentar escribirla de otra manera o contactar a nuestro equipo de soporte.",
    esFallo: true,
  };
}

export default function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 0,
      autor: "bot",
      texto: "¡Hola! 👋 Soy el asistente virtual del Sistema de Influencers. ¿En qué te puedo ayudar hoy? Selecciona una opción o escribe tu consulta:",
      opcionesSugeridas: OPCIONES_INICIALES,
    },
  ]);
  const [textoInput, setTextoInput] = useState("");
  const finMensajesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finMensajesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  function procesarMensaje(texto: string) {
    if (!texto.trim()) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now(),
      autor: "usuario",
      texto,
    };

    const { respuesta, esFallo } = buscarRespuesta(texto);

    const mensajeBotRespuesta: Mensaje = {
      id: Date.now() + 1,
      autor: "bot",
      texto: respuesta,
      esFallo,
    };

    // Mensaje de seguimiento continuo con el menú de opciones
    const mensajeBotSeguimiento: Mensaje = {
      id: Date.now() + 2,
      autor: "bot",
      texto: "¿Deseas consultar algo más? Estamos aquí para ayudarte.",
      opcionesSugeridas: OPCIONES_INICIALES,
    };

    setMensajes((prev) => [...prev, mensajeUsuario, mensajeBotRespuesta, mensajeBotSeguimiento]);
    setTextoInput("");
  }

  function reiniciarChat() {
    setMensajes([
      {
        id: Date.now(),
        autor: "bot",
        texto: "¡Chat reiniciado! 👋 ¿En qué más te puedo ayudar?",
        opcionesSugeridas: OPCIONES_INICIALES,
      },
    ]);
  }

  return (
    <>
      {abierto && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-left">
          {/* Encabezado */}
          <div className="bg-[#003D2D] text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <HelpCircle size={18} className="text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Asistente Virtual</p>
                <p className="text-[11px] text-emerald-200">Sembrando Perú</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reiniciarChat}
                title="Reiniciar conversación"
                className="p-1 text-emerald-200 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="p-1 text-emerald-200 hover:text-white hover:bg-white/10 rounded transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {mensajes.map((m) => (
              <div key={m.id} className="space-y-2">
                <div className={`flex ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      m.autor === "usuario"
                        ? "bg-[#003D2D] text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {m.texto}
                  </div>
                </div>

                {/* Opciones interactivas rápidas */}
                {m.opcionesSugeridas && m.opcionesSugeridas.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1 pl-2">
                    {m.opcionesSugeridas.map((opcion, idx) => (
                      <button
                        key={idx}
                        onClick={() => procesarMensaje(opcion)}
                        className="text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-[#003D2D] border border-emerald-200 font-medium py-1.5 px-3 rounded-lg transition-colors duration-150"
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Acciones si el Bot no entiende la pregunta */}
                {m.esFallo && (
                  <div className="flex flex-col gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-2">
                    <p className="font-semibold">¿Qué puedes hacer?</p>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => procesarMensaje("Contacto con Soporte")}
                        className="flex items-center gap-2 bg-white border border-amber-300 text-amber-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Mail size={14} className="text-amber-700" />
                        Contactar a Soporte
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={finMensajesRef} />
          </div>

          {/* Input de texto */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                procesarMensaje(textoInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={textoInput}
                onChange={(e) => setTextoInput(e.target.value)}
                placeholder="Escribe tu consulta..."
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003D2D]"
              />
              <button
                type="submit"
                disabled={!textoInput.trim()}
                className="bg-[#003D2D] text-white p-2 rounded-xl hover:bg-[#0B5E47] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setAbierto((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-[#003D2D] hover:bg-[#0B5E47] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105"
        aria-label="Abrir asistente de ayuda"
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}