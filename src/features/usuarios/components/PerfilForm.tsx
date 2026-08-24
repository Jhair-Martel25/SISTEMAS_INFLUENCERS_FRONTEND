"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Camera, Eye, EyeOff, Loader2, ZoomIn } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

import type { ActualizarPerfilInput } from "@/types/usuario"
import { usePerfil, useActualizarPerfil } from "../hooks/useUsuarios"
import {
  perfilFormSchema,
  type PerfilFormValues,
} from "../schemas/perfil-form.schema"

const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024 // 2MB

function iniciales(nombre?: string): string {
  if (!nombre) return "?"
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("")
}

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

export function PerfilForm() {
  const { data: perfil, isLoading } = usePerfil()
  const actualizar = useActualizarPerfil()
  const inputFotoRef = useRef<HTMLInputElement>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues: {
      email: "",
      passwordActual: "",
      passwordNueva: "",
      confirmarPassword: "",
      foto: undefined,
    },
  })

  // Precarga el formulario cuando llega el perfil desde el backend.
  useEffect(() => {
    if (!perfil) return
    form.reset({
      email: perfil.email,
      passwordActual: "",
      passwordNueva: "",
      confirmarPassword: "",
      foto: undefined,
    })
    setPreviewFoto(perfil.foto ?? null)
  }, [perfil, form])

  function handleSeleccionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0]
    event.target.value = ""
    if (!archivo) return

    if (!archivo.type.startsWith("image/")) {
      toast.error("Selecciona un archivo de imagen válido.")
      return
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
      toast.error("La imagen no debe superar los 2 MB.")
      return
    }

    const lector = new FileReader()
    lector.onload = () => {
      const resultado = lector.result as string
      setPreviewFoto(resultado)
      form.setValue("foto", resultado, { shouldDirty: true })
    }
    lector.readAsDataURL(archivo)
  }

  function handleSubmit(values: PerfilFormValues) {
    const payload: ActualizarPerfilInput = {}

    if (perfil && values.email !== perfil.email) {
      payload.email = values.email
    }
    if (values.passwordNueva) {
      payload.passwordActual = values.passwordActual
      payload.passwordNueva = values.passwordNueva
    }
    if (values.foto) {
      payload.foto = values.foto
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios que guardar.")
      return
    }

    actualizar.mutate(payload, {
      onSuccess: () => {
        toast.success("Perfil actualizado correctamente.")
        form.setValue("passwordActual", "")
        form.setValue("passwordNueva", "")
        form.setValue("confirmarPassword", "")
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
        description="Actualiza tu correo electrónico, tu contraseña y tu foto de perfil."
        backHref="/dashboard"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Datos de la cuenta</CardTitle>
            <CardDescription>
              Estos datos son visibles solo para ti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={previewFoto ?? undefined}
                      alt="Foto de perfil"
                    />
                    <AvatarFallback>{iniciales(perfil?.nombre)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputFotoRef.current?.click()}
                      >
                        <Camera size={14} />
                        Cambiar foto
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <ZoomIn size={14} />
                            Ver foto actual
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Foto de perfil</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center py-2">
                            {previewFoto ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={previewFoto}
                                alt="Foto de perfil"
                                className="max-h-[60vh] w-auto rounded-lg object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-3 py-8">
                                <Avatar className="size-24">
                                  <AvatarFallback className="text-lg">
                                    {iniciales(perfil?.nombre)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-muted-foreground">
                                  Todavía no has subido una foto de perfil.
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opcional. JPG o PNG, máximo 2 MB.
                    </p>
                    <input
                      ref={inputFotoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSeleccionarFoto}
                    />
                  </div>
                </div>

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
                    name="confirmarPassword"
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