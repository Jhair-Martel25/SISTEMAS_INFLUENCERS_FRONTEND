"use client"

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  RotateCcw,
  Search,
  Send,
  User,
  Users,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { SelectorPlantillaCorreo } from '@/features/influencers/components/SelectorPlantillaCorreo'
import { usePlantillas } from '@/features/plantillas/hooks/usePlantillas'
import { useEmpresas, useEnviarCorreosEmpresariales } from '../hooks/useEmpresasContactos'

type TipoDestinatario = 'TODOS' | 'EMPRESA' | 'CONTACTO'
type ModoRedaccion = 'PLANTILLA' | 'REUNION'

interface DestinatarioItem {
  id: string
  rawId: string
  tipo: 'EMPRESA' | 'CONTACTO'
  nombre: string
  subtitulo: string
  empresa: string
  email: string
  estadoCorreo: 'ENVIADO' | 'PENDIENTE'
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

export function GestionCorreosEmpresariales() {
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoDestinatario>('TODOS')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [modoRedaccion, setModoRedaccion] = useState<ModoRedaccion>('PLANTILLA')

  // Plantilla general
  const [plantillaId, setPlantillaId] = useState('')
  const [asunto, setAsunto] = useState('Invitación a colaborar con Sembrando Perú')
  const [contenido, setContenido] = useState(
    'Hola {nombre},\n\nEn Sembrando Perú creemos en el poder de las empresas y líderes para impulsar un cambio positivo. Nos encantará conversar con {empresa} sobre cómo podemos sumar esfuerzos.\n\nSaludos cordiales.'
  )
  const [mostrarEditorManual, setMostrarEditorManual] = useState(false)

  // Datos para Agendar Reunión
  const fechaDefault = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])
  const [fechaReunion, setFechaReunion] = useState(fechaDefault)
  const [diaReunion, setDiaReunion] = useState(() => obtenerDiaSemana(fechaDefault))
  const [horaReunion, setHoraReunion] = useState('10:00')
  const [modalidadReunion, setModalidadReunion] = useState('Google Meet / Virtual')

  const { data, isLoading } = useEmpresas('')
  const { data: plantillas } = usePlantillas()
  const enviar = useEnviarCorreosEmpresariales()

  const destinatarios = useMemo<DestinatarioItem[]>(() => {
    if (!data) return []
    const items: DestinatarioItem[] = []

    for (const empresa of data) {
      if (empresa.email?.trim()) {
        items.push({
          id: `empresa-${empresa.id}`,
          rawId: empresa.id,
          tipo: 'EMPRESA',
          nombre: empresa.nombre,
          subtitulo: 'Correo directo de la empresa',
          empresa: empresa.nombre,
          email: empresa.email.trim(),
          estadoCorreo: empresa.estadoCorreo === 'ENVIADO' ? 'ENVIADO' : 'PENDIENTE',
        })
      }

      for (const contacto of empresa.contactos || []) {
        if (contacto.email?.trim()) {
          items.push({
            id: `contacto-${contacto.id}`,
            rawId: contacto.id,
            tipo: 'CONTACTO',
            nombre: `${contacto.nombres} ${contacto.apellidos || ''}`.trim(),
            subtitulo: contacto.cargo || 'Contacto de empresa',
            empresa: empresa.nombre,
            email: contacto.email.trim(),
            estadoCorreo: contacto.estadoCorreo === 'ENVIADO' ? 'ENVIADO' : 'PENDIENTE',
          })
        }
      }
    }

    return items
  }, [data])

  const filtrados = useMemo(() => {
    let lista = destinatarios
    if (filtroTipo !== 'TODOS') {
      lista = lista.filter((d) => d.tipo === filtroTipo)
    }
    const termino = buscar.trim().toLowerCase()
    if (!termino) return lista

    return lista.filter((destinatario) =>
      `${destinatario.nombre} ${destinatario.subtitulo} ${destinatario.empresa} ${destinatario.email}`
        .toLowerCase()
        .includes(termino)
    )
  }, [buscar, destinatarios, filtroTipo])

  const todosFiltradosSeleccionados =
    filtrados.length > 0 && filtrados.every((destinatario) => seleccionados.includes(destinatario.id))

  const totalEmpresas = destinatarios.filter((d) => d.tipo === 'EMPRESA').length
  const totalContactos = destinatarios.filter((d) => d.tipo === 'CONTACTO').length

  const seleccionadosItems = useMemo(
    () => destinatarios.filter((d) => seleccionados.includes(d.id)),
    [destinatarios, seleccionados]
  )
  const empresasSeleccionadasCount = seleccionadosItems.filter((d) => d.tipo === 'EMPRESA').length
  const contactosSeleccionadosCount = seleccionadosItems.filter((d) => d.tipo === 'CONTACTO').length
  const primerSeleccionado = seleccionadosItems[0]

  function cambiarTodos(marcado: boolean) {
    setSeleccionados((actuales) =>
      marcado
        ? [...new Set([...actuales, ...filtrados.map((destinatario) => destinatario.id)])]
        : actuales.filter((id) => !filtrados.some((destinatario) => destinatario.id === id))
    )
  }

  function handlePlantillaChange(id: string) {
    setPlantillaId(id)
    const seleccionada = plantillas?.find((p) => p.id === id)
    if (seleccionada) {
      setAsunto(seleccionada.asunto)
      setContenido(seleccionada.cuerpo)
    }
  }

  function construirMensajeReunion(datos: {
    fecha: string
    dia: string
    hora: string
    modalidad: string
  }) {
    const diaTexto = datos.dia || obtenerDiaSemana(datos.fecha) || 'Día a coordinar'
    const fechaTexto = datos.fecha ? formatearFechaLegible(datos.fecha) : 'Fecha a coordinar'
    const horaTexto = datos.hora ? formatearHora(datos.hora) : 'Hora a coordinar'
    const modalidadTexto = datos.modalidad || 'Google Meet / Virtual'

    return {
      asunto: `Solicitud de reunión con Sembrando Perú: ${diaTexto} ${fechaTexto}`,
      contenido: `Hola {nombre},\n\nTe escribo de parte del equipo de Sembrando Perú. Nos encantaría agendar una breve reunión contigo para presentarte nuestra propuesta de colaboración con {empresa}.\n\nDetalles de la reunión propuesta:\n• Día: ${diaTexto}\n• Fecha: ${fechaTexto}\n• Hora: ${horaTexto}\n• Modalidad: ${modalidadTexto}\n\nPor favor confírmanos si este horario te queda cómodo o indícanos qué otra fecha y hora te acomoda mejor para coordinar.\n\n¡Muchas gracias por tu tiempo y consideración!\nEquipo Sembrando Perú`,
    }
  }

  function cambiarModo(nuevoModo: ModoRedaccion) {
    setModoRedaccion(nuevoModo)
    if (nuevoModo === 'REUNION') {
      const msg = construirMensajeReunion({
        fecha: fechaReunion,
        dia: diaReunion,
        hora: horaReunion,
        modalidad: modalidadReunion,
      })
      setAsunto(msg.asunto)
      setContenido(msg.contenido)
    } else {
      const p = plantillas?.find((item) => item.id === plantillaId)
      if (p) {
        setAsunto(p.asunto)
        setContenido(p.cuerpo)
      } else {
        setAsunto('Invitación a colaborar con Sembrando Perú')
        setContenido(
          'Hola {nombre},\n\nEn Sembrando Perú creemos en el poder de las empresas y líderes para impulsar un cambio positivo. Nos encantará conversar con {empresa} sobre cómo podemos sumar esfuerzos.\n\nSaludos cordiales.'
        )
      }
    }
  }

  function actualizarFecha(nuevaFecha: string) {
    setFechaReunion(nuevaFecha)
    const nuevoDia = obtenerDiaSemana(nuevaFecha)
    setDiaReunion(nuevoDia)
    if (modoRedaccion === 'REUNION') {
      const msg = construirMensajeReunion({
        fecha: nuevaFecha,
        dia: nuevoDia,
        hora: horaReunion,
        modalidad: modalidadReunion,
      })
      setAsunto(msg.asunto)
      setContenido(msg.contenido)
    }
  }

  function actualizarDia(nuevoDia: string) {
    setDiaReunion(nuevoDia)
    if (modoRedaccion === 'REUNION') {
      const msg = construirMensajeReunion({
        fecha: fechaReunion,
        dia: nuevoDia,
        hora: horaReunion,
        modalidad: modalidadReunion,
      })
      setAsunto(msg.asunto)
      setContenido(msg.contenido)
    }
  }

  function actualizarHora(nuevaHora: string) {
    setHoraReunion(nuevaHora)
    if (modoRedaccion === 'REUNION') {
      const msg = construirMensajeReunion({
        fecha: fechaReunion,
        dia: diaReunion,
        hora: nuevaHora,
        modalidad: modalidadReunion,
      })
      setAsunto(msg.asunto)
      setContenido(msg.contenido)
    }
  }

  function actualizarModalidad(nuevaModalidad: string) {
    setModalidadReunion(nuevaModalidad)
    if (modoRedaccion === 'REUNION') {
      const msg = construirMensajeReunion({
        fecha: fechaReunion,
        dia: diaReunion,
        hora: horaReunion,
        modalidad: nuevaModalidad,
      })
      setAsunto(msg.asunto)
      setContenido(msg.contenido)
    }
  }

  async function enviarCorreo() {
    if (seleccionados.length === 0) {
      toast.error('Selecciona al menos un destinatario (empresa o contacto).')
      return
    }
    if (!asunto.trim() || !contenido.trim()) {
      toast.error('Completa el asunto y el contenido del correo.')
      return
    }

    const contactoIds = seleccionados
      .filter((id) => id.startsWith('contacto-'))
      .map((id) => id.replace('contacto-', ''))
    const empresaIds = seleccionados
      .filter((id) => id.startsWith('empresa-'))
      .map((id) => id.replace('empresa-', ''))

    try {
      const resultados = await enviar.mutateAsync({
        contactoIds: contactoIds.length > 0 ? contactoIds : undefined,
        empresaIds: empresaIds.length > 0 ? empresaIds : undefined,
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        plantillaId: modoRedaccion === 'PLANTILLA' ? plantillaId || undefined : undefined,
      })
      const exitosos = resultados.filter((r) => r.exitoso).length
      toast.success(
        `${exitosos} correo${exitosos === 1 ? '' : 's'} ${
          modoRedaccion === 'REUNION' ? 'con solicitud de reunión ' : ''
        }enviado${exitosos === 1 ? '' : 's'}.`
      )
      setSeleccionados([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron enviar los correos.')
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <PageHeader
        title="Gestión de correos"
        description="Envía correos personalizados, solicita reuniones o utiliza plantillas directo a empresas y contactos."
        backHref="/empresas-contactos"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(460px,1.1fr)]">
        {/* Columna Izquierda: Destinatarios */}
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <Users size={18} />
                <h2>Destinatarios ({seleccionados.length})</h2>
              </div>
              <div className="text-xs text-muted-foreground">
                {totalEmpresas} empresa{totalEmpresas === 1 ? '' : 's'} · {totalContactos} contacto{totalContactos === 1 ? '' : 's'}
              </div>
            </div>

            {/* Pestañas de tipo de destinatario */}
            <div className="mb-3 flex gap-1 rounded-lg bg-muted/60 p-1 text-xs">
              <button
                type="button"
                onClick={() => setFiltroTipo('TODOS')}
                className={`flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  filtroTipo === 'TODOS' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({destinatarios.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('EMPRESA')}
                className={`flex items-center justify-center gap-1.5 flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  filtroTipo === 'EMPRESA' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 size={13} />
                Empresas ({totalEmpresas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo('CONTACTO')}
                className={`flex items-center justify-center gap-1.5 flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  filtroTipo === 'CONTACTO' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User size={13} />
                Contactos ({totalContactos})
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={buscar}
                onChange={(event) => setBuscar(event.target.value)}
                className="pl-9 text-sm"
                placeholder="Buscar por nombre, empresa o correo..."
              />
            </div>
          </div>

          <div className="max-h-[580px] overflow-auto">
            <div className="grid grid-cols-[32px_1.2fr_1fr_1.1fr_auto] items-center gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
              <Checkbox
                checked={todosFiltradosSeleccionados}
                onCheckedChange={(valor) => cambiarTodos(valor === true)}
                aria-label="Seleccionar todos los visibles"
              />
              <span>Destinatario</span>
              <span>Empresa</span>
              <span>Correo</span>
              <span>Estado</span>
            </div>

            {isLoading ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Cargando destinatarios…</p>
            ) : filtrados.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <p>No hay destinatarios con correo registrado que coincidan con la búsqueda.</p>
                <p className="mt-1 text-xs">
                  Puedes registrar el correo de una empresa editándola en la vista de Empresas y Contactos.
                </p>
              </div>
            ) : (
              filtrados.map((destinatario) => (
                <label
                  key={destinatario.id}
                  className="grid cursor-pointer grid-cols-[32px_1.2fr_1fr_1.1fr_auto] items-center gap-2 border-b px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={seleccionados.includes(destinatario.id)}
                    onCheckedChange={(valor) =>
                      setSeleccionados((actuales) =>
                        valor === true ? [...actuales, destinatario.id] : actuales.filter((id) => id !== destinatario.id)
                      )
                    }
                    aria-label={`Seleccionar ${destinatario.nombre}`}
                  />
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 font-medium truncate">
                      {destinatario.tipo === 'EMPRESA' ? (
                        <span className="flex items-center gap-1 shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          <Building2 size={11} /> Empresa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          <User size={11} /> Contacto
                        </span>
                      )}
                      <span className="truncate">{destinatario.nombre}</span>
                    </div>
                    <small className="block truncate text-xs text-muted-foreground">{destinatario.subtitulo}</small>
                  </div>
                  <span className="truncate text-sm text-muted-foreground">{destinatario.empresa}</span>
                  <span className="truncate font-mono text-xs text-foreground/90">{destinatario.email}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      destinatario.estadoCorreo === 'ENVIADO'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    {destinatario.estadoCorreo === 'ENVIADO' ? 'Enviado' : 'Pendiente'}
                  </span>
                </label>
              ))
            )}
          </div>

          {seleccionados.length > 0 && (
            <div className="border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Seleccionados: <strong>{seleccionados.length}</strong> ({empresasSeleccionadasCount} empresa{empresasSeleccionadasCount === 1 ? '' : 's'}, {contactosSeleccionadosCount} contacto{contactosSeleccionadosCount === 1 ? '' : 's'})
              </span>
              <button
                type="button"
                onClick={() => setSeleccionados([])}
                className="text-primary hover:underline font-medium"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </section>

        {/* Columna Derecha: Redactar correo / Agendar reunión */}
        <section className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
          <div className="space-y-4">
            {/* Cabecera de redacción */}
            <div className="flex items-center gap-2 border-b pb-3">
              <Mail className="text-primary" size={20} />
              <div>
                <h2 className="font-semibold text-base">Redactar correo</h2>
                <p className="text-xs text-muted-foreground">
                  Elige entre enviar una plantilla o solicitar una reunión con día, fecha y hora.
                </p>
              </div>
            </div>

            {/* Selector de modo: Plantilla vs Agendar reunión */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => cambiarModo('PLANTILLA')}
                className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold transition-all ${
                  modoRedaccion === 'PLANTILLA'
                    ? 'bg-background shadow-xs text-foreground ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail size={15} />
                Plantilla de correo
              </button>
              <button
                type="button"
                onClick={() => cambiarModo('REUNION')}
                className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold transition-all ${
                  modoRedaccion === 'REUNION'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarClockIcon size={15} />
                Agendar reunión
              </button>
            </div>

            {/* Modo 1: Selector de Plantilla (Embajadores) */}
            {modoRedaccion === 'PLANTILLA' && (
              <div className="rounded-lg border bg-muted/20 p-3">
                <SelectorPlantillaCorreo
                  plantillaId={plantillaId}
                  onChange={handlePlantillaChange}
                  nombreInfluencer={primerSeleccionado?.nombre}
                  disabled={enviar.isPending}
                />
              </div>
            )}

            {/* Modo 2: Opciones de Agendar Reunión (Día, Fecha y Hora) */}
            {modoRedaccion === 'REUNION' && (
              <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <CalendarDays size={16} />
                    <span>Datos de la reunión a solicitar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      actualizarFecha(fechaDefault)
                    }
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    title="Restablecer a fecha por defecto"
                  >
                    <RotateCcw size={12} />
                    Restablecer
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Calendar size={13} className="text-primary" />
                      Fecha de reunión
                    </Label>
                    <Input
                      type="date"
                      value={fechaReunion}
                      onChange={(e) => actualizarFecha(e.target.value)}
                      className="bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <CalendarDays size={13} className="text-primary" />
                      Día propuesto
                    </Label>
                    <Input
                      value={diaReunion}
                      onChange={(e) => actualizarDia(e.target.value)}
                      placeholder="Ej. Lunes, Martes..."
                      className="bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Clock size={13} className="text-primary" />
                      Hora
                    </Label>
                    <Input
                      type="time"
                      value={horaReunion}
                      onChange={(e) => actualizarHora(e.target.value)}
                      className="bg-background text-sm"
                    />
                  </div>
                </div>

                {/* Atajos de hora rápida */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-muted-foreground">Horas sugeridas:</span>
                  {HORAS_SUGERIDAS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => actualizarHora(h)}
                      className={`rounded-md px-2 py-0.5 font-medium transition-colors border ${
                        horaReunion === h
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {formatearHora(h)}
                    </button>
                  ))}
                </div>

                {/* Modalidad / Plataforma */}
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Video size={13} className="text-primary" />
                    Plataforma / Enlace
                  </Label>
                  <Input
                    value={modalidadReunion}
                    onChange={(e) => actualizarModalidad(e.target.value)}
                    placeholder="Ej. Google Meet (Virtual)"
                    className="bg-background text-sm"
                  />
                </div>
              </div>
            )}

            {/* Alternar edición de asunto y contenido */}
            <div>
              <button
                type="button"
                onClick={() => setMostrarEditorManual((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                {mostrarEditorManual ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {mostrarEditorManual ? 'Ocultar campos de edición' : 'Editar asunto y cuerpo del mensaje'}
              </button>
            </div>

            {mostrarEditorManual && (
              <div className="space-y-3 rounded-lg border bg-background p-3">
                <label className="block space-y-1 text-sm font-medium">
                  Asunto
                  <Input
                    value={asunto}
                    maxLength={200}
                    onChange={(event) => setAsunto(event.target.value)}
                    placeholder="Asunto del correo"
                  />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Contenido del correo
                  <textarea
                    value={contenido}
                    maxLength={10000}
                    rows={8}
                    onChange={(event) => setContenido(event.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent p-3 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Escribe el cuerpo del correo..."
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    Variables: <code>{'{nombre}'}</code>, <code>{'{empresa}'}</code>
                  </span>
                </label>
              </div>
            )}

            {/* Vista previa en vivo */}
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vista previa con el destinatario
                </p>
                {modoRedaccion === 'REUNION' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Calendar size={11} /> {diaReunion || 'Día'} · {formatearHora(horaReunion)}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm">
                {asunto
                  .replace(/\{\{\s*nombre_influencer\s*\}\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\{\s*nombre\s*\}\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\s*nombre\s*\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\{\s*empresa\s*\}\}/gi, primerSeleccionado?.empresa || '[Empresa]')
                  .replace(/\{\s*empresa\s*\}/gi, primerSeleccionado?.empresa || '[Empresa]') || 'Sin asunto'}
              </p>
              <p className="mt-2.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground max-h-52 overflow-y-auto">
                {contenido
                  .replace(/\{\{\s*nombre_influencer\s*\}\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\{\s*nombre\s*\}\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\s*nombre\s*\}/gi, primerSeleccionado?.nombre || '[Nombre]')
                  .replace(/\{\{\s*empresa\s*\}\}/gi, primerSeleccionado?.empresa || '[Empresa]')
                  .replace(/\{\s*empresa\s*\}/gi, primerSeleccionado?.empresa || '[Empresa]')
                  .replace(/\{\{\s*nombre_voluntario\s*\}\}/gi, '[tu nombre]')
                  .replace(/\{\{\s*link_agendamiento\s*\}\}/gi, '[link de agendamiento]')}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 pt-3 border-t">
            <p className="text-[11px] text-muted-foreground">
              El correo se envía desde la cuenta oficial de Sembrando Perú.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" asChild>
                <a href="/empresas-contactos">
                  <ArrowLeft size={16} />
                  Volver a Empresas y Contactos
                </a>
              </Button>
              <Button
                onClick={() => void enviarCorreo()}
                disabled={enviar.isPending || seleccionados.length === 0}
              >
                {modoRedaccion === 'REUNION' ? <CalendarDays size={16} /> : <Send size={16} />}
                {enviar.isPending
                  ? 'Enviando…'
                  : modoRedaccion === 'REUNION'
                  ? `Solicitar reunión a ${seleccionados.length || ''} destinatario${seleccionados.length === 1 ? '' : 's'}`
                  : `Enviar a ${seleccionados.length || ''} destinatario${seleccionados.length === 1 ? '' : 's'}`}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function CalendarClockIcon({ size }: { size: number }) {
  return <CalendarDays size={size} />
}
