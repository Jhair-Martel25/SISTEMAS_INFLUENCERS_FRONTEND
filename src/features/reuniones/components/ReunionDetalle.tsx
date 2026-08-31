"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Video } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EstadoBadge } from "@/components/shared/estado-badge"

import type { EstadoReunion } from "@/types/api"
import { ESTADO_REUNION } from "@/types/api"
import { ESTADOS_REUNION } from "@/types/reunion"
import { formatearFechaUI, zonaHorariaNavegador } from "@/lib/utils/date"

import {
  useActualizarEstadoReunion,
  useReunion,
} from "../hooks/useReuniones"

const ACCIONES_ESTADO: {
  estado: Exclude<EstadoReunion, "PENDIENTE">
  label: string
  color: string
}[] = [
  {
    estado: ESTADO_REUNION.REALIZADA,
    label: "Marcar como realizada",
    color: "bg-green-700 hover:bg-green-800",
  },
  {
    estado: ESTADO_REUNION.NO_ASISTIO,
    label: "Marcar no asistió",
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    estado: ESTADO_REUNION.CANCELADA,
    label: "Cancelar reunión",
    color: "bg-red-600 hover:bg-red-700",
  },
]

export function ReunionDetalle({ id }: { id: string }) {
  const { data: reunion, isLoading, isError, error } = useReunion(id)
  const actualizar = useActualizarEstadoReunion()
  const [confirmando, setConfirmando] = useState<Exclude<
    EstadoReunion,
    "PENDIENTE"
  > | null>(null)

  const errorMessage =
    isError && error instanceof Error ? error.message : null

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!reunion) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-muted-foreground">
        {errorMessage ?? "Reunión no encontrada."}
      </div>
    )
  }

  const esFinal = reunion.estado === ESTADO_REUNION.REALIZADA
  const accionesDisponibles = ACCIONES_ESTADO.filter(
    (accion) => accion.estado !== reunion.estado,
  )

  function confirmarEstado() {
    if (!confirmando || !reunion) return
    actualizar.mutate(
      { id: reunion.id, input: { estado: confirmando } },
      {
        onSuccess: () => {
          toast.success("Estado de la reunión actualizado.")
          setConfirmando(null)
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "No se pudo actualizar el estado.",
          )
        },
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/reuniones/gestion"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Volver a Gestión de Reuniones
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Detalle de la reunión
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta la información y actualiza el estado de la reunión.
            </p>
          </div>
          <EstadoBadge estado={reunion.estado} tipo="reunion" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Influencer
            </p>
            <p className="font-medium text-foreground">
              {reunion.influencer.nombre}
            </p>
            {reunion.influencer.email && (
              <p className="text-sm text-muted-foreground">
                {reunion.influencer.email}
              </p>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Voluntario
            </p>
            <p className="font-medium text-foreground">
              {reunion.disponibilidadCita.voluntario.nombre}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fecha y hora
            </p>
            <p className="font-medium text-foreground capitalize">
              {formatearFechaUI(reunion.fechaHora, zonaHorariaNavegador())}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Duración
            </p>
            <p className="font-medium text-foreground">
              {reunion.duracionMinutos} min
            </p>
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Videollamada
            </p>
            {reunion.googleMeetLink ? (
              <a
                href={reunion.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary"
              >
                <Video size={16} />
                {reunion.googleMeetLink}
              </a>
            ) : (
              <p className="text-muted-foreground">Sin enlace generado</p>
            )}
          </div>
        </div>
      </div>

      {esFinal ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Esta reunión ya fue marcada como realizada y no puede cambiar de
          estado.
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-3">
          {accionesDisponibles.map((accion) => (
            <Button
              key={accion.estado}
              className={accion.color}
              disabled={actualizar.isPending}
              onClick={() => setConfirmando(accion.estado)}
            >
              {accion.label}
            </Button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmando)}
        onOpenChange={(open) => !open && setConfirmando(null)}
        title="Cambiar estado de la reunión"
        description={
          confirmando
            ? `¿Seguro que deseas marcar la reunión como "${ESTADOS_REUNION.find((e) => e.value === confirmando)?.label}"?`
            : undefined
        }
        confirmLabel="Confirmar"
        isPending={actualizar.isPending}
        onConfirm={confirmarEstado}
      />
    </div>
  )
}
