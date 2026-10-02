"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  ExternalLink,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/usePermission"
import { useEnviarEmail } from "@/features/email/hooks/useEmail"
import type { Influencer } from "@/types/influencer"

import { abrirChatEnVentana } from "../utils/ventana-chat"
import { SelectorPlantillaCorreo } from "./SelectorPlantillaCorreo"

/**
 * Modal para contactar a un influencer por correo o por DM.
 *
 * - Correo: se envía de verdad con POST /email/enviar usando una plantilla
 *   (solo ADMIN; el backend exige que el influencer esté VALIDADO).
 * - DM: "Copiar y abrir chat" funciona; "Marcar como enviado" todavía no
 *   llama al backend (falta el endpoint de mensajes). Queda marcado con TODO.
 *
 * Nota: Instagram, TikTok y Facebook no permiten iniciar DMs por API,
 * por eso el DM es "asistido": el voluntario pega el mensaje y lo envía.
 */

type Canal = "EMAIL" | "INSTAGRAM" | "TIKTOK" | "FACEBOOK"

interface Props {
  influencer: Influencer | null
  onOpenChange: (open: boolean) => void
}

const CANALES: { value: Canal; label: string; descripcion: string }[] = [
  { value: "EMAIL", label: "Correo", descripcion: "Envío automático" },
  { value: "INSTAGRAM", label: "Instagram", descripcion: "DM asistido" },
  { value: "TIKTOK", label: "TikTok", descripcion: "DM asistido" },
  { value: "FACEBOOK", label: "Facebook", descripcion: "DM asistido" },
]

const LIMITE_DM = 1000

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Red del influencer (el backend la envía; por defecto Instagram). */
function redDe(influencer: Influencer): Canal {
  const red = (influencer.redSocial ?? "INSTAGRAM").toUpperCase()
  return red === "TIKTOK" || red === "FACEBOOK" ? red : "INSTAGRAM"
}

/** Link para abrir el chat (Instagram) o el perfil donde está el botón de mensaje. */
function linkChat(influencer: Influencer, canal: Canal): string {
  const usuario = influencer.usuarioIg.replace(/^@/, "")
  if (canal === "INSTAGRAM") return `https://www.instagram.com/${usuario}/`
  if (canal === "TIKTOK") return `https://www.tiktok.com/@${usuario}`
  return influencer.linkIg || `https://www.facebook.com/${usuario}`
}

function mensajeInicial(influencer: Influencer): string {
  if (influencer.mensajePersonalizado?.trim()) {
    return influencer.mensajePersonalizado.trim()
  }
  return `¡Hola ${influencer.nombre}! 👋 Somos Sembrando Perú. Nos encanta el contenido que compartes y creemos que encajaría muy bien con una campaña que estamos preparando. ¿Te gustaría que te contemos más? Podemos coordinar una breve reunión cuando te quede cómodo.`
}

function ContenidoContactar({
  influencer,
  onCerrar,
}: {
  influencer: Influencer
  onCerrar: () => void
}) {
  const red = redDe(influencer)
  const tieneEmail = Boolean(influencer.email?.trim())
  const sugerido: Canal = tieneEmail ? "EMAIL" : red

  const [canal, setCanal] = useState<Canal>(sugerido)
  const [mensaje, setMensaje] = useState(() => mensajeInicial(influencer))
  const [chatAbierto, setChatAbierto] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [plantillaId, setPlantillaId] = useState("")
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null)
  const [correoDestino, setCorreoDestino] = useState("")

  const { isAdmin } = usePermission()
  const enviarEmail = useEnviarEmail()
  const enviandoCorreo = enviarEmail.isPending
  const noValidado = influencer.estadoValidacion !== "VALIDADO"

  const esDM = canal !== "EMAIL"
  const excedeLimite = esDM && mensaje.length > LIMITE_DM

  function disponible(c: Canal) {
    return c === "EMAIL" ? tieneEmail : c === red
  }

  function motivoNoDisponible(c: Canal) {
    return c === "EMAIL" ? "Sin correo visible" : "No registrado"
  }

  function elegirCanal(c: Canal) {
    if (!disponible(c)) return
    setCanal(c)
    setChatAbierto(false)
  }

  async function copiarYAbrir() {
    try {
      await navigator.clipboard.writeText(mensaje)
      toast.success("Mensaje copiado. Pégalo en el chat y envíalo.")
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto y cópialo manualmente.")
    }
    if (!abrirChatEnVentana(linkChat(influencer, canal))) {
      toast.error(
        "El navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio.",
      )
      return
    }
    setChatAbierto(true)
  }

  function marcarEnviado() {
    // TODO: POST /influencers/:id/mensajes { canal, mensaje } cuando exista el endpoint.
    setEnviado(true)
    toast.success(`DM registrado como enviado por ${etiquetaCanal(canal)}.`)
  }

  async function enviarCorreo() {
    if (!plantillaId) {
      toast.error("Elige una plantilla de correo.")
      return
    }
    setErrorCorreo(null)
    try {
      const resultado = await enviarEmail.mutateAsync({
        influencerId: influencer.id,
        plantillaId,
      })
      if (!resultado.exitoso) {
        throw new Error(resultado.error ?? "No se pudo enviar el correo.")
      }
      setCorreoDestino(resultado.email || influencer.email || "")
      setEnviado(true)
      toast.success(`Correo enviado a ${resultado.email || influencer.email}.`)
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : "No se pudo enviar el correo."
      setErrorCorreo(mensajeError)
      toast.error(mensajeError)
    }
  }

  if (enviado) {
    return (
      <>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 size={26} className="text-primary" />
          </span>
          <p className="font-medium">
            {esDM ? "DM registrado" : "Correo enviado"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {esDM ? (
              <>
                {influencer.nombre} quedó registrado como contactado por{" "}
                <span className="font-medium text-foreground">
                  {etiquetaCanal(canal)}
                </span>
                .
              </>
            ) : (
              <>
                Se envió a{" "}
                <span className="font-medium text-foreground">
                  {correoDestino}
                </span>
                . Su estado de contacto pasa a &quot;Correo enviado&quot;.
              </>
            )}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onCerrar}>
            Listo
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Influencer */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-sm text-primary">
              {iniciales(influencer.nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{influencer.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{influencer.usuarioIg} · {etiquetaCanal(red)}
            </p>
          </div>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs",
              tieneEmail
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Mail size={12} />
            {tieneEmail ? influencer.email : "Sin correo"}
          </span>
        </div>

        {/* Canal */}
        <section className="flex flex-col gap-2.5">
          <span className="text-sm font-medium">¿Por dónde lo contactas?</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CANALES.map((c) => {
              const activo = canal === c.value
              const habilitado = disponible(c.value)
              return (
                <button
                  key={c.value}
                  type="button"
                  disabled={!habilitado}
                  aria-pressed={activo}
                  onClick={() => elegirCanal(c.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all",
                    activo
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background hover:border-primary/40",
                    !habilitado &&
                      "cursor-not-allowed opacity-45 hover:border-border",
                  )}
                >
                  {sugerido === c.value && (
                    <span className="absolute -top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Sugerido
                    </span>
                  )}
                  {c.value === "EMAIL" ? (
                    <Mail
                      size={18}
                      className={activo ? "text-primary" : "text-muted-foreground"}
                    />
                  ) : (
                    <MessageCircle
                      size={18}
                      className={activo ? "text-primary" : "text-muted-foreground"}
                    />
                  )}
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {habilitado ? c.descripcion : motivoNoDisponible(c.value)}
                  </span>
                </button>
              )
            })}
          </div>
          {!tieneEmail && (
            <p className="text-xs text-muted-foreground">
              No tiene correo visible, por eso se sugiere escribirle por DM en{" "}
              {etiquetaCanal(red)}.
            </p>
          )}
        </section>

        {/* Correo: plantilla */}
        {!esDM && (
          <section className="flex flex-col gap-3">
            <SelectorPlantillaCorreo
              plantillaId={plantillaId}
              onChange={(id) => {
                setPlantillaId(id)
                setErrorCorreo(null)
              }}
              nombreInfluencer={influencer.nombre}
              disabled={enviandoCorreo}
            />
            {!isAdmin && (
              <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Solo un ADMIN puede enviar correos desde el sistema.
              </p>
            )}
            {isAdmin && noValidado && (
              <p className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Este influencer aún no está validado. El backend solo envía
                correos a influencers con estado &quot;Validado&quot;.
              </p>
            )}
            {errorCorreo && (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {errorCorreo}
              </p>
            )}
          </section>
        )}

        {/* Mensaje (solo DM) */}
        {esDM && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="ci-mensaje">Mensaje</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMensaje(mensajeInicial(influencer))}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Sparkles size={12} />
                Restablecer
              </button>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  excedeLimite
                    ? "font-medium text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {mensaje.length}
                {esDM && `/${LIMITE_DM}`}
              </span>
            </div>
          </div>
          <Textarea
            id="ci-mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="min-h-32 resize-none"
            aria-invalid={excedeLimite}
          />
        </section>
        )}

        {/* Pasos del DM asistido */}
        {esDM && (
          <ol className="grid gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground sm:grid-cols-3">
            {[
              "Copia el mensaje y abre su perfil",
              `Pulsa "Enviar mensaje", pega (Ctrl+V) y envía`,
              "Vuelve y márcalo como enviado",
            ].map((paso, i) => {
              const hecho = i === 0 && chatAbierto
              return (
                <li key={paso} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      hecho
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {hecho ? "✓" : i + 1}
                  </span>
                  <span className="pt-0.5">{paso}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <DialogFooter className="items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {esDM
            ? "Las redes no permiten DMs automáticos: lo envías tú."
            : "El correo se envía desde la cuenta de Sembrando Perú."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCerrar}
            disabled={enviandoCorreo}
          >
            Cancelar
          </Button>
          {esDM ? (
            chatAbierto ? (
              <>
                <Button type="button" variant="outline" onClick={copiarYAbrir}>
                  <Copy size={16} />
                  Copiar de nuevo
                </Button>
                <Button type="button" onClick={marcarEnviado}>
                  <CheckCircle2 size={16} />
                  Marcar como enviado
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={copiarYAbrir}
                disabled={!mensaje.trim() || excedeLimite}
              >
                <ExternalLink size={16} />
                Copiar y abrir chat
              </Button>
            )
          ) : (
            <Button
              type="button"
              onClick={enviarCorreo}
              disabled={!plantillaId || !isAdmin || enviandoCorreo}
            >
              {enviandoCorreo ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {enviandoCorreo ? "Enviando..." : "Enviar correo"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  )
}

function etiquetaCanal(canal: Canal) {
  return CANALES.find((c) => c.value === canal)?.label ?? canal
}

export function ContactarInfluencerModal({ influencer, onOpenChange }: Props) {
  return (
    <Dialog open={Boolean(influencer)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl [&>*]:min-w-0">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Send size={18} className="text-primary" />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Contactar influencer</DialogTitle>
              <DialogDescription>
                Envía un correo o un mensaje directo por su red social.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {influencer && (
          // key: reinicia el estado al cambiar de influencer.
          <ContenidoContactar
            key={influencer.id}
            influencer={influencer}
            onCerrar={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
