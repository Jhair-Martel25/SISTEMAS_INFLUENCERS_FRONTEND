"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Search,
  Send,
  SkipForward,
  Square,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type Columna,
} from "@/components/shared/data-table"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { PageHeader } from "@/components/shared/page-header"
import { usePermission } from "@/hooks/usePermission"
import { cn } from "@/lib/utils"
import {
  useContactarInfluencer,
  useTodosInfluencers,
} from "@/features/influencers/hooks/useInfluencers"
import {
  abrirChatEnVentana,
  cerrarVentanaChat,
} from "@/features/influencers/utils/ventana-chat"
import { ESTADO_CONTACTO } from "@/types/api"
import type { Influencer } from "@/types/influencer"

import {
  LIMITE_DM,
  PLANTILLA_DM_INICIAL,
  REDES_DM,
  etiquetaRed,
  iniciales,
  linkChat,
  personalizarDm,
  redDe,
  type RedSocialDm,
} from "../utils/dm"

/**
 * Pantalla exclusiva de mensajes directos (DM) por Instagram, TikTok y Facebook.
 *
 * Las redes no permiten enviar DMs por API, asi que el envio es asistido:
 * se copia el mensaje personalizado, se abre el perfil en una ventana lateral
 * y el usuario lo pega y lo envia. Al marcar "Enviado", si el usuario es ADMIN
 * se guarda el estado DM_ENVIADO (PATCH /influencers/:id/contactar, solo ADMIN);
 * si es voluntario se marca solo en esta sesion.
 */

const POR_PAGINA = 20

export function MensajesDmView() {
  const { isAdmin } = usePermission()
  const { data: todos = [], isLoading, isError } = useTodosInfluencers()
  const contactar = useContactarInfluencer()

  const [red, setRed] = useState<RedSocialDm>("INSTAGRAM")
  const [soloSinContactar, setSoloSinContactar] = useState(true)
  const [soloValidados, setSoloValidados] = useState(false)
  const [incluirConCorreo, setIncluirConCorreo] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [pagina, setPagina] = useState(1)
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [plantilla, setPlantilla] = useState(PLANTILLA_DM_INICIAL)
  const [ventanaLateral, setVentanaLateral] = useState(true)

  // Cola de envio asistido
  const [cola, setCola] = useState<Influencer[] | null>(null)
  const [indice, setIndice] = useState(0)
  const [resumen, setResumen] = useState({ enviados: 0, saltados: 0 })
  const [marcadosLocal, setMarcadosLocal] = useState<Set<string>>(new Set())

  const conteoPorRed = useMemo(() => {
    const conteo: Record<RedSocialDm, number> = {
      INSTAGRAM: 0,
      TIKTOK: 0,
      FACEBOOK: 0,
    }
    for (const i of todos) conteo[redDe(i)]++
    return conteo
  }, [todos])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return todos.filter((i) => {
      if (redDe(i) !== red) return false
      if (soloSinContactar && i.estadoContacto !== ESTADO_CONTACTO.SIN_CONTACTAR)
        return false
      if (soloValidados && i.estadoValidacion !== "VALIDADO") return false
      if (!incluirConCorreo && i.email?.trim()) return false
      if (
        texto &&
        !i.nombre.toLowerCase().includes(texto) &&
        !i.usuarioIg.toLowerCase().includes(texto)
      )
        return false
      return true
    })
  }, [todos, red, soloSinContactar, soloValidados, incluirConCorreo, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  )

  const seleccionados = filtrados.filter((i) => seleccion.has(i.id))
  const todosVisiblesMarcados =
    visibles.length > 0 && visibles.every((i) => seleccion.has(i.id))

  const ejemplo = seleccionados[0] ?? filtrados[0]
  const largoMaximo = Math.max(
    0,
    ...(seleccionados.length ? seleccionados : ejemplo ? [ejemplo] : []).map(
      (i) => personalizarDm(plantilla, i).length,
    ),
  )
  const excedeLimite = largoMaximo > LIMITE_DM
  const enCola = cola !== null
  const actual = cola?.[indice]

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

  async function copiarYAbrir(objetivo: Influencer) {
    try {
      await navigator.clipboard.writeText(personalizarDm(plantilla, objetivo))
      toast.success(`Mensaje para ${objetivo.nombre} copiado. Pégalo con Ctrl+V.`)
    } catch {
      toast.error("No se pudo copiar el mensaje.")
    }
    const abierta = abrirChatEnVentana(linkChat(objetivo), ventanaLateral)
    if (!abierta) {
      toast.error(
        "El navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio.",
      )
    }
  }

  function iniciarCola() {
    if (seleccionados.length === 0) return
    setCola(seleccionados)
    setIndice(0)
    setResumen({ enviados: 0, saltados: 0 })
    void copiarYAbrir(seleccionados[0])
  }

  function terminarCola() {
    cerrarVentanaChat()
    const { enviados, saltados } = resumen
    toast.success(`DMs terminados: ${enviados} enviados, ${saltados} saltados.`)
    setCola(null)
    setIndice(0)
    setSeleccion(new Set())
  }

  async function avanzar(enviado: boolean) {
    if (!cola || !actual) return
    if (enviado) {
      if (isAdmin) {
        try {
          await contactar.mutateAsync({
            id: actual.id,
            input: { estadoContacto: ESTADO_CONTACTO.DM_ENVIADO },
          })
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `No se guardó el estado de ${actual.nombre}: ${error.message}`
              : `No se guardó el estado de ${actual.nombre}.`,
          )
        }
      } else {
        setMarcadosLocal((prev) => new Set(prev).add(actual.id))
      }
    }
    setResumen((r) =>
      enviado
        ? { ...r, enviados: r.enviados + 1 }
        : { ...r, saltados: r.saltados + 1 },
    )
    const siguiente = cola[indice + 1]
    if (!siguiente) {
      cerrarVentanaChat()
      const total = resumen.enviados + (enviado ? 1 : 0)
      toast.success(`Cola terminada: ${total} DMs enviados.`)
      setCola(null)
      setIndice(0)
      setSeleccion(new Set())
      return
    }
    setIndice(indice + 1)
    if (ventanaLateral) void copiarYAbrir(siguiente)
  }

  const columnas: Columna<Influencer>[] = [
    {
      id: "sel",
      className: "w-10",
      header: (
        <Checkbox
          checked={todosVisiblesMarcados}
          onCheckedChange={(v) => alternarVisibles(v === true)}
          disabled={enCola || visibles.length === 0}
          aria-label="Seleccionar página"
        />
      ),
      cell: (i) => (
        <Checkbox
          checked={seleccion.has(i.id)}
          onCheckedChange={(v) => alternar(i.id, v === true)}
          disabled={enCola}
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
      id: "seguidores",
      header: "Seguidores",
      className: "hidden md:table-cell",
      cell: (i) => (
        <span className="tabular-nums">{i.seguidores || "—"}</span>
      ),
    },
    {
      id: "validacion",
      header: "Validación",
      className: "hidden lg:table-cell",
      cell: (i) => <EstadoBadge estado={i.estadoValidacion} tipo="validacion" />,
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (i) =>
        marcadosLocal.has(i.id) ? (
          <EstadoBadge estado={ESTADO_CONTACTO.DM_ENVIADO} tipo="contacto" />
        ) : (
          <EstadoBadge estado={i.estadoContacto} tipo="contacto" />
        ),
    },
    {
      id: "acciones",
      header: "",
      className: "text-right",
      cell: (i) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={enCola}
          onClick={() => void copiarYAbrir(i)}
        >
          <ExternalLink size={14} />
          Abrir chat
        </Button>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        title="Mensajes DM"
        description="Contacta embajadores por mensaje directo en Instagram, TikTok o Facebook."
        backHref="/dashboard"
      />

      {/* Pestañas por red social */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {REDES_DM.map((r) => (
          <button
            key={r.value}
            type="button"
            role="tab"
            aria-selected={red === r.value}
            disabled={enCola}
            onClick={() => cambiarFiltro(() => setRed(r.value))}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors disabled:opacity-50",
              red === r.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {r.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                red === r.value ? "bg-primary-foreground/20" : "bg-muted",
              )}
            >
              {conteoPorRed[r.value]}
            </span>
          </button>
        ))}
      </div>

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
                placeholder="Buscar por nombre o usuario"
                className="pl-9"
                disabled={enCola}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={soloSinContactar}
                  onCheckedChange={(v) => cambiarFiltro(() => setSoloSinContactar(v === true))}
                  disabled={enCola}
                />
                Solo sin contactar
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={soloValidados}
                  onCheckedChange={(v) => cambiarFiltro(() => setSoloValidados(v === true))}
                  disabled={enCola}
                />
                Solo validados
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={incluirConCorreo}
                  onCheckedChange={(v) => cambiarFiltro(() => setIncluirConCorreo(v === true))}
                  disabled={enCola}
                />
                Incluir los que tienen correo
              </label>
            </div>
          </DataTableToolbar>

          <DataTable
            columnas={columnas}
            datos={visibles}
            getRowId={(i) => i.id}
            isLoading={isLoading}
            errorMessage={isError ? "No se pudieron cargar los embajadores." : null}
            emptyMessage={`No hay embajadores de ${etiquetaRed(red)} con estos filtros.`}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {filtrados.length} embajadores · {seleccionados.length} seleccionados
            </p>
            <DataTablePagination
              page={paginaActual}
              totalPages={totalPaginas}
              onPageChange={setPagina}
            />
          </div>
        </div>

        {/* ---------- Mensaje y cola ---------- */}
        <div className="flex flex-col gap-4">
          {enCola && actual ? (
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle size={18} className="text-primary" />
                  DM {indice + 1} de {cola.length}
                </CardTitle>
                <CardDescription>
                  Pega el mensaje en el chat de {etiquetaRed(redDe(actual))}, envíalo y
                  marca &quot;Enviado&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(indice / cola.length) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{iniciales(actual.nombre)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{actual.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{actual.usuarioIg}
                    </p>
                  </div>
                </div>

                <p className="max-h-40 overflow-y-auto rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {personalizarDm(plantilla, actual)}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copiarYAbrir(actual)}
                >
                  <ExternalLink size={16} />
                  Copiar y abrir chat otra vez
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={contactar.isPending}
                    onClick={() => void avanzar(false)}
                  >
                    <SkipForward size={16} />
                    Saltar
                  </Button>
                  <Button
                    type="button"
                    disabled={contactar.isPending}
                    onClick={() => void avanzar(true)}
                  >
                    {contactar.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Enviado
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {resumen.enviados} enviados · {resumen.saltados} saltados
                  </span>
                  <button
                    type="button"
                    onClick={terminarCola}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Square size={12} />
                    Terminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensaje</CardTitle>
                <CardDescription>
                  Usa {"{nombre}"} y {"{usuario}"} para personalizarlo.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="dm-plantilla">Texto del DM</Label>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        excedeLimite ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {largoMaximo}/{LIMITE_DM}
                    </span>
                  </div>
                  <Textarea
                    id="dm-plantilla"
                    value={plantilla}
                    onChange={(e) => setPlantilla(e.target.value)}
                    className="min-h-36 resize-none"
                    aria-invalid={excedeLimite}
                  />
                  <div className="flex gap-2">
                    {["{nombre}", "{usuario}"].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => setPlantilla((p) => `${p}${variable}`)}
                        className="rounded-full border border-dashed border-primary/40 px-2 py-0.5 text-xs text-primary hover:bg-primary/5"
                      >
                        + {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {ejemplo && (
                  <div className="rounded-lg bg-muted/50 p-3 text-xs">
                    <p className="mb-1 font-medium text-muted-foreground">
                      Vista previa para {ejemplo.nombre}:
                    </p>
                    <p className="whitespace-pre-wrap">
                      {personalizarDm(plantilla, ejemplo)}
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={ventanaLateral}
                    onCheckedChange={(v) => setVentanaLateral(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Abrir los chats en una ventana lateral
                    <span className="block text-xs text-muted-foreground">
                      Pasa sola al siguiente chat al marcar &quot;Enviado&quot;.
                    </span>
                  </span>
                </label>

                {!isAdmin && (
                  <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    Como voluntario, los DMs marcados como enviados se ven solo en
                    esta sesión; un administrador debe actualizar el estado.
                  </p>
                )}

                <Button
                  type="button"
                  onClick={iniciarCola}
                  disabled={
                    seleccionados.length === 0 || !plantilla.trim() || excedeLimite
                  }
                >
                  <Send size={16} />
                  {seleccionados.length > 0
                    ? `Enviar DM a ${seleccionados.length} seleccionados`
                    : "Selecciona embajadores"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
