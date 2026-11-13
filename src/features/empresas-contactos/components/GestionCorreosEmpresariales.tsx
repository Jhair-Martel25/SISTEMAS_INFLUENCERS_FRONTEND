"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Building2, Search, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { useEmpresas } from '../hooks/useEmpresasContactos'
import { DestinatarioItem, guardarSeleccionCorreos } from '../utils/seleccion-correos'
import { SECTORES_FILTRO, SIN_SECTOR, sectorDeEmpresa } from '../utils/sectores'

type TipoDestinatario = 'TODOS' | 'EMPRESA' | 'CONTACTO'

export function GestionCorreosEmpresariales() {
  const router = useRouter()
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoDestinatario>('TODOS')
  const [filtroSector, setFiltroSector] = useState<string>('TODOS')
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  const { data, isLoading } = useEmpresas('')

  const destinatarios = useMemo<DestinatarioItem[]>(() => {
    if (!data) return []
    const items: DestinatarioItem[] = []

    for (const empresa of data) {
      const sector = sectorDeEmpresa({
        ciiu: empresa.ciiu,
        descripcion: empresa.descripcion,
        sector: empresa.sector,
      })

      if (empresa.email?.trim()) {
        items.push({
          id: `empresa-${empresa.id}`,
          rawId: empresa.id,
          tipo: 'EMPRESA',
          nombre: empresa.nombre,
          subtitulo: 'Correo directo de la empresa',
          cargo: 'Correo general de la empresa',
          empresa: empresa.nombre,
          email: empresa.email.trim(),
          estadoCorreo: empresa.estadoCorreo === 'ENVIADO' ? 'ENVIADO' : 'PENDIENTE',
          sector,
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
            cargo: contacto.cargo?.trim() || 'Cargo no registrado',
            empresa: empresa.nombre,
            email: contacto.email.trim(),
            estadoCorreo: contacto.estadoCorreo === 'ENVIADO' ? 'ENVIADO' : 'PENDIENTE',
            sector,
          })
        }
      }
    }

    return items
  }, [data])

  // Cantidad de destinatarios por sector, para mostrar en el selector
  const conteoPorSector = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const d of destinatarios) {
      conteo.set(d.sector, (conteo.get(d.sector) ?? 0) + 1)
    }
    return conteo
  }, [destinatarios])

  // Los filtros (tipo, sector y búsqueda) se combinan y alimentan la lista
  const filtrados = useMemo(() => {
    let lista = destinatarios
    if (filtroTipo !== 'TODOS') {
      lista = lista.filter((d) => d.tipo === filtroTipo)
    }
    if (filtroSector !== 'TODOS') {
      lista = lista.filter((d) => d.sector === filtroSector)
    }
    const termino = buscar.trim().toLowerCase()
    if (!termino) return lista

    return lista.filter((destinatario) =>
      `${destinatario.nombre} ${destinatario.cargo} ${destinatario.empresa} ${destinatario.email}`
        .toLowerCase()
        .includes(termino)
    )
  }, [buscar, destinatarios, filtroTipo, filtroSector])

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

  function cambiarTodos(marcado: boolean) {
    setSeleccionados((actuales) =>
      marcado
        ? [...new Set([...actuales, ...filtrados.map((destinatario) => destinatario.id)])]
        : actuales.filter((id) => !filtrados.some((destinatario) => destinatario.id === id))
    )
  }

  function irARedactar() {
    if (seleccionadosItems.length === 0) return
    guardarSeleccionCorreos(seleccionadosItems)
    router.push('/empresas-contactos/correos/redactar')
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader
        title="Envío de mensajes"
        description="Selecciona los destinatarios y después redacta el correo o la solicitud de reunión."
        backHref="/empresas-contactos"
      />

      {/* Destinatarios: ocupa todo el ancho */}
      <section className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          {/* Cabecera: título, filtro de sector y contadores */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Users size={18} />
              <h2>Destinatarios ({seleccionados.length})</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filtroSector}
                onChange={(event) => setFiltroSector(event.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
                aria-label="Filtrar por sector"
              >
                <option value="TODOS">Todos los sectores ({destinatarios.length})</option>
                {SECTORES_FILTRO.map((sector) => (
                  <option key={sector} value={sector} disabled={!conteoPorSector.get(sector)}>
                    {sector} ({conteoPorSector.get(sector) ?? 0})
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                {totalEmpresas} empresa{totalEmpresas === 1 ? '' : 's'} · {totalContactos} contacto{totalContactos === 1 ? '' : 's'}
              </div>
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
              placeholder="Buscar por nombre, cargo, razón social o correo..."
            />
          </div>
        </div>

        <div className="max-h-[580px] overflow-auto">
          <div className="grid grid-cols-[32px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
            <Checkbox
              checked={todosFiltradosSeleccionados}
              onCheckedChange={(valor) => cambiarTodos(valor === true)}
              aria-label="Seleccionar todos los visibles"
            />
            <span>Persona encargada</span>
            <span>Cargo</span>
            <span>Razón social</span>
            <span>Correo</span>
            <span>Estado</span>
          </div>

          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Cargando destinatarios…</p>
          ) : filtrados.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <p>No hay destinatarios con correo registrado que coincidan con los filtros.</p>
              <p className="mt-1 text-xs">
                Puedes registrar el correo de una empresa editándola en la vista de Empresas y Contactos.
              </p>
            </div>
          ) : (
            filtrados.map((destinatario) => (
              <label
                key={destinatario.id}
                className="grid cursor-pointer grid-cols-[32px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
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
                  {destinatario.sector !== SIN_SECTOR && (
                    <small className="block truncate text-xs text-muted-foreground">{destinatario.sector}</small>
                  )}
                </div>
                <span
                  className={`truncate text-sm ${
                    destinatario.tipo === 'EMPRESA' ? 'italic text-muted-foreground/70' : 'text-foreground/90'
                  }`}
                  title={destinatario.cargo}
                >
                  {destinatario.cargo}
                </span>
                <span className="truncate text-sm text-muted-foreground" title={destinatario.empresa}>
                  {destinatario.empresa}
                </span>
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

      {/* Acciones: pasar a la vista de redacción */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {seleccionados.length === 0
            ? 'Selecciona al menos un destinatario para redactar el correo.'
            : `Listo para redactar el correo a ${seleccionados.length} destinatario${seleccionados.length === 1 ? '' : 's'}.`}
        </p>
        <Button onClick={irARedactar} disabled={seleccionados.length === 0}>
          Redactar correo
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
