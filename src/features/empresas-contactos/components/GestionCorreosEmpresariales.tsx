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
import { SIN_SECTOR, ordenarSectores, sectorDeEmpresa } from '../utils/sectores'

type TipoDestinatario = 'TODOS' | 'EMPRESA' | 'CONTACTO'
type Filtro = 'tipo' | 'sector' | 'razonSocial' | 'cargo'

interface Opcion {
  valor: string
  total: number
}

function contar(items: DestinatarioItem[], clave: (d: DestinatarioItem) => string) {
  const conteo = new Map<string, number>()
  for (const item of items) {
    const valor = clave(item)
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1)
  }
  return conteo
}

function ordenarOpciones(conteo: Map<string, number>): Opcion[] {
  return [...conteo.entries()]
    .map(([valor, total]) => ({ valor, total }))
    .sort((a, b) => a.valor.localeCompare(b.valor, 'es'))
}

/** Mantiene visible la opcion elegida aunque los demas filtros la dejen sin resultados. */
function conSeleccion(opciones: Opcion[], seleccion: string): Opcion[] {
  if (seleccion === 'TODOS' || opciones.some((o) => o.valor === seleccion)) return opciones
  return [...opciones, { valor: seleccion, total: 0 }].sort((a, b) => a.valor.localeCompare(b.valor, 'es'))
}

export function GestionCorreosEmpresariales() {
  const router = useRouter()
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoDestinatario>('TODOS')
  const [filtroSector, setFiltroSector] = useState<string>('TODOS')
  const [filtroRazonSocial, setFiltroRazonSocial] = useState<string>('TODOS')
  const [filtroCargo, setFiltroCargo] = useState<string>('TODOS')
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  const { data, isLoading } = useEmpresas('')

  const destinatarios = useMemo<DestinatarioItem[]>(() => {
    if (!data) return []
    const items: DestinatarioItem[] = []

    for (const empresa of data) {
      const sector = sectorDeEmpresa({
        descripcion: empresa.descripcion,
        sector: empresa.sector,
      })
      const ranking = typeof empresa.ranking === 'number' ? empresa.ranking : null

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
          ranking,
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
            ranking,
          })
        }
      }
    }

    return items
  }, [data])

  /**
   * Aplica todos los filtros activos. Con `omitir` se deja uno fuera, para
   * poder calcular las opciones de ese desplegable segun los demas filtros.
   */
  const filtrarDestinatarios = useMemo(() => {
    const termino = buscar.trim().toLowerCase()

    return (omitir?: Filtro) =>
      destinatarios.filter((d) => {
        if (omitir !== 'tipo' && filtroTipo !== 'TODOS' && d.tipo !== filtroTipo) return false
        if (omitir !== 'sector' && filtroSector !== 'TODOS' && d.sector !== filtroSector) return false
        if (omitir !== 'razonSocial' && filtroRazonSocial !== 'TODOS' && d.empresa !== filtroRazonSocial) return false
        if (omitir !== 'cargo' && filtroCargo !== 'TODOS' && d.cargo !== filtroCargo) return false
        if (!termino) return true
        return `${d.nombre} ${d.cargo} ${d.empresa} ${d.email}`.toLowerCase().includes(termino)
      })
  }, [buscar, destinatarios, filtroTipo, filtroSector, filtroRazonSocial, filtroCargo])

  const filtrados = useMemo(() => filtrarDestinatarios(), [filtrarDestinatarios])

  // Sectores CIIU disponibles segun los demas filtros
  const sectoresDisponibles = useMemo(() => {
    const conteo = contar(filtrarDestinatarios('sector'), (d) => d.sector)
    const opciones = ordenarSectores(conteo.keys()).map((valor) => ({ valor, total: conteo.get(valor) ?? 0 }))
    return conSeleccion(opciones, filtroSector)
  }, [filtrarDestinatarios, filtroSector])

  // Razones sociales disponibles segun los demas filtros
  const razonesSocialesDisponibles = useMemo(
    () => conSeleccion(ordenarOpciones(contar(filtrarDestinatarios('razonSocial'), (d) => d.empresa)), filtroRazonSocial),
    [filtrarDestinatarios, filtroRazonSocial]
  )

  // Cargos disponibles segun los demas filtros
  const cargosDisponibles = useMemo(
    () => conSeleccion(ordenarOpciones(contar(filtrarDestinatarios('cargo'), (d) => d.cargo)), filtroCargo),
    [filtrarDestinatarios, filtroCargo]
  )

  const hayFiltrosActivos =
    filtroSector !== 'TODOS' || filtroRazonSocial !== 'TODOS' || filtroCargo !== 'TODOS' || buscar.trim() !== ''

  function limpiarFiltros() {
    setFiltroSector('TODOS')
    setFiltroRazonSocial('TODOS')
    setFiltroCargo('TODOS')
    setBuscar('')
  }

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
          {/* Cabecera: título y contadores */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Users size={18} />
              <h2>Destinatarios ({seleccionados.length})</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                {totalEmpresas} empresa{totalEmpresas === 1 ? '' : 's'} · {totalContactos} contacto{totalContactos === 1 ? '' : 's'}
              </span>
              {hayFiltrosActivos && (
                <>
                  <span className="font-medium text-foreground">{filtrados.length} visibles</span>
                  <button type="button" onClick={limpiarFiltros} className="font-medium text-primary hover:underline">
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filtros: sector CIIU, razón social y cargo */}
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <select
              value={filtroSector}
              onChange={(event) => setFiltroSector(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              aria-label="Filtrar por sector CIIU"
            >
              <option value="TODOS">Todos los sectores CIIU</option>
              {sectoresDisponibles.map(({ valor, total }) => (
                <option key={valor} value={valor}>
                  {valor} ({total})
                </option>
              ))}
            </select>

            <select
              value={filtroRazonSocial}
              onChange={(event) => setFiltroRazonSocial(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              aria-label="Filtrar por razón social"
            >
              <option value="TODOS">Todas las razones sociales</option>
              {razonesSocialesDisponibles.map(({ valor, total }) => (
                <option key={valor} value={valor}>
                  {valor} ({total})
                </option>
              ))}
            </select>

            <select
              value={filtroCargo}
              onChange={(event) => setFiltroCargo(event.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              aria-label="Filtrar por cargo"
            >
              <option value="TODOS">Todos los cargos</option>
              {cargosDisponibles.map(({ valor, total }) => (
                <option key={valor} value={valor}>
                  {valor} ({total})
                </option>
              ))}
            </select>
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
          <div className="grid grid-cols-[32px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_92px_minmax(0,1.3fr)_96px] items-center gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
            <Checkbox
              checked={todosFiltradosSeleccionados}
              onCheckedChange={(valor) => cambiarTodos(valor === true)}
              aria-label="Seleccionar todos los visibles"
            />
            <span>Persona encargada</span>
            <span>Cargo</span>
            <span>Razón social</span>
            <span className="text-center">Ranking</span>
            <span>Correo</span>
            <span className="text-right">Estado</span>
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
                className="grid cursor-pointer grid-cols-[32px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_92px_minmax(0,1.3fr)_96px] items-center gap-2 border-b px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
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
                <span
                  className="flex justify-center"
                  title={destinatario.ranking === null ? 'Sin ranking registrado' : 'Ranking 2025'}
                >
                  {destinatario.ranking === null ? (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  ) : (
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground/80">
                      {destinatario.ranking}
                    </span>
                  )}
                </span>
                <span className="truncate font-mono text-xs text-foreground/90">{destinatario.email}</span>
                <span
                  className={`justify-self-end rounded-full px-2 py-0.5 text-[11px] font-medium ${
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
