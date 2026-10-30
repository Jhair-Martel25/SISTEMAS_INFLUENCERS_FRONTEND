'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Eye, Loader2, Plus, Search, UserPlus, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type Columna,
} from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'

import type { EmpresaBusqueda } from '@/types/empresa'
import { useBuscarEmpresas } from '../hooks/useEmpresas'
import { EmpresaForm } from './EmpresaForm'

const POR_PAGINA = 10

function ubicacion(empresa: EmpresaBusqueda) {
  return (
    [empresa.distrito, empresa.provincia, empresa.departamento]
      .filter(Boolean)
      .join(', ') || '-'
  )
}

/** Listado de empresas de la base corporativa con busqueda server-side. */
export function EmpresaList() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [termino, setTermino] = useState('')
  const [page, setPage] = useState(1)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTermino(busqueda.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  const { data, isLoading, isFetching, isError, error } = useBuscarEmpresas(
    termino,
    50,
  )

  const empresas = useMemo(() => data ?? [], [data])
  const totalPages = Math.max(1, Math.ceil(empresas.length / POR_PAGINA))
  const paginaActual = empresas.slice(
    (page - 1) * POR_PAGINA,
    page * POR_PAGINA,
  )

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : 'No se pudieron cargar las empresas.'
    : null

  const columnas: Columna<EmpresaBusqueda>[] = [
    {
      id: 'empresa',
      header: 'Empresa',
      cell: (empresa) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 size={17} />
          </span>
          <div className="min-w-0">
            <Link
              href={`/empresas/${empresa.id}`}
              className="block truncate font-medium text-foreground transition-colors hover:text-primary"
            >
              {empresa.nombre}
            </Link>
            <p className="text-xs text-muted-foreground">
              {empresa.ruc ? `RUC ${empresa.ruc}` : 'Sin RUC'}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sector',
      header: 'Sector / CIIU',
      cell: (empresa) => (
        <div className="text-sm">
          <p>{empresa.sector || empresa.tipoEmpresaCiiu || '-'}</p>
          {empresa.ciiu && (
            <p className="text-xs text-muted-foreground">CIIU {empresa.ciiu}</p>
          )}
        </div>
      ),
    },
    {
      id: 'ubicacion',
      header: 'Ubicacion',
      cell: (empresa) => (
        <span className="text-sm text-muted-foreground">
          {ubicacion(empresa)}
        </span>
      ),
    },
    {
      id: 'contactos',
      header: 'Contactos',
      cell: (empresa) => (
        <Badge variant={empresa.totalContactos > 0 ? 'secondary' : 'outline'}>
          {empresa.totalContactos}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      className: 'text-right',
      cell: (empresa) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild title="Ver detalle">
            <Link
              href={`/empresas/${empresa.id}`}
              aria-label={`Ver ${empresa.nombre}`}
            >
              <Eye size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Registrar embajador">
            <Link
              href={`/influencers/nuevo?tipo=EMPRESA&empresaId=${empresa.id}`}
              aria-label={`Registrar embajador de ${empresa.nombre}`}
            >
              <UserPlus size={16} className="text-primary" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Base corporativa de empresas y sus contactos para registrar embajadores."
        backHref="/dashboard"
        actions={
          <Button onClick={() => setCreando(true)}>
            <Plus size={16} />
            Nueva empresa
          </Button>
        }
      />

      <DataTableToolbar>
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, RUC o CIIU..."
            className="pl-9 pr-9"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {busqueda && !isFetching && (
            <button
              type="button"
              aria-label="Limpiar busqueda"
              onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {empresas.length}{' '}
          {empresas.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
          {termino ? ` para "${termino}"` : ''}
        </p>
      </DataTableToolbar>

      <DataTable
        columnas={columnas}
        datos={paginaActual}
        getRowId={(empresa) => empresa.id}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={
          termino
            ? 'No hay empresas que coincidan con la busqueda. Puedes registrarla manualmente.'
            : 'Todavia no hay empresas registradas.'
        }
      />

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar empresa</DialogTitle>
            <DialogDescription>
              Agrega una empresa que no existe en la base corporativa.
            </DialogDescription>
          </DialogHeader>
          <EmpresaForm
            onSuccess={(empresa) => {
              setCreando(false)
              router.push(`/empresas/${empresa.id}`)
            }}
            onCancel={() => setCreando(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
