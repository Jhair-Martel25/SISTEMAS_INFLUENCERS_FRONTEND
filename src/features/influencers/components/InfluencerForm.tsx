"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Building2, ExternalLink, Loader2, UserRound, Users } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { cn } from "@/lib/utils"

import { ESTADO_VALIDACION } from "@/types/api"
import type { Influencer } from "@/types/influencer"
import type {
  ActualizarInfluencerInput,
  CrearInfluencerInput,
} from "@/types/influencer"
import {
  TIPO_EMBAJADOR,
  TIPOS_EMBAJADOR,
  type ContactoEmpresa,
  type Empresa,
  type EmpresaBusqueda,
  type TipoEmbajador,
} from "@/types/empresa"
import { etiquetaEstado } from "@/lib/utils/format"
import { EmpresaSearch } from "@/features/empresas/components/EmpresaSearch"
import { EmpresaForm } from "@/features/empresas/components/EmpresaForm"
import { ContactosEmpresa } from "@/features/empresas/components/ContactosEmpresa"
import { useEmpresa } from "@/features/empresas/hooks/useEmpresas"
import {
  useCrearInfluencer,
  useEditarInfluencer,
  useTiposEmbajador,
} from "../hooks/useInfluencers"
import {
  influencerFormSchema,
  type InfluencerFormValues,
} from "../schemas/influencer-form.schema"
import { UbigeoAutocomplete } from "./UbigeoAutocomplete"

const BIOGRAFIA_MAX = 500
const MENSAJE_MAX = 1000
const SIN_CONTACTO = "sin-contacto"

function valoresIniciales(
  influencer?: Influencer | null,
  tipoInicial?: TipoEmbajador,
  empresaInicialId?: string,
): InfluencerFormValues {
  return {
    tipoEmbajador:
      influencer?.tipoEmbajador ??
      tipoInicial ??
      TIPO_EMBAJADOR.INFLUENCER,
    empresaId: influencer?.empresaId ?? empresaInicialId ?? "",
    contactoEmpresaId: "",
    nombre: influencer?.nombre ?? "",
    usuarioIg: influencer?.usuarioIg ?? "",
    linkIg: influencer?.linkIg ?? "",
    empresa: influencer?.empresa ?? "",
    ruc: influencer?.ruc ?? "",
    ciiu: influencer?.ciiu ?? "",
    sector: influencer?.sector ?? "",
    descripcion: influencer?.descripcion ?? "",
    direccion: influencer?.direccion ?? "",
    sitioWeb: influencer?.sitioWeb ?? "",
    ubigeo: influencer?.ubigeo ?? "",
    departamento: influencer?.departamento ?? "",
    provincia: influencer?.provincia ?? "",
    distrito: influencer?.distrito ?? "",
    cargo: influencer?.cargo ?? "",
    area: influencer?.area ?? "",
    email: influencer?.email ?? "",
    phone: influencer?.phone ?? "",
    seguidores: influencer?.seguidores ?? "",
    cantidad_post: influencer?.cantidad_post ?? "",
    biografia: influencer?.biografia ?? "",
    mensajePersonalizado: influencer?.mensajePersonalizado ?? "",
    estadoValidacion: influencer?.estadoValidacion ?? ESTADO_VALIDACION.PENDIENTE,
  }
}

const limpiaOpcional = (valor?: string) => (valor?.trim() ? valor.trim() : undefined)

function aBusqueda(empresa: Empresa): EmpresaBusqueda {
  return {
    id: empresa.id,
    nombre: empresa.nombre,
    ruc: empresa.ruc ?? null,
    ciiu: empresa.ciiu ?? null,
    tipoEmpresaCiiu: empresa.tipoEmpresaCiiu ?? null,
    sector: empresa.sector ?? null,
    departamento: empresa.departamento ?? null,
    provincia: empresa.provincia ?? null,
    distrito: empresa.distrito ?? null,
    totalContactos: empresa.contactos.length,
  }
}

/** Quita del payload los campos que solo acepta el alta (POST /influencers). */
function comoActualizacion(
  payload: CrearInfluencerInput,
): ActualizarInfluencerInput {
  const copia = { ...payload } as ActualizarInfluencerInput & {
    tipoEmbajador?: unknown
    empresaId?: unknown
    contactoEmpresaId?: unknown
  }
  delete copia.tipoEmbajador
  delete copia.empresaId
  delete copia.contactoEmpresaId
  return copia
}

interface InfluencerFormProps {
  influencer?: Influencer | null
  /** Prellena el formulario como embajador de esta empresa. */
  empresaInicialId?: string
  /** Tipo preseleccionado (por ejemplo desde /influencers/nuevo?tipo=EMPRESA). */
  tipoInicial?: TipoEmbajador
  onSuccess?: () => void
  onCancel?: () => void
}

export function InfluencerForm({
  influencer,
  empresaInicialId,
  tipoInicial,
  onSuccess,
  onCancel,
}: InfluencerFormProps) {
  const router = useRouter()
  const crear = useCrearInfluencer()
  const editar = useEditarInfluencer()
  const esEdicion = Boolean(influencer)
  const pendiente = crear.isPending || editar.isPending

  const [empresaIdSeleccionada, setEmpresaIdSeleccionada] = useState(
    influencer?.empresaId ?? empresaInicialId ?? "",
  )
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<EmpresaBusqueda | null>(null)
  const [contactoSeleccionado, setContactoSeleccionado] =
    useState<ContactoEmpresa | null>(null)
  const [registrandoEmpresa, setRegistrandoEmpresa] = useState(false)
  const [gestionandoContactos, setGestionandoContactos] = useState(false)
  const prefillAplicado = useRef("")

  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerFormSchema),
    defaultValues: valoresIniciales(
      influencer,
      tipoInicial,
      empresaInicialId,
    ),
  })

  const tipoEmbajador = form.watch("tipoEmbajador")
  const esEmpresa = tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
  const empresaBloqueada =
    esEdicion && influencer?.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA

  const { data: empresaDetalle } = useEmpresa(empresaIdSeleccionada)
  const { data: tiposRemotos } = useTiposEmbajador()
  const tipos = tiposRemotos?.length ? tiposRemotos : TIPOS_EMBAJADOR

  const contactos = empresaDetalle?.contactos ?? []

  const biografiaValor = form.watch("biografia") ?? ""
  const mensajeValor = form.watch("mensajePersonalizado") ?? ""

  function seleccionarContacto(contacto: ContactoEmpresa | null) {
    setContactoSeleccionado(contacto)
    form.setValue("contactoEmpresaId", contacto?.id ?? "")

    if (!contacto) return

    form.setValue("nombre", contacto.nombreCompleto)
    form.setValue("cargo", contacto.cargo ?? "")
    form.setValue("area", contacto.area ?? "")
    if (contacto.email) form.setValue("email", contacto.email)
    if (contacto.telefono) form.setValue("phone", contacto.telefono)
  }

  function elegirEmpresa(empresa: EmpresaBusqueda | null) {
    setEmpresaSeleccionada(empresa)
    setEmpresaIdSeleccionada(empresa?.id ?? "")
    setContactoSeleccionado(null)
    prefillAplicado.current = ""
    form.setValue("empresaId", empresa?.id ?? "")
    form.setValue("contactoEmpresaId", "")

    if (!empresa) {
      form.setValue("empresa", "")
      form.setValue("ruc", "")
      form.setValue("ciiu", "")
      form.setValue("sector", "")
      form.setValue("descripcion", "")
      form.setValue("direccion", "")
      form.setValue("sitioWeb", "")
      form.setValue("ubigeo", "")
      form.setValue("departamento", "")
      form.setValue("provincia", "")
      form.setValue("distrito", "")
    }
  }

  function cambiarTipo(valor: TipoEmbajador) {
    form.setValue("tipoEmbajador", valor)

    if (valor === TIPO_EMBAJADOR.INFLUENCER) {
      elegirEmpresa(null)
      form.setValue("contactoEmpresaId", "")
    }
  }

  // Carga los datos corporativos (prefill) y preselecciona al contacto vinculado.
  useEffect(() => {
    if (!esEmpresa || !empresaDetalle) return

    if (!empresaSeleccionada || empresaSeleccionada.id !== empresaDetalle.id) {
      setEmpresaSeleccionada(aBusqueda(empresaDetalle))
    }

    if (esEdicion && influencer) {
      const vinculado = empresaDetalle.contactos.find(
        (contacto) => contacto.influencerId === influencer.id,
      )
      if (vinculado && contactoSeleccionado?.id !== vinculado.id) {
        setContactoSeleccionado(vinculado)
      }
      return
    }

    if (prefillAplicado.current !== empresaDetalle.id) {
      prefillAplicado.current = empresaDetalle.id
      const { prefill } = empresaDetalle
      form.setValue("empresa", prefill.empresa)
      form.setValue("ruc", prefill.ruc ?? "")
      form.setValue("ciiu", prefill.ciiu ?? "")
      form.setValue("sector", prefill.sector ?? "")
      form.setValue("descripcion", prefill.descripcion ?? "")
      form.setValue("direccion", prefill.direccion ?? "")
      form.setValue("sitioWeb", prefill.sitioWeb ?? "")
      form.setValue("ubigeo", prefill.ubigeo ?? "")
      form.setValue("departamento", prefill.departamento ?? "")
      form.setValue("provincia", prefill.provincia ?? "")
      form.setValue("distrito", prefill.distrito ?? "")
      if (prefill.email) form.setValue("email", prefill.email)
      if (prefill.phone) form.setValue("phone", prefill.phone)
    }

    if (!contactoSeleccionado) {
      const inicial =
        empresaDetalle.contactos.find((contacto) => contacto.principal) ??
        empresaDetalle.contactos[0]
      if (inicial) seleccionarContacto(inicial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaDetalle])

  function handleSubmit(values: InfluencerFormValues) {
    const payload = {
      nombre: values.nombre,
      usuarioIg: limpiaOpcional(values.usuarioIg),
      linkIg: limpiaOpcional(values.linkIg),
      tipoEmbajador: values.tipoEmbajador,
      ...(values.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA
        ? {
            empresaId: limpiaOpcional(values.empresaId),
            contactoEmpresaId: limpiaOpcional(values.contactoEmpresaId),
          }
        : {}),
      empresa: limpiaOpcional(values.empresa),
      ruc: limpiaOpcional(values.ruc),
      ciiu: limpiaOpcional(values.ciiu),
      sector: limpiaOpcional(values.sector),
      descripcion: limpiaOpcional(values.descripcion),
      direccion: limpiaOpcional(values.direccion),
      sitioWeb: limpiaOpcional(values.sitioWeb),
      ubigeo: limpiaOpcional(values.ubigeo),
      departamento: limpiaOpcional(values.departamento),
      provincia: limpiaOpcional(values.provincia),
      distrito: limpiaOpcional(values.distrito),
      cargo: limpiaOpcional(values.cargo),
      area: limpiaOpcional(values.area),
      email: limpiaOpcional(values.email),
      phone: limpiaOpcional(values.phone),
      seguidores: limpiaOpcional(values.seguidores),
      cantidad_post: limpiaOpcional(values.cantidad_post),
      biografia: limpiaOpcional(values.biografia),
      mensajePersonalizado: limpiaOpcional(values.mensajePersonalizado),
      estadoValidacion: values.estadoValidacion,
    }

    if (esEdicion && influencer) {
      // PATCH /:id/editar no acepta los campos de tipo/empresa.
      editar.mutate(
        { id: influencer.id, input: comoActualizacion(payload) },
        {
          onSuccess: () => {
            toast.success("Embajador actualizado correctamente.")
            onSuccess?.()
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el embajador.",
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: () => {
        toast.success("Embajador creado correctamente.")
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo crear el embajador.",
        )
      },
    })
  }

  const errorEmpresa = form.formState.errors.empresaId?.message

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        {!esEdicion && (
          <section className="space-y-2">
            <FormLabel>Tipo de embajador</FormLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {tipos.map((tipo) => {
                const activo = tipoEmbajador === tipo.valor
                const Icono = tipo.valor === TIPO_EMBAJADOR.EMPRESA ? Building2 : UserRound
                return (
                  <button
                    key={tipo.valor}
                    type="button"
                    onClick={() => cambiarTipo(tipo.valor)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      activo
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md",
                        activo
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icono size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {tipo.etiqueta}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {tipo.descripcion}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {esEmpresa ? (
          <section className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Empresa del embajador{" "}
                <span className="text-destructive">*</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {empresaBloqueada
                  ? "El tipo y la empresa no se pueden cambiar al editar un embajador corporativo."
                  : "Busca la empresa en la base corporativa o registrala manualmente."}
              </p>
            </div>

            {empresaBloqueada ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {empresaSeleccionada?.nombre ??
                        influencer?.empresaRegistrada?.nombre ??
                        influencer?.empresa ??
                        "Empresa vinculada"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        influencer?.ruc ? `RUC ${influencer.ruc}` : null,
                        influencer?.sector,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Datos corporativos"}
                    </p>
                  </div>
                </div>
                {influencer?.empresaId && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/empresas/${influencer.empresaId}`}>
                      <ExternalLink size={14} />
                      Ver empresa
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <EmpresaSearch
                seleccionada={empresaSeleccionada}
                onSelect={elegirEmpresa}
                onRegistrarManual={() => setRegistrandoEmpresa(true)}
                disabled={pendiente}
                error={errorEmpresa}
              />
            )}

            {empresaSeleccionada && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Contacto / funcionario
                  </span>
                  {!empresaBloqueada && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setGestionandoContactos(true)}
                    >
                      <Users size={14} />
                      Gestionar contactos
                    </Button>
                  )}
                </div>

                <Select
                  value={contactoSeleccionado?.id ?? SIN_CONTACTO}
                  onValueChange={(valor) => {
                    if (valor === SIN_CONTACTO) {
                      seleccionarContacto(null)
                      return
                    }
                    const contacto = contactos.find((c) => c.id === valor) ?? null
                    seleccionarContacto(contacto)
                  }}
                  disabled={pendiente || empresaBloqueada}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_CONTACTO}>
                      Sin contacto especifico
                    </SelectItem>
                    {contactos.map((contacto) => (
                      <SelectItem key={contacto.id} value={contacto.id}>
                        {contacto.nombreCompleto}
                        {contacto.cargo ? ` — ${contacto.cargo}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {contactoSeleccionado ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">Contacto</Badge>
                    <span>{contactoSeleccionado.nombreCompleto}</span>
                    {contactoSeleccionado.cargo && (
                      <span>· {contactoSeleccionado.cargo}</span>
                    )}
                    {contactoSeleccionado.email && (
                      <span>· {contactoSeleccionado.email}</span>
                    )}
                  </div>
                ) : contactos.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Esta empresa no tiene contactos. Agrega uno para identificar
                    a la persona embajadora.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Si no eliges un contacto, se usara el contacto principal de
                    la empresa.
                  </p>
                )}
              </div>
            )}

            {empresaSeleccionada && (
              <div className="grid gap-3 rounded-lg border border-border/60 bg-card p-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">RUC / CIIU</p>
                  <p className="font-medium text-foreground">
                    {[empresaSeleccionada.ruc, empresaSeleccionada.ciiu]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sector</p>
                  <p className="font-medium text-foreground">
                    {empresaSeleccionada.sector ||
                      empresaSeleccionada.tipoEmpresaCiiu ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ubicacion</p>
                  <p className="font-medium text-foreground">
                    {[
                      empresaSeleccionada.distrito,
                      empresaSeleccionada.provincia,
                      empresaSeleccionada.departamento,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contactos registrados</p>
                  <p className="font-medium text-foreground">
                    {empresaSeleccionada.totalContactos}
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Sin datos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="2138348921" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ciiu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIIU</FormLabel>
                    <FormControl>
                      <Input placeholder="2341" {...field} />
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
                    <FormLabel>Descripcion</FormLabel>
                    <FormControl>
                      <Input placeholder="Exportacion madera" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Jefe Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input placeholder="Resp. Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Ubigeo con autocompletado y campos derivados */}
        <div className="rounded-lg border border-border/60 bg-muted/10 p-3.5">
          <UbigeoAutocomplete form={form} disabled={pendiente} />
        </div>

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {esEmpresa ? "Nombre del embajador" : "Nombre completo"}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
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
                <p className="text-xs text-muted-foreground">
                  Sin el @. Solo letras, numeros, puntos y guiones bajos.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Puedes enviar solo uno: el sistema genera el otro.
                </p>
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
                <FormLabel>Correo electronico</FormLabel>
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
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 999 999" {...field} />
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
              <div className="flex items-baseline justify-between">
                <FormLabel>Biografia</FormLabel>
                <span
                  className={`text-xs ${
                    biografiaValor.length > BIOGRAFIA_MAX
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {biografiaValor.length}/{BIOGRAFIA_MAX}
                </span>
              </div>
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
              <div className="flex items-baseline justify-between">
                <FormLabel>Mensaje personalizado</FormLabel>
                <span
                  className={`text-xs ${
                    mensajeValor.length > MENSAJE_MAX
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {mensajeValor.length}/{MENSAJE_MAX}
                </span>
              </div>
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
              <FormLabel>Estado de validacion</FormLabel>
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

      <Dialog open={registrandoEmpresa} onOpenChange={setRegistrandoEmpresa}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar empresa</DialogTitle>
            <DialogDescription>
              Agrega una empresa nueva y usala para este embajador.
            </DialogDescription>
          </DialogHeader>
          <EmpresaForm
            onSuccess={(empresa) => {
              setRegistrandoEmpresa(false)
              elegirEmpresa(aBusqueda(empresa))
            }}
            onCancel={() => setRegistrandoEmpresa(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={gestionandoContactos}
        onOpenChange={setGestionandoContactos}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contactos de la empresa</DialogTitle>
            <DialogDescription>
              Agrega o actualiza los funcionarios que pueden ser embajadores.
            </DialogDescription>
          </DialogHeader>
          {empresaSeleccionada && (
            <ContactosEmpresa
              empresaId={empresaSeleccionada.id}
              mostrarEncabezado={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </Form>
  )
}
