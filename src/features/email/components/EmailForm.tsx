"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { usePlantillas } from "@/features/plantillas/hooks/usePlantillas"

import { useEnviarEmail } from "../hooks/useEmail"
import {
  emailFormSchema,
  type EmailFormValues,
} from "../schemas/email-form.schema"
import { InfluencerCards } from "./InfluencerCards"

export function EmailForm() {
  const router = useRouter()
  const enviar = useEnviarEmail()
  const { data: plantillas, isLoading: cargandoPlantillas } = usePlantillas()

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      influencerId: "",
      plantillaId: "",
    },
  })

  function handleSubmit(values: EmailFormValues) {
    enviar.mutate(
      { influencerId: values.influencerId, plantillaId: values.plantillaId },
      {
        onSuccess: (data) => {
          toast.success(`Correo enviado a ${data.email}.`)
          form.reset({ influencerId: "", plantillaId: values.plantillaId })
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudo enviar el correo.",
          )
        },
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Enviar Email"
        description="Envía el correo de contacto a un influencer usando una plantilla. Solo administradores."
        backHref="/dashboard"
      />

      <Card>
        <CardHeader>
          <CardTitle>Nuevo envío</CardTitle>
          <CardDescription>
            El influencer debe estar validado y tener email para recibir el
            correo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              noValidate
            >
              <FormField
                control={form.control}
                name="influencerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Influencer</FormLabel>
                    <InfluencerCards
                      seleccionadoId={field.value}
                      onSeleccionar={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plantillaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              cargandoPlantillas
                                ? "Cargando plantillas..."
                                : "Selecciona una plantilla"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {plantillas?.map((plantilla) => (
                            <SelectItem
                              key={plantilla.id}
                              value={plantilla.id}
                            >
                              {plantilla.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={enviar.isPending}
                  onClick={() => router.push("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviar.isPending}>
                  {enviar.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  Enviar Email
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}