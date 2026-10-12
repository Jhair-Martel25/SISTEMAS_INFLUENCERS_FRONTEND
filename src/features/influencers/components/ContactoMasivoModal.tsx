"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  SkipForward,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePermission } from "@/hooks/usePermission"
import { useEnviarEmailMasivo } from "@/features/email/hooks/useEmail"
import type { Influencer } from "@/types/influencer"

import { abrirChatEnVentana, cerrarVentanaChat } from "../utils/ventana-chat"
import { SelectorPlantillaCorreo } from "./SelectorPlantillaCorreo"

/**
 * Contacto masivo: envía un mismo mensaje (personalizado con {nombre}) a
 * varios influencers seleccionados.
 *
 * - Los que tienen correo: se envían todos de una vez con
 *   POST /email/enviar-masivo y la plantilla elegida (solo ADMIN; el backend
 *   solo envía a influencers VALIDADOS).
 * - Los que no: se recorren en una COLA de DMs asistidos (copiar + abrir chat
 *   + marcar enviado), porque las redes no permiten DMs automáticos.
 *
 * El registro de los DMs todavía no llama al backend (marcado con TODO).
 */

type Red = "INSTAGRAM" | "TIKTOK" | "FACEBOOK"
type Paso = "preparar" | "cola" | "fin"

interface Props {
  influencers: Influencer[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onFinalizar?: () => void
}

const ETIQUETA_RED: Record<Red, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
}

const LIMITE_DM = 1000

const PLANTILLA_INICIAL =
  "¡Hola {nombre}! 👋 Somos Sembrando Perú. Nos encanta el contenido que compartes y creemos que encajaría muy bien con una campaña que estamos preparando. ¿Te gustaría que te contemos más?"

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function redDe(influencer: Influencer): Red {
  const red = (influencer.redSocial ?? "INSTAGRAM").toUpperCase()
  return red === "TIKTOK" || red === "FACEBOOK" ? red : "INSTAGRAM"
}

function linkChat(influencer: Influencer): string {
  const usuario = influencer.usuarioIg.replace(/^@/, "")
  const red = redDe(influencer)
  if (red === "INSTAGRAM") return `https://www.instagram.com/${usuario}/`
  if (red === "TIKTOK") return `https://www.tiktok.com/@${usuario}`
  return influencer.linkIg || `https://www.facebook.com/${usuario}`
}

function personalizar(plantilla: string, influencer: Influencer) {
  return plantilla
    .replaceAll("{nombre}", influencer.nombre)
    .replaceAll("{usuario}", `@${influencer.usuarioIg}`)
}

function tieneEmail(influencer: Influencer) {
  return Boolean(influencer.email?.trim())
}

export function ContactoMasivoModal({
  influencers,
  open,
  onOpenChange,
  onFinalizar,
}: Props) {
  const [paso, setPaso] = useState<Paso>("preparar")
  const [plantilla, setPlantilla] = useState(PLANTILLA_INICIAL)
  const [priorizarCorreo, setPriorizarCorreo] = useState(true)
  const [indice, setIndice] = useState(0)
  const [chatAbierto, setChatAbierto] = useState(false)
  const [resumen, setResumen] = useState({ correos: 0, dms: 0, saltados: 0 })
  const [plantillaId, setPlantillaId] = useState("")
  const [ventanaLateral, setVentanaLateral] = useState(true)
  const [fallidos, setFallidos] = useState<{ nombre: string; error: string }[]>([])

  const { isAdmin } = usePermission()
  const enviarMasivo = useEnviarEmailMasivo()
  const enviandoCorreos = enviarMasivo.isPending

  const { porCorreo, porDM } = useMemo(() => {
    const correo = priorizarCorreo ? influencers.filter(tieneEmail) : []
    const dm = influencers.filter((i) => !correo.includes(i))
    return { porCorreo: correo, porDM: dm }
  }, [influencers, priorizarCorreo])

  const dmPorRed = useMemo(() => {
    const conteo: Record<Red, number> = { INSTAGRAM: 0, TIKTOK: 0, FACEBOOK: 0 }
    for (const i of porDM) conteo[redDe(i)]++
    return conteo
  }, [porDM])

  const ejemplo = influencers[0]
  const largoMaximo = Math.max(
    0,
    ...porDM.map((i) => personalizar(plantilla, i).length),
  )
  const excedeLimite = porDM.length > 0 && largoMaximo > LIMITE_DM
  const actual = porDM[indice]

  function reiniciar() {
    setPaso("preparar")
    setPlantilla(PLANTILLA_INICIAL)
    setPriorizarCorreo(true)
    setIndice(0)
    setChatAbierto(false)
    setResumen({ correos: 0, dms: 0, saltados: 0 })
    setPlantillaId("")
    setFallidos([])
    cerrarVentanaChat()
  }

  function cambiarOpen(abierto: boolean) {
    if (!abierto && enviandoCorreos) return
    if (!abierto && paso === "cola") {
      toast.info("Termina o salta los DMs pendientes antes de cerrar.")
      return
    }
    if (!abierto) {
      if (paso === "fin") onFinalizar?.()
      reiniciar()
    }
    onOpenChange(abierto)
  }

  async function comenzar() {
    if (porCorreo.length > 0) {
      if (!plantillaId) {
        toast.error("Elige una plantilla para los correos.")
        return
      }
      try {
        const resultados = await enviarMasivo.mutateAsync({
          influencerIds: porCorreo.map((i) => i.id),
          plantillaId,
        })
        const ok = resultados.filter((r) => r.exitoso).length
        const errores = resultados
          .filter((r) => !r.exitoso)
          .map((r) => ({
            nombre:
              porCorreo.find((i) => i.id === r.influencerId)?.nombre ??
              r.email ??
              r.influencerId,
            error: r.error ?? "Error desconocido",
          }))
        setFallidos(errores)
        setResumen((res) => ({ ...res, correos: ok }))
        if (errores.length === 0) {
          toast.success(`${ok} correos enviados.`)
        } else {
          toast.warning(`${ok} correos enviados, ${errores.length} fallaron.`)
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudieron enviar los correos.",
        )
        return
      }
    }
    setIndice(0)
    setChatAbierto(false)
    setPaso(porDM.length > 0 ? "cola" : "fin")
  }

  async function copiarYAbrir(objetivo: Influencer | undefined = actual) {
    if (!objetivo) return
    try {
      await navigator.clipboard.writeText(personalizar(plantilla, objetivo))
      toast.success(`Mensaje para ${objetivo.nombre} copiado. Pégalo con Ctrl+V.`)
    } catch {
      toast.error("No se pudo copiar el mensaje.")
    }
    const abierta = abrirChatEnVentana(linkChat(objetivo), ventanaLateral)
    if (!abierta) {
      toast.error(
        "El navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio.",
      )
      return
    }
    setChatAbierto(true)
  }

  function avanzar(enviado: boolean) {
    // TODO: si `enviado`, POST /influencers/:id/mensajes { canal: red, mensaje }.
    setResumen((r) =>
      enviado ? { ...r, dms: r.dms + 1 } : { ...r, saltados: r.saltados + 1 },
    )
    setChatAbierto(false)
    const siguiente = porDM[indice + 1]
    if (!siguiente) {
      cerrarVentanaChat()
      setPaso("fin")
      return
    }
    setIndice(indice + 1)
    // Con la ventana lateral, se pasa solo al chat del siguiente influencer.
    if (ventanaLateral) void copiarYAbrir(siguiente)
  }

  return (
    <Dialog open={open} onOpenChange={cambiarOpen}>
      <DialogContent className="sm:max-w-xl [&>*]:min-w-0">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users size={18} className="text-primary" />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Contactar {influencers.length} embajadores</DialogTitle>
              <DialogDescription>
                Un mismo mensaje, personalizado con el nombre de cada uno.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ---------- 1. Preparar ---------- */}
        {paso === "preparar" && (
          <>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail size={16} className="text-primary" />
                    Por correo
                    <span className="ml-auto text-xl font-semibold tabular-nums">
                      {porCorreo.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Se envían todos de una vez.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageCircle size={16} className="text-primary" />
                    Por DM
                    <span className="ml-auto text-xl font-semibold tabular-nums">
                      {porDM.length}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Object.keys(dmPorRed) as Red[])
                      .filter((r) => dmPorRed[r] > 0)
                      .map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px]"
                        >
                          {ETIQUETA_RED[r]} · {dmPorRed[r]}
                        </span>
                      ))}
                    {porDM.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Ninguno
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={priorizarCorreo}
                  onCheckedChange={(v) => setPriorizarCorreo(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Usar correo cuando el embajador lo tenga
                  <span className="block text-xs text-muted-foreground">
                    Los que no tienen correo visible van a la cola de DMs.
                  </span>
                </span>
              </label>

              {porCorreo.length > 0 && (
                <section className="flex flex-col gap-2">
                  <SelectorPlantillaCorreo
                    plantillaId={plantillaId}
                    onChange={setPlantillaId}
                    nombreInfluencer={porCorreo[0]?.nombre}
                    disabled={enviandoCorreos}
                  />
                  {!isAdmin && (
                    <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      Solo un ADMIN puede enviar correos. Desmarca &quot;Usar
                      correo&quot; para contactarlos por DM.
                    </p>
                  )}
                  {isAdmin &&
                    porCorreo.some((i) => i.estadoValidacion !== "VALIDADO") && (
                      <p className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        {
                          porCorreo.filter((i) => i.estadoValidacion !== "VALIDADO")
                            .length
                        }{" "}
                        de los {porCorreo.length} con correo no están validados;
                        el backend no les enviará el correo.
                      </p>
                    )}
                </section>
              )}

              {porDM.length > 0 && (
              <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="cm-plantilla">Mensaje para DM</Label>
                  <button
                    type="button"
                    onClick={() => setPlantilla((p) => `${p}{nombre}`)}
                    className="rounded-full border border-dashed border-primary/40 px-2 py-0.5 text-xs text-primary hover:bg-primary/5"
                  >
                    + {"{nombre}"}
                  </button>
                </div>
                <Textarea
                  id="cm-plantilla"
                  value={plantilla}
                  onChange={(e) => setPlantilla(e.target.value)}
                  className="min-h-28 resize-none"
                  aria-invalid={excedeLimite}
                />
                {ejemplo && (
                  <div className="rounded-lg bg-muted/50 p-3 text-xs">
                    <p className="mb-1 font-medium text-muted-foreground">
                      Vista previa para {ejemplo.nombre}:
                    </p>
                    <p className="whitespace-pre-wrap">
                      {personalizar(plantilla, ejemplo)}
                    </p>
                  </div>
                )}
                {excedeLimite && (
                  <p className="text-xs text-destructive">
                    Algún DM supera los {LIMITE_DM} caracteres.
                  </p>
                )}
              </section>
              )}
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Usa {"{nombre}"} y {"{usuario}"} para personalizar.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cambiarOpen(false)}
                  disabled={enviandoCorreos}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={comenzar}
                  disabled={
                    enviandoCorreos ||
                    (porDM.length > 0 && (!plantilla.trim() || excedeLimite)) ||
                    (porCorreo.length > 0 && (!plantillaId || !isAdmin))
                  }
                >
                  {enviandoCorreos ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {enviandoCorreos
                    ? "Enviando correos..."
                    : porCorreo.length > 0
                      ? `Enviar ${porCorreo.length} correos${porDM.length ? " y seguir" : ""}`
                      : "Comenzar DMs"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ---------- 2. Cola de DMs ---------- */}
        {paso === "cola" && actual && (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-primary">Cola de DMs</span>
                  <span className="tabular-nums text-muted-foreground">
                    {indice + 1} de {porDM.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-primary/15">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(indice / porDM.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-sm text-primary">
                    {iniciales(actual.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{actual.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{actual.usuarioIg}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  <MessageCircle size={12} />
                  {ETIQUETA_RED[redDe(actual)]}
                </span>
              </div>

              <div className="rounded-lg border border-border p-3 text-sm whitespace-pre-wrap">
                {personalizar(plantilla, actual)}
              </div>

              {porDM[indice + 1] && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronRight size={12} />
                  Siguiente: {porDM[indice + 1].nombre}
                </p>
              )}

              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={ventanaLateral}
                    onCheckedChange={(v) => setVentanaLateral(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Abrir los chats en una ventana lateral
                    <span className="block text-xs text-muted-foreground">
                      Se reutiliza la misma ventana y pasa sola al siguiente
                      chat al presionar &quot;Enviado, siguiente&quot;.
                    </span>
                  </span>
                </label>
                {ventanaLateral && (
                  <p className="text-xs text-muted-foreground">
                    Consejo: pon esta ventana a la izquierda (tecla Windows + ←)
                    para trabajar lado a lado. En el perfil pulsa &quot;Enviar mensaje&quot; y
                    pega el texto con Ctrl+V.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => avanzar(false)}
              >
                <SkipForward size={14} />
                Saltar
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={chatAbierto ? "outline" : "default"}
                  onClick={() => void copiarYAbrir()}
                >
                  <ExternalLink size={16} />
                  {chatAbierto ? "Abrir de nuevo" : "Copiar y abrir chat"}
                </Button>
                <Button
                  type="button"
                  onClick={() => avanzar(true)}
                  disabled={!chatAbierto}
                >
                  <CheckCircle2 size={16} />
                  Enviado, siguiente
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ---------- 3. Fin ---------- */}
        {paso === "fin" && (
          <>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 size={26} className="text-primary" />
              </span>
              <p className="font-medium">Contacto masivo completado</p>
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Correos enviados", valor: resumen.correos },
                  { label: "Correos fallidos", valor: fallidos.length },
                  { label: "DMs enviados", valor: resumen.dms },
                  { label: "Saltados", valor: resumen.saltados },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border p-3"
                  >
                    <p className="text-2xl font-semibold tabular-nums">
                      {item.valor}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              {fallidos.length > 0 && (
                <div className="w-full text-left">
                  <p className="mb-1.5 text-xs font-medium text-destructive">
                    Correos que no se enviaron:
                  </p>
                  <div className="flex max-h-40 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-destructive/30">
                    {fallidos.map((f, i) => (
                      <div
                        key={`${f.nombre}-${i}`}
                        className="flex items-start justify-between gap-3 px-3 py-2 text-xs"
                      >
                        <span className="truncate font-medium">{f.nombre}</span>
                        <span className="shrink-0 text-right text-destructive">
                          {f.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => cambiarOpen(false)}>
                Listo
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
