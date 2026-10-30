'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  ContactoEmpresa,
  CrearContactoEmpresaInput,
} from '@/types/empresa'
import {
  useActualizarContactoEmpresa,
  useCrearContactoEmpresa,
} from '../hooks/useEmpresas'
import {
  contactoEmpresaFormSchema,
  type ContactoEmpresaFormValues,
} from '../schemas/empresas.schema'

const limpiar = (valor?: string) => {
  const texto = valor?.trim()
  return texto ? texto : undefined
}

function valoresIniciales(
  contacto?: ContactoEmpresa | null,
): ContactoEmpresaFormValues {
  return {
    nombres: contacto?.nombres ?? '',
    apellidos: contacto?.apellidos ?? '',
    cargo: contacto?.cargo ?? '',
    area: contacto?.area ?? '',
    email: contacto?.email ?? '',
    telefono: contacto?.telefono ?? '',
    whatsapp: contacto?.whatsapp ?? '',
    linkedin: contacto?.linkedin ?? '',
    notas: '',
    principal: contacto?.principal ?? false,
  }
}

interface ContactoEmpresaFormProps {
  empresaId: string
  contacto?: ContactoEmpresa | null
  onSuccess?: (contacto: ContactoEmpresa) => void
  onCancel?: () => void
}

/** Alta/edicion de un contacto o funcionario de una empresa. */
export function ContactoEmpresaForm({
  empresaId,
  contacto,
  onSuccess,
  onCancel,
}: ContactoEmpresaFormProps) {
  const crear = useCrearContactoEmpresa(empresaId)
  const actualizar = useActualizarContactoEmpresa()
  const esEdicion = Boolean(contacto)
  const pendiente = crear.isPending || actualizar.isPending

  const form = useForm<ContactoEmpresaFormValues>({
    resolver: zodResolver(contactoEmpresaFormSchema),
    defaultValues: valoresIniciales(contacto),
  })

  function handleSubmit(values: ContactoEmpresaFormValues) {
    const payload: CrearContactoEmpresaInput = {
      nombres: values.nombres.trim(),
      apellidos: limpiar(values.apellidos),
      cargo: limpiar(values.cargo),
      area: limpiar(values.area),
      email: limpiar(values.email),
      telefono: limpiar(values.telefono),
      whatsapp: limpiar(values.whatsapp),
      linkedin: limpiar(values.linkedin),
      notas: limpiar(values.notas),
      principal: values.principal,
    }

    if (esEdicion && contacto) {
      actualizar.mutate(
        { contactoId: contacto.id, input: payload },
        {
          onSuccess: (data) => {
            toast.success('Contacto actualizado correctamente.')
            onSuccess?.(data)
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : 'No se pudo actualizar el contacto.',
            )
          },
        },
      )
      return
    }

    crear.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Contacto agregado correctamente.')
        onSuccess?.(data)
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'No se pudo agregar el contacto.',
        )
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombres <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Luis Fernando" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellidos"
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
            name="cargo"
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
            name="area"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electronico</FormLabel>
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
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="(1)2156225" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 999 999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/contacto"
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
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas internas</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Notas del contacto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="principal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-border/60 p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(valor) => field.onChange(valor === true)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Contacto principal</FormLabel>
                <FormDescription>
                  Se usara por defecto al registrar un embajador de esta
                  empresa.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

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
            {esEdicion ? 'Guardar cambios' : 'Agregar contacto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
