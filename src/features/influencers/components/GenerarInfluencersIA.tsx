"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/http"
import { TIPO_CATEGORIA } from "@/types/categoria"
import type { Influencer, InfluencerGenerado } from "@/types/influencer"

import { useCategorias } from "../../categorias/hooks/useCategorias"
import { useGenerarInfluencers, useInfluencers } from "../hooks/useInfluencers"

/**
 * Formulario para generar influencers automaticamente con IA.
 * Llama a POST /influencers/generar con { tema, rangoSeguidores, cantidad }.
 * Una respuesta exitosa trae un array de influencers NUEVOS que el backend
 * acaba de crear (ya con mensaje_personalizado armado por el backend): esos
 * se muestran en la seccion "Nuevos generados".
 *
 * Cuando no hay nada nuevo para crear, el backend responde con un error
 * "blando" (400/404): "ya existen en la base de datos" o "no se
 * encontraron perfiles" (la busqueda de Gemini/Instagram no encontro nada
 * nuevo; esto lo decide el backend, el frontend no puede forzar mas
 * resultados). En cualquiera de esos casos SIEMPRE se muestra una lista de
 * influencers ya guardados, para que la pantalla nunca quede vacia:
 * primero se intenta con influencers de la misma tematica buscada, y si no
 * hay ninguno, se cae a los mas recientes del sistema en general.
 *
 * El tema/nicho se elige de un desplegable poblado con GET /categorias
 * (tipo TEMATICA), el mismo catalogo que usa el resto de la app.
 */

interface Props {
  onFinalizar?: () => void
}

type Resultado =
  | { tipo: "nuevos"; influencers: InfluencerGenerado[] }
  | { tipo: "sinNuevos"; mensaje: string }

/** Errores "blandos": la busqueda corrio bien pero no genero nada nuevo. */
function resultadoBlando(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null
  if (error.status !== 400 && error.status !== 404) return null
  if (/ya existen en la base de datos/i.test(error.message)) return error.message
  if (/no se encontraron perfiles/i.test(error.message)) return error.message
  return null
}

function TablaInfluencers({ influencers }: { influencers: Influencer[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Nombre</th>
            <th className="px-3 py-2 font-medium">Instagram</th>
            <th className="px-3 py-2 font-medium">Seguidores</th>
          </tr>
        </thead>
        <tbody>
          {influencers.map((influencer) => (
            <tr key={influencer.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-medium text-foreground">
                {influencer.nombre || influencer.usuarioIg}
              </td>
              <td className="px-3 py-2">
                <a href={influencer.linkIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  @{influencer.usuarioIg}
                </a>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {influencer.seguidores ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaInfluencersGenerados({ influencers }: { influencers: InfluencerGenerado[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Nombre</th>
            <th className="px-3 py-2 font-medium">Instagram</th>
            <th className="px-3 py-2 font-medium">Seguidores</th>
          </tr>
        </thead>
        <tbody>
          {influencers.map((influencer) => (
            <tr key={influencer.UsuarioIg} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-medium text-foreground">
                {influencer.Nombre || influencer.UsuarioIg}
              </td>
              <td className="px-3 py-2">
                <a href={influencer.LinkIg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  @{influencer.UsuarioIg}
                </a>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {influencer.seguidores ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GenerarInfluencersIA({ onFinalizar }: Props) {
  const generar = useGenerarInfluencers()
  const { data: categorias, isLoading: cargandoTematicas } = useCategorias(
    TIPO_CATEGORIA.TEMATICA,
  )

  const tematicas = [...(categorias?.TEMATICA ?? [])].sort((a, b) => a.orden - b.orden)

  const [tema, setTema] = useState("")
  const [rangoSeguidores, setRangoSeguidores] = useState("")
  const [cantidad, setCantidad] = useState(20)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const tematicaSeleccionada = tematicas.find((t) => t.etiqueta === tema)
  const limite = Math.min(cantidad, 20)

  // Fallback 1: influencers ya guardados de la misma tematica buscada.
  const recientesTematica = useInfluencers({
    page: 1,
    limit: limite,
    ...(tematicaSeleccionada ? { tematica: tematicaSeleccionada.valor } : {}),
  })
  // Fallback 2: si no hay ninguno de esa tematica, los mas recientes en general.
  const recientesGenerales = useInfluencers({ page: 1, limit: limite })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!tema.trim() || !rangoSeguidores.trim() || cantidad < 1) return

    generar.mutate(
      {
        tema: tema.trim(),
        rangoSeguidores: rangoSeguidores.trim(),
        cantidad,
      },
      {
        onSuccess: (data) => {
          const influencers = data ?? []
          setResultado({ tipo: "nuevos", influencers })
          toast.success(
            influencers.length > 0
              ? `Se generaron ${influencers.length} influencers nuevos.`
              : "Generacion completada.",
          )
        },
        onError: (error) => {
          const mensaje = resultadoBlando(error)
          if (mensaje) {
            setResultado({ tipo: "sinNuevos", mensaje })
            toast.info(mensaje)
            return
          }
          toast.error(
            error instanceof Error ? error.message : "No se pudo generar los influencers.",
          )
        },
      },
    )
  }

  if (resultado) {
    const listaTematica = recientesTematica.data?.data ?? []
    const listaGeneral = recientesGenerales.data?.data ?? []
    const cargandoFallback = recientesTematica.isLoading || recientesGenerales.isLoading
    const usarFallbackGeneral = !recientesTematica.isLoading && listaTematica.length === 0
    const listaAMostrar = usarFallbackGeneral ? listaGeneral : listaTematica

    return (
      <div className="flex flex-col gap-4 py-6">
        {resultado.tipo === "nuevos" && (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Se generaron {resultado.influencers.length} influencers nuevos y ya quedaron
              guardados en el sistema:
            </p>

            {resultado.influencers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                El backend no devolvio influencers nuevos en la respuesta.
              </p>
            ) : (
              <TablaInfluencersGenerados influencers={resultado.influencers} />
            )}
          </>
        )}

        {resultado.tipo === "sinNuevos" && (
          <>
            <p className="text-center text-sm text-muted-foreground">{resultado.mensaje}</p>

            {cargandoFallback ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : listaAMostrar.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todavia no hay influencers registrados en el sistema.
              </p>
            ) : (
              <>
                <p className="text-center text-xs text-muted-foreground">
                  {usarFallbackGeneral
                    ? "No hay influencers de esta tematica todavia. Mostrando los mas recientes del sistema en general:"
                    : `Influencers de la tematica "${tema}" ya registrados en el sistema:`}
                </p>
                <TablaInfluencers influencers={listaAMostrar} />
              </>
            )}
          </>
        )}

        <div className="flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => setResultado(null)}>
            Generar otra tanda
          </Button>
          <Button type="button" onClick={() => onFinalizar?.()}>
            Volver a Influencers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tema">Tema / nicho</Label>
        <Select value={tema} onValueChange={setTema}>
          <SelectTrigger id="tema">
            <SelectValue
              placeholder={cargandoTematicas ? "Cargando temas..." : "Selecciona un tema"}
            />
          </SelectTrigger>
          <SelectContent>
            {tematicas.map((tematica) => (
              <SelectItem key={tematica.valor} value={tematica.etiqueta}>
                {tematica.etiqueta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tematicas.length === 0 && !cargandoTematicas && (
          <p className="text-xs text-muted-foreground">
            No hay temas configurados todavia. Contacta a un administrador.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rangoSeguidores">Rango de seguidores</Label>
        <Input
          id="rangoSeguidores"
          placeholder="Ej. 10k - 50k"
          value={rangoSeguidores}
          onChange={(e) => setRangoSeguidores(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cantidad">Cantidad de influencers</Label>
        <Input
          id="cantidad"
          type="number"
          min={1}
          max={100}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          required
        />
      </div>

      <Button type="submit" disabled={generar.isPending || !tema} className="mt-2">
        {generar.isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generar influencers
          </>
        )}
      </Button>
    </form>
  )
}