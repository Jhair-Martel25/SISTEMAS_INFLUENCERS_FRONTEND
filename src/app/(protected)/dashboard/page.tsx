"use client";

import Link from "next/link";
import { Users, Sparkles, Video, UserPlus, FileText, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const accesos =
    user?.role === "ADMIN"
      ? [
          { href: "/influencers/gestion", label: "Influencers", desc: "Administra y valida influencers", icon: Users },
          { href: "/influencers/motor-ia", label: "Motor IA", desc: "Búsqueda inteligente de talento", icon: Sparkles },
          { href: "/reuniones/gestion", label: "Reuniones", desc: "Coordina y da seguimiento", icon: Video },
          { href: "/usuarios", label: "Usuarios", desc: "Administra usuarios y roles", icon: UserPlus },
          { href: "/plantillas", label: "Plantillas", desc: "Gestiona plantillas de correo", icon: FileText },
          { href: "/email", label: "Email", desc: "Envía correos a influencers", icon: Mail },
        ]
      : [
          { href: "/influencers/gestion", label: "Influencers", desc: "Administra y valida influencers", icon: Users },
          { href: "/influencers/motor-ia", label: "Motor IA", desc: "Búsqueda inteligente de talento", icon: Sparkles },
          { href: "/reuniones/gestion", label: "Reuniones", desc: "Coordina y da seguimiento", icon: Video },
          { href: "/reuniones/agenda", label: "Mi agenda", desc: "Disponibilidad y bloques", icon: Video },
        ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.nombre?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          Panel de administración de Sembrando Perú
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accesos.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow block"
          >
            <div className="w-12 h-12 rounded-xl bg-[#003D2D]/10 flex items-center justify-center mb-4">
              <Icon size={24} className="text-[#003D2D]" />
            </div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
