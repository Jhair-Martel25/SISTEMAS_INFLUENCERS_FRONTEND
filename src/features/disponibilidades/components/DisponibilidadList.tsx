"use client"

import { useState } from "react"
import { CalendarPlus, Power, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DataTable,
  DataTablePagination,
  type Columna,
} from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

import type { DisponibilidadCita } from "@/types/disponibilidad"
import { formatearFechaUI, zonaHorariaNavegador } from "@/lib/utils/date"
import {
  useEliminarDisponibilidad,
  useGenerar,
  useLimpiar,
  useMisBloques,
  useToggle,
} from "../hooks/useDisponibilidades"
import { DisponibilidadForm } from "./DisponibilidadForm"

const LIMITE = 10

export function DisponibilidadList() {
  const [page, setPage] = useState(1)
  const [creando, setCreando] = useState(false)
  const [limpiando, setLimpiando] = useState(false)
  const [eliminando, setEliminando] = useState<DisponibilidadCita | null>(null)

  const { data, isLoading, isError, error } = useMisBloques({
    page,
    limit: LIMITE,
  })
  const generar = useGenerar()
  const limpiar = useLimpiar()
  const toggle = useToggle()
  const eliminar = useEliminarDisponibilidad()

  const bloques = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMITE))
  const disponibles = bloques.filter((b) => b.disponible !== false).length

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar tus bloques de disponibilidad."
    : null

  function manejarGenerar() {
    generar.mutate(
      { zonaHoraria: zonaHorariaNavegador() },
      {
        onSuccess: (res) => {
          toast.success(
            `Se generaron ${res.creados} bloques (${res.existentes} ya existían).`,
          )
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudieron generar los bloques. Configura tu horario semanal primero.",
          )
        },
      },
    )
  }

  function manejarToggle(bloque: DisponibilidadCita) {
    toggle.mutate(bloque.id, {
      onSuccess: () => {
        toast.success("Estado del bloque actualizado.")
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el bloque.",
        )
      },
    })
  }

  const columnas: Columna<DisponibilidadCita>[] = [
    {
      id: "fechaHora",
      header: "Fecha y hora",
      cell: (bloque) => (
        <span className="font-medium text-foreground">
          {formatearFechaUI(bloque.fechaHora, zonaHorariaNavegador())}
        </span>
      ),
    },
    {
      id: "disponible",
      header: "Disponible",
      cell: (bloque) => (
        <Badge variant={bloque.disponible === false ? "secondary" : "default"}>
          {bloque.disponible === false ? "Ocupado" : "Disponible"}
        </Badge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      className: "text-right",
      cell: (bloque) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              bloque.disponible === false ? "Activar bloque" : "Desactivar bloque"
            }
            onClick={() => manejarToggle(bloque)}
          >
            <Power
              size={16}
              className={bloque.disponible === false ? "text-primary" : "text-muted-foreground"}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Eliminar"
            onClick={() => setEliminando(bloque)}
          >
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Gestión de Disponibilidad"
        description="Administra tus bloques de disponibilidad para las reuniones con influencers."
        backHref="/dashboard"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={manejarGenerar}
              disabled={generar.isPending}
            >
              <Sparkles size={16} />
              {generar.isPending ? "Generando..." : "Generar"}
            </Button>
            <Button variant="outline" onClick={() => setLimpiando(true)}>
              Limpiar vencidos
            </Button>
            <Button onClick={() => setCreando(true)}>
              <CalendarPlus size={16} />
              Nuevo bloque
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Disponibles (esta página)</p>
          <p className="text-2xl font-semibold text-foreground">{disponibles}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total de bloques</p>
          <p className="text-2xl font-semibold text-foreground">{total}</p>
        </div>
      </div>

      <DataTable
        columnas={columnas}
        datos={bloques}
        getRowId={(bloque) => bloque.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="Aún no tienes bloques de disponibilidad. Genera desde tu horario o crea uno manualmente."
      />

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo bloque</DialogTitle>
            <DialogDescription>
              Crea un bloque de disponibilidad manualmente.
            </DialogDescription>
          </DialogHeader>
          <DisponibilidadForm
            onSuccess={() => setCreando(false)}
            onCancel={() => setCreando(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={limpiando}
        onOpenChange={(open) => !open && setLimpiando(false)}
        title="Limpiar bloques vencidos"
        description="Se eliminarán los bloques vencidos que no tengan reunión. Esta acción no se puede deshacer."
        confirmLabel="Limpiar"
        destructive
        isPending={limpiar.isPending}
        onConfirm={() => {
          limpiar.mutate(undefined, {
            onSuccess: (res) => {
              toast.success(
                res.eliminados > 0
                  ? `${res.eliminados} bloque(s) vencido(s) eliminados.`
                  : "No había bloques vencidos para limpiar.",
              )
              setLimpiando(false)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo limpiar la disponibilidad.",
              )
            },
          })
        }}
      />

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar bloque"
        description={
          eliminando
            ? `¿Seguro que deseas eliminar el bloque del ${formatearFechaUI(eliminando.fechaHora, zonaHorariaNavegador())}?`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Bloque eliminado correctamente.")
              setEliminando(null)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el bloque.",
              )
            },
          })
        }}
      />
    </div>
  )
}
