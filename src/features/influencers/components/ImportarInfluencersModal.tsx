"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable, type Columna } from "@/components/shared/data-table"

/**
 * Modal para importar influencers en lote desde un archivo CSV o Excel.
 *
 * Por ahora esto es SOLO interfaz: lee y valida el archivo del lado del
 * cliente y muestra una vista previa, pero el boton final de importar no
 * llama a ningun endpoint todavia (no existe un endpoint de importacion
 * masiva confirmado en el backend). Queda listo para conectar en cuanto
 * el backend lo tenga.
 */

const EXTENSIONES_PERMITIDAS = [".csv", ".xlsx", ".xls"]
const TAMANO_MAXIMO_MB = 5
const FILAS_MAXIMAS = 500

interface FilaImportada {
  numeroFila: number
  nombre: string
  usuarioIg: string
  linkIg: string
  email: string
  phone: string
  seguidores: string
  cantidad_post: string
  biografia: string
  errores: string[]
}

const ALIAS_COLUMNAS: Record<keyof Omit<FilaImportada, "numeroFila" | "errores">, string[]> = {
  nombre: ["nombre", "name", "nombrecompleto"],
  usuarioIg: ["usuario", "usuarioig", "instagram", "handle", "usuarioinstagram", "usuariodeinstagram"],
  linkIg: ["link", "linkig", "url", "perfil", "linkperfil", "enlace", "linkdeperfil"],
  email: ["email", "correo", "correoelectronico"],
  phone: ["telefono", "phone", "celular", "whatsapp"],
  seguidores: ["seguidores", "followers"],
  cantidad_post: ["publicaciones", "posts", "cantidadpost", "cantidaddepost"],
  biografia: ["biografia", "bio", "descripcion"],
}

function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function extensionValida(nombreArchivo: string): boolean {
  const nombreEnMinusculas = nombreArchivo.toLowerCase()
  return EXTENSIONES_PERMITIDAS.some((ext) => nombreEnMinusculas.endsWith(ext))
}

function mapearFila(
  filaOriginal: Record<string, unknown>,
  indiceColumnas: Map<string, string>,
  numeroFila: number,
): FilaImportada {
  const valores: Record<string, string> = {
    nombre: "",
    usuarioIg: "",
    linkIg: "",
    email: "",
    phone: "",
    seguidores: "",
    cantidad_post: "",
    biografia: "",
  }

  for (const [headerOriginal, valorCelda] of Object.entries(filaOriginal)) {
    const headerNormalizado = normalizarTexto(headerOriginal)
    const campo = indiceColumnas.get(headerNormalizado)
    if (campo) {
      valores[campo] = String(valorCelda ?? "").trim()
    }
  }

  const errores: string[] = []
  if (!valores.nombre) errores.push("Falta el nombre")
  if (!valores.usuarioIg) errores.push("Falta el usuario de Instagram")
  if (!valores.linkIg) {
    errores.push("Falta el link del perfil")
  } else if (!/^https?:\/\/.+/i.test(valores.linkIg)) {
    errores.push("El link del perfil no parece una URL valida")
  }

  return {
    numeroFila,
    nombre: valores.nombre,
    usuarioIg: valores.usuarioIg.replace(/^@+/, ""),
    linkIg: valores.linkIg,
    email: valores.email,
    phone: valores.phone,
    seguidores: valores.seguidores,
    cantidad_post: valores.cantidad_post,
    biografia: valores.biografia,
    errores,
  }
}

function construirIndiceColumnas(): Map<string, string> {
  const indice = new Map<string, string>()
  for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
    for (const nombreAlias of alias) {
      indice.set(nombreAlias, campo)
    }
  }
  return indice
}

interface ImportarInfluencersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportarInfluencersModal({
  open,
  onOpenChange,
}: ImportarInfluencersModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [archivo, setArchivo] = useState<File | null>(null)
  const [filas, setFilas] = useState<FilaImportada[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)

  const filasValidas = filas.filter((f) => f.errores.length === 0)
  const filasConError = filas.filter((f) => f.errores.length > 0)

  function limpiar() {
    setArchivo(null)
    setFilas([])
    setErrorArchivo(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleClose(open: boolean) {
    if (!open) limpiar()
    onOpenChange(open)
  }

  async function handleArchivoSeleccionado(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorArchivo(null)
    setFilas([])

    if (!extensionValida(file.name)) {
      setErrorArchivo(
        `Formato no soportado. Usa un archivo ${EXTENSIONES_PERMITIDAS.join(", ")}.`,
      )
      setArchivo(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setErrorArchivo(`El archivo supera el tamano maximo permitido (${TAMANO_MAXIMO_MB} MB).`)
      setArchivo(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setArchivo(file)
    setProcesando(true)

    try {
      const buffer = await file.arrayBuffer()
      const libro = XLSX.read(buffer, { type: "array" })
      const primeraHoja = libro.SheetNames[0]

      if (!primeraHoja) {
        setErrorArchivo("El archivo no tiene ninguna hoja con datos.")
        setProcesando(false)
        return
      }

      const filasCrudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        libro.Sheets[primeraHoja],
        { defval: "" },
      )

      if (filasCrudas.length === 0) {
        setErrorArchivo("El archivo no tiene filas con datos (o falta la fila de encabezados).")
        setProcesando(false)
        return
      }

      if (filasCrudas.length > FILAS_MAXIMAS) {
        setErrorArchivo(
          `El archivo tiene ${filasCrudas.length} filas. Por ahora el limite es ${FILAS_MAXIMAS} por importacion.`,
        )
        setProcesando(false)
        return
      }

      const indiceColumnas = construirIndiceColumnas()
      const filasMapeadas = filasCrudas.map((fila, i) =>
        mapearFila(fila, indiceColumnas, i + 2), // +2: fila 1 es encabezado
      )

      setFilas(filasMapeadas)
    } catch {
      setErrorArchivo(
        "No se pudo leer el archivo. Confirma que sea un CSV o Excel valido y no este danado.",
      )
    } finally {
      setProcesando(false)
    }
  }

  const columnasPreview: Columna<FilaImportada>[] = [
    {
      id: "fila",
      header: "Fila",
      cell: (fila) => fila.numeroFila,
      className: "w-14 text-muted-foreground",
    },
    {
      id: "nombre",
      header: "Nombre",
      cell: (fila) => fila.nombre || "-",
    },
    {
      id: "usuario",
      header: "Usuario IG",
      cell: (fila) => (fila.usuarioIg ? `@${fila.usuarioIg}` : "-"),
    },
    {
      id: "link",
      header: "Link",
      cell: (fila) =>
        fila.linkIg ? (
          <span className="block max-w-[220px] truncate text-muted-foreground">
            {fila.linkIg}
          </span>
        ) : (
          "-"
        ),
    },
    {
      id: "seguidores",
      header: "Seguidores",
      cell: (fila) => fila.seguidores || "-",
    },
    {
      id: "estado",
      header: "Estado",
      cell: (fila) =>
        fila.errores.length === 0 ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 size={12} />
            Listo
          </Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit gap-1">
              <AlertCircle size={12} />
              {fila.errores.length === 1 ? "1 error" : `${fila.errores.length} errores`}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {fila.errores.join("; ")}
            </span>
          </div>
        ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar influencers</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV o Excel con tus influencers. Columnas
            reconocidas: nombre, usuario de Instagram, link del perfil
            (obligatorias), y opcionalmente correo, telefono, seguidores,
            publicaciones y biografia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!archivo ? (
            <label
              htmlFor="archivo-importar"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <Upload size={28} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Haz clic para elegir un archivo
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: {EXTENSIONES_PERMITIDAS.join(", ")} (maximo{" "}
                {TAMANO_MAXIMO_MB} MB)
              </p>
              <input
                id="archivo-importar"
                ref={inputRef}
                type="file"
                accept={EXTENSIONES_PERMITIDAS.join(",")}
                className="hidden"
                onChange={handleArchivoSeleccionado}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet size={18} className="shrink-0 text-primary" />
                <span className="truncate text-sm font-medium text-foreground">
                  {archivo.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ({(archivo.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar archivo"
                onClick={limpiar}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {errorArchivo && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorArchivo}</span>
            </div>
          )}

          {procesando && (
            <p className="text-center text-sm text-muted-foreground">
              Leyendo archivo...
            </p>
          )}

          {filas.length > 0 && !procesando && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 size={12} />
                  {filasValidas.length} listos
                </Badge>
                {filasConError.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle size={12} />
                    {filasConError.length} con errores
                  </Badge>
                )}
                <span className="text-muted-foreground">
                  de {filas.length} filas encontradas
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <DataTable
                  columnas={columnasPreview}
                  datos={filas}
                  getRowId={(fila) => String(fila.numeroFila)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          {filas.length > 0 && !procesando && (
            <p className="text-center text-xs text-muted-foreground">
              La importacion todavia no esta conectada al backend. Esta vista
              previa confirma que tu archivo esta listo para cuando el
              endpoint de importacion masiva este disponible.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cerrar
            </Button>
            <Button type="button" disabled={filasValidas.length === 0}>
              <Upload size={16} />
              Importar {filasValidas.length > 0 ? `${filasValidas.length} ` : ""}
              influencers
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}