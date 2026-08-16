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
import { Textarea } from "@/components/ui/textarea"

import { ESTADO_VALIDACION } from "@/types/api"
import type { Influencer } from "@/types/influencer"
import { etiquetaEstado } from "@/lib/utils/format"
import {
  useCrearInfluencer,
  useEditarInfluencer,
} from "../hooks/useInfluencers"
import {
  influencerFormSchema,
  type InfluencerFormValues,
} from "../schemas/influencer-form.schema"

function valoresIniciales(influencer?: Influencer | null): InfluencerFormValues {
  return {
    nombre: influencer?.nombre ?? "",
    usuarioIg: influencer?.usuarioIg ?? "",
    linkIg: influencer?.linkIg ?? "",
    email: influencer?.email ?? "",
    phone: influencer?.phone ?? "",
    seguidores: influencer?.seguidores ?? "",
    cantidad_post: influencer?.cantidad_post ?? "",
    biografia: influencer?.biografia ?? "",
    mensajePersonalizado: influencer?.mensajePersonalizado ?? "",
    estadoValidacion: influencer?.estadoValidacion ?? ESTADO_VALIDACION.PENDIENTE,
  }
}

const limpiaOpcional = (valor: string) => (valor.trim() ? valor.trim() : undefined)

interface InfluencerFormProps {
  influencer?: Influencer | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function InfluencerForm({
  influencer,
  onSuccess,
  onCancel,
}: InfluencerFormProps) {
  const router = useRouter()
  const crear = useCrearInfluencer()
  const editar = useEditarInfluencer()
  const esEdicion = Boolean(influencer)
  const pendiente = crear.isPending || editar.isPending

  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerFormSchema),
    defaultValues: valoresIniciales(influencer),
  })

  function handleSubmit(values: InfluencerFormValues) {
    const payload = {
      nombre: values.nombre,
      usuarioIg: values.usuarioIg,
      linkIg: values.linkIg,
      email: limpiaOpcional(values.email),
      phone: limpiaOpcional(values.phone),
      seguidores: limpiaOpcional(values.seguidores),
      cantidad_post: limpiaOpcional(values.cantidad_post),
      biografia: limpiaOpcional(values.biografia),
      mensajePersonalizado: limpiaOpcional(values.mensajePersonalizado),
      estadoValidacion: values.estadoValidacion,
    }

    if (esEdicion && influencer) {
      editar.mutate(
        { id: influencer.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Influencer actualizado correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el influencer.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Influencer creado correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el influencer.",
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
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Andrea Paz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="usuarioIg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario de Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="andreapaz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkIg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link del perfil</FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="+51..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="seguidores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seguidores</FormLabel>
                <FormControl>
                  <Input placeholder="150k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cantidad_post"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publicaciones</FormLabel>
                <FormControl>
                  <Input placeholder="120" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="biografia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografía</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensajePersonalizado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje personalizado</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estadoValidacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de validación</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ESTADO_VALIDACION).map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {etiquetaEstado(estado, "validacion")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
