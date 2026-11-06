"use client"

import { useState } from "react"
import { CalendarCheck2, CalendarClock, Users } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/usePermission"
import { DisponibilidadList } from "@/features/disponibilidades/components/DisponibilidadList"
import { HorariosAdminVista } from "./HorariosAdminVista"
import { MiHorarioSemanal } from "./MiHorarioSemanal"

type Pestana = "EQUIPO" | "MI_HORARIO" | "DISPONIBILIDAD"

const PESTANAS: { valor: Pestana; label: string; descripcion: string; icono: React.ElementType }[] = [
  {
    valor: "EQUIPO",
    label: "Horarios del equipo",
    descripcion: "Consulta el horario semanal de reuniones de todos los usuarios.",
    icono: Users,
  },
  {
    valor: "MI_HORARIO",
    label: "Mi horario",
    descripcion: "Marca tus horas disponibles para reuniones (lunes a sábado, 8:00 a. m. – 10:00 p. m.).",
    icono: CalendarClock,
  },
  {
    valor: "DISPONIBILIDAD",
    label: "Disponibilidad",
    descripcion: "Tus bloques de disponibilidad y reservas de embajadores.",
    icono: CalendarCheck2,
  },
]

/**
 * Gestión de horarios:
 * - ADMIN: todo en un solo lugar → horarios del equipo, su propio horario
 *   y su disponibilidad (pestañas).
 * - VOLUNTARIO: configura su horario de reuniones en la cuadrícula.
 */
export function HorarioList() {
  const { isAdmin } = usePermission()
  const [pestana, setPestana] = useState<Pestana>("EQUIPO")

  if (!isAdmin) return <MiHorarioSemanal />

  const actual = PESTANAS.find((p) => p.valor === pestana)!

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Horarios" description={actual.descripcion} backHref="/dashboard" />

      <div className="flex w-full gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-sm sm:w-fit">
        {PESTANAS.map(({ valor, label, icono: Icono }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setPestana(valor)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              pestana === valor
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icono size={16} />
            {label}
          </button>
        ))}
      </div>

      {pestana === "EQUIPO" && <HorariosAdminVista embebido />}
      {pestana === "MI_HORARIO" && <MiHorarioSemanal embebido />}
      {pestana === "DISPONIBILIDAD" && <DisponibilidadList embebido />}
    </div>
  )
}
