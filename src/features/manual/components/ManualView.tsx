"use client"

import { useState, type ReactNode } from "react"
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileText,
  Home,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Video,
  Building2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"

interface Tarjeta {
  icono: LucideIcon
  titulo: string
  texto: string
}

interface Seccion {
  id: string
  /** Texto exacto de la opción del menú lateral. */
  titulo: string
  /** Ruta del menú, por ejemplo "Menú › Embajadores". */
  ruta: string
  icono: LucideIcon
  intro: string
  tarjetas?: Tarjeta[]
  pasos?: { titulo: string; texto: string }[]
  nota?: string
  extra?: ReactNode
}

const SECCIONES: Seccion[] = [
  {
    id: "dashboard",
    titulo: "Dashboard",
    ruta: "Menú › Dashboard",
    icono: Home,
    intro:
      "Resumen del estado del sistema de embajadores. Solo lo ve el administrador. Muestra únicamente embajadores validados y se actualiza sola cada minuto.",
    tarjetas: [
      { icono: CalendarClock, titulo: "Filtros de mes y año", texto: "Elige un periodo arriba a la derecha. Los gráficos y el resumen se recalculan para ese mes." },
      { icono: Mail, titulo: "Correos enviados", texto: "Cuántos correos salieron en el mes, por día y por usuario. El límite es de 300 correos por día entre todos los usuarios." },
      { icono: Video, titulo: "Reuniones agendadas", texto: "Reuniones del mes, por semana." },
      { icono: Building2, titulo: "Empresas e influencers contactados", texto: "Cuántas empresas e influencers recibieron contacto en el periodo." },
    ],
    nota: "Si un gráfico dice \"Aún no hay datos para este gráfico\", todavía no tiene información en el servidor. No es un error de tu parte.",
  },
  {
    id: "embajadores",
    titulo: "Embajadores",
    ruta: "Menú › Embajadores",
    icono: Users,
    intro:
      "Gestión de los embajadores validados. Desde aquí los contactas, los revisas y los administras, individualmente o en grupo.",
    pasos: [
      { titulo: "Buscar y filtrar", texto: "Usa el buscador y los filtros de estado de contacto, temática y red social para encontrar embajadores." },
      { titulo: "Contactar o ver", texto: "En cada fila, el botón Contactar envía un correo y el botón Ver abre su ficha." },
      { titulo: "Editar o eliminar", texto: "El lápiz edita los datos del embajador y el icono de papelera lo elimina tras confirmar." },
      { titulo: "Acciones en grupo", texto: "Marca varios embajadores con las casillas. Luego puedes enviar un mensaje masivo o eliminarlos juntos con Eliminar varios." },
      { titulo: "Agregar embajadores", texto: "Con los botones de la parte superior puedes crear uno nuevo, importar una lista desde Excel o captar embajadores." },
    ],
    nota: "Esta lista solo muestra embajadores validados.",
  },
  {
    id: "influencers",
    titulo: "Influencers",
    ruta: "Menú › Influencers",
    icono: Users,
    intro:
      "Consulta y administra solo los influencers registrados. Es la misma lista que Embajadores, pero limitada a ese tipo de registro.",
    tarjetas: [
      { icono: Users, titulo: "Lo que sí puedes hacer", texto: "Buscar, filtrar, contactar, ver, editar y eliminar influencers, uno por uno o varios a la vez." },
      { icono: Mail, titulo: "Lo que no aparece", texto: "El mensaje masivo, importar, captar y crear nuevo no se muestran en esta sección. Están en Embajadores." },
    ],
    nota: "Solo se muestran influencers validados.",
  },
  {
    id: "empresas-contactos",
    titulo: "Empresas y Contactos",
    ruta: "Menú › Empresas y Contactos",
    icono: Building2,
    intro:
      "Administra las empresas que se registraron como embajadores y sus personas de contacto.",
    pasos: [
      { titulo: "Buscar", texto: "Busca por empresa, embajador, correo o RUC." },
      { titulo: "Editar datos de la empresa", texto: "El RUC solo acepta números (máximo 11 dígitos). La página web debe empezar con https://." },
      { titulo: "Agregar un contacto", texto: "Registra nombres, apellidos, correo y teléfonos. Los teléfonos vacíos deben completarse o eliminarse antes de guardar." },
      { titulo: "Enviar un correo", texto: "El icono de sobre envía un correo a un contacto. Puedes usar una plantilla y, si quieres, agendar una reunión." },
      { titulo: "Eliminar un contacto", texto: "El icono de papelera quita al contacto tras confirmar." },
    ],
    extra: (
      <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <Mail size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Envío de mensajes:</span> desde esta sección se abre la página de correos empresariales, donde envías un correo personalizado o con plantilla a varias empresas y contactos a la vez. Cada destinatario muestra si ya recibió el correo (Enviado) o no (Pendiente).
        </p>
      </div>
    ),
  },
  {
    id: "reuniones",
    titulo: "Reuniones",
    ruta: "Menú › Reuniones",
    icono: Video,
    intro:
      "Da seguimiento a las reuniones entre embajadores y voluntarios.",
    pasos: [
      { titulo: "Filtrar por estado", texto: "Elige un estado en el selector o deja Todos los estados." },
      { titulo: "Abrir una reunión", texto: "El botón Ver reunión abre su detalle." },
      { titulo: "Cambiar el estado", texto: "En el detalle puedes marcarla como realizada, como no asistió o cancelarla. Pide confirmación antes de guardar." },
    ],
    nota: "Una reunión marcada como realizada ya no puede cambiar de estado.",
  },
  {
    id: "horarios",
    titulo: "Horarios",
    ruta: "Menú › Horarios",
    icono: CalendarClock,
    intro:
      "Horario semanal de los voluntarios. Cada horario es la base de los bloques en los que pueden agendarte.",
    tarjetas: [
      { icono: Plus, titulo: "Crear", texto: "Un bloque por día de la semana, con hora de inicio y de fin en formato de 24 horas." },
      { icono: Pencil, titulo: "Editar y eliminar", texto: "Desde la tabla del voluntario. Pide confirmación antes de eliminar." },
      { icono: ShieldCheck, titulo: "Permisos", texto: "El voluntario administra solo sus horarios. El administrador los ve en modo lectura." },
    ],
  },
  {
    id: "plantillas",
    titulo: "Plantillas",
    ruta: "Menú › Plantillas",
    icono: FileText,
    intro:
      "Plantillas de correo que usan los envíos a embajadores, empresas y contactos.",
    pasos: [
      { titulo: "Crear una plantilla", texto: "Pulsa Nueva plantilla y escribe el nombre, el asunto y el cuerpo del correo." },
      { titulo: "Usar variables", texto: "En el cuerpo puedes escribir variables como {{nombre_influencer}}. Al enviar, se reemplazan por los datos de cada destinatario." },
      { titulo: "Editar o eliminar", texto: "El lápiz edita la plantilla. La papelera la elimina tras confirmar." },
    ],
  },
  {
    id: "usuarios",
    titulo: "Usuarios",
    ruta: "Menú › Usuarios",
    icono: UserPlus,
    intro:
      "Cuentas que pueden entrar al sistema y su rol. Solo lo ve el administrador.",
    pasos: [
      { titulo: "Buscar y filtrar", texto: "Filtra por estado y por rol." },
      { titulo: "Crear un usuario", texto: "Pulsa Nuevo usuario e indica nombre, correo institucional y rol." },
      { titulo: "Editar", texto: "El lápiz cambia los datos y el rol de la cuenta." },
      { titulo: "Desactivar", texto: "El icono de desactivar bloquea el acceso de la cuenta tras confirmar la acción. Una cuenta desactivada no puede iniciar sesión." },
      { titulo: "Reactivar", texto: "Una cuenta desactivada se puede volver a activar para que el usuario recupere el acceso. Esta opción se está habilitando y estará disponible en una próxima versión." },
    ],
    nota: "Desactivar un usuario no borra sus datos. Solo le impide entrar.",
  },
  {
    id: "perfil",
    titulo: "Perfil",
    ruta: "Menú › Perfil",
    icono: UserCog,
    intro:
      "Tus datos de acceso. Cualquier usuario puede cambiar su propio correo y contraseña.",
    pasos: [
      { titulo: "Cambiar el correo", texto: "Escribe el nuevo correo electrónico y guarda." },
      { titulo: "Cambiar la contraseña", texto: "Escribe la contraseña nueva y guarda." },
    ],
    nota: "Si olvidas tu contraseña, consulta con el administrador del sistema.",
  },
  {
    id: "manual",
    titulo: "Manual",
    ruta: "Menú › Manual",
    icono: BookOpen,
    intro:
      "Esta sección. Tiene una guía por cada opción del menú lateral, en el mismo orden.",
    tarjetas: [
      { icono: ClipboardList, titulo: "Cómo leer la guía", texto: "Elige una opción en el índice de la izquierda. Usa Anterior y Siguiente para recorrerlas en orden." },
      { icono: Lightbulb, titulo: "Tip", texto: "Si una opción del menú no aparece para ti, tu rol no tiene permiso para usarla." },
    ],
  },
]

export function ManualView() {
  const [activa, setActiva] = useState(SECCIONES[0].id)
  const seccion = SECCIONES.find((s) => s.id === activa) ?? SECCIONES[0]
  const indice = SECCIONES.findIndex((s) => s.id === seccion.id)
  const Icono = seccion.icono

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Manual"
        description="Guías de uso de cada opción del menú."
      />

      <div className="overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground sm:p-8">
        <div className="flex flex-col gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-white/10">
            <Icono size={24} className="text-mint" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-mint">Guía de uso</p>
          <h2 className="font-heading text-2xl font-semibold text-white">{seccion.titulo}</h2>
          <p className="max-w-xl text-sm text-sidebar-foreground/80">{seccion.ruta}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="flex flex-col gap-1 p-3">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contenido
            </p>
            {SECCIONES.map((s) => {
              const I = s.icono
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiva(s.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    s.id === activa
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <I size={16} />
                  <span>{s.titulo}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {String(indice + 1).padStart(2, "0")} · {seccion.ruta}
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-foreground">{seccion.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{seccion.intro}</p>
            </div>

            {seccion.tarjetas && (
              <div className="grid gap-3 sm:grid-cols-2">
                {seccion.tarjetas.map((t) => (
                  <div key={t.titulo} className="rounded-xl border border-border bg-muted/30 p-4">
                    <t.icono size={20} className="text-primary" />
                    <p className="mt-2 text-sm font-semibold text-foreground">{t.titulo}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t.texto}</p>
                  </div>
                ))}
              </div>
            )}

            {seccion.pasos && (
              <ol className="flex flex-col gap-4">
                {seccion.pasos.map((p, i) => (
                  <li key={p.titulo} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.titulo}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {seccion.extra}

            {seccion.nota && (
              <div className="flex gap-3 rounded-xl bg-mint/10 p-4 text-sm text-foreground">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-mint" />
                <p>{seccion.nota}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                disabled={indice === 0}
                onClick={() => setActiva(SECCIONES[indice - 1].id)}
                className="text-sm font-medium text-primary disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={indice === SECCIONES.length - 1}
                onClick={() => setActiva(SECCIONES[indice + 1].id)}
                className="text-sm font-medium text-primary disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
