"use client"

import { useMemo, useState } from 'react'
import { Building2, Calendar, CalendarDays, Clock, Mail, RotateCcw, Send, User, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import {
  SelectorPlantillaCorreo,
  SelectorPlantillaGaleria,
} from '@/features/influencers/components/SelectorPlantillaCorreo'
import { usePlantillas } from '@/features/plantillas/hooks/usePlantillas'
import { useEnviarCorreosEmpresariales } from '../hooks/useEmpresasContactos'
import {
  DestinatarioItem,
  leerSeleccionCorreos,
  limpiarSeleccionCorreos,
} from '../utils/seleccion-correos'

type ModoRedaccion = 'PLANTILLA' | 'REUNION'

const ASUNTO_BASE = 'Invitación a colaborar con Sembrando Perú'
const CONTENIDO_BASE =
  'Hola {nombre},\n\nEn Sembrando Perú creemos en el poder de las empresas y líderes para impulsar un cambio positivo. Nos encantará conversar con {empresa} sobre cómo podemos sumar esfuerzos.\n\nSaludos cordiales.'

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

export function RedactarCorreoEmpresarial() {
  // La página se carga solo en el navegador (ver page.tsx), así que sessionStorage está disponible
  const [destinatarios, setDestinatarios] = useState<DestinatarioItem[]>(() => leerSeleccionCorreos())
  const [modoRedaccion, setModoRedaccion] = useState<ModoRedaccion>('PLANTILLA')

  // Plantilla general
  const [plantillaId, setPlantillaId] = useState('')
  const [asunto, setAsunto] = useState(ASUNTO_BASE)
  const [contenido, setContenido] = useState(CONTENIDO_BASE)

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

  const { data: plantillas } = usePlantillas()
  const enviar = useEnviarCorreosEmpresariales()

  const primerDestinatario = destinatarios[0]
  const empresasCount = destinatarios.filter((d) => d.tipo === 'EMPRESA').length
  const contactosCount = destinatarios.filter((d) => d.tipo === 'CONTACTO').length

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
        setAsunto(ASUNTO_BASE)
        setContenido(CONTENIDO_BASE)
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
    if (destinatarios.length === 0) {
      toast.error('No hay destinatarios seleccionados.')
      return
    }
    if (!asunto.trim() || !contenido.trim()) {
      toast.error('Completa el asunto y el contenido del correo.')
      return
    }

    const contactoIds = destinatarios.filter((d) => d.tipo === 'CONTACTO').map((d) => d.rawId)
    const empresaIds = destinatarios.filter((d) => d.tipo === 'EMPRESA').map((d) => d.rawId)

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
      limpiarSeleccionCorreos()
      setDestinatarios([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron enviar los correos.')
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader
        title="Redactar correo"
        description="Elige una plantilla o solicita una reunión para los destinatarios seleccionados."
        backHref="/empresas-contactos/correos"
      />

      {destinatarios.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          <p>No hay destinatarios seleccionados.</p>
          <Button variant="outline" asChild className="mt-4">
            <a href="/empresas-contactos/correos">Volver a seleccionar destinatarios</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Resumen de destinatarios */}
          <section className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold">Destinatarios ({destinatarios.length})</h2>
              <span className="text-xs text-muted-foreground">
                {empresasCount} empresa{empresasCount === 1 ? '' : 's'} · {contactosCount} contacto{contactosCount === 1 ? '' : 's'}
              </span>
            </div>
            <ul className="max-h-[560px] divide-y overflow-auto">
              {destinatarios.map((d) => (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-medium">
                      {d.tipo === 'EMPRESA' ? <Building2 size={13} className="shrink-0 text-primary" /> : <User size={13} className="shrink-0 text-muted-foreground" />}
                      <span className="truncate">{d.nombre}</span>
                    </div>
                    <small className="block truncate text-xs text-muted-foreground">
                      {d.cargo ? `${d.cargo} · ${d.empresa}` : d.empresa}
                    </small>
                  </div>
                  <span className="truncate font-mono text-xs text-foreground/90">{d.email}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Redacción */}
          <section className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div className="space-y-4">
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
                  <CalendarDays size={15} />
                  Agendar reunión
                </button>
              </div>

              {/* Modo 1: Selector de Plantilla */}
              {modoRedaccion === 'PLANTILLA' && (
                <div className="rounded-lg border bg-muted/20 p-3">
                  <SelectorPlantillaGaleria
                    plantillaId={plantillaId}
                    onChange={handlePlantillaChange}
                    disabled={enviar.isPending}
                  />
                </div>
              )}

              {/* Modo 2: Día, fecha y hora de la reunión */}
              {modoRedaccion === 'REUNION' && (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <CalendarDays size={16} />
                      <span>Datos de la reunión a solicitar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => actualizarFecha(fechaDefault)}
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

                  {/* Plataforma / Enlace */}
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

              {/* Texto editable + vista previa */}
              <div className="rounded-lg border bg-muted/10 p-3">
                <SelectorPlantillaCorreo
                  plantillaId={modoRedaccion === 'PLANTILLA' ? plantillaId : ''}
                  onChange={handlePlantillaChange}
                  asunto={asunto}
                  onAsuntoChange={setAsunto}
                  cuerpo={contenido}
                  onCuerpoChange={setContenido}
                  tipo="EMPRESA"
                  destinatario={{ nombre: primerDestinatario?.nombre, empresa: primerDestinatario?.empresa }}
                  disabled={enviar.isPending}
                  ocultarSelector
                />
              </div>
            </div>

            <div className="mt-5 space-y-3 pt-3 border-t">
              <p className="text-[11px] text-muted-foreground">
                El correo se envía desde la cuenta oficial de Sembrando Perú.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" asChild>
                  <a href="/empresas-contactos/correos">Volver a destinatarios</a>
                </Button>
                <Button onClick={() => void enviarCorreo()} disabled={enviar.isPending || destinatarios.length === 0}>
                  {modoRedaccion === 'REUNION' ? <CalendarDays size={16} /> : <Send size={16} />}
                  {enviar.isPending
                    ? 'Enviando…'
                    : modoRedaccion === 'REUNION'
                    ? `Solicitar reunión a ${destinatarios.length} destinatario${destinatarios.length === 1 ? '' : 's'}`
                    : `Enviar a ${destinatarios.length} destinatario${destinatarios.length === 1 ? '' : 's'}`}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
