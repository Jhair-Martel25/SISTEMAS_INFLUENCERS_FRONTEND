"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataTable,
  type Columna,
} from "@/components/shared/data-table"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { PageHeader } from "@/components/shared/page-header"

import type { EstadoReunion } from "@/types/api"
import type { Reunion } from "@/types/reunion"
import { ESTADOS_REUNION } from "@/types/reunion"
import { formatearFechaUI, zonaHorariaNavegador } from "@/lib/utils/date"

import { useReuniones } from "../hooks/useReuniones"

const TODOS = "todos"

export function ReunionList() {
  const router = useRouter()
  const [filtro, setFiltro] = useState<EstadoReunion | "">("")

  const { data, isLoading, isError, error } = useReuniones(
    filtro ? { estado: filtro } : undefined,
  )

  const reuniones = data ?? []
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar las reuniones."
    : null

  const columnas: Columna<Reunion>[] = [
    {
      id: "influencer",
      header: "Influencer",
      cell: (reunion) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {reunion.influencer.nombre}
          </span>
          {reunion.influencer.email && (
            <span className="text-xs text-muted-foreground">
              {reunion.influencer.email}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "voluntario",
      header: "Voluntario",
      cell: (reunion) => (
        <span className="text-muted-foreground">
          {reunion.disponibilidadCita.voluntario.nombre}
        </span>
      ),
    },
    {
      id: "fechaHora",
      header: "Fecha y hora",
      cell: (reunion) => (
        <span className="text-muted-foreground">
          {formatearFechaUI(reunion.fechaHora, zonaHorariaNavegador())}
        </span>
      ),
    },
    {
      id: "meet",
      header: "Videollamada",
      cell: (reunion) =>
        reunion.googleMeetLink ? (
          <a
            href={reunion.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
          >
            <Video size={14} />
            Unirse
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (reunion) => <EstadoBadge estado={reunion.estado} tipo="reunion" />,
    },
    {
      id: "acciones",
      header: "Acciones",
      className: "text-right",
      cell: (reunion) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ver reunión"
            onClick={() => router.push(`/reuniones/gestionar/${reunion.id}`)}
          >
            <Eye size={16} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Gestión de Reuniones"
        description="Coordina y da seguimiento a las reuniones entre influencers y voluntarios."
        backHref="/dashboard"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={filtro || TODOS}
          onValueChange={(valor) =>
            setFiltro(valor === TODOS ? "" : (valor as EstadoReunion))
          }
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {ESTADOS_REUNION.map((estado) => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columnas={columnas}
        datos={reuniones}
        getRowId={(reunion) => reunion.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay reuniones para este filtro."
      />
    </div>
  )
}
