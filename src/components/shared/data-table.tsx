"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Columna<T> {
  id: string
  header: ReactNode
  cell: (fila: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columnas: Columna<T>[]
  datos: T[]
  getRowId: (fila: T) => string
  isLoading?: boolean
  emptyMessage?: string
  errorMessage?: string | null
  filasSkeleton?: number
}

export function DataTable<T>({
  columnas,
  datos,
  getRowId,
  isLoading = false,
  emptyMessage = "No hay resultados para los filtros seleccionados.",
  errorMessage = null,
  filasSkeleton = 5,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columnas.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: filasSkeleton }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {columnas.map((col) => (
                  <TableCell key={col.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnas.length}
                className="h-24 text-center text-destructive"
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : datos.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnas.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            datos.map((fila) => (
              <TableRow key={getRowId(fila)}>
                {columnas.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.cell(fila)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface DataTableToolbarProps {
  children: ReactNode
  className?: string
}

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  )
}

function generarRangoPaginas(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const delta = 1
  const range: number[] = []
  const left = page - delta
  const right = page + delta

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i)
    }
  }

  const result: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of range) {
    if (prev && p - prev > 1) result.push("ellipsis")
    result.push(p)
    prev = p
  }
  return result
}

interface DataTablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null

  const paginas = generarRangoPaginas(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {paginas.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-2 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
