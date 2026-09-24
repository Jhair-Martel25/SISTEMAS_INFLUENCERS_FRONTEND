"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Plus, Search, Sparkles, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { usePermission } from "@/hooks/usePermission"
import {
  ESTADO_CONTACTO,
  ESTADO_VALIDACION,
  type EstadoContacto,
  type EstadoValidacion,
} from "@/types/api"
import { TIPO_CATEGORIA } from "@/types/categoria"
import type { Influencer } from "@/types/influencer"
import { etiquetaEstado } from "@/lib/utils/format"
import { useCategorias } from "../../categorias/hooks/useCategorias"
import {
  useEliminarInfluencer,
  useInfluencers,
} from "../hooks/useInfluencers"
import { InfluencerForm } from "./InfluencerForm"
import { ImportarInfluencersModal } from "./ImportarInfluencersModal"

const LIMITE = 10
// Cuando hay un termino de busqueda activo, se piden mas registros al backend
// para que el filtro (que hoy es solo del lado del cliente, porque la API
// todavia no soporta busqueda por texto) tenga mas contra que buscar.
const LIMITE_CON_BUSQUEDA = 100
const TODOS = "todos"

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function InfluencerList() {
  const { isAdmin } = usePermission()

  const [page, setPage] = useState(1)
  const [estadoValidacion, setEstadoValidacion] = useState<
    EstadoValidacion | ""
  >("")
  const [estadoContacto, setEstadoContacto] = useState<EstadoContacto | "">("")
  const [tematica, setTematica] = useState("")
  const [busqueda, setBusqueda] = useState("")

  const [viendo, setViendo] = useState<Influencer | null>(null)
  const [editando, setEditando] = useState<Influencer | null>(null)
  const [eliminando, setEliminando] = useState<Influencer | null>(null)
  const [importando, setImportando] = useState(false)

  const { data: categorias } = useCategorias(TIPO_CATEGORIA.TEMATICA)
  const tematicas = [...(categorias?.TEMATICA ?? [])].sort(
    (a, b) => a.orden - b.orden,
  )

  const busquedaActiva = busqueda.trim().length > 0

  const { data, isLoading, isError, error } = useInfluencers({
    page: busquedaActiva ? 1 : page,
    limit: busquedaActiva ? LIMITE_CON_BUSQUEDA : LIMITE,
    estadoValidacion: estadoValidacion || undefined,
    estadoContacto: estadoContacto || undefined,
    tematica: tematica || undefined,
  })
  const eliminar = useEliminarInfluencer()

  const influencersCargados = useMemo(() => data?.data ?? [], [data])

  const influencers = useMemo(() => {
    if (!busquedaActiva) return influencersCargados
    const termino = busqueda.trim().toLowerCase()
    return influencersCargados.filter(
      (influencer) =>
        influencer.nombre.toLowerCase().includes(termino) ||
        influencer.usuarioIg.toLowerCase().includes(termino),
    )
  }, [influencersCargados, busqueda, busquedaActiva])

  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / LIMITE))

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los influencers."
    : null

  const hayFiltrosActivos = Boolean(estadoValidacion || estadoContacto || tematica)
  const sinInfluencersEnElSistema =
    !busquedaActiva && !hayFiltrosActivos && (data?.meta.total ?? 0) === 0

  const mensajeVacio = busquedaActiva
    ? "No hay resultados para esa busqueda en los registros cargados."
    : sinInfluencersEnElSistema
      ? "Todavia no hay influencers registrados en el sistema."
      : "No hay resultados para los filtros seleccionados."

  const columnas: Columna<Influencer>[] = [
    {
      id: "influencer",
      header: "Influencer",
      cell: (influencer) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {iniciales(influencer.nombre)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {influencer.nombre}
          </span>
        </div>
      ),
    },
    {
      id: "instagram",
      header: "Instagram",
      cell: (influencer) => (
        <a href={influencer.linkIg}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          @{influencer.usuarioIg}
        </a>
      ),
    },
    {
      id: "seguidores",
      header: "Seguidores",
      cell: (influencer) => influencer.seguidores ?? "-",
    },
    {
      id: "publicaciones",
      header: "Publicaciones",
      cell: (influencer) => influencer.cantidad_post ?? "-",
    },
    {
      id: "validacion",
      header: "Validacion",
      cell: (influencer) => (
        <EstadoBadge estado={influencer.estadoValidacion} tipo="validacion" />
      ),
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (influencer) => (
        <EstadoBadge estado={influencer.estadoContacto} tipo="contacto" />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      className: "text-right",
      cell: (influencer) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ver"
            onClick={() => setViendo(influencer)}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar"
            onClick={() => setEditando(influencer)}
          >
            <Pencil size={16} />
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Eliminar"
              onClick={() => setEliminando(influencer)}
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
        title="Gestion de Influencers"
        description="Administra, consulta y valida los influencers registrados en el sistema."
        backHref="/dashboard"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportando(true)}>
              <Upload size={16} />
              Importar influencers
            </Button>
            <Button variant="outline" asChild>
              <Link href="/influencers/importar">
                <Sparkles size={16} />
                Generar con IA
              </Link>
            </Button>
            <Button asChild>
              <Link href="/influencers/nuevo">
                <Plus size={16} />
                Nuevo Influencer
              </Link>
            </Button>
          </div>
        }
      />

      <DataTableToolbar>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o usuario..."
            className="pl-9 pr-9"
          />
          {busqueda && (
            <button
              type="button"
              aria-label="Limpiar busqueda"
              onClick={() => setBusqueda("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={estadoValidacion || TODOS}
            onValueChange={(valor) => {
              setEstadoValidacion(
                valor === TODOS ? "" : (valor as EstadoValidacion),
              )
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Validacion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {Object.values(ESTADO_VALIDACION).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {etiquetaEstado(estado, "validacion")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={estadoContacto || TODOS}
            onValueChange={(valor) => {
              setEstadoContacto(
                valor === TODOS ? "" : (valor as EstadoContacto),
              )
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Contacto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todo el contacto</SelectItem>
              {Object.values(ESTADO_CONTACTO).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {etiquetaEstado(estado, "contacto")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={tematica || TODOS}
            onValueChange={(valor) => {
              setTematica(valor === TODOS ? "" : valor)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tematica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las tematicas</SelectItem>
              {tematicas.map((t) => (
                <SelectItem key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DataTableToolbar>

      {busquedaActiva && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Buscando &quot;{busqueda.trim()}&quot; entre los {influencersCargados.length}{" "}
          registros mas recientes que coinciden con los filtros ({influencers.length}{" "}
          {influencers.length === 1 ? "resultado" : "resultados"}). La busqueda
          por texto todavia no cubre todo el listado del sistema.
        </p>
      )}

      <DataTable
        columnas={columnas}
        datos={influencers}
        getRowId={(influencer) => influencer.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={mensajeVacio}
      />

      {!busquedaActiva && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={Boolean(viendo)} onOpenChange={(open) => !open && setViendo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viendo?.nombre}</DialogTitle>
            <DialogDescription>@{viendo?.usuarioIg}</DialogDescription>
          </DialogHeader>
          {viendo && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Correo</p>
                <p className="font-medium">{viendo.email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefono</p>
                <p className="font-medium">{viendo.phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Seguidores</p>
                <p className="font-medium">{viendo.seguidores || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publicaciones</p>
                <p className="font-medium">{viendo.cantidad_post || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Link de perfil</p>
                <a href={viendo.linkIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline break-all"
                >
                  {viendo.linkIg}
                </a>
              </div>
              {viendo.biografia && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Biografia</p>
                  <p className="font-medium">{viendo.biografia}</p>
                </div>
              )}
              {viendo.mensajePersonalizado && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Mensaje personalizado</p>
                  <p className="font-medium">{viendo.mensajePersonalizado}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Validacion</p>
                <EstadoBadge
                  estado={viendo.estadoValidacion}
                  tipo="validacion"
                />
              </div>
              <div>
                <p className="text-muted-foreground">Contacto</p>
                <EstadoBadge estado={viendo.estadoContacto} tipo="contacto" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editando)} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar influencer</DialogTitle>
            <DialogDescription>
              Actualiza los datos del influencer.
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <InfluencerForm
              influencer={editando}
              onSuccess={() => setEditando(null)}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar influencer"
        description={
          eliminando
            ? `Seguro que deseas eliminar a ${eliminando.nombre}? Esta accion no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Influencer eliminado correctamente.")
              setEliminando(null)
              // Si era el unico registro de esta pagina (y no es la primera),
              // retrocedemos para no quedar viendo una pagina vacia.
              if (!busquedaActiva && influencers.length === 1 && page > 1) {
                setPage((p) => p - 1)
              }
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el influencer.",
              )
            },
          })
        }}
      />

      <ImportarInfluencersModal open={importando} onOpenChange={setImportando} />
    </div>
  )
}