"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, Mail, Search, Send, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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
import { ESTADO_CONTACTO, ESTADO_VALIDACION, type EstadoContacto } from "@/types/api"
import type { Influencer } from "@/types/influencer"
import { ETIQUETAS_CONTACTO } from "@/lib/utils/format"
import { useTodosInfluencers } from "@/features/influencers/hooks/useInfluencers"
import { SelectorPlantillaCorreo } from "@/features/influencers/components/SelectorPlantillaCorreo"
import { iniciales } from "@/features/mensajes-dm/utils/dm"

import { useEnviarEmailMasivo } from "../hooks/useEmail"

/**
 * Pantalla exclusiva de correos (solo ADMIN).
 *
 * Lista los embajadores VALIDADOS que tienen correo (el backend solo envia a
 * validados), permite seleccionar varios y enviarles una plantilla con
 * POST /email/enviar-masivo. El backend cambia su estado a CORREO_ENVIADO.
 */

const POR_PAGINA = 20
const TODOS = "TODOS"

interface Resultado {
  enviados: number
  fallidos: { nombre: string; error: string }[]
}

export function EmailForm() {
  const { data: validados = [], isLoading, isError } = useTodosInfluencers({
    estadoValidacion: ESTADO_VALIDACION.VALIDADO,
  })
  const enviarMasivo = useEnviarEmailMasivo()

  const [estado, setEstado] = useState<EstadoContacto | typeof TODOS>(
    ESTADO_CONTACTO.SIN_CONTACTAR,
  )
  const [busqueda, setBusqueda] = useState("")
  const [pagina, setPagina] = useState(1)
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [plantillaId, setPlantillaId] = useState("")
  const [confirmar, setConfirmar] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const conCorreo = useMemo(
    () => validados.filter((i) => Boolean(i.email?.trim())),
    [validados],
  )

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return conCorreo.filter((i) => {
      if (estado !== TODOS && i.estadoContacto !== estado) return false
      if (
        texto &&
        !i.nombre.toLowerCase().includes(texto) &&
        !(i.email ?? "").toLowerCase().includes(texto) &&
        !i.usuarioIg.toLowerCase().includes(texto)
      )
        return false
      return true
    })
  }, [conCorreo, estado, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  )
  const seleccionados = filtrados.filter((i) => seleccion.has(i.id))
  const todosVisiblesMarcados =
    visibles.length > 0 && visibles.every((i) => seleccion.has(i.id))
  const enviando = enviarMasivo.isPending

  function cambiarFiltro(accion: () => void) {
    accion()
    setPagina(1)
    setSeleccion(new Set())
  }

  function alternar(id: string, marcado: boolean) {
    setSeleccion((prev) => {
      const nuevo = new Set(prev)
      if (marcado) nuevo.add(id)
      else nuevo.delete(id)
      return nuevo
    })
  }

  function alternarVisibles(marcado: boolean) {
    setSeleccion((prev) => {
      const nuevo = new Set(prev)
      for (const i of visibles) {
        if (marcado) nuevo.add(i.id)
        else nuevo.delete(i.id)
      }
      return nuevo
    })
  }

  function seleccionarTodosFiltrados() {
    setSeleccion(new Set(filtrados.map((i) => i.id)))
  }

  async function enviar() {
    try {
      const resultados = await enviarMasivo.mutateAsync({
        influencerIds: seleccionados.map((i) => i.id),
        plantillaId,
      })
      const enviados = resultados.filter((r) => r.exitoso).length
      const fallidos = resultados
        .filter((r) => !r.exitoso)
        .map((r) => ({
          nombre:
            seleccionados.find((i) => i.id === r.influencerId)?.nombre ??
            r.email ??
            r.influencerId,
          error: r.error ?? "Error desconocido",
        }))
      setResultado({ enviados, fallidos })
      setSeleccion(new Set())
      if (fallidos.length === 0) toast.success(`${enviados} correos enviados.`)
      else toast.warning(`${enviados} correos enviados, ${fallidos.length} fallaron.`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron enviar los correos.",
      )
    } finally {
      setConfirmar(false)
    }
  }

  const columnas: Columna<Influencer>[] = [
    {
      id: "sel",
      className: "w-10",
      header: (
        <Checkbox
          checked={todosVisiblesMarcados}
          onCheckedChange={(v) => alternarVisibles(v === true)}
          disabled={enviando || visibles.length === 0}
          aria-label="Seleccionar página"
        />
      ),
      cell: (i) => (
        <Checkbox
          checked={seleccion.has(i.id)}
          onCheckedChange={(v) => alternar(i.id, v === true)}
          disabled={enviando}
          aria-label={`Seleccionar ${i.nombre}`}
        />
      ),
    },
    {
      id: "embajador",
      header: "Embajador",
      cell: (i) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{iniciales(i.nombre)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 max-w-[16rem] xl:max-w-[22rem]" title={i.nombre}>
            <p className="truncate font-medium">{i.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">@{i.usuarioIg}</p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Correo",
      className: "hidden md:table-cell",
      cell: (i) => <span className="text-sm">{i.email}</span>,
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (i) => <EstadoBadge estado={i.estadoContacto} tipo="contacto" />,
    },
  ]

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        title="Correos"
        description="Envía correos con una plantilla a los embajadores validados que tienen email. Solo administradores."
        backHref="/dashboard"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------- Lista ---------- */}
        <div className="flex min-w-0 flex-col gap-4">
          <DataTableToolbar>
            <div className="relative w-full md:max-w-xs">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={busqueda}
                onChange={(e) => cambiarFiltro(() => setBusqueda(e.target.value))}
                placeholder="Buscar por nombre, usuario o correo"
                className="pl-9"
                disabled={enviando}
              />
            </div>
            <Select
              value={estado}
              onValueChange={(v) =>
                cambiarFiltro(() => setEstado(v as EstadoContacto | typeof TODOS))
              }
              disabled={enviando}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los estados</SelectItem>
                {Object.values(ESTADO_CONTACTO).map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {ETIQUETAS_CONTACTO[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DataTableToolbar>

          <DataTable
            columnas={columnas}
            datos={visibles}
            getRowId={(i) => i.id}
            isLoading={isLoading}
            errorMessage={isError ? "No se pudieron cargar los embajadores." : null}
            emptyMessage="No hay embajadores validados con correo para estos filtros."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {filtrados.length} con correo · {seleccionados.length} seleccionados
              {filtrados.length > visibles.length &&
                seleccionados.length < filtrados.length && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      onClick={seleccionarTodosFiltrados}
                      className="text-primary hover:underline"
                      disabled={enviando}
                    >
                      Seleccionar los {filtrados.length}
                    </button>
                  </>
                )}
            </p>
            <DataTablePagination
              page={paginaActual}
              totalPages={totalPaginas}
              onPageChange={setPagina}
            />
          </div>
        </div>

        {/* ---------- Envío ---------- */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail size={18} className="text-primary" />
                Envío por correo
              </CardTitle>
              <CardDescription>
                Al enviarse, el estado cambia a &quot;Correo enviado&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SelectorPlantillaCorreo
                plantillaId={plantillaId}
                onChange={setPlantillaId}
                nombreInfluencer={seleccionados[0]?.nombre}
                disabled={enviando}
              />
              <Button
                type="button"
                onClick={() => setConfirmar(true)}
                disabled={enviando || seleccionados.length === 0 || !plantillaId}
              >
                {enviando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {seleccionados.length > 0
                  ? `Enviar a ${seleccionados.length} seleccionados`
                  : "Selecciona embajadores"}
              </Button>
            </CardContent>
          </Card>

          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Último envío</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  {resultado.enviados} enviados
                </p>
                {resultado.fallidos.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-2 text-destructive">
                      <XCircle size={16} />
                      {resultado.fallidos.length} fallaron
                    </p>
                    <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs">
                      {resultado.fallidos.map((f, idx) => (
                        <li key={`${f.nombre}-${idx}`}>
                          <span className="font-medium">{f.nombre}:</span> {f.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmar}
        onOpenChange={(abierto) => !enviando && setConfirmar(abierto)}
        title={`¿Enviar ${seleccionados.length} correos?`}
        description="Se enviará la plantilla elegida a cada embajador seleccionado."
        confirmLabel="Enviar"
        isPending={enviando}
        onConfirm={() => void enviar()}
      />
    </div>
  )
}
