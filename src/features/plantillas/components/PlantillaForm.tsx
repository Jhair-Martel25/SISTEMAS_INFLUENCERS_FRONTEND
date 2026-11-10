"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { Check, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
import { MiniaturaDiseno } from "@/features/influencers/components/SelectorPlantillaCorreo"
import { VistaPreviaCorreo } from "@/features/email/components/VistaPreviaCorreo"
import { useVistaPreviaCorreo } from "@/features/email/hooks/useVistaPreviaCorreo"
import {
  useActualizarPlantilla,
  useCrearPlantilla,
} from "../hooks/usePlantillas"
import {
  plantillaFormSchema,
  type PlantillaFormValues,
} from "../schemas/plantilla-form.schema"

function valoresIniciales(plantilla?: Plantilla | null, disenoInicial?: DisenoCorreo): PlantillaFormValues {
  return {
    nombre: plantilla?.nombre ?? "",
    descripcion: plantilla?.descripcion ?? "",
    asunto: plantilla?.asunto ?? "",
    cuerpo: plantilla?.cuerpo ?? "",
    diseno: plantilla ? normalizarDiseno(plantilla.diseno) : (disenoInicial ?? "CLASICO"),
  }
}

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES_ORIGINAL = 12 * 1024 * 1024
const MAX_BYTES_FINAL = 3 * 1024 * 1024
const ANCHO_MAX = 1280

function leerComoDataUrl(archivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."))
    lector.readAsDataURL(archivo)
  })
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("El archivo no es una imagen válida."))
    img.src = src
  })
}

/**
 * Prepara la imagen para el correo: la reduce a 1280 px de ancho como máximo
 * y la convierte a JPEG (más liviana). Los GIF y los PNG pequeños se dejan
 * tal cual para no perder animación ni transparencia.
 */
export async function prepararImagenCorreo(archivo: File): Promise<string> {
  if (!TIPOS_IMAGEN.includes(archivo.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WEBP o GIF.")
  }
  if (archivo.size > MAX_BYTES_ORIGINAL) {
    throw new Error("La imagen es muy pesada (máx. 12 MB).")
  }
  const original = await leerComoDataUrl(archivo)
  if (archivo.type === "image/gif") {
    if (archivo.size > MAX_BYTES_FINAL) throw new Error("El GIF supera los 3 MB.")
    return original
  }
  const img = await cargarImagen(original)
  if (archivo.type === "image/png" && img.naturalWidth <= ANCHO_MAX && archivo.size <= 800 * 1024) {
    return original
  }
  const escala = Math.min(1, ANCHO_MAX / img.naturalWidth)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.naturalWidth * escala)
  canvas.height = Math.round(img.naturalHeight * escala)
  const ctx = canvas.getContext("2d")
  if (!ctx) return original
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  for (const calidad of [0.86, 0.75, 0.6]) {
    const dataUrl = canvas.toDataURL("image/jpeg", calidad)
    if ((dataUrl.length * 3) / 4 <= MAX_BYTES_FINAL) return dataUrl
  }
  throw new Error("La imagen es muy grande incluso comprimida. Prueba con otra.")
}

/** Zona para subir / cambiar / quitar la imagen propia de la plantilla. */
function SubirImagen({
  imagen,
  procesando,
  onArchivo,
  onQuitar,
}: {
  imagen: string | null
  procesando: boolean
  onArchivo: (archivo: File) => void
  onQuitar: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)

  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        accept={TIPOS_IMAGEN.join(",")}
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0]
          if (archivo) onArchivo(archivo)
          e.target.value = ""
        }}
      />
      {imagen ? (
        <div className="overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagen} alt="Imagen de la plantilla" className="max-h-56 w-full object-contain" />
          <div className="flex items-center justify-end gap-2 border-t bg-background p-2">
            <Button type="button" variant="outline" size="sm" disabled={procesando} onClick={() => input.current?.click()}>
              {procesando ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              Cambiar imagen
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={procesando}
              onClick={onQuitar}
            >
              <Trash2 size={14} /> Quitar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={procesando}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault()
            setArrastrando(false)
            const archivo = e.dataTransfer.files?.[0]
            if (archivo) onArchivo(archivo)
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            arrastrando ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:border-primary/60 hover:bg-primary/5",
          )}
        >
          {procesando ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
          <span className="text-sm font-semibold">Importar imagen</span>
          <span className="text-xs">Arrastra aquí tu pieza gráfica o haz clic · JPG, PNG, WEBP o GIF</span>
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        La imagen va arriba del correo (con enlace a la agenda). Debajo van tu texto, el botón
        &quot;Agenda tu cita&quot; y el banner del certificado de donación.
      </p>
    </div>
  )
}

interface PlantillaFormProps {
  plantilla?: Plantilla | null
  /** Diseño preseleccionado al crear (p. ej. IMAGEN desde "Importar imagen"). */
  disenoInicial?: DisenoCorreo
  onSuccess?: () => void
  onCancel?: () => void
}

export function PlantillaForm({
  plantilla,
  disenoInicial,
  onSuccess,
  onCancel,
}: PlantillaFormProps) {
  const router = useRouter()
  const crear = useCrearPlantilla()
  const actualizar = useActualizarPlantilla()
  const esEdicion = Boolean(plantilla)
  const pendiente = crear.isPending || actualizar.isPending

  const form = useForm<PlantillaFormValues>({
    resolver: zodResolver(plantillaFormSchema),
    defaultValues: valoresIniciales(plantilla, disenoInicial),
  })

  const [imagenNueva, setImagenNueva] = useState<string | null>(null)
  const [quitarGuardada, setQuitarGuardada] = useState(false)
  const [procesandoImagen, setProcesandoImagen] = useState(false)
  const imagenGuardada = plantilla && !quitarGuardada ? urlImagenPlantilla(plantilla) : null
  const imagenMostrada = imagenNueva ?? imagenGuardada

  const [diseno, asunto, cuerpo] = useWatch({
    control: form.control,
    name: ["diseno", "asunto", "cuerpo"],
  })
  const vista = useVistaPreviaCorreo({
    diseno,
    asunto,
    cuerpo,
    tipo: tipoPreviaDeDiseno(diseno),
    // La imagen guardada la toma el backend de la plantilla; la nueva va en el body.
    plantillaId: plantilla && imagenGuardada && !imagenNueva ? plantilla.id : undefined,
    imagenBase64: diseno === "IMAGEN" ? (imagenNueva ?? undefined) : undefined,
  })

  async function elegirArchivo(archivo: File) {
    setProcesandoImagen(true)
    try {
      setImagenNueva(await prepararImagenCorreo(archivo))
      form.clearErrors("diseno")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar la imagen.")
    } finally {
      setProcesandoImagen(false)
    }
  }

  function quitarImagen() {
    setImagenNueva(null)
    setQuitarGuardada(true)
  }

  function handleSubmit(values: PlantillaFormValues) {
    if (values.diseno === "IMAGEN" && !imagenMostrada) {
      form.setError("diseno", { message: "Importa una imagen para el diseño \"Imagen propia\"." })
      return
    }
    const teniaImagen = Boolean(plantilla?.tieneImagen)
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion.trim() || undefined,
      asunto: values.asunto,
      cuerpo: values.cuerpo,
      diseno: values.diseno,
      imagenBase64: values.diseno === "IMAGEN" && imagenNueva ? imagenNueva : undefined,
      // Se borra la imagen si se quitó o si la plantilla dejó de ser de imagen propia.
      quitarImagen:
        teniaImagen && !imagenNueva && (quitarGuardada || values.diseno !== "IMAGEN") ? true : undefined,
    }

    if (esEdicion && plantilla) {
      actualizar.mutate(
        { id: plantilla.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Plantilla actualizada correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar la plantilla.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Plantilla creada correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear la plantilla.",
        )
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        noValidate
      >
        <div className="min-w-0 space-y-4">
        <FormField
          control={form.control}
          name="diseno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diseño del correo</FormLabel>
              <div className="grid grid-cols-2 gap-3" role="radiogroup">
                {DISENOS_CORREO.map((d) => {
                  const activo = field.value === d
                  return (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => field.onChange(d)}
                      className={cn(
                        "relative flex flex-col overflow-hidden rounded-xl border text-left transition-all",
                        activo
                          ? "border-primary ring-2 ring-primary/40"
                          : "hover:border-primary/50",
                      )}
                    >
                      <div className="h-20 overflow-hidden border-b bg-muted">
                        <MiniaturaDiseno diseno={d} imagenUrl={d === "IMAGEN" ? imagenMostrada : undefined} />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold">{DISENO_CORREO_INFO[d].label}</p>
                        <p className="line-clamp-2 text-[11px] text-muted-foreground">
                          {DISENO_CORREO_INFO[d].descripcion}
                        </p>
                      </div>
                      {activo && (
                        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {diseno === "IMAGEN" && (
          <SubirImagen
            imagen={imagenMostrada}
            procesando={procesandoImagen}
            onArchivo={elegirArchivo}
            onQuitar={quitarImagen}
          />
        )}

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Moda Verano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Campaña de verano" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="asunto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asunto</FormLabel>
              <FormControl>
                <Input placeholder="Propuesta de colaboración" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cuerpo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea
                  rows={8}
                  placeholder="Hola {nombre}..."
                  className="max-h-80 min-h-40 [field-sizing:fixed]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Variables: {"{nombre}"}, {"{empresa}"}, {"{{nombre_voluntario}}"} y{" "}
                {"{{link_agendamiento}}"}. El botón de agendar lo añade el diseño.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium">Vista previa</p>
          <VistaPreviaCorreo
            html={vista.data?.html}
            asunto={vista.data?.asunto ?? asunto}
            isLoading={vista.isFetching}
            error={vista.error}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={pendiente}
            onClick={onCancel ?? (() => router.back())}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pendiente || procesandoImagen}>
            {pendiente && <Loader2 className="animate-spin" size={16} />}
            {esEdicion ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
