"use client"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  CaptarInfluencersResponse,
  RedSocial,
} from "@/types/influencer"

import { useCaptarInfluencers } from "../hooks/useInfluencers"

interface Props {
  onFinalizar?: () => void
}

const REDES: { value: RedSocial; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "FACEBOOK", label: "Facebook" },
]

function ResumenCaptura({
  resultado,
}: {
  resultado: CaptarInfluencersResponse
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          La captura se completó correctamente.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-semibold">{resultado.totalResultados}</p>
          <p className="text-xs text-muted-foreground">Resultados</p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-semibold">{resultado.validos}</p>
          <p className="text-xs text-muted-foreground">Válidos</p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-semibold">{resultado.nuevos}</p>
          <p className="text-xs text-muted-foreground">Nuevos</p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-semibold">{resultado.actualizados}</p>
          <p className="text-xs text-muted-foreground">Actualizados</p>
        </div>

        <div className="rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-semibold">{resultado.conEmail}</p>
          <p className="text-xs text-muted-foreground">Con email</p>
        </div>
      </div>

      {Object.keys(resultado.porRed).length > 0 && (
        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-medium">Resultados por red</p>

          <div className="flex flex-wrap gap-2">
            {Object.entries(resultado.porRed).map(([red, cantidad]) => (
              <div
                key={red}
                className="rounded-md bg-muted px-3 py-2 text-sm"
              >
                {red}: {cantidad}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CaptarInfluencers({ onFinalizar }: Props) {
  const captar = useCaptarInfluencers()

  const [prompt, setPrompt] = useState("")
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([
    "INSTAGRAM",
  ])
  const [maxItems, setMaxItems] = useState(20)
  const [resultado, setResultado] =
    useState<CaptarInfluencersResponse | null>(null)

  function cambiarRed(red: RedSocial, checked: boolean) {
    setRedesSociales((actuales) => {
      if (checked) {
        return actuales.includes(red) ? actuales : [...actuales, red]
      }

      return actuales.filter((actual) => actual !== red)
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!prompt.trim()) {
      toast.error("Ingresa un tema o descripción para buscar influencers.")
      return
    }

    if (redesSociales.length === 0) {
      toast.error("Selecciona al menos una red social.")
      return
    }

    if (maxItems < 1 || maxItems > 200) {
      toast.error("La cantidad debe estar entre 1 y 200.")
      return
    }

    captar.mutate(
      {
        prompt: prompt.trim(),
        redesSociales,
        maxItems,
      },
      {
        onSuccess: (data) => {
          setResultado(data)

          toast.success(
            `Captura completada. Se encontraron ${data.validos} influencers válidos.`,
          )
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudieron captar los influencers.",
          )
        },
      },
    )
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <ResumenCaptura resultado={resultado} />

        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setResultado(null)}
          >
            Captar otra búsqueda
          </Button>

          <Button
            type="button"
            onClick={() => onFinalizar?.()}
          >
            Volver a Influencers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prompt">Tema o búsqueda</Label>

        <Textarea
          id="prompt"
          placeholder="Ej. influencers de moda sostenible en Lima"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          required
        />

        <p className="text-xs text-muted-foreground">
          Describe el tipo de influencers que quieres encontrar.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Redes sociales</Label>

        <div className="flex flex-col gap-3">
          {REDES.map((red) => (
            <div key={red.value} className="flex items-center gap-2">
              <Checkbox
                id={`red-${red.value}`}
                checked={redesSociales.includes(red.value)}
                onCheckedChange={(checked) =>
                  cambiarRed(red.value, checked === true)
                }
              />

              <Label
                htmlFor={`red-${red.value}`}
                className="cursor-pointer font-normal"
              >
                {red.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="maxItems">Cantidad máxima</Label>

        <Input
          id="maxItems"
          type="number"
          min={1}
          max={200}
          value={maxItems}
          onChange={(event) => setMaxItems(Number(event.target.value))}
          required
        />

        <p className="text-xs text-muted-foreground">
          Puedes solicitar entre 1 y 200 resultados.
        </p>
      </div>

      <Button
        type="submit"
        disabled={captar.isPending || redesSociales.length === 0}
        className="mt-2"
      >
        {captar.isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Captando influencers...
          </>
        ) : (
          <>
            <Search size={16} />
            Captar influencers
          </>
        )}
      </Button>
    </form>
  )
}