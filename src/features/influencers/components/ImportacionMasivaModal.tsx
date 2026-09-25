"use client"

import { useState } from "react"
import {
  Check,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type {
  CaptarInfluencersResponse,
  RedSocial,
} from "@/types/influencer"

import { useCaptarInfluencers } from "../hooks/useInfluencers"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const REDES: { value: RedSocial; label: string }[] = [
  { value: "TIKTOK", label: "TikTok" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
]

// Ideas rápidas para el prompt (solo rellenan el campo).
const EJEMPLOS_PROMPT = [
  "moda sostenible lima",
  "fitness y vida sana perú",
  "gastronomía peruana",
]

// Atajos de rango de seguidores (solo rellenan los campos).
const RANGOS: { label: string; min: string; max: string }[] = [
  { label: "Cualquiera", min: "", max: "" },
  { label: "Nano · 1K–10K", min: "1000", max: "10000" },
  { label: "Micro · 10K–50K", min: "10000", max: "50000" },
  { label: "Medio · 50K–100K", min: "50000", max: "100000" },
]

// Límites que exige el backend (CaptarInfluencersDto).
const MAX_PALABRAS = 24
const MAX_ITEMS_MIN = 10
const MAX_ITEMS_MAX = 20

function contarPalabras(texto: string) {
  return texto.trim().split(/\s+/).filter(Boolean).length
}

function aNumeroOpcional(valor: string): number | undefined {
  if (valor.trim() === "") return undefined
  const n = Number(valor)
  return Number.isFinite(n) ? n : undefined
}

function Seccion({
  paso,
  titulo,
  children,
  extra,
}: {
  paso: number
  titulo: string
  children: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {paso}
          </span>
          <span className="text-sm font-medium">{titulo}</span>
        </div>
        {extra}
      </div>
      {children}
    </section>
  )
}

function Resumen({ resultado }: { resultado: CaptarInfluencersResponse }) {
  const items = [
    { label: "Resultados", valor: resultado.totalResultados, destacado: false },
    { label: "Válidos", valor: resultado.validos, destacado: false },
    { label: "Nuevos", valor: resultado.nuevos, destacado: true },
    { label: "Actualizados", valor: resultado.actualizados, destacado: false },
    { label: "Con email", valor: resultado.conEmail, destacado: false },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 size={26} className="text-primary" />
        </span>
        <p className="font-medium">Búsqueda completada</p>
        <p className="text-sm text-muted-foreground">
          Los influencers ya se guardaron y aparecen en la tabla.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-xl border p-3 text-center",
              item.destacado
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-background",
            )}
          >
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                item.destacado && "text-primary",
              )}
            >
              {item.valor}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {Object.keys(resultado.porRed ?? {}).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(resultado.porRed).map(([red, cantidad]) => (
            <span
              key={red}
              className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs"
            >
              {red} · <span className="font-semibold">{cantidad}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ImportacionMasivaModal({ open, onOpenChange }: Props) {
  const captar = useCaptarInfluencers()

  const [prompt, setPrompt] = useState("")
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>(["INSTAGRAM"])
  const [maxItems, setMaxItems] = useState(String(MAX_ITEMS_MAX))
  const [minSeguidores, setMinSeguidores] = useState("")
  const [maxSeguidores, setMaxSeguidores] = useState("")
  const [resultado, setResultado] = useState<CaptarInfluencersResponse | null>(
    null,
  )

  const palabras = contarPalabras(prompt)
  const excedePalabras = palabras > MAX_PALABRAS
  const ocupado = captar.isPending

  function reiniciar() {
    setPrompt("")
    setRedesSociales(["INSTAGRAM"])
    setMaxItems(String(MAX_ITEMS_MAX))
    setMinSeguidores("")
    setMaxSeguidores("")
    setResultado(null)
    captar.reset()
  }

  function cambiarOpen(abierto: boolean) {
    // No cerrar mientras la búsqueda está en curso.
    if (!abierto && ocupado) return
    if (!abierto) reiniciar()
    onOpenChange(abierto)
  }

  function alternarRed(red: RedSocial) {
    setRedesSociales((actuales) =>
      actuales.includes(red)
        ? actuales.filter((r) => r !== red)
        : [...actuales, red],
    )
  }

  function ajustarMaxItems(delta: number) {
    const actual = Number(maxItems) || MAX_ITEMS_MAX
    const siguiente = Math.min(
      MAX_ITEMS_MAX,
      Math.max(MAX_ITEMS_MIN, actual + delta),
    )
    setMaxItems(String(siguiente))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const texto = prompt.trim()
    if (!texto) {
      toast.error("Ingresa un prompt de búsqueda.")
      return
    }
    if (contarPalabras(texto) > MAX_PALABRAS) {
      toast.error(`El prompt no debe superar ${MAX_PALABRAS} palabras.`)
      return
    }
    if (redesSociales.length === 0) {
      toast.error("Selecciona al menos una red social.")
      return
    }

    const items = Number(maxItems)
    if (
      !Number.isInteger(items) ||
      items < MAX_ITEMS_MIN ||
      items > MAX_ITEMS_MAX
    ) {
      toast.error(
        `maxItems debe ser un número entero entre ${MAX_ITEMS_MIN} y ${MAX_ITEMS_MAX}.`,
      )
      return
    }

    const min = aNumeroOpcional(minSeguidores)
    const max = aNumeroOpcional(maxSeguidores)
    if (
      (min !== undefined && (!Number.isInteger(min) || min < 0)) ||
      (max !== undefined && (!Number.isInteger(max) || max < 0))
    ) {
      toast.error("Los seguidores deben ser números enteros positivos.")
      return
    }
    if (min !== undefined && max !== undefined && min > max) {
      toast.error("minSeguidores no puede ser mayor que maxSeguidores.")
      return
    }

    captar.mutate(
      {
        prompt: texto,
        redesSociales,
        maxItems: items,
        ...(min !== undefined && { minSeguidores: min }),
        ...(max !== undefined && { maxSeguidores: max }),
      },
      {
        onSuccess: (data) => {
          setResultado(data)
          toast.success(
            `Importación completada: ${data.nuevos} nuevos, ${data.actualizados} actualizados.`,
          )
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudo realizar la importación masiva.",
          )
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={cambiarOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle>Importación masiva</DialogTitle>
              <DialogDescription>
                Busca influencers en redes sociales y guárdalos automáticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {resultado ? (
          <>
            <Resumen resultado={resultado} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={reiniciar}>
                Nueva búsqueda
              </Button>
              <Button type="button" onClick={() => cambiarOpen(false)}>
                Listo
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Seccion
              paso={1}
              titulo="¿Qué buscas?"
              extra={
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    excedePalabras
                      ? "font-medium text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {palabras}/{MAX_PALABRAS} palabras
                </span>
              }
            >
              <Label htmlFor="im-prompt" className="sr-only">
                Prompt
              </Label>
              <Textarea
                id="im-prompt"
                placeholder="Ej. moda sostenible lima"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={ocupado}
                aria-invalid={excedePalabras}
                className="min-h-20 resize-none"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Ideas:</span>
                {EJEMPLOS_PROMPT.map((ejemplo) => (
                  <button
                    key={ejemplo}
                    type="button"
                    disabled={ocupado}
                    onClick={() => setPrompt(ejemplo)}
                    className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    {ejemplo}
                  </button>
                ))}
              </div>
            </Seccion>

            <Seccion
              paso={2}
              titulo="Redes sociales"
              extra={
                <span className="text-xs text-muted-foreground">
                  {redesSociales.length} seleccionada
                  {redesSociales.length === 1 ? "" : "s"}
                </span>
              }
            >
              <div className="grid grid-cols-3 gap-2">
                {REDES.map((red) => {
                  const activa = redesSociales.includes(red.value)
                  return (
                    <button
                      key={red.value}
                      type="button"
                      aria-pressed={activa}
                      disabled={ocupado}
                      onClick={() => alternarRed(red.value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                        activa
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                      )}
                    >
                      {activa && <Check size={14} />}
                      {red.label}
                    </button>
                  )
                })}
              </div>
            </Seccion>

            <Seccion paso={3} titulo="Filtros">
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor="im-maxItems">Resultados por red</Label>
                    <span className="text-xs text-muted-foreground">
                      Entre {MAX_ITEMS_MIN} y {MAX_ITEMS_MAX}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Menos"
                      disabled={ocupado || Number(maxItems) <= MAX_ITEMS_MIN}
                      onClick={() => ajustarMaxItems(-1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <Input
                      id="im-maxItems"
                      type="number"
                      min={MAX_ITEMS_MIN}
                      max={MAX_ITEMS_MAX}
                      value={maxItems}
                      onChange={(e) => setMaxItems(e.target.value)}
                      disabled={ocupado}
                      className="w-16 text-center tabular-nums"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Más"
                      disabled={ocupado || Number(maxItems) >= MAX_ITEMS_MAX}
                      onClick={() => ajustarMaxItems(1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Rango de seguidores
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Opcional · solo aplica a Instagram y TikTok
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {RANGOS.map((rango) => {
                      const activo =
                        minSeguidores === rango.min &&
                        maxSeguidores === rango.max
                      return (
                        <button
                          key={rango.label}
                          type="button"
                          disabled={ocupado}
                          onClick={() => {
                            setMinSeguidores(rango.min)
                            setMaxSeguidores(rango.max)
                          }}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            activo
                              ? "border-primary bg-primary/10 font-medium text-primary"
                              : "border-border bg-background text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {rango.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <Users
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                      />
                      <Label htmlFor="im-min" className="sr-only">
                        Mínimo de seguidores
                      </Label>
                      <Input
                        id="im-min"
                        type="number"
                        min={0}
                        placeholder="Mínimo"
                        value={minSeguidores}
                        onChange={(e) => setMinSeguidores(e.target.value)}
                        disabled={ocupado}
                        className="bg-background pl-8"
                      />
                    </div>
                    <div className="relative">
                      <Users
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                      />
                      <Label htmlFor="im-max" className="sr-only">
                        Máximo de seguidores
                      </Label>
                      <Input
                        id="im-max"
                        type="number"
                        min={0}
                        placeholder="Máximo"
                        value={maxSeguidores}
                        onChange={(e) => setMaxSeguidores(e.target.value)}
                        disabled={ocupado}
                        className="bg-background pl-8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Seccion>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {ocupado
                  ? "Buscando perfiles, puede tardar hasta un minuto..."
                  : "Los resultados se guardan automáticamente."}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={ocupado}
                  onClick={() => cambiarOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    ocupado || redesSociales.length === 0 || excedePalabras
                  }
                >
                  {ocupado ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Realizar búsqueda
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
