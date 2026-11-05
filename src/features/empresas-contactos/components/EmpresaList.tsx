"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  Search,
  UserRoundPlus,
  Mail,
  Pencil,
  Trash2,
  X,
  Send,
  Plus,
  Minus,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { usePermission } from '@/hooks/usePermission'
import { SelectorPlantillaCorreo } from '@/features/influencers/components/SelectorPlantillaCorreo'
import { usePlantillas } from '@/features/plantillas/hooks/usePlantillas'
import type { ContactoEmpresa, Empresa } from '@/types/empresa-contacto'
import { useActualizarEmpresa, useCrearContacto, useEliminarContacto, useEmpresas, useEnviarCorreoContacto } from '../hooks/useEmpresasContactos'
import { UbigeoContactoAutocomplete } from './UbigeoContactoAutocomplete'

const SECTORES = [
  'Sector Agrario',
  'Sector Educativo',
  'Sector Ambiental',
  'Sector Forestal',
  'Sector Energético',
  'Sector Sociocomunitario',
]

const vacioContacto = {
  nombres: '',
  apellidos: '',
  cargo: '',
  email: '',
  telefonos: [''],
  fax: '',
  ubigeo: '',
  paginaWeb: '',
  direccion: '',
}

interface DestinoCorreoModal {
  nombre: string
  email: string
  empresa?: string
}

function obtenerDiaSemana(fechaStr: string): string {
  if (!fechaStr) return ''
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  if (!año || !mes || !dia) return ''
  const d = new Date(año, mes - 1, dia)
  const diaNombre = d.toLocaleDateString('es-ES', { weekday: 'long' })
  return diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1)
}

function formatearFechaLegible(fechaStr: string): string {
  if (!fechaStr) return ''
  const [año, mes, dia] = fechaStr.split('-').map(Number)
  if (!año || !mes || !dia) return ''
  const d = new Date(año, mes - 1, dia)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatearHora(horaStr: string): string {
  if (!horaStr) return ''
  const [horas, minutos] = horaStr.split(':')
  if (!horas || !minutos) return horaStr
  const h = parseInt(horas, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutos} ${ampm}`
}

const HORAS_SUGERIDAS = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']

export function EmpresaList() {
  const router = useRouter()
  const [buscar, setBuscar] = useState('')
  const [seleccionId, setSeleccionId] = useState('')
  const [mostrarContacto, setMostrarContacto] = useState(false)
  const [contactoForm, setContactoForm] = useState(vacioContacto)
  const [editando, setEditando] = useState<Empresa | null>(null)
  const [empresaForm, setEmpresaForm] = useState({
    nombre: '',
    email: '',
    ruc: '',
    sector: '',
    direccion: '',
    sitioWeb: '',
    descripcion: '',
  })
  const [mostrarDatos, setMostrarDatos] = useState(false)

  // Modal correo
  const [destinoCorreo, setDestinoCorreo] = useState<DestinoCorreoModal | null>(null)
  const [modoModal, setModoModal] = useState<'PLANTILLA' | 'REUNION'>('PLANTILLA')
  const [plantillaModalId, setPlantillaModalId] = useState('')
  const [correoForm, setCorreoForm] = useState({ asunto: '', mensaje: '' })

  // Agendar reunión en modal
  const fechaDefault = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])
  const [fechaModal, setFechaModal] = useState(fechaDefault)
  const [diaModal, setDiaModal] = useState(() => obtenerDiaSemana(fechaDefault))
  const [horaModal, setHoraModal] = useState('10:00')
  const [modalidadModal, setModalidadModal] = useState('Google Meet / Virtual')

  const { isAdmin } = usePermission()
  const { data, isLoading, isError, error } = useEmpresas(buscar)
  const { data: plantillas } = usePlantillas()
  const actualizarEmpresa = useActualizarEmpresa()
  const crearContacto = useCrearContacto()
  const eliminarContacto = useEliminarContacto()
  const enviarCorreo = useEnviarCorreoContacto()

  const empresas = useMemo(() => data ?? [], [data])
  const empresaSeleccionada = empresas.find((e) => e.id === seleccionId) ?? null

  function construirMsgReunion(f: string, d: string, h: string, m: string, dest: DestinoCorreoModal) {
    const diaTexto = d || obtenerDiaSemana(f) || 'Día a coordinar'
    const fechaTexto = f ? formatearFechaLegible(f) : 'Fecha a coordinar'
    const horaTexto = h ? formatearHora(h) : 'Hora a coordinar'
    const empresaTexto = dest.empresa || 'tu organización'

    return {
      asunto: `Solicitud de reunión con Sembrando Perú: ${diaTexto} ${fechaTexto}`,
      mensaje: `Hola ${dest.nombre},\n\nTe escribo de parte del equipo de Sembrando Perú. Nos encantaría agendar una breve reunión contigo para presentarte nuestra propuesta de colaboración con ${empresaTexto}.\n\nDetalles de la reunión propuesta:\n• Día: ${diaTexto}\n• Fecha: ${fechaTexto}\n• Hora: ${horaTexto}\n• Modalidad: ${m}\n\nPor favor confírmanos si este horario te queda cómodo o indícanos qué otra fecha y hora te acomoda mejor para coordinar.\n\n¡Muchas gracias por tu tiempo y consideración!\nEquipo Sembrando Perú`,
    }
  }

  function abrirModalCorreo(destino: DestinoCorreoModal) {
    setDestinoCorreo(destino)
    setModoModal('PLANTILLA')
    setPlantillaModalId('')
    setCorreoForm({
      asunto: 'Contacto de Sembrando Perú',
      mensaje: `Hola ${destino.nombre},\n\n`,
    })
  }

  function cambiarModoModal(nuevoModo: 'PLANTILLA' | 'REUNION') {
    setModoModal(nuevoModo)
    if (!destinoCorreo) return
    if (nuevoModo === 'REUNION') {
      const msg = construirMsgReunion(fechaModal, diaModal, horaModal, modalidadModal, destinoCorreo)
      setCorreoForm(msg)
    } else {
      const p = plantillas?.find((item) => item.id === plantillaModalId)
      if (p) {
        setCorreoForm({
          asunto: p.asunto,
          mensaje: p.cuerpo,
        })
      } else {
        setCorreoForm({
          asunto: 'Contacto de Sembrando Perú',
          mensaje: `Hola ${destinoCorreo.nombre},\n\n`,
        })
      }
    }
  }

  function alElegirPlantilla(id: string) {
    setPlantillaModalId(id)
    const plantilla = plantillas?.find((p) => p.id === id)
    if (plantilla) {
      setCorreoForm({
        asunto: plantilla.asunto,
        mensaje: plantilla.cuerpo,
      })
    }
  }

  function actualizarFechaModal(f: string) {
    setFechaModal(f)
    const d = obtenerDiaSemana(f)
    setDiaModal(d)
    if (modoModal === 'REUNION' && destinoCorreo) {
      setCorreoForm(construirMsgReunion(f, d, horaModal, modalidadModal, destinoCorreo))
    }
  }

  function actualizarHoraModal(h: string) {
    setHoraModal(h)
    if (modoModal === 'REUNION' && destinoCorreo) {
      setCorreoForm(construirMsgReunion(fechaModal, diaModal, h, modalidadModal, destinoCorreo))
    }
  }

  async function guardarDatos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editando) return
    if (empresaForm.ruc && !/^\d{1,11}$/.test(empresaForm.ruc)) {
      toast.error('El RUC debe contener solo números y máximo 11 dígitos.')
      return
    }
    if (empresaForm.sitioWeb && !/^https:\/\/.+/i.test(empresaForm.sitioWeb)) {
      toast.error('El sitio web debe comenzar con https://')
      return
    }
    try {
      await actualizarEmpresa.mutateAsync({ id: editando.id, input: empresaForm })
      toast.success('Datos empresariales actualizados.')
      setMostrarDatos(false)
      setEditando(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron guardar los datos.')
    }
  }

  async function guardarContacto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!empresaSeleccionada) return
    if (contactoForm.telefonos.some((telefono) => !telefono.trim())) {
      toast.error('Completa o elimina los teléfonos vacíos.')
      return
    }
    try {
      await crearContacto.mutateAsync({ empresaId: empresaSeleccionada.id, input: contactoForm })
      toast.success('Contacto agregado.')
      setMostrarContacto(false)
      setContactoForm(vacioContacto)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar el contacto.')
    }
  }

  async function borrarContacto(c: ContactoEmpresa) {
    if (!window.confirm(`¿Eliminar el contacto ${c.nombres} ${c.apellidos}?`)) return
    try {
      await eliminarContacto.mutateAsync(c.id)
      toast.success('Contacto eliminado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar el contacto.')
    }
  }

  async function enviarCorreoIndividual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!destinoCorreo?.email) return
    try {
      await enviarCorreo.mutateAsync({
        email: destinoCorreo.email,
        nombreDestino: destinoCorreo.nombre,
        asunto: correoForm.asunto,
        mensaje: correoForm.mensaje,
      })
      toast.success(
        `Correo ${modoModal === 'REUNION' ? 'con solicitud de reunión ' : ''}enviado a ${destinoCorreo.email}`
      )
      setDestinoCorreo(null)
      setCorreoForm({ asunto: '', mensaje: '' })
      setPlantillaModalId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar el correo.')
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Empresas y Contactos"
          description="Solo se muestran los embajadores registrados como empresa; administra sus datos y contactos."
          backHref="/dashboard"
        />
        {isAdmin && (
          <Button onClick={() => router.push('/empresas-contactos/correos')}>
            <Mail size={16} />
            Gestión de correos
          </Button>
        )}
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar empresa, embajador, correo o RUC..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">Cargando empresas…</div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : 'No se pudieron cargar las empresas.'}
        </div>
      ) : empresas.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Building2 className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="font-medium">No hay empresas registradas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            En Embajadores, registra o edita un perfil y selecciónalo como tipo Empresa.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {empresas.map((empresa) => (
            <section
              key={empresa.id}
              className={`rounded-xl border bg-card p-5 shadow-sm transition-all ${
                seleccionId === empresa.id ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Building2 size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base">{empresa.nombre}</h2>
                  <p className="text-sm text-muted-foreground">
                    Embajador: {empresa.nombreEmbajador || empresa.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {empresa.sector || 'Sector no indicado'}
                    {empresa.ruc ? ` · RUC ${empresa.ruc}` : ''}
                  </p>
                  {empresa.email ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Mail size={12} className="text-primary shrink-0" />
                      <span className="truncate">{empresa.email}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] italic text-muted-foreground/80">
                      Sin correo corporativo
                    </p>
                  )}
                  {empresa.sitioWeb && (
                    <a
                      className="mt-1 block text-sm text-primary underline truncate"
                      href={empresa.sitioWeb}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {empresa.sitioWeb}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      title={
                        empresa.email
                          ? `Enviar correo a ${empresa.nombre}`
                          : 'Registra un correo en Datos para poder escribirle a la empresa'
                      }
                      onClick={() => {
                        if (!empresa.email) {
                          toast.info('Para escribir a la empresa, primero registra su correo en Datos.')
                          setEditando(empresa)
                          setEmpresaForm({
                            nombre: empresa.nombre,
                            email: '',
                            ruc: empresa.ruc || '',
                            sector: empresa.sector || '',
                            direccion: empresa.direccion || '',
                            sitioWeb: empresa.sitioWeb || '',
                            descripcion: empresa.descripcion || '',
                          })
                          setMostrarDatos(true)
                          return
                        }
                        abrirModalCorreo({
                          nombre: empresa.nombre,
                          email: empresa.email,
                          empresa: empresa.nombre,
                        })
                      }}
                    >
                      <Mail size={14} /> Correo
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditando(empresa)
                      setEmpresaForm({
                        nombre: empresa.nombre,
                        email: empresa.email || '',
                        ruc: empresa.ruc || '',
                        sector: empresa.sector || '',
                        direccion: empresa.direccion || '',
                        sitioWeb: empresa.sitioWeb || '',
                        descripcion: empresa.descripcion || '',
                      })
                      setMostrarDatos(true)
                    }}
                  >
                    <Pencil size={14} /> Datos
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {empresa.direccion || 'Sin dirección registrada'}
              </p>
              {empresa.descripcion && <p className="mt-2 text-sm">{empresa.descripcion}</p>}

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">{empresa.contactos?.length ?? 0} contactos</span>
                <Button
                  size="sm"
                  variant={seleccionId === empresa.id ? 'default' : 'outline'}
                  onClick={() => {
                    setSeleccionId(empresa.id)
                    setMostrarContacto(true)
                  }}
                >
                  <UserRoundPlus size={15} /> Añadir contacto
                </Button>
              </div>

              {(empresa.contactos || []).map((c) => (
                <div key={c.id} className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {c.nombres} {c.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.cargo}</p>
                    <p className="text-sm font-mono text-muted-foreground">{c.email}</p>
                    <p className="text-sm text-muted-foreground">Tel. {c.telefono}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Enviar correo"
                        title="Enviar correo"
                        onClick={() => {
                          if (!c.email) {
                            toast.error('Este contacto no tiene correo registrado.')
                            return
                          }
                          abrirModalCorreo({
                            nombre: `${c.nombres} ${c.apellidos || ''}`.trim(),
                            email: c.email,
                            empresa: empresa.nombre,
                          })
                        }}
                      >
                        <Mail size={15} />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar contacto"
                        onClick={() => void borrarContacto(c)}
                      >
                        <Trash2 size={15} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {/* Modal: Datos de la empresa */}
      {mostrarDatos && editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(e) => void guardarDatos(e)}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-xl bg-background p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Datos de la empresa · {editando.nombre}</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setMostrarDatos(false)}>
                <X size={18} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Los cambios se guardan en la ficha del embajador existente.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                Nombre de empresa
                <Input
                  value={empresaForm.nombre}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, nombre: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                Correo corporativo directo
                <Input
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={empresaForm.email}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, email: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                RUC (máximo 11 dígitos)
                <Input
                  inputMode="numeric"
                  maxLength={11}
                  value={empresaForm.ruc}
                  onChange={(e) =>
                    setEmpresaForm((v) => ({ ...v, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) }))
                  }
                />
              </label>
              <label className="space-y-1 text-sm">
                Sector
                <select
                  className="h-10 w-full rounded-md border bg-background px-3"
                  value={empresaForm.sector}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, sector: e.target.value }))}
                >
                  <option value="">Seleccionar sector</option>
                  {SECTORES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                Dirección
                <Input
                  value={empresaForm.direccion}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, direccion: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                Sitio web (debe comenzar con https://)
                <Input
                  type="url"
                  placeholder="https://ejemplo.com"
                  value={empresaForm.sitioWeb}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, sitioWeb: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm sm:col-span-2">
                Descripción
                <textarea
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent p-2 text-sm"
                  value={empresaForm.descripcion}
                  onChange={(e) => setEmpresaForm((v) => ({ ...v, descripcion: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMostrarDatos(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizarEmpresa.isPending}>
                {actualizarEmpresa.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Añadir contacto */}
      {mostrarContacto && empresaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(e) => void guardarContacto(e)}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl bg-background p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Añadir contacto</h2>
                <p className="text-sm text-muted-foreground">Empresa: {empresaSeleccionada.nombre}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setMostrarContacto(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['nombres', 'Nombres', true],
                  ['apellidos', 'Apellidos', true],
                  ['cargo', 'Cargo', true],
                  ['email', 'Correo electrónico', true],
                  ['fax', 'Fax', false],
                  ['paginaWeb', 'Página web', true],
                  ['direccion', 'Dirección', true],
                ] as const
              ).map(([key, label, required]) => (
                <label
                  key={key}
                  className={`space-y-1 text-sm ${key === 'direccion' || key === 'paginaWeb' ? 'sm:col-span-2' : ''}`}
                >
                  {label}
                  <Input
                    type={key === 'email' ? 'email' : key === 'paginaWeb' ? 'url' : 'text'}
                    placeholder={key === 'paginaWeb' ? 'https://empresa.pe' : undefined}
                    required={required}
                    value={contactoForm[key]}
                    onChange={(e) => setContactoForm((old) => ({ ...old, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <label className="space-y-1 text-sm sm:col-span-2">
                Ubigeo
                <UbigeoContactoAutocomplete
                  value={contactoForm.ubigeo}
                  onChange={(ubigeo) => setContactoForm((old) => ({ ...old, ubigeo }))}
                />
              </label>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Teléfonos</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContactoForm((old) => ({ ...old, telefonos: [...old.telefonos, ''] }))}
                  >
                    <Plus size={15} /> Añadir teléfono
                  </Button>
                </div>
                {contactoForm.telefonos.map((telefono, indice) => (
                  <div key={indice} className="flex gap-2">
                    <Input
                      required
                      value={telefono}
                      placeholder="Ej. +51 999 999 999"
                      onChange={(e) =>
                        setContactoForm((old) => ({
                          ...old,
                          telefonos: old.telefonos.map((item, posicion) =>
                            posicion === indice ? e.target.value : item
                          ),
                        }))
                      }
                    />
                    {contactoForm.telefonos.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Eliminar teléfono"
                        onClick={() =>
                          setContactoForm((old) => ({
                            ...old,
                            telefonos: old.telefonos.filter((_, posicion) => posicion !== indice),
                          }))
                        }
                      >
                        <Minus size={15} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMostrarContacto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={crearContacto.isPending}>
                {crearContacto.isPending ? 'Guardando…' : 'Guardar contacto'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Enviar correo individual con opción de plantilla y agendar reunión */}
      {destinoCorreo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={(e) => void enviarCorreoIndividual(e)}
            className="w-full max-w-xl space-y-4 rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Enviar correo</h2>
                <p className="text-sm text-muted-foreground">
                  Para: {destinoCorreo.nombre} · <span className="font-mono">{destinoCorreo.email}</span>
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDestinoCorreo(null)}>
                <X size={18} />
              </Button>
            </div>

            {/* Alternar entre Plantilla y Agendar reunión */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => cambiarModoModal('PLANTILLA')}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-3 text-xs font-semibold transition-all ${
                  modoModal === 'PLANTILLA'
                    ? 'bg-background shadow-xs text-foreground ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail size={14} />
                Plantilla
              </button>
              <button
                type="button"
                onClick={() => cambiarModoModal('REUNION')}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-3 text-xs font-semibold transition-all ${
                  modoModal === 'REUNION'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays size={14} />
                Agendar reunión
              </button>
            </div>

            {modoModal === 'PLANTILLA' && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <SelectorPlantillaCorreo
                  plantillaId={plantillaModalId}
                  onChange={alElegirPlantilla}
                  nombreInfluencer={destinoCorreo.nombre}
                  disabled={enviarCorreo.isPending}
                />
              </div>
            )}

            {modoModal === 'REUNION' && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                <p className="font-medium text-primary flex items-center gap-1">
                  <CalendarDays size={14} />
                  Solicitar día, fecha y hora de reunión
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label className="text-[11px]">Fecha</Label>
                    <Input
                      type="date"
                      value={fechaModal}
                      onChange={(e) => actualizarFechaModal(e.target.value)}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Día</Label>
                    <Input
                      value={diaModal}
                      onChange={(e) => {
                        setDiaModal(e.target.value)
                        setCorreoForm(
                          construirMsgReunion(fechaModal, e.target.value, horaModal, modalidadModal, destinoCorreo)
                        )
                      }}
                      className="bg-background text-xs h-8"
                      placeholder="Ej. Martes"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Hora</Label>
                    <Input
                      type="time"
                      value={horaModal}
                      onChange={(e) => actualizarHoraModal(e.target.value)}
                      className="bg-background text-xs h-8"
                    />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {HORAS_SUGERIDAS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => actualizarHoraModal(h)}
                      className={`rounded px-1.5 py-0.5 text-[10px] border ${
                        horaModal === h
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {formatearHora(h)}
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-[11px]">Modalidad</Label>
                  <Input
                    value={modalidadModal}
                    onChange={(e) => {
                      setModalidadModal(e.target.value)
                      setCorreoForm(
                        construirMsgReunion(fechaModal, diaModal, horaModal, e.target.value, destinoCorreo)
                      )
                    }}
                    className="bg-background text-xs h-8"
                    placeholder="Google Meet / Virtual"
                  />
                </div>
              </div>
            )}

            <label className="block space-y-1 text-sm font-medium">
              Asunto
              <Input
                required
                maxLength={200}
                value={correoForm.asunto}
                onChange={(e) => setCorreoForm((v) => ({ ...v, asunto: e.target.value }))}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Mensaje
              <textarea
                required
                maxLength={10000}
                rows={7}
                className="w-full rounded-lg border border-input bg-transparent p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={correoForm.mensaje}
                onChange={(e) => setCorreoForm((v) => ({ ...v, mensaje: e.target.value }))}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDestinoCorreo(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviarCorreo.isPending}>
                <Send size={15} />
                {enviarCorreo.isPending
                  ? 'Enviando…'
                  : modoModal === 'REUNION'
                  ? 'Solicitar reunión'
                  : 'Enviar correo'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
