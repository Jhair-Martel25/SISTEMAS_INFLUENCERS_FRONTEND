"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
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

import type { Plantilla } from "@/types/plantilla"
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

  function handleSubmit(values: PlantillaFormValues) {
    const payload = {
      nombre: values.nombre,
      descripcion: values.descripcion.trim() || undefined,
      asunto: values.asunto,
      cuerpo: values.cuerpo,
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
        className="space-y-4"
        noValidate
      >
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
                  rows={6}
                  placeholder="Hola {{nombre_influencer}}..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Puedes usar los placeholders: {"{{nombre_influencer}}, "}
                {"{{nombre_voluntario}}"} y {"{{link_agendamiento}}"}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
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
