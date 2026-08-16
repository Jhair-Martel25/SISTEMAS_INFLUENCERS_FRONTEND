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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Usuario } from "@/types/usuario"
import {
  useActualizarUsuario,
  useCrearUsuario,
} from "../hooks/useUsuarios"
import {
  usuarioFormSchema,
  type UsuarioFormValues,
} from "../schemas/usuario-form.schema"

const ROLES: { valor: string; etiqueta: string }[] = [
  { valor: "1", etiqueta: "Administrador" },
  { valor: "2", etiqueta: "Voluntario" },
]

function valoresIniciales(usuario?: Usuario | null): UsuarioFormValues {
  return {
    nombre: usuario?.nombre ?? "",
    email: usuario?.email ?? "",
    roleId: usuario ? String(usuario.roleId) : "2",
  }
}

interface UsuarioFormProps {
  usuario?: Usuario | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function UsuarioForm({
  usuario,
  onSuccess,
  onCancel,
}: UsuarioFormProps) {
  const router = useRouter()
  const crear = useCrearUsuario()
  const actualizar = useActualizarUsuario()
  const esEdicion = Boolean(usuario)
  const pendiente = crear.isPending || actualizar.isPending

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: valoresIniciales(usuario),
  })

  function handleSubmit(values: UsuarioFormValues) {
    const payload = {
      nombre: values.nombre,
      email: values.email,
      roleId: Number(values.roleId),
    }

    if (esEdicion && usuario) {
      actualizar.mutate(
        { id: usuario.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Usuario actualizado correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el usuario.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Usuario creado correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el usuario.",
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
                <Input placeholder="Carlos Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="usuario@sembrandoperu.org"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Solo se permiten correos @sembrandoperu.org.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROLES.map((rol) => (
                    <SelectItem key={rol.valor} value={rol.valor}>
                      {rol.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!esEdicion && (
          <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            Se asignará una contraseña temporal al nuevo usuario.
          </p>
        )}

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
