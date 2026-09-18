# ============================================================================
# Script de actualizacion - Gestion de Influencers (rama feature/jhostyn-ui-influencers)
#
# Que hace:
#   1. Mejora InfluencerList.tsx: buscador por nombre/usuario, filtro por
#      tematica, boton "Importar influencers", limpieza de mojibake.
#   2. Mejora InfluencerForm.tsx + su schema: asteriscos en campos
#      obligatorios, validaciones de formato (usuario IG, telefono, URL),
#      contadores de caracteres en biografia y mensaje personalizado.
#   3. Corrige mojibake en data-table.tsx (Pagina, puntos suspensivos).
#   4. Crea ImportarInfluencersModal.tsx: UI completa de importacion masiva
#      (subir CSV/Excel, validar extension/tamano, vista previa con
#      errores por fila). NO esta conectado al backend todavia, es solo UI.
#
# Como correrlo:
#   1. Abre la terminal de PowerShell en VS Code.
#   2. Asegurate de estar en la raiz del proyecto:
#      cd C:\Users\User\Documents\GitHub\SISTEMAS_INFLUENCERS_FRONTEND
#   3. Confirma que estas en tu rama de trabajo (feature/jhostyn-ui-influencers):
#      git branch --show-current
#   4. Corre este script:
#      .\actualizar-gestion-influencers.ps1
#   5. Cuando termine, corre:
#      npx tsc --noEmit
#      para confirmar que no hay errores de tipos.
#
# Cada archivo se escribe con verificacion: si algo falla, el script te lo
# dice en rojo y no asume que funciono.
# ============================================================================

$ErrorActionPreference = "Stop"

function Write-FileVerificado {
    param(
        [string]$RutaRelativa,
        [string]$Contenido
    )
    try {
        $rutaCompleta = Join-Path -Path (Get-Location) -ChildPath $RutaRelativa
        $directorio = Split-Path -Path $rutaCompleta -Parent
        if ($directorio -and -not (Test-Path $directorio)) {
            New-Item -ItemType Directory -Path $directorio -Force | Out-Null
        }

        [System.IO.File]::WriteAllText($rutaCompleta, $Contenido, [System.Text.Encoding]::ASCII)

        $verificacion = Get-Content -Raw -Path $rutaCompleta
        $esperado = $Contenido.Length
        $leido = $verificacion.Length

        if ($leido -eq $esperado) {
            Write-Host "OK   $RutaRelativa ($leido caracteres verificados)" -ForegroundColor Green
        } else {
            Write-Host "FAIL $RutaRelativa (esperados $esperado, leidos $leido - revisa el archivo a mano)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR $RutaRelativa : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Actualizando archivos de Gestion de Influencers..." -ForegroundColor Cyan
Write-Host ""

# --- src\features\influencers\components\InfluencerList.tsx ---
$InfluencerList = @'
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

  const influencersCargados = data?.data ?? []

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
          Buscando "{busqueda.trim()}" entre los {influencersCargados.length}{" "}
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
        emptyMessage={
          busquedaActiva
            ? "No hay resultados para esa busqueda en los registros cargados."
            : "No hay resultados para los filtros seleccionados."
        }
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
'@
Write-FileVerificado -RutaRelativa "src\features\influencers\components\InfluencerList.tsx" -Contenido $InfluencerList

# --- src\features\influencers\components\InfluencerForm.tsx ---
$InfluencerForm = @'
"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { ESTADO_VALIDACION } from "@/types/api"
import type { Influencer } from "@/types/influencer"
import { etiquetaEstado } from "@/lib/utils/format"
import {
  useCrearInfluencer,
  useEditarInfluencer,
} from "../hooks/useInfluencers"
import {
  influencerFormSchema,
  type InfluencerFormValues,
} from "../schemas/influencer-form.schema"

const BIOGRAFIA_MAX = 500
const MENSAJE_MAX = 1000

function valoresIniciales(influencer?: Influencer | null): InfluencerFormValues {
  return {
    nombre: influencer?.nombre ?? "",
    usuarioIg: influencer?.usuarioIg ?? "",
    linkIg: influencer?.linkIg ?? "",
    email: influencer?.email ?? "",
    phone: influencer?.phone ?? "",
    seguidores: influencer?.seguidores ?? "",
    cantidad_post: influencer?.cantidad_post ?? "",
    biografia: influencer?.biografia ?? "",
    mensajePersonalizado: influencer?.mensajePersonalizado ?? "",
    estadoValidacion: influencer?.estadoValidacion ?? ESTADO_VALIDACION.PENDIENTE,
  }
}

const limpiaOpcional = (valor: string) => (valor.trim() ? valor.trim() : undefined)

interface InfluencerFormProps {
  influencer?: Influencer | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function InfluencerForm({
  influencer,
  onSuccess,
  onCancel,
}: InfluencerFormProps) {
  const router = useRouter()
  const crear = useCrearInfluencer()
  const editar = useEditarInfluencer()
  const esEdicion = Boolean(influencer)
  const pendiente = crear.isPending || editar.isPending

  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerFormSchema),
    defaultValues: valoresIniciales(influencer),
  })

  const biografiaValor = form.watch("biografia") ?? ""
  const mensajeValor = form.watch("mensajePersonalizado") ?? ""

  function handleSubmit(values: InfluencerFormValues) {
    const payload = {
      nombre: values.nombre,
      usuarioIg: values.usuarioIg,
      linkIg: values.linkIg,
      email: limpiaOpcional(values.email),
      phone: limpiaOpcional(values.phone),
      seguidores: limpiaOpcional(values.seguidores),
      cantidad_post: limpiaOpcional(values.cantidad_post),
      biografia: limpiaOpcional(values.biografia),
      mensajePersonalizado: limpiaOpcional(values.mensajePersonalizado),
      estadoValidacion: values.estadoValidacion,
    }

    if (esEdicion && influencer) {
      editar.mutate(
        { id: influencer.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Influencer actualizado correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el influencer.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Influencer creado correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el influencer.",
        )
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Andrea Paz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="usuarioIg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Usuario de Instagram{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="andreapaz" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Sin el @. Solo letras, numeros, puntos y guiones bajos.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkIg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Link del perfil <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electronico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 999 999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="seguidores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seguidores</FormLabel>
                <FormControl>
                  <Input placeholder="150k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cantidad_post"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publicaciones</FormLabel>
                <FormControl>
                  <Input placeholder="120" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="biografia"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Biografia</FormLabel>
                <span
                  className={`text-xs ${
                    biografiaValor.length > BIOGRAFIA_MAX
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {biografiaValor.length}/{BIOGRAFIA_MAX}
                </span>
              </div>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensajePersonalizado"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Mensaje personalizado</FormLabel>
                <span
                  className={`text-xs ${
                    mensajeValor.length > MENSAJE_MAX
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {mensajeValor.length}/{MENSAJE_MAX}
                </span>
              </div>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estadoValidacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de validacion</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ESTADO_VALIDACION).map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {etiquetaEstado(estado, "validacion")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={pendiente}
            onClick={onCancel ?? (() => router.back())}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pendiente}>
            {pendiente && <Loader2 className="animate-spin" size={16} />}
            {esEdicion ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
'@
Write-FileVerificado -RutaRelativa "src\features\influencers\components\InfluencerForm.tsx" -Contenido $InfluencerForm

# --- src\features\influencers\schemas\influencer-form.schema.ts ---
$InfluencerFormSchema = @'
import { z } from 'zod'
import { EstadoValidacionEnum } from './influencers.schema'

/**
 * Schema de validacion del formulario de influencer (crear/editar).
 *
 * Valida solo el formato de los campos; las reglas de negocio las aplica
 * el backend. `usuarioIg` NO incluye el "@" (el backend guarda el handle,
 * asi que si el usuario lo escribe con @ se lo quitamos automaticamente).
 */

const USUARIO_IG_REGEX = /^[a-zA-Z0-9._]{1,30}$/
const TELEFONO_REGEX = /^[0-9+()\-\s]{6,20}$/

export const influencerFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre es demasiado largo (maximo 120 caracteres)'),
  usuarioIg: z
    .string()
    .trim()
    .min(1, 'El usuario de Instagram es obligatorio')
    .transform((valor) => valor.replace(/^@+/, ''))
    .refine((valor) => USUARIO_IG_REGEX.test(valor), {
      message:
        'Usa solo letras, numeros, puntos y guiones bajos (sin el @, maximo 30 caracteres)',
    }),
  linkIg: z
    .string()
    .trim()
    .min(1, 'El link del perfil es obligatorio')
    .url('Ingresa una URL valida'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo valido')
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .refine((valor) => valor === '' || TELEFONO_REGEX.test(valor), {
      message:
        'Ingresa un telefono valido (numeros, espacios, +, - y parentesis)',
    }),
  seguidores: z.string().trim(),
  cantidad_post: z.string().trim(),
  biografia: z
    .string()
    .trim()
    .max(500, 'Maximo 500 caracteres'),
  mensajePersonalizado: z
    .string()
    .trim()
    .max(1000, 'Maximo 1000 caracteres'),
  estadoValidacion: EstadoValidacionEnum,
})

export type InfluencerFormValues = z.infer<typeof influencerFormSchema>
'@
Write-FileVerificado -RutaRelativa "src\features\influencers\schemas\influencer-form.schema.ts" -Contenido $InfluencerFormSchema

# --- src\components\shared\data-table.tsx ---
$DataTable = @'
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Columna<T> {
  id: string
  header: ReactNode
  cell: (fila: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columnas: Columna<T>[]
  datos: T[]
  getRowId: (fila: T) => string
  isLoading?: boolean
  emptyMessage?: string
  errorMessage?: string | null
  filasSkeleton?: number
}

export function DataTable<T>({
  columnas,
  datos,
  getRowId,
  isLoading = false,
  emptyMessage = "No hay resultados para los filtros seleccionados.",
  errorMessage = null,
  filasSkeleton = 5,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columnas.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: filasSkeleton }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {columnas.map((col) => (
                  <TableCell key={col.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnas.length}
                className="h-24 text-center text-destructive"
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : datos.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnas.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            datos.map((fila) => (
              <TableRow key={getRowId(fila)}>
                {columnas.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.cell(fila)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface DataTableToolbarProps {
  children: ReactNode
  className?: string
}

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  )
}

function generarRangoPaginas(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const delta = 1
  const range: number[] = []
  const left = page - delta
  const right = page + delta

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i)
    }
  }

  const result: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of range) {
    if (prev && p - prev > 1) result.push("ellipsis")
    result.push(p)
    prev = p
  }
  return result
}

interface DataTablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  const paginas = generarRangoPaginas(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Pagina {page} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {paginas.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
'@
Write-FileVerificado -RutaRelativa "src\components\shared\data-table.tsx" -Contenido $DataTable

# --- src\features\influencers\components\ImportarInfluencersModal.tsx ---
$ImportarInfluencersModal = @'
"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable, type Columna } from "@/components/shared/data-table"

/**
 * Modal para importar influencers en lote desde un archivo CSV o Excel.
 *
 * Por ahora esto es SOLO interfaz: lee y valida el archivo del lado del
 * cliente y muestra una vista previa, pero el boton final de importar no
 * llama a ningun endpoint todavia (no existe un endpoint de importacion
 * masiva confirmado en el backend). Queda listo para conectar en cuanto
 * el backend lo tenga.
 */

const EXTENSIONES_PERMITIDAS = [".csv", ".xlsx", ".xls"]
const TAMANO_MAXIMO_MB = 5
const FILAS_MAXIMAS = 500

interface FilaImportada {
  numeroFila: number
  nombre: string
  usuarioIg: string
  linkIg: string
  email: string
  phone: string
  seguidores: string
  cantidad_post: string
  biografia: string
  errores: string[]
}

const ALIAS_COLUMNAS: Record<keyof Omit<FilaImportada, "numeroFila" | "errores">, string[]> = {
  nombre: ["nombre", "name", "nombrecompleto"],
  usuarioIg: ["usuario", "usuarioig", "instagram", "handle", "usuarioinstagram", "usuariodeinstagram"],
  linkIg: ["link", "linkig", "url", "perfil", "linkperfil", "enlace", "linkdeperfil"],
  email: ["email", "correo", "correoelectronico"],
  phone: ["telefono", "phone", "celular", "whatsapp"],
  seguidores: ["seguidores", "followers"],
  cantidad_post: ["publicaciones", "posts", "cantidadpost", "cantidaddepost"],
  biografia: ["biografia", "bio", "descripcion"],
}

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function extensionValida(nombreArchivo: string): boolean {
  const nombreEnMinusculas = nombreArchivo.toLowerCase()
  return EXTENSIONES_PERMITIDAS.some((ext) => nombreEnMinusculas.endsWith(ext))
}

function mapearFila(
  filaOriginal: Record<string, unknown>,
  indiceColumnas: Map<string, string>,
  numeroFila: number,
): FilaImportada {
  const valores: Record<string, string> = {
    nombre: "",
    usuarioIg: "",
    linkIg: "",
    email: "",
    phone: "",
    seguidores: "",
    cantidad_post: "",
    biografia: "",
  }

  for (const [headerOriginal, valorCelda] of Object.entries(filaOriginal)) {
    const headerNormalizado = normalizarTexto(headerOriginal)
    const campo = indiceColumnas.get(headerNormalizado)
    if (campo) {
      valores[campo] = String(valorCelda ?? "").trim()
    }
  }

  const errores: string[] = []
  if (!valores.nombre) errores.push("Falta el nombre")
  if (!valores.usuarioIg) errores.push("Falta el usuario de Instagram")
  if (!valores.linkIg) {
    errores.push("Falta el link del perfil")
  } else if (!/^https?:\/\/.+/i.test(valores.linkIg)) {
    errores.push("El link del perfil no parece una URL valida")
  }

  return {
    numeroFila,
    nombre: valores.nombre,
    usuarioIg: valores.usuarioIg.replace(/^@+/, ""),
    linkIg: valores.linkIg,
    email: valores.email,
    phone: valores.phone,
    seguidores: valores.seguidores,
    cantidad_post: valores.cantidad_post,
    biografia: valores.biografia,
    errores,
  }
}

function construirIndiceColumnas(): Map<string, string> {
  const indice = new Map<string, string>()
  for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
    for (const nombreAlias of alias) {
      indice.set(nombreAlias, campo)
    }
  }
  return indice
}

interface ImportarInfluencersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportarInfluencersModal({
  open,
  onOpenChange,
}: ImportarInfluencersModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [archivo, setArchivo] = useState<File | null>(null)
  const [filas, setFilas] = useState<FilaImportada[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)

  const filasValidas = filas.filter((f) => f.errores.length === 0)
  const filasConError = filas.filter((f) => f.errores.length > 0)

  function limpiar() {
    setArchivo(null)
    setFilas([])
    setErrorArchivo(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleClose(open: boolean) {
    if (!open) limpiar()
    onOpenChange(open)
  }

  async function handleArchivoSeleccionado(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorArchivo(null)
    setFilas([])

    if (!extensionValida(file.name)) {
      setErrorArchivo(
        `Formato no soportado. Usa un archivo ${EXTENSIONES_PERMITIDAS.join(", ")}.`,
      )
      setArchivo(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrorArchivo(`El archivo supera el tamano maximo permitido (${TAMANO_MAXIMO_MB} MB).`)
      setArchivo(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setArchivo(file)
    setProcesando(true)

    try {
      const buffer = await file.arrayBuffer()
      const libro = XLSX.read(buffer, { type: "array" })
      const primeraHoja = libro.SheetNames[0]

      if (!primeraHoja) {
        setErrorArchivo("El archivo no tiene ninguna hoja con datos.")
        setProcesando(false)
        return
      }

      const filasCrudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        libro.Sheets[primeraHoja],
        { defval: "" },
      )

      if (filasCrudas.length === 0) {
        setErrorArchivo("El archivo no tiene filas con datos (o falta la fila de encabezados).")
        setProcesando(false)
        return
      }

      if (filasCrudas.length > FILAS_MAXIMAS) {
        setErrorArchivo(
          `El archivo tiene ${filasCrudas.length} filas. Por ahora el limite es ${FILAS_MAXIMAS} por importacion.`,
        )
        setProcesando(false)
        return
      }

      const indiceColumnas = construirIndiceColumnas()
      const filasMapeadas = filasCrudas.map((fila, i) =>
        mapearFila(fila, indiceColumnas, i + 2), // +2: fila 1 es encabezado
      )

      setFilas(filasMapeadas)
    } catch {
      setErrorArchivo(
        "No se pudo leer el archivo. Confirma que sea un CSV o Excel valido y no este danado.",
      )
    } finally {
      setProcesando(false)
    }
  }

  const columnasPreview: Columna<FilaImportada>[] = [
    {
      id: "fila",
      header: "Fila",
      cell: (fila) => fila.numeroFila,
      className: "w-14 text-muted-foreground",
    },
    {
      id: "nombre",
      header: "Nombre",
      cell: (fila) => fila.nombre || "-",
    },
    {
      id: "usuario",
      header: "Usuario IG",
      cell: (fila) => (fila.usuarioIg ? `@${fila.usuarioIg}` : "-"),
    },
    {
      id: "link",
      header: "Link",
      cell: (fila) =>
        fila.linkIg ? (
          <span className="block max-w-[220px] truncate text-muted-foreground">
            {fila.linkIg}
          </span>
        ) : (
          "-"
        ),
    },
    {
      id: "seguidores",
      header: "Seguidores",
      cell: (fila) => fila.seguidores || "-",
    },
    {
      id: "estado",
      header: "Estado",
      cell: (fila) =>
        fila.errores.length === 0 ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 size={12} />
            Listo
          </Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit gap-1">
              <AlertCircle size={12} />
              {fila.errores.length === 1 ? "1 error" : `${fila.errores.length} errores`}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {fila.errores.join("; ")}
            </span>
          </div>
        ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar influencers</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV o Excel con tus influencers. Columnas
            reconocidas: nombre, usuario de Instagram, link del perfil
            (obligatorias), y opcionalmente correo, telefono, seguidores,
            publicaciones y biografia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!archivo ? (
            <label
              htmlFor="archivo-importar"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <Upload size={28} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Haz clic para elegir un archivo
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: {EXTENSIONES_PERMITIDAS.join(", ")} (maximo{" "}
                {TAMANO_MAXIMO_MB} MB)
              </p>
              <input
                id="archivo-importar"
                ref={inputRef}
                type="file"
                accept={EXTENSIONES_PERMITIDAS.join(",")}
                className="hidden"
                onChange={handleArchivoSeleccionado}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet size={18} className="shrink-0 text-primary" />
                <span className="truncate text-sm font-medium text-foreground">
                  {archivo.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ({(archivo.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar archivo"
                onClick={limpiar}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {errorArchivo && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorArchivo}</span>
            </div>
          )}

          {procesando && (
            <p className="text-center text-sm text-muted-foreground">
              Leyendo archivo...
            </p>
          )}

          {filas.length > 0 && !procesando && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 size={12} />
                  {filasValidas.length} listos
                </Badge>
                {filasConError.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle size={12} />
                    {filasConError.length} con errores
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  de {filas.length} filas encontradas
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <DataTable
                  columnas={columnasPreview}
                  datos={filas}
                  getRowId={(fila) => String(fila.numeroFila)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          {filas.length > 0 && !procesando && (
            <p className="text-center text-xs text-muted-foreground">
              La importacion todavia no esta conectada al backend. Esta vista
              previa confirma que tu archivo esta listo para cuando el
              endpoint de importacion masiva este disponible.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cerrar
            </Button>
            <Button type="button" disabled={filasValidas.length === 0}>
              <Upload size={16} />
              Importar {filasValidas.length > 0 ? `${filasValidas.length} ` : ""}
              influencers
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
'@
Write-FileVerificado -RutaRelativa "src\features\influencers\components\ImportarInfluencersModal.tsx" -Contenido $ImportarInfluencersModal


Write-Host ""
Write-Host "Listo. Siguiente paso: npx tsc --noEmit" -ForegroundColor Cyan
Write-Host ""