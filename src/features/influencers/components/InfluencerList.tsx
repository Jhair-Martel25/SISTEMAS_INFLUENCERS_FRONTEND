"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, Eye, Mail, MessagesSquare, Pencil, Plus, Search, Send, Trash2, Upload, UserRound, Users, X } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { TIPO_EMBAJADOR, type TipoEmbajador } from "@/types/empresa"
import { etiquetaEstado } from "@/lib/utils/format"
import { useCategorias } from "../../categorias/hooks/useCategorias"
import {
  useEliminarInfluencer,
  useInfluencers,
} from "../hooks/useInfluencers"
import { InfluencerForm } from "./InfluencerForm"
import { ImportarInfluencersModal } from "./ImportarInfluencersModal"
import { ImportacionMasivaModal } from "./ImportacionMasivaModal"
import { ContactarInfluencerModal } from "./ContactarInfluencerModal"
import { ContactoMasivoModal } from "./ContactoMasivoModal"

const LIMITE = 10
// Cuando hay un termino de busqueda activo, se piden mas registros al backend
// para que el filtro (que hoy es solo del lado del cliente, porque la API
// todavia no soporta busqueda por texto) tenga mas contra que buscar.
const LIMITE_CON_BUSQUEDA = 100

// Filtro por red social (se aplica en el cliente: el backend aun no acepta
// el parametro `redSocial` en GET /influencers).
type FiltroRed = "" | "INSTAGRAM" | "TIKTOK" | "FACEBOOK" | "CORREO"
const OPCIONES_RED: { value: Exclude<FiltroRed, "">; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "CORREO", label: "Correo (con email)" },
]

function coincideRed(influencer: Influencer, filtro: FiltroRed) {
  if (!filtro) return true
  if (filtro === "CORREO") return Boolean(influencer.email?.trim())
  return (influencer.redSocial ?? "INSTAGRAM").toUpperCase() === filtro
}
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
  const [tipoEmbajador, setTipoEmbajador] = useState<TipoEmbajador | "">("")
  const [busqueda, setBusqueda] = useState("")

  const [viendo, setViendo] = useState<Influencer | null>(null)
  const [editando, setEditando] = useState<Influencer | null>(null)
  const [eliminando, setEliminando] = useState<Influencer | null>(null)
  const [importando, setImportando] = useState(false)
  const [importacionMasiva, setImportacionMasiva] = useState(false)
  const [contactando, setContactando] = useState<Influencer | null>(null)
  // Seleccion multiple (se mantiene al cambiar de pagina o de filtros).
  const [seleccionados, setSeleccionados] = useState<Map<string, Influencer>>(
    () => new Map(),
  )
  const [contactoMasivo, setContactoMasivo] = useState(false)
  // Modo "mensaje masivo": muestra las casillas de seleccion en la tabla.
  const [modoSeleccion, setModoSeleccion] = useState(false)

  function salirModoSeleccion() {
    setModoSeleccion(false)
    setSeleccionados(new Map())
  }

  function alternarSeleccion(influencer: Influencer, marcado: boolean) {
    setSeleccionados((actual) => {
      const nuevo = new Map(actual)
      if (marcado) nuevo.set(influencer.id, influencer)
      else nuevo.delete(influencer.id)
      return nuevo
    })
  }

  function alternarPagina(lista: Influencer[], marcado: boolean) {
    setSeleccionados((actual) => {
      const nuevo = new Map(actual)
      for (const influencer of lista) {
        if (marcado) nuevo.set(influencer.id, influencer)
        else nuevo.delete(influencer.id)
      }
      return nuevo
    })
  }

  const { data: categorias } = useCategorias(TIPO_CATEGORIA.TEMATICA)
  const tematicas = [...(categorias?.TEMATICA ?? [])].sort(
    (a, b) => a.orden - b.orden,
  )

  const busquedaActiva = busqueda.trim().length > 0
  const [redFiltro, setRedFiltro] = useState<FiltroRed>("")
  // Busqueda por texto o filtro de red: se cargan mas registros y se filtra aqui.
  const filtroLocalActivo = busquedaActiva || Boolean(redFiltro)

  const { data, isLoading, isError, error } = useInfluencers({
    page: filtroLocalActivo ? 1 : page,
    limit: filtroLocalActivo ? LIMITE_CON_BUSQUEDA : LIMITE,
    estadoValidacion: estadoValidacion || undefined,
    estadoContacto: estadoContacto || undefined,
    tipoEmbajador: tipoEmbajador || undefined,
    tematica: tematica || undefined,
  })
  const eliminar = useEliminarInfluencer()

  const influencersCargados = useMemo(() => data?.data ?? [], [data])

  const influencers = useMemo(() => {
    if (!filtroLocalActivo) return influencersCargados
    const termino = busqueda.trim().toLowerCase()
    return influencersCargados.filter(
      (influencer) =>
        coincideRed(influencer, redFiltro) &&
        (!termino ||
          influencer.nombre.toLowerCase().includes(termino) ||
          influencer.usuarioIg.toLowerCase().includes(termino)),
    )
  }, [influencersCargados, busqueda, redFiltro, filtroLocalActivo])

  const totalPages = Math.max(1, Math.ceil((data?.meta.total ?? 0) / LIMITE))

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los embajadores."
    : null

  const hayFiltrosActivos = Boolean(
    estadoValidacion || estadoContacto || tematica || redFiltro || tipoEmbajador,
  )
  const sinInfluencersEnElSistema =
    !busquedaActiva && !hayFiltrosActivos && (data?.meta.total ?? 0) === 0

  const mensajeVacio = busquedaActiva
    ? "No hay resultados para esa busqueda en los registros cargados."
    : sinInfluencersEnElSistema
      ? "Todavia no hay embajadores registrados en el sistema."
      : "No hay resultados para los filtros seleccionados."

  const seleccionadosEnPagina = influencers.filter((i) => seleccionados.has(i.id)).length
  const paginaCompleta =
    influencers.length > 0 && seleccionadosEnPagina === influencers.length
  const listaSeleccionados = [...seleccionados.values()]
  const seleccionadosConCorreo = listaSeleccionados.filter((i) => i.email?.trim()).length

  const columnaSeleccion: Columna<Influencer> = {
    id: "seleccion",
    className: "w-10",
    header: (
      <Checkbox
        aria-label="Seleccionar todos los de esta pagina"
        checked={
          paginaCompleta ? true : seleccionadosEnPagina > 0 ? "indeterminate" : false
        }
        onCheckedChange={(v) => alternarPagina(influencers, v === true)}
      />
    ),
    cell: (influencer) => (
      <Checkbox
        aria-label={`Seleccionar ${influencer.nombre}`}
        checked={seleccionados.has(influencer.id)}
        onCheckedChange={(v) => alternarSeleccion(influencer, v === true)}
      />
    ),
  }

  const columnasBase: Columna<Influencer>[] = [
    {
      id: "influencer",
      header: "Embajador",
      cell: (influencer) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {iniciales(influencer.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="block font-medium text-foreground">
              {influencer.nombre}
            </span>
            {influencer.empresaRegistrada && (
              <Link
                href={`/empresas/${influencer.empresaRegistrada.id}`}
                className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Building2 size={12} />
                {influencer.empresaRegistrada.nombre}
              </Link>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "tipoEmbajador",
      header: "Tipo",
      cell: (influencer) => {
        const esEmpresa = influencer.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
        return (
          <Badge
            variant={esEmpresa ? "secondary" : "outline"}
            className="gap-1 font-medium"
          >
            {esEmpresa ? (
              <>
                <Building2 size={12} className="text-primary" />
                Empresa
              </>
            ) : (
              <>
                <UserRound size={12} className="text-muted-foreground" />
                Influencer
              </>
            )}
          </Badge>
        )
      },
    },
    {
      id: "canalContacto",
      header:
        tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
          ? "Correo"
          : tipoEmbajador === TIPO_EMBAJADOR.INFLUENCER
            ? "Instagram"
            : "Instagram / Correo",
      cell: (influencer) => {
        const esEmpresa = influencer.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
        if (esEmpresa) {
          const correo = influencer.email?.trim()
          return correo ? (
            <a
              href={`mailto:${correo}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary max-w-[200px]"
              title={correo}
            >
              <Mail size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{correo}</span>
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )
        }

        const handle = influencer.usuarioIg?.trim()
        return handle ? (
          <a
            href={influencer.linkIg || `https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            @{handle}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "datoPrincipal",
      header:
        tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
          ? "RUC"
          : tipoEmbajador === TIPO_EMBAJADOR.INFLUENCER
            ? "Seguidores"
            : "Seguidores / RUC",
      cell: (influencer) => {
        const esEmpresa = influencer.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
        if (esEmpresa) {
          const ruc = influencer.ruc?.trim() || influencer.empresaRegistrada?.ruc?.trim()
          return ruc ? (
            <span className="font-mono text-xs font-medium text-foreground">
              {ruc}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )
        }
        return (
          <span className="text-xs text-foreground">
            {influencer.seguidores || "-"}
          </span>
        )
      },
    },
    {
      id: "datoSecundario",
      header:
        tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
          ? "CIIU"
          : tipoEmbajador === TIPO_EMBAJADOR.INFLUENCER
            ? "Publicaciones"
            : "Publicaciones / CIIU",
      cell: (influencer) => {
        const esEmpresa = influencer.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
        if (esEmpresa) {
          const ciiu = influencer.ciiu?.trim() || influencer.empresaRegistrada?.ciiu?.trim()
          return ciiu ? (
            <span className="font-mono text-xs font-medium text-foreground">
              {ciiu}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )
        }
        return (
          <span className="text-xs text-foreground">
            {influencer.cantidad_post || "-"}
          </span>
        )
      },
    },
    {
      id: "validacion",
      header: "Validacion",
      cell: (influencer) => (
        <EstadoBadge estado={influencer.estadoValidacion} tipo="validacion" />
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
            aria-label="Contactar"
            title="Contactar"
            onClick={() => setContactando(influencer)}
          >
            <Send size={16} className="text-primary" />
          </Button>
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

  const columnas = modoSeleccion
    ? [columnaSeleccion, ...columnasBase]
    : columnasBase

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Gestión de Embajadores"
        description="Administra, consulta y valida los embajadores registrados en el sistema."
        backHref="/dashboard"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setImportando(true)}>
              <Upload size={16} />
              Importar embajadores
            </Button>
            {/* Boton "Importar influencers" (CSV/Excel) oculto temporalmente.
            <Button variant="outline" onClick={() => setImportando(true)}>
              <Upload size={16} />
              Importar influencers
            </Button>
            */}
            <Button variant="outline" onClick={() => setImportacionMasiva(true)}>
              <Search size={16} />
              Importacion masiva
            </Button>
            <Button variant="outline" asChild>
              <Link href="/influencers/captar">
                <Search size={16} />
                Captar influencers
              </Link>
            </Button>

            <Button
              variant={modoSeleccion ? "secondary" : "outline"}
              onClick={() =>
                modoSeleccion ? salirModoSeleccion() : setModoSeleccion(true)
              }
            >
              {modoSeleccion ? <X size={16} /> : <MessagesSquare size={16} />}
              {modoSeleccion ? "Cancelar mensaje masivo" : "Mensaje masivo"}
            </Button>
            <Button asChild>
              <Link href="/influencers/nuevo">
                <Plus size={16} />
                Nuevo Embajador
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
            value={tipoEmbajador || TODOS}
            onValueChange={(valor) => {
              setTipoEmbajador(
                valor === TODOS ? "" : (valor as TipoEmbajador),
              )
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los tipos</SelectItem>
              <SelectItem value={TIPO_EMBAJADOR.EMPRESA}>Empresa</SelectItem>
              <SelectItem value={TIPO_EMBAJADOR.INFLUENCER}>
                Influencer
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={redFiltro || TODOS}
            onValueChange={(valor) =>
              setRedFiltro(valor === TODOS ? "" : (valor as FiltroRed))
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Red social" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las redes</SelectItem>
              {OPCIONES_RED.map((opcion) => (
                <SelectItem key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {redFiltro && !busquedaActiva && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Mostrando {influencers.length}{" "}
          {influencers.length === 1 ? "embajador" : "embajadores"} de{" "}
          {OPCIONES_RED.find((o) => o.value === redFiltro)?.label} entre los{" "}
          {influencersCargados.length} registros mas recientes que coinciden con
          los filtros.
        </p>
      )}

      {busquedaActiva && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Buscando &quot;{busqueda.trim()}&quot; entre los {influencersCargados.length}{" "}
          registros mas recientes que coinciden con los filtros ({influencers.length}{" "}
          {influencers.length === 1 ? "resultado" : "resultados"}). La busqueda
          por texto todavia no cubre todo el listado del sistema.
        </p>
      )}

      {modoSeleccion && (
        <div className="sticky top-2 z-10 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {seleccionados.size}
            </span>
            <div className="text-sm">
              <p className="font-medium">
                {seleccionados.size === 0
                  ? "Mensaje masivo: selecciona embajadores"
                  : seleccionados.size === 1
                    ? "1 embajador seleccionado"
                    : `${seleccionados.size} embajadores seleccionados`}
              </p>
              <p className="text-xs text-muted-foreground">
                {seleccionados.size === 0
                  ? "Marca las casillas de la tabla. Puedes usar los filtros y cambiar de pagina."
                  : `${seleccionadosConCorreo} con correo · ${seleccionados.size - seleccionadosConCorreo} solo por DM`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {seleccionados.size > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSeleccionados(new Map())}>
                <X size={14} />
                Quitar seleccion
              </Button>
            )}
            <Button
              size="sm"
              disabled={seleccionados.size === 0}
              onClick={() => setContactoMasivo(true)}
            >
              <Users size={14} />
              Enviar mensaje
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columnas={columnas}
        datos={influencers}
        getRowId={(influencer) => influencer.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={mensajeVacio}
      />

      {!filtroLocalActivo && (
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
              <div className="col-span-2">
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {viendo.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
                    ? "Empresa"
                    : "Influencer"}
                </p>
              </div>
              {viendo.empresaRegistrada && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Empresa</p>
                  <Link
                    href={`/empresas/${viendo.empresaRegistrada.id}`}
                    className="font-medium text-primary underline"
                  >
                    {viendo.empresaRegistrada.nombre}
                  </Link>
                </div>
              )}
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
            <DialogTitle>Editar embajador</DialogTitle>
            <DialogDescription>
              Actualiza los datos del embajador.
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
        title="Eliminar embajador"
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
              toast.success("Embajador eliminado correctamente.")
              setEliminando(null)
              // Si era el unico registro de esta pagina (y no es la primera),
              // retrocedemos para no quedar viendo una pagina vacia.
              if (!filtroLocalActivo && influencers.length === 1 && page > 1) {
                setPage((p) => p - 1)
              }
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el embajador.",
              )
            },
          })
        }}
      />

      <ImportarInfluencersModal open={importando} onOpenChange={setImportando} />
      <ImportacionMasivaModal open={importacionMasiva} onOpenChange={setImportacionMasiva} />
      <ContactoMasivoModal
        influencers={listaSeleccionados}
        open={contactoMasivo}
        onOpenChange={setContactoMasivo}
        onFinalizar={salirModoSeleccion}
      />
      <ContactarInfluencerModal
        influencer={contactando}
        onOpenChange={(open) => !open && setContactando(null)}
      />
    </div>
  )
}