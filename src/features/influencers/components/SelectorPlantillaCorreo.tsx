"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useRef } from "react"
import Link from "next/link"
import { Check, Loader2, PenLine, RotateCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePlantillas } from "@/features/plantillas/hooks/usePlantillas"
import { VistaPreviaCorreo } from "@/features/email/components/VistaPreviaCorreo"
import { useVistaPreviaCorreo } from "@/features/email/hooks/useVistaPreviaCorreo"
import type { TipoDestinoCorreo } from "@/types/email"
import {
  DISENO_CORREO_INFO,
  normalizarDiseno,
  type DisenoCorreo,
  type Plantilla,
} from "@/types/plantilla"

/**
 * Selector visual de plantilla + editor del texto + vista previa real.
 *
 * - Al elegir una plantilla se muestra su diseño completo (imagen, colores,
 *   botón) exactamente como llegará, renderizado por el backend.
 * - El asunto y el cuerpo son editables antes de enviar; los cambios se
 *   reflejan en vivo en la vista previa. Las variables ({nombre}, {empresa},
 *   {{nombre_voluntario}}, {{link_agendamiento}}) se reemplazan al enviar.
 * - Se usa en embajadores (individual y masivo), empresas y contactos.
 */

interface Props {
  plantillaId: string
  onChange: (id: string, plantilla?: Plantilla) => void
  asunto: string
  onAsuntoChange: (valor: string) => void
  cuerpo: string
  onCuerpoChange: (valor: string) => void
  /** Marco del diseño clásico: invitación a embajador o correo a empresa. */
  tipo?: TipoDestinoCorreo
  /** Datos del destinatario para personalizar la vista previa. */
  destinatario?: { nombre?: string; empresa?: string }
  disabled?: boolean
  /** Oculta la galería (p. ej. en "Agendar reunión"): solo editor + vista previa. */
  ocultarSelector?: boolean
  /** Permite redactar con el diseño clásico aunque no se elija plantilla. */
  permitirSinPlantilla?: boolean
}

const VARIABLES: { token: string; label: string; tipos: TipoDestinoCorreo[] }[] = [
  { token: "{nombre}", label: "Nombre", tipos: ["INFLUENCER", "EMPRESA"] },
  { token: "{empresa}", label: "Empresa", tipos: ["EMPRESA", "INFLUENCER"] },
  { token: "{{nombre_voluntario}}", label: "Tu nombre", tipos: ["INFLUENCER", "EMPRESA"] },
]

export function MiniaturaDiseno({ diseno }: { diseno: DisenoCorreo }) {
  const info = DISENO_CORREO_INFO[diseno]
  if (info.miniatura) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={info.miniatura}
        alt={info.label}
        className="h-full w-full object-cover object-top"
        loading="lazy"
      />
    )
  }
  // Boceto del diseño clásico (cabecera blanca, hero verde, texto, botón).
  return (
    <div className="flex h-full w-full flex-col bg-[#F1F6EF] p-1.5">
      <div className="flex flex-1 flex-col overflow-hidden rounded-md bg-white shadow-sm">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="h-1.5 w-10 rounded bg-[#1B4332]" />
          <span className="h-1 w-6 rounded bg-[#2D6A4F]/50" />
        </div>
        <div className="space-y-1 bg-[#1B4332] px-2 py-2">
          <span className="block h-1 w-8 rounded bg-[#8CC63F]" />
          <span className="block h-2 w-16 rounded bg-white/90" />
          <span className="block h-1 w-14 rounded bg-white/40" />
          <span className="mt-1 block h-2 w-10 rounded-full bg-[#8CC63F]" />
        </div>
        <div className="space-y-1 px-2 py-2">
          <span className="block h-1 w-full rounded bg-slate-200" />
          <span className="block h-1 w-5/6 rounded bg-slate-200" />
          <span className="block h-1 w-4/6 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

function ListaPlantillas({
  plantillas,
  plantillaId,
  onElegir,
  disabled,
}: {
  plantillas: Plantilla[]
  plantillaId: string
  onElegir: (plantilla: Plantilla) => void
  disabled?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label>Plantilla de correo</Label>
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pt-1 pb-2" role="radiogroup">
        {plantillas.map((p) => {
          const diseno = normalizarDiseno(p.diseno)
          const activa = p.id === plantillaId
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={activa}
              disabled={disabled}
              onClick={() => onElegir(p)}
              title={p.descripcion ?? p.nombre}
              className={cn(
                "group relative flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-background text-left transition-all",
                activa
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/50 hover:shadow-sm",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <div className="h-24 w-full overflow-hidden border-b bg-muted">
                <MiniaturaDiseno diseno={diseno} />
              </div>
              <div className="flex flex-col gap-0.5 p-2">
                <span className="line-clamp-1 text-xs font-semibold">{p.nombre}</span>
                <span className="line-clamp-1 text-[11px] text-muted-foreground">
                  {DISENO_CORREO_INFO[diseno].label}
                </span>
              </div>
              {activa && (
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Check size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Solo la galería de plantillas (sin editor). Útil cuando el editor se
 * muestra aparte, p. ej. en Gestión de correos con el modo "Agendar reunión".
 */
export function SelectorPlantillaGaleria({
  plantillaId,
  onChange,
  disabled,
}: {
  plantillaId: string
  onChange: (id: string, plantilla?: Plantilla) => void
  disabled?: boolean
}) {
  const { data: plantillas, isLoading, isError } = usePlantillas()
  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        Cargando plantillas...
      </p>
    )
  }
  if (isError) {
    return <p className="text-sm text-destructive">No se pudieron cargar las plantillas de correo.</p>
  }
  if (!plantillas || plantillas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
        No hay plantillas de correo.{" "}
        <Link href="/plantillas" className="text-primary hover:underline">
          Crea una en Plantillas
        </Link>
        .
      </div>
    )
  }
  return (
    <ListaPlantillas
      plantillas={plantillas}
      plantillaId={plantillaId}
      onElegir={(p) => onChange(p.id, p)}
      disabled={disabled}
    />
  )
}

export function SelectorPlantillaCorreo({
  plantillaId,
  onChange,
  asunto,
  onAsuntoChange,
  cuerpo,
  onCuerpoChange,
  tipo = "INFLUENCER",
  destinatario,
  disabled,
  ocultarSelector,
  permitirSinPlantilla,
}: Props) {
  const { data: plantillas, isLoading, isError } = usePlantillas()
  const cuerpoRef = useRef<HTMLTextAreaElement>(null)
  const seleccionada = plantillas?.find((p) => p.id === plantillaId)

  const usarPlantilla = Boolean(seleccionada)
  const mostrarEditor = ocultarSelector || permitirSinPlantilla || Boolean(seleccionada)
  const vista = useVistaPreviaCorreo(
    {
      plantillaId: usarPlantilla ? plantillaId : undefined,
      diseno: usarPlantilla ? undefined : "CLASICO",
      tipo,
      asunto,
      cuerpo,
      nombre: destinatario?.nombre,
      empresa: destinatario?.empresa,
    },
    { enabled: mostrarEditor },
  )

  const modificado =
    Boolean(seleccionada) && (seleccionada?.asunto !== asunto || seleccionada?.cuerpo !== cuerpo)

  function elegir(plantilla: Plantilla) {
    onChange(plantilla.id, plantilla)
    onAsuntoChange(plantilla.asunto)
    onCuerpoChange(plantilla.cuerpo)
  }

  function restablecer() {
    if (!seleccionada) return
    onAsuntoChange(seleccionada.asunto)
    onCuerpoChange(seleccionada.cuerpo)
  }

  function insertarVariable(token: string) {
    const el = cuerpoRef.current
    if (!el) {
      onCuerpoChange(`${cuerpo}${token}`)
      return
    }
    const inicio = el.selectionStart ?? cuerpo.length
    const fin = el.selectionEnd ?? cuerpo.length
    const nuevo = `${cuerpo.slice(0, inicio)}${token}${cuerpo.slice(fin)}`
    onCuerpoChange(nuevo)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(inicio + token.length, inicio + token.length)
    })
  }

  if (!ocultarSelector) {
    if (isLoading) {
      return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Cargando plantillas...
        </p>
      )
    }
    if (isError) {
      return <p className="text-sm text-destructive">No se pudieron cargar las plantillas de correo.</p>
    }
    if (!plantillas || plantillas.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          No hay plantillas de correo.{" "}
          <Link href="/plantillas" className="text-primary hover:underline">
            Crea una en Plantillas
          </Link>{" "}
          para poder enviar correos.
        </div>
      )
    }
  }

  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      {!ocultarSelector && plantillas && (
        <ListaPlantillas
          plantillas={plantillas}
          plantillaId={plantillaId}
          onElegir={elegir}
          disabled={disabled}
        />
      )}

      {mostrarEditor ? (
        <div className="grid min-w-0 gap-4 @3xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Editor del texto */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <PenLine size={14} className="text-primary" />
                Texto del correo
              </span>
              {modificado && (
                <button
                  type="button"
                  onClick={restablecer}
                  disabled={disabled}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <RotateCcw size={12} />
                  Restablecer plantilla
                </button>
              )}
            </div>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Asunto
              <Input
                value={asunto}
                maxLength={200}
                disabled={disabled}
                onChange={(e) => onAsuntoChange(e.target.value)}
                placeholder="Asunto del correo"
                className="text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              <span className="flex items-center justify-between">
                Mensaje
                <span className="tabular-nums font-normal">{cuerpo.length}/10000</span>
              </span>
              <Textarea
                ref={cuerpoRef}
                value={cuerpo}
                maxLength={10000}
                disabled={disabled}
                onChange={(e) => onCuerpoChange(e.target.value)}
                placeholder="Escribe el mensaje..."
                className="max-h-[420px] min-h-56 resize-y text-sm leading-relaxed text-foreground [field-sizing:fixed]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Insertar:</span>
              {VARIABLES.filter((v) => v.tipos.includes(tipo)).map((v) => (
                <button
                  key={v.token}
                  type="button"
                  disabled={disabled}
                  onClick={() => insertarVariable(v.token)}
                  className="rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10.5px] text-foreground hover:border-primary hover:text-primary"
                  title={v.label}
                >
                  {v.token}
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              El diseño, la imagen y el botón &quot;Agenda tu cita&quot; se mantienen; solo cambia el
              texto. Las variables se completan con los datos de cada destinatario al enviar.
            </p>
          </div>

          {/* Vista previa real */}
          <VistaPreviaCorreo
            html={vista.data?.html}
            asunto={vista.data?.asunto ?? asunto}
            isLoading={vista.isFetching}
            error={vista.error}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          Elige una plantilla para ver su diseño completo y editar el texto antes de enviar.
        </p>
      )}
    </div>
  )
}
