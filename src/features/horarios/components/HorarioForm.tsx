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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { DiaSemana } from "@/types/api"
import type { Horario } from "@/types/horario"
import { DIAS_SEMANA } from "@/types/horario"
import { etiquetaEstado } from "@/lib/utils/format"
import {
  useActualizarHorario,
  useCrearHorario,
} from "../hooks/useHorarios"
import {
  horarioFormSchema,
  type HorarioFormValues,
} from "../schemas/horario-form.schema"

function valoresIniciales(horario?: Horario | null): HorarioFormValues {
  return {
    diaSemana: horario?.diaSemana ?? "LUNES",
    horaInicio: horario?.horaInicio ?? "",
    horaFin: horario?.horaFin ?? "",
  }
}

interface HorarioFormProps {
  horario?: Horario | null
  /** Días que ya tienen un horario configurado (se deshabilitan al crear). */
  diasOcupados?: Set<DiaSemana>
  onSuccess?: () => void
  onCancel?: () => void
}

export function HorarioForm({
  horario,
  diasOcupados = new Set(),
  onSuccess,
  onCancel,
}: HorarioFormProps) {
  const router = useRouter()
  const crear = useCrearHorario()
  const actualizar = useActualizarHorario()
  const esEdicion = Boolean(horario)
  const pendiente = crear.isPending || actualizar.isPending

  const form = useForm<HorarioFormValues>({
    resolver: zodResolver(horarioFormSchema),
    defaultValues: valoresIniciales(horario),
  })

  function handleSubmit(values: HorarioFormValues) {
    const payload = {
      diaSemana: values.diaSemana,
      horaInicio: values.horaInicio,
      horaFin: values.horaFin,
    }

    if (esEdicion && horario) {
      actualizar.mutate(
        { id: horario.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Horario actualizado correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el horario.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Horario creado correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el horario.",
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
          name="diaSemana"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Día de la semana</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DIAS_SEMANA.map((dia) => {
                    const ocupado = !esEdicion && diasOcupados.has(dia.value)
                    return (
                      <SelectItem
                        key={dia.value}
                        value={dia.value}
                        disabled={ocupado}
                      >
                        {etiquetaEstado(dia.value, "dia")}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {!esEdicion && diasOcupados.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  Los días ya configurados aparecen deshabilitados (solo se
                  permite un horario por día).
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de inicio</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="08:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de fin</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="13:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
