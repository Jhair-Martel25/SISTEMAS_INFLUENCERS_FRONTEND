"use client"

import { useState } from "react"
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
import { DataTable, type Columna } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

import { usePermission } from "@/hooks/usePermission"
import type { Plantilla } from "@/types/plantilla"
import {
  useEliminarPlantilla,
  usePlantillas,
} from "../hooks/usePlantillas"
import { PlantillaForm } from "./PlantillaForm"

export function PlantillaList() {
  const { isAdmin } = usePermission()

  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Plantilla | null>(null)
  const [eliminando, setEliminando] = useState<Plantilla | null>(null)

  const { data, isLoading, isError, error } = usePlantillas()
  const eliminar = useEliminarPlantilla()

  const plantillas = data ?? []
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar las plantillas."
    : null

  const columnas: Columna<Plantilla>[] = [
    {
      id: "nombre",
      header: "Nombre",
      cell: (plantilla) => (
        <span className="font-medium text-foreground">{plantilla.nombre}</span>
      ),
    },
    {
      id: "asunto",
      header: "Asunto",
      cell: (plantilla) => (
        <span className="text-muted-foreground">{plantilla.asunto}</span>
      ),
    },
    {
      id: "cuerpo",
      header: "Contenido",
      cell: (plantilla) => (
        <span
          className="block max-w-md truncate text-muted-foreground"
          title={plantilla.cuerpo}
        >
          {plantilla.cuerpo}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      className: "text-right",
      cell: (plantilla) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar"
            onClick={() => setEditando(plantilla)}
          >
            <Pencil size={16} />
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Eliminar"
              onClick={() => setEliminando(plantilla)}
            >
              <Trash2 size={16} className="text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Gestión de Plantillas"
        description="Administra las plantillas utilizadas por el sistema."
        backHref="/dashboard"
        actions={
          <Button onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nueva plantilla
          </Button>
        }
      />

      <DataTable
        columnas={columnas}
        datos={plantillas}
        getRowId={(plantilla) => plantilla.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />

      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva plantilla</DialogTitle>
            <DialogDescription>
              Crea una plantilla de correo.
            </DialogDescription>
          </DialogHeader>
          <PlantillaForm
            onSuccess={() => setCreando(false)}
            onCancel={() => setCreando(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editando)}
        onOpenChange={(open) => !open && setEditando(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>
              Actualiza los datos de la plantilla.
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <PlantillaForm
              plantilla={editando}
              onSuccess={() => setEditando(null)}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar plantilla"
        description={
          eliminando
            ? `¿Seguro que deseas eliminar la plantilla "${eliminando.nombre}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Plantilla eliminada correctamente.")
              setEliminando(null)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar la plantilla.",
              )
            },
          })
        }}
      />
    </div>
  )
}
