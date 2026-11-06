"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { Check, Loader2 } from "lucide-react"
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

function valoresIniciales(plantilla?: Plantilla | null): PlantillaFormValues {
  return {
    nombre: plantilla?.nombre ?? "",
    descripcion: plantilla?.descripcion ?? "",
    asunto: plantilla?.asunto ?? "",
    cuerpo: plantilla?.cuerpo ?? "",
    diseno: normalizarDiseno(plantilla?.diseno),
  }
}

interface PlantillaFormProps {
  plantilla?: Plantilla | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function PlantillaForm({
  plantilla,
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
    defaultValues: valoresIniciales(plantilla),
  })

  const [diseno, asunto, cuerpo] = useWatch({
    control: form.control,
    name: ["diseno", "asunto", "cuerpo"],
  })
  const vista = useVistaPreviaCorreo({
    diseno,
    asunto,
    cuerpo,
    tipo: diseno === "REFORESTA" ? "EMPRESA" : "INFLUENCER",
  })

  function handleSubmit(values: PlantillaFormValues) {
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion.trim() || undefined,
      asunto: values.asunto,
      cuerpo: values.cuerpo,
      diseno: values.diseno,
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
                        <MiniaturaDiseno diseno={d} />
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
          <Button type="submit" disabled={pendiente}>
            {pendiente && <Loader2 className="animate-spin" size={16} />}
            {esEdicion ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
