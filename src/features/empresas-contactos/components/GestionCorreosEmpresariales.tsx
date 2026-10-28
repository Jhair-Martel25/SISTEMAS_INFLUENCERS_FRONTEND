"use client"

import { useMemo, useState } from 'react'
import { ArrowLeft, Mail, Search, Send, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { useEmpresas, useEnviarCorreosEmpresariales } from '../hooks/useEmpresasContactos'
import type { ContactoEmpresa } from '@/types/empresa-contacto'

export function GestionCorreosEmpresariales() {
  const [buscar, setBuscar] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [asunto, setAsunto] = useState('Invitación a colaborar con Sembrando Perú')
  const [contenido, setContenido] = useState('Hola {nombre},\n\nEn Sembrando Perú creemos en el poder de las empresas para impulsar un cambio positivo. Nos encantará conversar con {empresa} sobre cómo podemos colaborar.\n\nSaludos cordiales.')
  const { data, isLoading } = useEmpresas('')
  const enviar = useEnviarCorreosEmpresariales()

  const destinatarios = useMemo(() => (data ?? []).flatMap((empresa) => empresa.contactos.map((contacto) => ({ ...contacto, empresa: empresa.nombre })).filter((contacto): contacto is ContactoEmpresa & { empresa: string; email: string } => Boolean(contacto.email))), [data])
  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    return termino ? destinatarios.filter((destinatario) => `${destinatario.nombres} ${destinatario.apellidos} ${destinatario.empresa} ${destinatario.email}`.toLowerCase().includes(termino)) : destinatarios
  }, [buscar, destinatarios])
  const todosFiltradosSeleccionados = filtrados.length > 0 && filtrados.every((destinatario) => seleccionados.includes(destinatario.id))

  function cambiarTodos(marcado: boolean) {
    setSeleccionados((actuales) => marcado ? [...new Set([...actuales, ...filtrados.map((destinatario) => destinatario.id)])] : actuales.filter((id) => !filtrados.some((destinatario) => destinatario.id === id)))
  }

  async function enviarCorreo() {
    if (seleccionados.length === 0) { toast.error('Selecciona al menos un contacto.'); return }
    if (!asunto.trim() || !contenido.trim()) { toast.error('Completa el asunto y el contenido.'); return }
    try {
      const resultados = await enviar.mutateAsync({ contactoIds: seleccionados, asunto: asunto.trim(), contenido: contenido.trim() })
      const exitosos = resultados.filter((resultado) => resultado.exitoso).length
      toast.success(`${exitosos} correo${exitosos === 1 ? '' : 's'} enviado${exitosos === 1 ? '' : 's'}.`)
      setSeleccionados([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron enviar los correos.')
    }
  }

  return <div className="mx-auto flex max-w-7xl flex-col gap-5">
    <PageHeader title="Gestión de correos empresariales" description="Envía correos personalizados a los contactos de las empresas." backHref="/empresas-contactos" />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,1.15fr)]">
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><Users size={18}/>Destinatarios ({seleccionados.length})</h2><span className="text-xs text-muted-foreground">{destinatarios.length} contactos</span></div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/><Input value={buscar} onChange={(event) => setBuscar(event.target.value)} className="pl-9" placeholder="Buscar por nombre, empresa o correo..." /></div>
        </div>
        <div className="max-h-[560px] overflow-auto">
          <div className="grid grid-cols-[32px_1.1fr_1fr_1.2fr_auto] gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground"><Checkbox checked={todosFiltradosSeleccionados} onCheckedChange={(valor) => cambiarTodos(valor === true)} aria-label="Seleccionar todos"/><span>Nombre</span><span>Empresa</span><span>Correo</span><span>Estado</span></div>
          {isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">Cargando contactos…</p> : filtrados.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No hay contactos que coincidan con la búsqueda.</p> : filtrados.map((destinatario) => <label key={destinatario.id} className="grid cursor-pointer grid-cols-[32px_1.1fr_1fr_1.2fr_auto] items-center gap-2 border-b px-4 py-3 text-sm hover:bg-muted/30"><Checkbox checked={seleccionados.includes(destinatario.id)} onCheckedChange={(valor) => setSeleccionados((actuales) => valor === true ? [...actuales, destinatario.id] : actuales.filter((id) => id !== destinatario.id))} aria-label={`Seleccionar a ${destinatario.nombres}`}/><span className="font-medium">{destinatario.nombres} {destinatario.apellidos}<small className="block font-normal text-muted-foreground">{destinatario.cargo}</small></span><span className="truncate">{destinatario.empresa}</span><span className="truncate text-muted-foreground">{destinatario.email}</span><span className={`rounded-full px-2 py-1 text-xs ${destinatario.estadoCorreo === 'ENVIADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{destinatario.estadoCorreo === 'ENVIADO' ? 'Enviado' : 'Pendiente'}</span></label>)}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2"><Mail className="text-primary" size={20}/><div><h2 className="font-semibold">Redactar correo</h2><p className="text-sm text-muted-foreground">Usa <code>{'{nombre}'}</code> y <code>{'{empresa}'}</code> para personalizarlo.</p></div></div>
        <div className="space-y-4"><label className="block space-y-1 text-sm font-medium">Asunto<Input value={asunto} maxLength={200} onChange={(event) => setAsunto(event.target.value)} /></label><label className="block space-y-1 text-sm font-medium">Contenido del correo<textarea value={contenido} maxLength={10000} rows={10} onChange={(event) => setContenido(event.target.value)} className="w-full rounded-lg border border-input bg-transparent p-3 text-sm font-normal" /></label>
          <div className="rounded-lg border bg-muted/20 p-4"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Vista previa</p><p className="font-semibold">{asunto || 'Sin asunto'}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{contenido.replace(/\{nombre\}/gi, 'Nombre del contacto').replace(/\{empresa\}/gi, 'Empresa')}</p></div>
          <div className="flex justify-between gap-3"><Button variant="outline" asChild><a href="/empresas-contactos"><ArrowLeft size={16}/>Volver</a></Button><Button onClick={() => void enviarCorreo()} disabled={enviar.isPending || seleccionados.length === 0}><Send size={16}/>{enviar.isPending ? 'Enviando…' : `Enviar a ${seleccionados.length || ''} contacto${seleccionados.length === 1 ? '' : 's'}`}</Button></div>
        </div>
      </section>
    </div>
  </div>
}
