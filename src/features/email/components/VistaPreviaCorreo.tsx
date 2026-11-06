"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, Expand, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** Ancho de render del correo (640px de tarjeta + márgenes del layout). */
const ANCHO_CORREO = 688

interface MarcoProps {
  html: string
  /** Ancho disponible; si es menor que el del correo se escala. */
  escalar?: boolean
  className?: string
}

/**
 * Iframe aislado (sin scripts) que muestra el HTML real del correo. Se escala
 * para caber en el contenedor y ajusta su alto al contenido.
 */
function MarcoCorreo({ html, escalar = true, className }: MarcoProps) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [escala, setEscala] = useState(1)
  const [alto, setAlto] = useState(600)

  useEffect(() => {
    const el = contenedorRef.current
    if (!el || !escalar) return
    const observer = new ResizeObserver(([entrada]) => {
      const ancho = entrada.contentRect.width
      setEscala(Math.min(1, ancho / ANCHO_CORREO))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [escalar])

  const medir = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0)
    if (h > 0) setAlto(h)
    // Los botones/enlaces del correo se abren en una pestaña nueva (como en Gmail).
    doc.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank")
      a.setAttribute("rel", "noopener noreferrer")
    })
  }, [])

  return (
    <div
      ref={contenedorRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: alto * escala }}
    >
      <iframe
        ref={iframeRef}
        title="Vista previa del correo"
        srcDoc={html}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={medir}
        className="absolute top-0 left-0 origin-top-left border-0 bg-transparent"
        style={{
          width: ANCHO_CORREO,
          height: alto,
          transform: `scale(${escala})`,
          left: escala < 1 ? 0 : `calc(50% - ${ANCHO_CORREO / 2}px)`,
        }}
      />
    </div>
  )
}

interface Props {
  html?: string
  asunto?: string
  remitente?: string
  isLoading?: boolean
  error?: unknown
  /** Texto cuando aún no hay plantilla elegida. */
  vacio?: string
  className?: string
}

/** Vista previa con apariencia de bandeja de entrada + modo "ver en grande". */
export function VistaPreviaCorreo({
  html,
  asunto,
  remitente = "Sembrando Perú",
  isLoading,
  error,
  vacio = "Elige una plantilla para ver el correo tal como lo recibirá el destinatario.",
  className,
}: Props) {
  const [ampliado, setAmpliado] = useState(false)

  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex items-start gap-3 border-b bg-muted/40 px-3 py-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={asunto}>
            {asunto || "Sin asunto"}
          </p>
          <p className="truncate text-xs text-muted-foreground">De: {remitente}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isLoading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          {html && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setAmpliado(true)}
            >
              <Expand size={13} />
              Ver en grande
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-[560px] min-h-48 overflow-y-auto bg-[#F1F6EF]">
        {error && !html ? (
          <p className="flex items-start gap-2 p-4 text-xs text-destructive">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {error instanceof Error && /cannot post|404|not found/i.test(error.message)
              ? "El backend al que está conectado el sistema no tiene la vista previa de correos. Actualiza o reinicia el backend con la última versión."
              : error instanceof Error
                ? error.message
                : "No se pudo generar la vista previa."}
          </p>
        ) : html ? (
          <MarcoCorreo html={html} />
        ) : isLoading ? (
          <div className="flex h-48 items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Generando vista previa…
          </div>
        ) : (
          <p className="flex h-48 items-center justify-center px-6 text-center text-xs text-muted-foreground">
            {vacio}
          </p>
        )}
      </div>

      <Dialog open={ampliado} onOpenChange={setAmpliado}>
        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b px-5 py-3 text-left">
            <DialogTitle className="truncate pr-8 text-base">{asunto || "Sin asunto"}</DialogTitle>
            <DialogDescription>De: {remitente} · Vista previa a tamaño real</DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-80px)] overflow-y-auto bg-[#F1F6EF]">
            {html && <MarcoCorreo html={html} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
