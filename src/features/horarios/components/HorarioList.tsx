"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { EstadoBadge } from "@/components/shared/estado-badge"
import { PageHeader } from "@/components/shared/page-header"

import { usePermission } from "@/hooks/usePermission"
import type { DiaSemana } from "@/types/api"
import type { Horario } from "@/types/horario"
import { etiquetaEstado } from "@/lib/utils/format"
import {
  useEliminarHorario,
  useHorarios,
  useMisHorarios,
} from "../hooks/useHorarios"
import { HorarioForm } from "./HorarioForm"

/** Versión corta del UUID para mostrarla al ADMIN en la tabla. */
function idCorto(id: string) {
  return `${id.slice(0, 8)}…`
}

const LIMITE = 10

export function HorarioList() {
  const { isAdmin } = usePermission()

  const [page, setPage] = useState(1)
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Horario | null>(null)
  const [eliminando, setEliminando] = useState<Horario | null>(null)

  // ADMIN ve todos; VOLUNTARIO administra solo los suyos.
  // Cada rol ejecuta únicamente su endpoint (el otro queda deshabilitado).
  const listarAdmin = useHorarios({ page, limit: LIMITE }, { enabled: isAdmin })
  const listarMios = useMisHorarios(
    { page, limit: LIMITE },
    { enabled: !isAdmin },
  )
  const query = isAdmin ? listarAdmin : listarMios

  const { data, isLoading, isError, error } = query
  const eliminar = useEliminarHorario()

  const horarios = data?.data ?? []
  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / LIMITE))
  const diasOcupados = useMemo(
    () => new Set<DiaSemana>((data?.data ?? []).map((h) => h.diaSemana)),
    [data],
  )

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los horarios."
    : null

  const columnas: Columna<Horario>[] = [
    ...(isAdmin
      ? [
          {
            id: "voluntario",
            header: "Voluntario",
            cell: (horario: Horario) => (
              <span
                title={horario.voluntarioId}
                className="text-muted-foreground"
              >
                {horario.voluntarioId ? idCorto(horario.voluntarioId) : "—"}
              </span>
            ),
          },
        ]
      : []),
    {
      id: "diaSemana",
      header: "Día",
      cell: (horario) => <EstadoBadge estado={horario.diaSemana} tipo="dia" />,
    },
    {
      id: "horaInicio",
      header: "Hora de inicio",
      cell: (horario) => (
        <span className="text-muted-foreground">{horario.horaInicio}</span>
      ),
    },
    {
      id: "horaFin",
      header: "Hora de fin",
      cell: (horario) => (
        <span className="text-muted-foreground">{horario.horaFin}</span>
      ),
    },
    ...(isAdmin
      ? []
      : [
          {
            id: "acciones",
            header: "Acciones",
            className: "text-right",
            cell: (horario: Horario) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar"
                  onClick={() => setEditando(horario)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar"
                  onClick={() => setEliminando(horario)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ),
          },
        ]),
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Gestión de Horarios"
        description={
          isAdmin
            ? "Consulta el horario semanal de todos los voluntarios."
            : "Configura tu horario semanal. A partir de él se generan tus bloques de disponibilidad."
        }
        backHref="/dashboard"
        actions={
          !isAdmin && (
            <Button onClick={() => setCreando(true)}>
              <Plus size={16} />
              Nuevo horario
            </Button>
          )
        }
      />

      <DataTable
        columnas={columnas}
        datos={horarios}
        getRowId={(horario) => horario.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={
          isAdmin
            ? "Aún no hay horarios registrados."
            : "Aún no has configurado ningún horario. Crea tu primer bloque semanal."
        }
      />

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo horario</DialogTitle>
            <DialogDescription>
              Registra el horario de un día de la semana.
            </DialogDescription>
          </DialogHeader>
          <HorarioForm
            diasOcupados={diasOcupados}
            onSuccess={() => setCreando(false)}
            onCancel={() => setCreando(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editando)}
        onOpenChange={(open) => !open && setEditando(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar horario</DialogTitle>
            <DialogDescription>
              Actualiza el horario de este día.
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <HorarioForm
              horario={editando}
              onSuccess={() => setEditando(null)}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar horario"
        description={
          eliminando
            ? `¿Seguro que deseas eliminar el horario del día ${etiquetaEstado(eliminando.diaSemana, "dia")}?`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Horario eliminado correctamente.")
              setEliminando(null)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el horario.",
              )
            },
          })
        }}
      />
    </div>
  )
}
