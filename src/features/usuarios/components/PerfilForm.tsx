"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"

import type { ActualizarPerfilInput } from "@/types/usuario"
import { useActualizarPerfil } from "../hooks/useUsuarios"
import {
  perfilFormSchema,
  type PerfilFormValues,
} from "../schemas/perfil-form.schema"

/**
 * Input de contraseña con botón para mostrar/ocultar (icono de ojo).
 * Estado de visibilidad independiente por instancia.
 */
function PasswordInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

/**
 * Formulario "Mi perfil" (autoservicio): disponible tanto para ADMIN como
 * para VOLUNTARIO — el acceso lo controla `RECURSOS.PERFIL` en
 * `config/roles.ts`, presente en los permisos de ambos roles.
 */
export function PerfilForm() {
  const { user, isLoading: cargandoUsuario, logout } = useAuthStore()
  const actualizar = useActualizarPerfil()

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues: {
      email: "",
      passwordActual: "",
      passwordNueva: "",
      confirmarPasswordNueva: "",
    },
  })

  // Precarga el correo actual cuando la sesión termina de hidratarse.
  useEffect(() => {
    if (!user) return
    form.reset({
      email: user.email,
      passwordActual: "",
      passwordNueva: "",
      confirmarPasswordNueva: "",
    })
  }, [user, form])

  function handleSubmit(values: PerfilFormValues) {
    const payload: ActualizarPerfilInput = {}

    if (user && values.email !== user.email) {
      payload.email = values.email
    }
    if (values.passwordNueva) {
      payload.passwordActual = values.passwordActual
      payload.passwordNueva = values.passwordNueva
      payload.confirmarPasswordNueva = values.confirmarPasswordNueva
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para aplicar.")
      return
    }

    actualizar.mutate(payload, {
      onSuccess: async (respuesta) => {
        if (payload.passwordNueva) {
          toast.success(
            respuesta.mensaje ?? "Contraseña actualizada correctamente.",
          )
          // Al cambiar la contraseña hay que volver a iniciar sesión:
          // se cierra la sesión local (localStorage + cookie sp_token)
          // y se redirige al login.
          await logout()
          window.location.assign("/login")
          return
        }

        toast.success(
          respuesta.mensaje ?? "Correo actualizado correctamente.",
        )
        // Solo cambió el correo: se mantiene la sesión actual (sin redirigir).
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil.",
        )
      },
    })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Mi perfil"
        description="Actualiza tu correo electrónico y tu contraseña."
        backHref="/dashboard"
      />

      {cargandoUsuario ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Datos de la cuenta</CardTitle>
            <CardDescription>
              Estos datos son visibles solo para ti. Si cambias tu
              contraseña, se cerrará tu sesión y deberás volver a iniciar
              sesión.
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

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Cambiar contraseña
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Déjalo en blanco si no quieres cambiar tu contraseña.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="passwordActual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordNueva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña nueva</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmarPasswordNueva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña nueva</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={actualizar.isPending}>
                    {actualizar.isPending && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    Actualizar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}