"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AtSign, Building2, ExternalLink, Loader2, Mail, MessagesSquare, Sparkles, UserRound, Users, type LucideIcon } from "lucide-react"
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

const TONOS_SECCION = {
  mint: {
    panel: "border-mint/25 bg-mint/5",
    icono: "bg-mint/15 text-primary",
  },
  sky: {
    panel: "border-sky-200/70 bg-sky-50/50 dark:border-sky-500/20 dark:bg-sky-500/5",
    icono: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  violet: {
    panel:
      "border-violet-200/70 bg-violet-50/50 dark:border-violet-500/20 dark:bg-violet-500/5",
    icono: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  amber: {
    panel:
      "border-amber-200/70 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5",
    icono: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
} as const

function FormSection({
  titulo,
  descripcion,
  icono: Icono,
  tono = "mint",
  children,
}: {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  tono?: keyof typeof TONOS_SECCION
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border p-4 [&_input]:bg-card [&_textarea]:bg-card [&_[data-slot=select-trigger]]:bg-card",
        TONOS_SECCION[tono].panel,
      )}
    >
      <div className="flex items-start gap-3">
        {Icono && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              TONOS_SECCION[tono].icono,
            )}
          >
            <Icono size={16} />
          </span>
        )}
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
          {descripcion && (
            <p className="text-xs text-muted-foreground">{descripcion}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

function Contador({ valor, maximo }: { valor: number; maximo: number }) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        valor > maximo ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {valor}/{maximo}
    </span>
  )
}

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
    totalContactos: empresa.contactos?.length ?? 0,
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
  /** Empresa preseleccionada (por ejemplo al registrar desde la ficha de empresa). */
  empresaInicialId?: string
  /** Tipo preseleccionado (por ejemplo desde /influencers/nuevo?tipo=EMPRESA). */
  tipoInicial?: TipoEmbajador
  /** Ajusta el scroll y el pie de acciones para mostrarse dentro de un diálogo. */
  enDialogo?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function InfluencerForm({
  influencer,
  empresaInicialId,
  tipoInicial,
  enDialogo = false,
  onSuccess,
  onCancel,
}: InfluencerFormProps) {
  const router = useRouter()
  const crear = useCrearInfluencer()
  const editar = useEditarInfluencer()
  const esEdicion = Boolean(influencer)
  const pendiente = crear.isPending || editar.isPending

  const [registrandoEmpresa, setRegistrandoEmpresa] = useState(false)
  const [gestionandoContactos, setGestionandoContactos] = useState(false)
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<EmpresaBusqueda | null>(null)
  const [contactoSeleccionado, setContactoSeleccionado] =
    useState<ContactoEmpresa | null>(null)
  const [empresaIdSeleccionada, setEmpresaIdSeleccionada] = useState<string>(
    influencer?.empresaId ?? empresaInicialId ?? "",
  )

  const prefillAplicado = useRef<string>("")

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

  const { data: tiposRemotos } = useTiposEmbajador()
  const tipos = tiposRemotos?.length ? tiposRemotos : TIPOS_EMBAJADOR

  const { data: empresaDetalle } = useEmpresa(empresaIdSeleccionada)
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
      form.setValue("cargo", "")
      form.setValue("area", "")
    } else {
      form.setValue("usuarioIg", "")
      form.setValue("linkIg", "")
      form.setValue("seguidores", "")
      form.setValue("cantidad_post", "")
      form.setValue("biografia", "")
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
    const esEmpresaVal = values.tipoEmbajador === TIPO_EMBAJADOR.EMPRESA

    // Para empresa, si no tiene nombre o usuarioIg/linkIg, preparamos datos consistentes
    const nombreFinal = esEmpresaVal
      ? (values.nombre?.trim() || values.empresa?.trim() || "Empresa Embajadora")
      : (values.nombre?.trim() ?? "")

    const handleSugerido = esEmpresaVal && !values.usuarioIg && !values.linkIg
      ? (values.ruc ? `empresa_${values.ruc}` : (values.empresa ? values.empresa.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25) : 'empresa_embajador'))
      : limpiaOpcional(values.usuarioIg)

    const linkIgFinal = limpiaOpcional(values.linkIg) || (esEmpresaVal && handleSugerido ? `https://instagram.com/${handleSugerido}` : undefined)

    const payload: CrearInfluencerInput = {
      nombre: nombreFinal,
      usuarioIg: handleSugerido,
      linkIg: linkIgFinal,
      tipoEmbajador: values.tipoEmbajador,
      ...(esEmpresaVal
        ? {
            empresaId: limpiaOpcional(values.empresaId),
            contactoEmpresaId: limpiaOpcional(values.contactoEmpresaId),
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
          }
        : {
            seguidores: limpiaOpcional(values.seguidores),
            cantidad_post: limpiaOpcional(values.cantidad_post),
            biografia: limpiaOpcional(values.biografia),
          }),
      email: limpiaOpcional(values.email),
      phone: limpiaOpcional(values.phone),
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
        className={cn("flex min-h-0 flex-col", enDialogo && "flex-1")}
        noValidate
      >
        <div
          className={cn(
            "space-y-6",
            enDialogo && "min-h-0 flex-1 overflow-y-auto px-6 py-5",
          )}
        >
        {!esEdicion && (
          <FormSection
            titulo="Tipo de embajador"
            descripcion="Elige si el embajador es un perfil personal o una empresa."
            icono={Sparkles}
            tono="violet"
          >
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
          </FormSection>
        )}

        {/* ========================================================================= */}
        {/* CAMPOS EXCLUSIVOS DE EMPRESA                                              */}
        {/* ========================================================================= */}
        {esEmpresa && (
          <>
            <section className="space-y-4 rounded-2xl border border-mint/25 bg-mint/5 p-4 [&_input]:bg-card [&_[data-slot=select-trigger]]:bg-card">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-mint/15 text-primary">
                  <Building2 size={16} />
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Empresa del embajador
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {empresaBloqueada
                      ? "El tipo y la empresa no se pueden cambiar al editar un embajador corporativo."
                      : "Busca la empresa en la base corporativa o completa los datos en los campos a continuación."}
                  </p>
                </div>
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
                      Esta empresa no tiene contactos. Agrega uno para identificar a la persona embajadora.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Si no eliges un contacto, se usara el contacto principal de la empresa.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Datos corporativos de la empresa (Image 2) */}
            <FormSection
              titulo="Datos corporativos"
              descripcion="Completa la información fiscal y de ubicación de la empresa."
              icono={Building2}
              tono="sky"
            >
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Exportación de madera" {...field} />
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
                      <Input placeholder="Gerente General" {...field} />
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
                    <FormLabel>Área</FormLabel>
                    <FormControl>
                      <Input placeholder="Resp. Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ubigeo con autocompletado y campos derivados */}
            <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
              <UbigeoAutocomplete form={form} disabled={pendiente} />
            </div>
            </FormSection>
          </>
        )}

        {/* ========================================================================= */}
        {/* CAMPOS EXCLUSIVOS DE INFLUENCER                                           */}
        {/* ========================================================================= */}
        {!esEmpresa && (
          <FormSection
            titulo="Perfil público"
            descripcion="Datos de la cuenta de Instagram y métricas del embajador."
            icono={AtSign}
            tono="mint"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre del embajador <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. María Fernanda Ríos" {...field} />
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
                      <Input placeholder="ej. maria.rios" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Sin el @. Solo letras, números, puntos y guiones bajos.
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
                      <Input placeholder="https://instagram.com/maria.rios" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Puedes completar solo uno: el sistema genera el otro.
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Puedes usar 150k o 150000.
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Cantidad aproximada de publicaciones.
                    </p>
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
                    <FormLabel>Biografía</FormLabel>
                    <Contador valor={biografiaValor.length} maximo={BIOGRAFIA_MAX} />
                  </div>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe el contenido, nicho y alcance del embajador."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        )}

        {/* ========================================================================= */}
        {/* CAMPOS COMUNES (Contacto, Mensaje, Validación)                           */}
        {/* ========================================================================= */}
        <FormSection
          titulo="Datos de contacto"
          descripcion="Se usan para enviar correos y coordinar el seguimiento."
          icono={Mail}
          tono="sky"
        >
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
                    <Input placeholder="+51 999 999 999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          titulo="Seguimiento"
          descripcion="Mensaje base y estado de validación dentro del embudo."
          icono={MessagesSquare}
          tono="amber"
        >
          <FormField
            control={form.control}
            name="mensajePersonalizado"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-baseline justify-between">
                  <FormLabel>Mensaje personalizado</FormLabel>
                  <Contador valor={mensajeValor.length} maximo={MENSAJE_MAX} />
                </div>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Hola {nombre}, te escribimos de Sembrando Perú porque..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="sm:max-w-60">
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
          </div>
        </FormSection>

        </div>

        <div
          className={cn(
            "flex justify-end gap-2",
            enDialogo
              ? "shrink-0 border-t border-border bg-gradient-to-r from-mint/5 via-card to-card px-6 py-4"
              : "pt-4",
          )}
        >
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
