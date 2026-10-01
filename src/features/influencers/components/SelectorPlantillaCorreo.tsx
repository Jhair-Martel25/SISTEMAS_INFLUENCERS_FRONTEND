"use client"

import Link from "next/link"
import { FileText, Loader2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePlantillas } from "@/features/plantillas/hooks/usePlantillas"

/**
 * Selector de plantilla de correo + vista previa (asunto y cuerpo).
 * El backend reemplaza los placeholders al enviar; aquí solo se simulan
 * para la vista previa.
 */

interface Props {
  plantillaId: string
  onChange: (id: string) => void
  /** Nombre del influencer para la vista previa (opcional). */
  nombreInfluencer?: string
  disabled?: boolean
}

function vistaPrevia(texto: string, nombreInfluencer?: string) {
  return texto
    .replaceAll("{{nombre_influencer}}", nombreInfluencer ?? "[nombre del influencer]")
    .replaceAll("{{nombre_voluntario}}", "[tu nombre]")
    .replaceAll("{{link_agendamiento}}", "[link de agendamiento]")
}

export function SelectorPlantillaCorreo({
  plantillaId,
  onChange,
  nombreInfluencer,
  disabled,
}: Props) {
  const { data: plantillas, isLoading, isError } = usePlantillas()
  const seleccionada = plantillas?.find((p) => p.id === plantillaId)

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        Cargando plantillas...
      </p>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        No se pudieron cargar las plantillas de correo.
      </p>
    )
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

  return (
    <div className="flex flex-col gap-2">
      <Label>Plantilla de correo</Label>
      <Select value={plantillaId} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige una plantilla" />
        </SelectTrigger>
        <SelectContent>
          {plantillas.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {seleccionada ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 text-xs">
            <FileText size={12} className="shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Asunto:</span>
            <span className="truncate font-medium">
              {vistaPrevia(seleccionada.asunto, nombreInfluencer)}
            </span>
          </div>
          <p className="max-h-40 overflow-y-auto px-3 py-2 text-xs whitespace-pre-wrap">
            {vistaPrevia(seleccionada.cuerpo, nombreInfluencer)}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          El correo se envía con el asunto y el texto de la plantilla elegida.
        </p>
      )}
    </div>
  )
}
