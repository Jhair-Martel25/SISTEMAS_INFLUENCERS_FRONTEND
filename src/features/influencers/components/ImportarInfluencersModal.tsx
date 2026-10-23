"use client"

// Nota: en la interfaz, los "influencers" ahora se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

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
import type {
  FilaErrorImportacion,
  FilaOmitidaImportacion,
  ResultadoImportacionExcel,
} from "@/types/influencer"
import { influencersService } from "../services/influencers.service"
import { useImportarInfluencersExcel } from "../hooks/useInfluencers"

/**
 * Modal para importar embajadores en lote desde la plantilla Excel oficial.
 *
 * - Descarga la plantilla con GET /influencers/plantilla-excel.
 * - Lee el archivo en el navegador solo para mostrar una vista previa y
 *   avisar de errores antes de enviarlo (mismas reglas que el backend).
 * - Envia el archivo completo a POST /influencers/importar-excel (campo
 *   "archivo"). El backend es quien valida e importa: devuelve cuantos se
 *   importaron, los omitidos (ya existian) y los errores por fila.
 */

const EXTENSION_PERMITIDA = ".xlsx"
const TAMANO_MAXIMO_MB = 5
const FILAS_MAXIMAS = 1000
const USUARIO_EJEMPLO = "andreapaz"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Campo =
  | "nombre"
  | "usuarioIg"
  | "linkIg"
  | "email"
  | "biografia"
  | "mensajePersonalizado"
  | "cantidad_post"
  | "seguidores"

/** Encabezados que acepta el backend (normalizados), igual que excel-influencer.util.ts. */
const ALIAS_ENCABEZADOS: Record<string, Campo> = {
  nombre: "nombre",
  usuarioig: "usuarioIg",
  usuario_ig: "usuarioIg",
  usuario: "usuarioIg",
  linkig: "linkIg",
  link_ig: "linkIg",
  link: "linkIg",
  email: "email",
  correo: "email",
  correo_electronico: "email",
  biografia: "biografia",
  bio: "biografia",
  mensaje_personalidado: "mensajePersonalizado",
  mensaje_personalizado: "mensajePersonalizado",
  mensajepersonalizado: "mensajePersonalizado",
  cantidad_post: "cantidad_post",
  cantidadpost: "cantidad_post",
  cantidad_publicaciones: "cantidad_post",
  posts: "cantidad_post",
  seguidores: "seguidores",
  followers: "seguidores",
}

const OBLIGATORIOS: { campo: Campo; etiqueta: string }[] = [
  { campo: "nombre", etiqueta: "Nombre" },
  { campo: "usuarioIg", etiqueta: "UsuarioIg" },
  { campo: "linkIg", etiqueta: "LinkIg" },
]

interface FilaPrevia {
  numeroFila: number
  nombre: string
  usuarioIg: string
  linkIg: string
  seguidores: string
  errores: string[]
}

function normalizarEncabezado(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
}

function normalizarLink(valor: string): string {
  const link = valor.trim()
  if (!link) return ""
  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

function esUrlValida(link: string): boolean {
  try {
    const url = new URL(link)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/** Lee la primera hoja y arma la vista previa con las mismas reglas del backend. */
function leerHoja(libro: XLSX.WorkBook): {
  faltantes: string[]
  filas: FilaPrevia[]
} {
  const hoja = libro.Sheets[libro.SheetNames[0]]
  const matriz = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
    header: 1,
    defval: "",
    blankrows: false,
  })

  const encabezados = (matriz[0] ?? []).map((v) => String(v ?? ""))
  const columnaPorCampo = new Map<Campo, number>()
  encabezados.forEach((encabezado, indice) => {
    const campo = ALIAS_ENCABEZADOS[normalizarEncabezado(encabezado)]
    if (campo && !columnaPorCampo.has(campo)) columnaPorCampo.set(campo, indice)
  })

  const faltantes = OBLIGATORIOS.filter((o) => !columnaPorCampo.has(o.campo)).map(
    (o) => o.etiqueta,
  )
  if (faltantes.length > 0) return { faltantes, filas: [] }

  const usuariosVistos = new Map<string, number>()
  const filas: FilaPrevia[] = []

  matriz.slice(1).forEach((celdas, i) => {
    const valor = (campo: Campo) => {
      const col = columnaPorCampo.get(campo)
      return col === undefined ? "" : String(celdas[col] ?? "").trim()
    }
    const nombre = valor("nombre")
    const usuarioIg = valor("usuarioIg").replace(/^@+/, "").trim()
    const linkIg = normalizarLink(valor("linkIg"))
    const email = valor("email").toLowerCase()
    const seguidores = valor("seguidores")

    if (!nombre && !usuarioIg && !linkIg && !email && !seguidores) return

    const numeroFila = i + 2 // la fila 1 es el encabezado
    const errores: string[] = []
    if (!nombre) errores.push("Falta el nombre")
    if (!usuarioIg) errores.push("Falta el usuario")
    else if (/\s/.test(usuarioIg)) errores.push("El usuario no debe tener espacios")
    if (!linkIg) errores.push("Falta el link")
    else if (!esUrlValida(linkIg)) errores.push("El link no es una URL valida")
    if (email && !EMAIL_REGEX.test(email)) errores.push("Correo con formato invalido")

    const clave = usuarioIg.toLowerCase()
    if (clave && errores.length === 0) {
      const previa = usuariosVistos.get(clave)
      if (previa !== undefined) errores.push(`Usuario repetido (fila ${previa})`)
      else usuariosVistos.set(clave, numeroFila)
    }

    filas.push({ numeroFila, nombre, usuarioIg, linkIg, seguidores, errores })
  })

  return { faltantes: [], filas }
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
  const importar = useImportarInfluencersExcel()

  const [archivo, setArchivo] = useState<File | null>(null)
  const [filas, setFilas] = useState<FilaPrevia[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoImportacionExcel | null>(null)

  const filasValidas = filas.filter((f) => f.errores.length === 0)
  const filasConError = filas.filter((f) => f.errores.length > 0)
  const tieneFilaEjemplo = filas.some((f) => f.usuarioIg.toLowerCase() === USUARIO_EJEMPLO)

  function limpiar() {
    setArchivo(null)
    setFilas([])
    setErrorArchivo(null)
    setResultado(null)
    importar.reset()
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleClose(abierto: boolean) {
    if (!abierto && importar.isPending) return
    if (!abierto) limpiar()
    onOpenChange(abierto)
  }

  async function handleDescargarPlantilla() {
    setDescargando(true)
    try {
      const blob = await influencersService.descargarPlantilla()
      descargarBlob(blob, "plantilla-embajadores.xlsx")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo descargar la plantilla.",
      )
    } finally {
      setDescargando(false)
    }
  }

  function rechazarArchivo(mensaje: string) {
    setErrorArchivo(mensaje)
    setArchivo(null)
    setFilas([])
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleArchivoSeleccionado(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorArchivo(null)
    setFilas([])
    setResultado(null)

    if (!file.name.toLowerCase().endsWith(EXTENSION_PERMITIDA)) {
      rechazarArchivo("Formato no soportado. Usa la plantilla en formato Excel (.xlsx).")
      return
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      rechazarArchivo(`El archivo supera el tamano maximo permitido (${TAMANO_MAXIMO_MB} MB).`)
      return
    }

    setArchivo(file)
    setProcesando(true)
    try {
      const libro = XLSX.read(await file.arrayBuffer(), { type: "array" })
      if (!libro.SheetNames[0]) {
        rechazarArchivo("El archivo no tiene ninguna hoja con datos.")
        return
      }
      const { faltantes, filas: filasLeidas } = leerHoja(libro)
      if (faltantes.length > 0) {
        rechazarArchivo(
          `Faltan columnas obligatorias en la fila 1: ${faltantes.join(", ")}. Descarga la plantilla y usa sus encabezados.`,
        )
        return
      }
      if (filasLeidas.length === 0) {
        rechazarArchivo("El archivo no tiene filas con datos debajo de los encabezados.")
        return
      }
      if (filasLeidas.length > FILAS_MAXIMAS) {
        rechazarArchivo(
          `El archivo tiene ${filasLeidas.length} filas. El limite es ${FILAS_MAXIMAS} por importacion.`,
        )
        return
      }
      setFilas(filasLeidas)
    } catch {
      rechazarArchivo("No se pudo leer el archivo. Confirma que sea un Excel valido y no este danado.")
    } finally {
      setProcesando(false)
    }
  }

  function handleImportar() {
    if (!archivo) return
    setErrorArchivo(null)
    importar.mutate(archivo, {
      onSuccess: (respuesta) => {
        setResultado(respuesta)
        if (respuesta.importados > 0) {
          toast.success(
            respuesta.importados === 1
              ? "Se importo 1 embajador."
              : `Se importaron ${respuesta.importados} embajadores.`,
          )
        } else {
          toast.warning("No se importo ningun embajador. Revisa el detalle.")
        }
      },
      onError: (error) => {
        setErrorArchivo(
          error instanceof Error ? error.message : "No se pudo importar el archivo.",
        )
      },
    })
  }

  const columnasPreview: Columna<FilaPrevia>[] = [
    { id: "fila", header: "Fila", cell: (f) => f.numeroFila, className: "w-14 text-muted-foreground" },
    { id: "nombre", header: "Nombre", cell: (f) => f.nombre || "-" },
    { id: "usuario", header: "Usuario", cell: (f) => (f.usuarioIg ? `@${f.usuarioIg}` : "-") },
    {
      id: "link",
      header: "Link",
      cell: (f) =>
        f.linkIg ? (
          <span className="block max-w-[200px] truncate text-muted-foreground">{f.linkIg}</span>
        ) : (
          "-"
        ),
    },
    { id: "seguidores", header: "Seguidores", cell: (f) => f.seguidores || "-" },
    {
      id: "estado",
      header: "Estado",
      cell: (f) =>
        f.errores.length === 0 ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 size={12} />
            Listo
          </Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit gap-1">
              <AlertCircle size={12} />
              {f.errores.length === 1 ? "1 error" : `${f.errores.length} errores`}
            </Badge>
            <span className="text-xs text-muted-foreground">{f.errores.join("; ")}</span>
          </div>
        ),
    },
  ]

  const columnasOmitidos: Columna<FilaOmitidaImportacion>[] = [
    { id: "fila", header: "Fila", cell: (f) => f.fila, className: "w-14 text-muted-foreground" },
    { id: "usuario", header: "Usuario", cell: (f) => `@${f.usuarioIg}` },
    { id: "motivo", header: "Motivo", cell: (f) => f.motivo },
  ]

  const columnasErrores: Columna<FilaErrorImportacion>[] = [
    { id: "fila", header: "Fila", cell: (f) => f.fila, className: "w-14 text-muted-foreground" },
    { id: "campo", header: "Campo", cell: (f) => f.campo },
    { id: "mensaje", header: "Detalle", cell: (f) => f.mensaje },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar embajadores</DialogTitle>
          <DialogDescription>
            Descarga la plantilla, completala y subela en formato .xlsx. Nombre,
            UsuarioIg y LinkIg son obligatorios; el resto de columnas son
            opcionales. Los embajadores se registran como Instagram y en estado
            Pendiente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          {!resultado && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Usa siempre la plantilla oficial y borra la fila de ejemplo antes de subirla.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDescargarPlantilla}
                disabled={descargando}
              >
                {descargando ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Descargar plantilla
              </Button>
            </div>
          )}

          {!resultado &&
            (!archivo ? (
              <label
                htmlFor="archivo-importar"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <Upload size={28} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Haz clic para elegir un archivo</p>
                <p className="text-xs text-muted-foreground">
                  Formato aceptado: {EXTENSION_PERMITIDA} (maximo {TAMANO_MAXIMO_MB} MB y {FILAS_MAXIMAS} filas)
                </p>
                <input
                  id="archivo-importar"
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleArchivoSeleccionado}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileSpreadsheet size={18} className="shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium text-foreground">{archivo.name}</span>
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
                  disabled={importar.isPending}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}

          {errorArchivo && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorArchivo}</span>
            </div>
          )}

          {procesando && <p className="text-center text-sm text-muted-foreground">Leyendo archivo...</p>}

          {!resultado && filas.length > 0 && !procesando && (
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
                <span className="text-muted-foreground">de {filas.length} filas encontradas</span>
              </div>

              {tieneFilaEjemplo && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    El archivo todavia tiene la fila de ejemplo (@{USUARIO_EJEMPLO}). Borrala para no
                    registrarla como embajador.
                  </span>
                </div>
              )}

              <div className="max-h-72 overflow-y-auto">
                <DataTable
                  columnas={columnasPreview}
                  datos={filas}
                  getRowId={(f) => String(f.numeroFila)}
                />
              </div>
            </div>
          )}

          {resultado && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ResumenItem etiqueta="Filas leidas" valor={resultado.totalFilas} />
                <ResumenItem etiqueta="Importados" valor={resultado.importados} destacado />
                <ResumenItem etiqueta="Omitidos" valor={resultado.omitidos.length} />
                <ResumenItem etiqueta="Con errores" valor={resultado.errores.length} />
              </div>

              {resultado.omitidos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Omitidos (ya existian en el sistema)</p>
                  <DataTable
                    columnas={columnasOmitidos}
                    datos={resultado.omitidos}
                    getRowId={(f) => `omitido-${f.fila}`}
                  />
                </div>
              )}

              {resultado.errores.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Filas con errores (no se importaron)</p>
                  <DataTable
                    columnas={columnasErrores}
                    datos={resultado.errores}
                    getRowId={(f) => `error-${f.fila}-${f.campo}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Corrige esas filas en tu Excel y vuelve a subirlo: las que ya se importaron
                    apareceran como omitidas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          {resultado ? (
            <>
              <Button type="button" variant="outline" onClick={limpiar}>
                Importar otro archivo
              </Button>
              <Button type="button" onClick={() => handleClose(false)}>
                Listo
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={importar.isPending}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleImportar}
                disabled={!archivo || filasValidas.length === 0 || procesando || importar.isPending}
              >
                {importar.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {importar.isPending
                  ? "Importando..."
                  : `Importar ${filasValidas.length > 0 ? `${filasValidas.length} ` : ""}embajadores`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResumenItem({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string
  valor: number
  destacado?: boolean
}) {
  return (
    <div
      className={
        destacado
          ? "rounded-lg border border-primary/30 bg-primary/5 px-3 py-2"
          : "rounded-lg border border-border px-3 py-2"
      }
    >
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="text-xl font-semibold text-foreground">{valor}</p>
    </div>
  )
}
