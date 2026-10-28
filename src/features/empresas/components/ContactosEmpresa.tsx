'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Pencil, Phone, Plus, Star, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'

import { usePermission } from '@/hooks/usePermission'
import type { ContactoEmpresa } from '@/types/empresa'
import {
  useContactosEmpresa,
  useEliminarContactoEmpresa,
} from '../hooks/useEmpresas'
import { ContactoEmpresaForm } from './ContactoEmpresaForm'

interface ContactosEmpresaProps {
  empresaId: string
  /** Titulo de la seccion (se oculta dentro de un dialogo). */
  mostrarEncabezado?: boolean
}

/** Lista y CRUD de los contactos/funcionarios de una empresa. */
export function ContactosEmpresa({
  empresaId,
  mostrarEncabezado = true,
}: ContactosEmpresaProps) {
  const { isAdmin } = usePermission()
  const { data, isLoading, isError, error } = useContactosEmpresa(empresaId)
  const eliminar = useEliminarContactoEmpresa()

  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<ContactoEmpresa | null>(null)
  const [eliminando, setEliminando] = useState<ContactoEmpresa | null>(null)

  const contactos = data ?? []

  return (
    <div className="space-y-4">
      {mostrarEncabezado && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Contactos y funcionarios
            </h2>
            <p className="text-sm text-muted-foreground">
              Personas de la empresa que pueden ser registradas como
              embajadores.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreando(true)}>
            <Plus size={15} />
            Agregar contacto
          </Button>
        </div>
      )}

      {!mostrarEncabezado && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreando(true)}>
            <Plus size={15} />
            Agregar contacto
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar los contactos.'}
        </p>
      ) : contactos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center">
          <UserRound className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">
            Esta empresa aun no tiene contactos
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Agrega al menos un contacto para poder registrar un embajador de
            tipo empresa.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {contactos.map((contacto) => (
            <li
              key={contacto.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {contacto.nombreCompleto
                    .split(' ')
                    .map((parte) => parte[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                    <span className="truncate">{contacto.nombreCompleto}</span>
                    {contacto.principal && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="size-3 fill-current" />
                        Principal
                      </Badge>
                    )}
                    {contacto.influencerId && (
                      <Badge variant="outline">Ya es embajador</Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[contacto.cargo, contacto.area]
                      .filter(Boolean)
                      .join(' · ') || 'Sin cargo registrado'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {contacto.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-3" />
                        {contacto.email}
                      </span>
                    )}
                    {contacto.telefono && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3" />
                        {contacto.telefono}
                      </span>
                    )}
                    {contacto.whatsapp && (
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="size-3" />
                        {contacto.whatsapp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar contacto"
                  title="Editar contacto"
                  onClick={() => setEditando(contacto)}
                >
                  <Pencil size={16} />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar contacto"
                    title="Eliminar contacto"
                    onClick={() => setEliminando(contacto)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Agregar contacto</DialogTitle>
            <DialogDescription>
              Registra un funcionario o contacto de la empresa.
            </DialogDescription>
          </DialogHeader>
          <ContactoEmpresaForm
            empresaId={empresaId}
            onSuccess={() => setCreando(false)}
            onCancel={() => setCreando(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editando)}
        onOpenChange={(open) => !open && setEditando(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
            <DialogDescription>
              Actualiza los datos del contacto o funcionario.
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <ContactoEmpresaForm
              empresaId={empresaId}
              contacto={editando}
              onSuccess={() => setEditando(null)}
              onCancel={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(eliminando)}
        onOpenChange={(open) => !open && setEliminando(null)}
        title="Eliminar contacto"
        description={
          eliminando
            ? `Seguro que deseas eliminar a ${eliminando.nombreCompleto}? Esta accion no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        isPending={eliminar.isPending}
        onConfirm={() => {
          if (!eliminando) return
          eliminar.mutate(eliminando.id, {
            onSuccess: () => {
              toast.success('Contacto eliminado correctamente.')
              setEliminando(null)
            },
            onError: (error) => {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'No se pudo eliminar el contacto.',
              )
            },
          })
        }}
      />
    </div>
  )
}
