'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type {
  ActualizarEmpresaInput,
  Empresa,
  CrearEmpresaInput,
} from '@/types/empresa'
import { UbigeoSelector } from '@/features/ubigeo/components/UbigeoSelector'
import {
  useActualizarEmpresa,
  useCrearEmpresa,
} from '../hooks/useEmpresas'
import {
  empresaFormSchema,
  type EmpresaFormValues,
} from '../schemas/empresas.schema'

const soloDigitos = (valor?: string) => (valor ?? '').replace(/\D/g, '')
const limpiar = (valor?: string) => {
  const texto = valor?.trim()
  return texto ? texto : undefined
}

function valoresIniciales(empresa?: Empresa | null): EmpresaFormValues {
  return {
    nombre: empresa?.nombre ?? '',
    ruc: empresa?.ruc ?? '',
    ciiu: empresa?.ciiu ?? '',
    tipoEmpresaCiiu: empresa?.tipoEmpresaCiiu ?? '',
    sector: empresa?.sector ?? '',
    ranking: empresa?.ranking != null ? String(empresa.ranking) : '',
    descripcion: empresa?.descripcion ?? '',
    direccion: empresa?.direccion ?? '',
    sitioWeb: empresa?.sitioWeb ?? '',
    telefono1: empresa?.telefono1 ?? '',
    telefono2: empresa?.telefono2 ?? '',
    telefono3: empresa?.telefono3 ?? '',
    fax1: empresa?.fax1 ?? '',
    emailCorporativo: empresa?.emailCorporativo ?? '',
    ubigeo: empresa?.ubigeo ?? '',
    departamento: empresa?.departamento ?? '',
    provincia: empresa?.provincia ?? '',
    distrito: empresa?.distrito ?? '',
    contactoNombres: '',
    contactoApellidos: '',
    contactoCargo: '',
    contactoArea: '',
    contactoEmail: '',
    contactoTelefono: '',
    contactoWhatsapp: '',
  }
}

interface EmpresaFormProps {
  empresa?: Empresa | null
  onSuccess?: (empresa: Empresa) => void
  onCancel?: () => void
  /** Permite registrar un contacto principal al crear la empresa. */
  permitirContactoPrincipal?: boolean
}

export function EmpresaForm({
  empresa,
  onSuccess,
  onCancel,
  permitirContactoPrincipal = true,
}: EmpresaFormProps) {
  const crear = useCrearEmpresa()
  const actualizar = useActualizarEmpresa()
  const esEdicion = Boolean(empresa)
  const pendiente = crear.isPending || actualizar.isPending

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: valoresIniciales(empresa),
  })

  const ubigeoValores = form.watch([
    'ubigeo',
    'departamento',
    'provincia',
    'distrito',
  ])

  const contactoValores = form.watch([
    'contactoNombres',
    'contactoApellidos',
    'contactoCargo',
    'contactoArea',
    'contactoEmail',
    'contactoTelefono',
    'contactoWhatsapp',
  ])

  const hayContacto = contactoValores.some((valor) =>
    Boolean(valor?.trim()),
  )

  function handleSubmit(values: EmpresaFormValues) {
    const contacto = hayContacto
      ? {
          nombres: values.contactoNombres?.trim() ?? '',
          apellidos: limpiar(values.contactoApellidos),
          cargo: limpiar(values.contactoCargo),
          area: limpiar(values.contactoArea),
          email: limpiar(values.contactoEmail),
          telefono: limpiar(values.contactoTelefono),
          whatsapp: limpiar(values.contactoWhatsapp),
          principal: true,
        }
      : undefined

    const payload: CrearEmpresaInput = {
      nombre: values.nombre.trim(),
      ruc: soloDigitos(values.ruc) || undefined,
      ciiu: soloDigitos(values.ciiu) || undefined,
      tipoEmpresaCiiu: limpiar(values.tipoEmpresaCiiu),
      sector: limpiar(values.sector),
      ranking: values.ranking?.trim()
        ? Number(values.ranking.trim())
        : undefined,
      descripcion: limpiar(values.descripcion),
      direccion: limpiar(values.direccion),
      sitioWeb: limpiar(values.sitioWeb),
      telefono1: limpiar(values.telefono1),
      telefono2: limpiar(values.telefono2),
      telefono3: limpiar(values.telefono3),
      fax1: limpiar(values.fax1),
      emailCorporativo: limpiar(values.emailCorporativo),
      ubigeo: limpiar(values.ubigeo),
      departamento: limpiar(values.departamento),
      provincia: limpiar(values.provincia),
      distrito: limpiar(values.distrito),
      contactos: contacto ? [contacto] : undefined,
    }

    if (esEdicion && empresa) {
      // El DTO de actualización no acepta `contactos`.
      const datosActualizacion = {
        ...payload,
      } as ActualizarEmpresaInput & { contactos?: unknown }
      delete datosActualizacion.contactos
      actualizar.mutate(
        { id: empresa.id, input: datosActualizacion },
        {
          onSuccess: (data) => {
            toast.success('Empresa actualizada correctamente.')
            onSuccess?.(data)
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : 'No se pudo actualizar la empresa.',
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Empresa registrada correctamente.')
        onSuccess?.(data)
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'No se pudo registrar la empresa.',
        )
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-h-[72vh] space-y-5 overflow-y-auto pr-1"
        noValidate
      >
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Datos de la empresa
            </h3>
            <p className="text-xs text-muted-foreground">
              La razon social es obligatoria. El RUC y el CIIU ayudan a
              identificar la empresa en la base corporativa.
            </p>
          </div>

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Razon social <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="REFINERIA LA PAMPILLA S.A.A"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="20100147514"
                      {...field}
                      onChange={(e) =>
                        field.onChange(soloDigitos(e.target.value).slice(0, 11))
                      }
                    />
                  </FormControl>
                  <FormDescription>11 digitos, sin guiones.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ciiu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CIIU</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="1320"
                      {...field}
                      onChange={(e) =>
                        field.onChange(soloDigitos(e.target.value).slice(0, 6))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Codigo de actividad economica.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tipoEmpresaCiiu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de empresa (CIIU)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Extraccion de minerales metaliferos"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <FormControl>
                    <Input placeholder="Mineria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="emailCorporativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo corporativo</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contacto@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sitioWeb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Actividad principal o descripcion de la empresa"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ranking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ranking corporativo</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="2"
                      {...field}
                      onChange={(e) =>
                        field.onChange(soloDigitos(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Caminos del Inca 171"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ['telefono1', 'Telefono 1'],
                ['telefono2', 'Telefono 2'],
                ['telefono3', 'Telefono 3'],
                ['fax1', 'Fax'],
              ] as const
            ).map(([name, etiqueta]) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{etiqueta}</FormLabel>
                    <FormControl>
                      <Input placeholder="(1)5120440" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-muted/10 p-3.5">
          <UbigeoSelector
            value={{
              ubigeo: ubigeoValores[0] ?? '',
              departamento: ubigeoValores[1] ?? '',
              provincia: ubigeoValores[2] ?? '',
              distrito: ubigeoValores[3] ?? '',
            }}
            onChange={(patch) => {
              if (patch.ubigeo !== undefined) {
                form.setValue('ubigeo', patch.ubigeo, { shouldDirty: true })
              }
              if (patch.departamento !== undefined) {
                form.setValue('departamento', patch.departamento, {
                  shouldDirty: true,
                })
              }
              if (patch.provincia !== undefined) {
                form.setValue('provincia', patch.provincia, {
                  shouldDirty: true,
                })
              }
              if (patch.distrito !== undefined) {
                form.setValue('distrito', patch.distrito, {
                  shouldDirty: true,
                })
              }
            }}
            disabled={pendiente}
          />
        </section>

        {permitirContactoPrincipal && !esEdicion && (
          <section className="space-y-3 rounded-lg border border-border/60 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Contacto principal{' '}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Si lo registras ahora, podras usarlo de inmediato como
                embajador de la empresa.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactoNombres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                      <Input placeholder="Luis Fernando" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactoApellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Vargas Bermudez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactoCargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Gerente de Relaciones Publicas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactoArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input placeholder="Responsabilidad Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactoEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo del contacto</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contacto@empresa.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactoTelefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono del contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="(1)2156225" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactoWhatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp del contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="+51 999 999 999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={pendiente}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pendiente}>
            {pendiente && <Loader2 className="animate-spin" size={16} />}
            {esEdicion ? 'Guardar cambios' : 'Registrar empresa'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
