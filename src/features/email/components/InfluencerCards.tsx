"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { DataTablePagination } from "@/components/shared/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useInfluencers } from "@/features/influencers/hooks/useInfluencers"
import { ESTADO_VALIDACION } from "@/types/api"

const LIMITE = 9

interface InfluencerCardsProps {
  seleccionadoId: string
  onSeleccionar: (id: string) => void
}

export function InfluencerCards({
  seleccionadoId,
  onSeleccionar,
}: InfluencerCardsProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useInfluencers({
    estadoValidacion: ESTADO_VALIDACION.VALIDADO,
    page,
    limit: LIMITE,
  })

  const influencers = (data?.data ?? []).filter((influencer) => influencer.email)
  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / LIMITE))

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los influencers."
    : null

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: LIMITE }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return <p className="text-sm text-destructive">{errorMessage}</p>
  }

  if (influencers.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No hay influencers validados con email para enviar el correo.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Seleccionar influencer"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {influencers.map((influencer) => {
          const seleccionado = seleccionadoId === influencer.id
          return (
            <button
              key={influencer.id}
              type="button"
              role="radio"
              aria-checked={seleccionado}
              onClick={() => onSeleccionar(seleccionado ? "" : influencer.id)}
              className={cn(
                "relative flex flex-col gap-0.5 rounded-xl border bg-card p-4 text-left transition-colors",
                "hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                seleccionado &&
                  "border-primary ring-2 ring-primary",
              )}
            >
              {seleccionado && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={12} />
                </span>
              )}
              <span className="pr-6 font-medium text-foreground">
                {influencer.nombre}
              </span>
              <span className="text-sm text-muted-foreground">
                @{influencer.usuarioIg}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {influencer.email}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                {influencer.seguidores ?? "—"} seguidores
              </span>
            </button>
          )
        })}
      </div>

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}