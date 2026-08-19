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

import { aFormatoAPI, zonaHorariaNavegador } from "@/lib/utils/date"
import { useCrearDisponibilidad } from "../hooks/useDisponibilidades"
import {
  disponibilidadFormSchema,
  type DisponibilidadFormValues,
} from "../schemas/disponibilidad-form.schema"

interface DisponibilidadFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function DisponibilidadForm({
  onSuccess,
  onCancel,
}: DisponibilidadFormProps) {
  const router = useRouter()
  const crear = useCrearDisponibilidad()

  const form = useForm<DisponibilidadFormValues>({
    resolver: zodResolver(disponibilidadFormSchema),
    defaultValues: { fechaHora: "" },
  })

  function handleSubmit(values: DisponibilidadFormValues) {
    const fecha = new Date(values.fechaHora)
    if (Number.isNaN(fecha.getTime())) {
      toast.error("Ingresa una fecha y hora válidas.")
      return
    }

    crear.mutate(
      {
        fechaHora: aFormatoAPI(fecha),
        zonaHoraria: zonaHorariaNavegador(),
      },
      {
        onSuccess: () => {
          toast.success("Bloque de disponibilidad creado correctamente.")
          onSuccess?.()
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudo crear el bloque.",
          )
        },
      },
    )
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
          name="fechaHora"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y hora del bloque</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Hora local del voluntario. El sistema la convierte a UTC al
                guardarla.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={crear.isPending}
            onClick={onCancel ?? (() => router.back())}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={crear.isPending}>
            {crear.isPending && <Loader2 className="animate-spin" size={16} />}
            Crear bloque
          </Button>
        </div>
      </form>
    </Form>
  )
}
