"use client"

import { useState } from "react"
import { Pencil, Plus, UserX } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type Columna,
} from "@/components/shared/data-table"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { PageHeader } from "@/components/shared/page-header"

import { ESTADO_USUARIO, type EstadoUsuario } from "@/types/api"
import type { Usuario } from "@/types/usuario"
import { etiquetaEstado } from "@/lib/utils/format"
import { formatearFechaUI } from "@/lib/utils/date"
import {
  useDesactivarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios"
import { UsuarioForm } from "./UsuarioForm"

const LIMITE = 10
const TODOS = "todos"

function nombreRol(roleId: number) {
  return roleId === 1 ? "Administrador" : "Voluntario"
}

export function UsuarioList() {
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState<EstadoUsuario | "">("")
  const [roleId, setRoleId] = useState<number | "">("")

  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [desactivando, setDesactivando] = useState<Usuario | null>(null)

  const { data, isLoading, isError, error } = useUsuarios({
    page,
    limit: LIMITE,
    estado: estado || undefined,
    roleId: roleId === "" ? undefined : roleId,
  })
  const desactivar = useDesactivarUsuario()

  const usuarios = data?.data ?? []
  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / LIMITE))

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los usuarios."
    : null

  const columnas: Columna<Usuario>[] = [
    {
      id: "nombre",
      header: "Nombre",
      cell: (usuario) => (
        <span className="font-medium text-foreground">{usuario.nombre}</span>
      ),
    },
    {
      id: "email",
      header: "Correo",
      cell: (usuario) => (
        <span className="text-muted-foreground">{usuario.email}</span>
      ),
    },
    {
      id: "rol",
      header: "Rol",
      cell: (usuario) => nombreRol(usuario.roleId),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (usuario) => <EstadoBadge estado={usuario.estado} tipo="usuario" />,
    },
    {
      id: "createdAt",
      header: "Fecha de registro",
      cell: (usuario) =>
        usuario.createdAt ? formatearFechaUI(usuario.createdAt) : "—",
    },
    {
      id: "acciones",
      header: "Acciones",
      className: "text-right",
      cell: (usuario) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar"
            onClick={() => setEditando(usuario)}
          >
            <Pencil size={16} />
          </Button>
          {usuario.estado === ESTADO_USUARIO.ACTIVO && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Desactivar"
              onClick={() => setDesactivando(usuario)}
            >
              <UserX size={16} className="text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios registrados en el sistema."
        backHref="/dashboard"
        actions={
          <Button onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nuevo usuario
          </Button>
        }
      />

      <DataTableToolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={estado || TODOS}
            onValueChange={(valor) => {
              setEstado(valor === TODOS ? "" : (valor as EstadoUsuario))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {Object.values(ESTADO_USUARIO).map((valor) => (
                <SelectItem key={valor} value={valor}>
                  {etiquetaEstado(valor, "usuario")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={roleId === "" ? TODOS : String(roleId)}
            onValueChange={(valor) => {
              setRoleId(valor === TODOS ? "" : Number(valor))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los roles</SelectItem>
              <SelectItem value="1">Administrador</SelectItem>
              <SelectItem value="2">Voluntario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DataTableToolbar>

      <DataTable
        columnas={columnas}
        datos={usuarios}
        getRowId={(usuario) => usuario.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={creando} onOpenChange={(open) => !open && setCreando(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea un usuario con acceso al sistema.
            </DialogDescription>
          </DialogHeader>
          <UsuarioForm
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
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del usuario.
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <UsuarioForm
              usuario={editando}
              onSuccess={() => setEditando(null)}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(desactivando)}
        onOpenChange={(open) => !open && setDesactivando(null)}
        title="Desactivar usuario"
        description={
          desactivando
            ? `¿Seguro que deseas desactivar a ${desactivando.nombre}? No podrá iniciar sesión.`
            : undefined
        }
        confirmLabel="Desactivar"
        destructive
        isPending={desactivar.isPending}
        onConfirm={() => {
          if (!desactivando) return
          desactivar.mutate(desactivando.id, {
            onSuccess: () => {
              toast.success("Usuario desactivado correctamente.")
              setDesactivando(null)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No fue posible desactivar el usuario.",
              )
            },
          })
        }}
      />
    </div>
  )
}
