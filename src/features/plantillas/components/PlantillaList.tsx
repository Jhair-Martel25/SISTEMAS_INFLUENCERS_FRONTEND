"use client"

import { useMemo, useState } from "react"
import {
  Copy,
  Eye,
  FileText,
  ImageIcon,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

import {
  DISENOS_CORREO,
  DISENO_CORREO_INFO,
  normalizarDiseno,
  tipoPreviaDeDiseno,
  urlImagenPlantilla,
  type DisenoCorreo,
  type Plantilla,
} from "@/types/plantilla"
import { VistaPreviaCorreo } from "@/features/email/components/VistaPreviaCorreo"
import { useVistaPreviaCorreo } from "@/features/email/hooks/useVistaPreviaCorreo"
import {
  useCrearPlantilla,
  useEliminarPlantilla,
  usePlantillas,
} from "../hooks/usePlantillas"
import { PlantillaForm } from "./PlantillaForm"

type FiltroDiseno = DisenoCorreo | "TODOS"

/** Resalta las variables ({nombre}, {{link_agendamiento}}…) dentro del texto. */
function TextoConVariables({ texto }: { texto: string }) {
  const partes = texto.split(/(\{\{?\s*[a-z_]+\s*\}?\})/gi)
  return (
    <>
      {partes.map((p, i) =>
        /^\{\{?\s*[a-z_]+\s*\}?\}$/i.test(p) ? (
          <span
            key={i}
            className="rounded bg-emerald-100 px-1 font-mono text-[10.5px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

/** Portada de la tarjeta: imagen del diseño o una maqueta con el asunto. */
function PortadaPlantilla({ plantilla }: { plantilla: Plantilla }) {
  const diseno = normalizarDiseno(plantilla.diseno)
  const info = DISENO_CORREO_INFO[diseno]
  const src = urlImagenPlantilla(plantilla) ?? info.miniatura
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={info.label}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    )
  }
  return (
    <div className="flex h-full w-full items-start justify-center bg-[#F1F6EF] px-6 pt-4">
      <div className="w-full max-w-[260px] overflow-hidden rounded-t-lg bg-white shadow-md transition-transform duration-500 group-hover:-translate-y-1">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="size-4 object-contain" />
            <span className="leading-none">
              <span className="block text-[5px] font-bold tracking-[0.2em] text-[#2D6A4F]">ONGD</span>
              <span className="block text-[9px] font-black text-[#1B4332]" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
                SEMBRANDO PERÚ
              </span>
            </span>
          </span>
          <span className="rounded-full bg-[#E7F1E2] px-1.5 py-0.5 text-[5px] font-bold text-[#2D6A4F]">Alianzas que generan impacto</span>
        </div>
        <div className="space-y-1.5 bg-[#1B4332] px-3 py-3">
          <span className="block text-[6px] font-bold tracking-[0.2em] text-[#8CC63F]">SEMBRANDO PERÚ</span>
          <p className="line-clamp-2 text-[11px] leading-tight font-black text-white" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
            {plantilla.asunto}
          </p>
          <span className="inline-block rounded-full bg-[#8CC63F] px-2 py-0.5 text-[6px] font-bold text-[#1B4332]">
            Agendar reunión →
          </span>
        </div>
        <div className="space-y-1 px-3 py-2.5">
          <span className="block h-1 w-full rounded bg-slate-200" />
          <span className="block h-1 w-5/6 rounded bg-slate-200" />
          <span className="block h-1 w-4/6 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

function DialogoVistaPrevia({ plantilla, onClose }: { plantilla: Plantilla; onClose: () => void }) {
  const diseno = normalizarDiseno(plantilla.diseno)
  const vista = useVistaPreviaCorreo({
    plantillaId: plantilla.id,
    tipo: tipoPreviaDeDiseno(diseno),
  })
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{plantilla.nombre}</DialogTitle>
          <DialogDescription>
            Así llegará el correo · {DISENO_CORREO_INFO[diseno].label}
          </DialogDescription>
        </DialogHeader>
        <VistaPreviaCorreo
          html={vista.data?.html}
          asunto={vista.data?.asunto ?? plantilla.asunto}
          isLoading={vista.isFetching}
          error={vista.error}
        />
      </DialogContent>
    </Dialog>
  )
}

export function PlantillaList() {

  /** null = cerrado; `diseno` preselecciona el diseño (IMAGEN al importar imagen). */
  const [creando, setCreando] = useState<{ diseno?: DisenoCorreo } | null>(null)
  const [editando, setEditando] = useState<Plantilla | null>(null)
  const [eliminando, setEliminando] = useState<Plantilla | null>(null)
  const [viendo, setViendo] = useState<Plantilla | null>(null)
  const [buscar, setBuscar] = useState("")
  const [filtro, setFiltro] = useState<FiltroDiseno>("TODOS")

  const { data, isLoading, isError, error } = usePlantillas()
  const eliminar = useEliminarPlantilla()
  const crear = useCrearPlantilla()

  const plantillas = useMemo(() => data ?? [], [data])
  const porDiseno = useMemo(() => {
    let clasicas = 0
    for (const p of plantillas) if (normalizarDiseno(p.diseno) === "CLASICO") clasicas++
    return { CLASICO: clasicas, CAMPANAS: plantillas.length - clasicas }
  }, [plantillas])

  const filtradas = useMemo(() => {
    const texto = buscar.trim().toLowerCase()
    return plantillas.filter((p) => {
      if (filtro !== "TODOS" && normalizarDiseno(p.diseno) !== filtro) return false
      if (!texto) return true
      return [p.nombre, p.asunto, p.descripcion ?? "", p.cuerpo].join(" ").toLowerCase().includes(texto)
    })
  }, [plantillas, buscar, filtro])

  async function duplicar(p: Plantilla) {
    const nombres = new Set(plantillas.map((x) => x.nombre))
    let nombre = `${p.nombre} (copia)`
    for (let i = 2; nombres.has(nombre); i++) nombre = `${p.nombre} (copia ${i})`
    // Las plantillas con imagen propia copian también su imagen.
    let imagenBase64: string | undefined
    const urlImagen = urlImagenPlantilla(p)
    if (urlImagen) {
      try {
        const blob = await (await fetch(urlImagen)).blob()
        imagenBase64 = await new Promise<string>((resolve, reject) => {
          const lector = new FileReader()
          lector.onload = () => resolve(String(lector.result))
          lector.onerror = () => reject(new Error("No se pudo copiar la imagen."))
          lector.readAsDataURL(blob)
        })
      } catch {
        toast.error("No se pudo copiar la imagen de la plantilla.")
        return
      }
    }
    crear.mutate(
      {
        nombre,
        descripcion: p.descripcion ?? undefined,
        asunto: p.asunto,
        cuerpo: p.cuerpo,
        diseno: normalizarDiseno(p.diseno),
        imagenBase64,
      },
      {
        onSuccess: () => toast.success(`Se creó "${nombre}".`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo duplicar la plantilla."),
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Plantillas de correo"
        description="Diseños y textos que se usan al invitar a embajadores, empresas y contactos."
        backHref="/dashboard"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCreando({ diseno: "IMAGEN" })}>
              <ImagePlus size={16} />
              Importar imagen
            </Button>
            <Button onClick={() => setCreando({})}>
              <Plus size={16} />
              Nueva plantilla
            </Button>
          </div>
        }
      />

      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#003D2D] to-emerald-800 p-4 text-white shadow-sm">
          <div>
            <p className="text-xs font-medium text-emerald-100">Plantillas</p>
            <p className="mt-1 text-3xl font-bold">{plantillas.length}</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
            <LayoutTemplate size={20} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{DISENO_CORREO_INFO.CLASICO.label}</p>
            <p className="mt-1 text-2xl font-bold">{porDiseno.CLASICO}</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
            <FileText size={20} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Diseños de campaña (con imagen)</p>
            <p className="mt-1 text-2xl font-bold">{porDiseno.CAMPANAS}</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
            <ImageIcon size={20} />
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-muted/70 p-1 text-sm">
          {(["TODOS", ...DISENOS_CORREO] as FiltroDiseno[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFiltro(d)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-medium transition-colors",
                filtro === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d === "TODOS" ? "Todas" : DISENO_CORREO_INFO[d].label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, asunto o texto…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {/* Galería */}
      {isError ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "No se pudieron cargar las plantillas."}
        </p>
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Cargando plantillas…
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((p) => {
            const diseno = normalizarDiseno(p.diseno)
            return (
              <article
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setViendo(p)}
                  className="relative h-44 w-full overflow-hidden border-b bg-muted"
                  aria-label={`Ver ${p.nombre}`}
                >
                  <PortadaPlantilla plantilla={p} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#003D2D] shadow">
                      <Eye size={14} /> Vista previa
                    </span>
                  </span>
                  <span
                    className={cn(
                      "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-sm",
                      diseno === "CLASICO" ? "bg-[#1B4332] text-white" : "bg-[#8CC63F] text-[#1B4332]",
                    )}
                  >
                    {DISENO_CORREO_INFO[diseno].label}
                  </span>
                </button>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-bold">{p.nombre}</h3>
                    {p.descripcion && <p className="line-clamp-1 text-xs text-muted-foreground">{p.descripcion}</p>}
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2">
                    <Mail size={14} className="mt-0.5 shrink-0 text-primary" />
                    <p className="line-clamp-1 text-sm font-medium">
                      <TextoConVariables texto={p.asunto} />
                    </p>
                  </div>
                  <p className="line-clamp-3 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                    <TextoConVariables texto={p.cuerpo.replace(/<[^>]+>/g, " ")} />
                  </p>
                </div>

                <div className="flex items-center justify-between gap-1 border-t px-3 py-2">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setViendo(p)}>
                    <Eye size={14} /> Ver
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setEditando(p)}>
                      <Pencil size={14} /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title="Duplicar"
                      aria-label="Duplicar"
                      disabled={crear.isPending}
                      onClick={() => void duplicar(p)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar plantilla"
                      aria-label="Eliminar"
                      onClick={() => setEliminando(p)}
                    >
                      <Trash2 size={14} /> Borrar
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}

          {/* Tarjetas para crear */}
          <div className="grid min-h-[340px] grid-rows-2 gap-3">
            <button
              type="button"
              onClick={() => setCreando({})}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-muted">
                <Plus size={20} />
              </span>
              <span className="font-semibold">Nueva plantilla</span>
              <span className="max-w-[220px] text-center text-xs">Elige un diseño, escribe el texto y mira la vista previa.</span>
            </button>
            <button
              type="button"
              onClick={() => setCreando({ diseno: "IMAGEN" })}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-muted">
                <ImagePlus size={20} />
              </span>
              <span className="font-semibold">Importar imagen</span>
              <span className="max-w-[220px] text-center text-xs">Sube tu propia pieza gráfica y crea un nuevo modelo.</span>
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && filtradas.length === 0 && plantillas.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">No hay plantillas que coincidan con la búsqueda.</p>
      )}

      {viendo && <DialogoVistaPrevia plantilla={viendo} onClose={() => setViendo(null)} />}

      <Dialog open={Boolean(creando)} onOpenChange={(open) => !open && setCreando(null)}>
        <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{creando?.diseno === "IMAGEN" ? "Nueva plantilla con imagen" : "Nueva plantilla"}</DialogTitle>
            <DialogDescription>
              {creando?.diseno === "IMAGEN"
                ? "Importa tu imagen, escribe el texto y revisa cómo llegará el correo."
                : "Elige un diseño y escribe el texto del correo."}
            </DialogDescription>
          </DialogHeader>
          {creando && (
            <PlantillaForm
              disenoInicial={creando.diseno}
              onSuccess={() => setCreando(null)}
              onCancel={() => setCreando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editando)} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>Actualiza el diseño o el texto de la plantilla.</DialogDescription>
          </DialogHeader>
          {editando && (
            <PlantillaForm plantilla={editando} onSuccess={() => setEditando(null)} onCancel={() => setEditando(null)} />
          )}
          {editando && (
            <div className="flex justify-start border-t pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setEliminando(editando)
                  setEditando(null)
                }}
              >
                <Trash2 size={14} /> Borrar esta plantilla
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar plantilla"
        description={
          eliminando
            ? `¿Seguro que deseas eliminar la plantilla "${eliminando.nombre}"? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success("Plantilla eliminada correctamente.")
              setEliminando(null)
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo eliminar la plantilla."),
          })
        }}
      />
    </div>
  )
}
