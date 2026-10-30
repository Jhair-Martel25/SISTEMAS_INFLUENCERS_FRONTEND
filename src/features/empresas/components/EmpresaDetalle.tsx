'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  CalendarClock,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserPlus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'

import { useEmpresa } from '../hooks/useEmpresas'
import { ContactosEmpresa } from './ContactosEmpresa'
import { EmpresaForm } from './EmpresaForm'

interface EmpresaDetalleProps {
  id: string
}

function urlSegura(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function ubicacionTexto(empresa: {
  distrito?: string | null
  provincia?: string | null
  departamento?: string | null
}) {
  return (
    [empresa.distrito, empresa.provincia, empresa.departamento]
      .filter(Boolean)
      .join(', ') || '-'
  )
}

export function EmpresaDetalle({ id }: EmpresaDetalleProps) {
  const { data: empresa, isLoading, isError, error } = useEmpresa(id)
  const [editando, setEditando] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="h-16 animate-pulse rounded-xl bg-muted/40" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-52 animate-pulse rounded-xl bg-muted/40 lg:col-span-2" />
          <div className="h-52 animate-pulse rounded-xl bg-muted/40" />
        </div>
      </div>
    )
  }

  if (isError || !empresa) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <PageHeader
          title="Empresa no encontrada"
          description="No se pudo cargar la informacion de la empresa."
          backHref="/empresas"
          backLabel="Volver a Empresas"
        />
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'La empresa no existe o fue eliminada.'}
        </p>
      </div>
    )
  }

  const telefono = [empresa.telefono1, empresa.telefono2, empresa.telefono3]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title={empresa.nombre}
        description={
          [empresa.sector, empresa.tipoEmpresaCiiu, empresa.ruc ? `RUC ${empresa.ruc}` : null]
            .filter(Boolean)
            .join(' · ') || 'Ficha de la empresa'
        }
        backHref="/empresas"
        backLabel="Volver a Empresas"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditando(true)}>
              <Pencil size={16} />
              Editar
            </Button>
            <Button asChild>
              <Link href={`/influencers/nuevo?tipo=EMPRESA&empresaId=${empresa.id}`}>
                <UserPlus size={16} />
                Registrar embajador
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={empresa.activa ? 'secondary' : 'outline'}>
          {empresa.activa ? 'Activa' : 'Inactiva'}
        </Badge>
        <Badge variant="outline">
          {empresa.origen === 'MANUAL'
            ? 'Registrada manualmente'
            : 'Base corporativa'}
        </Badge>
        <Badge variant="outline">
          {empresa.contactos.length}{' '}
          {empresa.contactos.length === 1 ? 'contacto' : 'contactos'}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Datos corporativos
            </CardTitle>
            <CardDescription>
              Informacion proveniente de la base de empresas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['RUC', empresa.ruc],
                  ['CIIU', empresa.ciiu],
                  ['Sector', empresa.sector],
                  ['Tipo de empresa (CIIU)', empresa.tipoEmpresaCiiu],
                  [
                    'Ranking corporativo',
                    empresa.ranking != null ? String(empresa.ranking) : null,
                  ],
                  ['Correo corporativo', empresa.emailCorporativo],
                ] as const
              ).map(([etiqueta, valor]) => (
                <div key={etiqueta}>
                  <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-foreground">
                    {valor || '-'}
                  </dd>
                </div>
              ))}
            </dl>

            {empresa.descripcion && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Descripcion</p>
                <p className="mt-1 text-sm text-foreground">
                  {empresa.descripcion}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Ubicacion y contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Direccion</p>
              <p className="font-medium text-foreground">
                {empresa.direccion || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Distrito / provincia / departamento
              </p>
              <p className="font-medium text-foreground">
                {ubicacionTexto(empresa)}
              </p>
              {empresa.ubigeo && (
                <p className="text-xs text-muted-foreground">
                  UBIGEO {empresa.ubigeo}
                </p>
              )}
            </div>
            {telefono && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="size-3.5" />
                {telefono}
              </p>
            )}
            {empresa.emailCorporativo && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5" />
                <a
                  href={`mailto:${empresa.emailCorporativo}`}
                  className="break-all transition-colors hover:text-primary"
                >
                  {empresa.emailCorporativo}
                </a>
              </p>
            )}
            {empresa.sitioWeb && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="size-3.5" />
                <a
                  href={urlSegura(empresa.sitioWeb)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all transition-colors hover:text-primary"
                >
                  {empresa.sitioWeb}
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <ContactosEmpresa empresaId={empresa.id} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              ¿Listo para registrar un embajador?
            </p>
            <p className="text-xs text-muted-foreground">
              Usa uno de los contactos de esta empresa para crear su perfil de
              embajador.
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/influencers/nuevo?tipo=EMPRESA&empresaId=${empresa.id}`}>
            <Plus size={16} />
            Nuevo embajador
          </Link>
        </Button>
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
            <DialogDescription>
              Actualiza los datos corporativos de la empresa.
            </DialogDescription>
          </DialogHeader>
          <EmpresaForm
            empresa={empresa}
            permitirContactoPrincipal={false}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
