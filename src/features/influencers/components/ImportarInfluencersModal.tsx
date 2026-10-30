"use client"

import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
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

import { ESTADO_VALIDACION } from "@/types/api"
import { TIPO_EMBAJADOR, type CrearEmpresaInput } from "@/types/empresa"
import { empresasService } from "@/features/empresas/services/empresas.service"
import { influencersService } from "../services/influencers.service"

const EXTENSIONES_PERMITIDAS = [".csv", ".xlsx", ".xls"]
const TAMANO_MAXIMO_MB = 10
const FILAS_MAXIMAS = 500

type CampoImportable =
  | "empresa"
  | "contacto"
  | "ruc"
  | "ciiu"
  | "descripcion"
  | "cargo"
  | "area"
  | "ubigeo"
  | "email"
  | "phone"
  | "mensajePersonalizado"

export interface FilaImportadaEmpresa {
  numeroFila: number
  empresa: string
  contacto: string
  ruc: string
  ciiu: string
  descripcion: string
  cargo: string
  area: string
  ubigeo: string
  email: string
  phone: string
  mensajePersonalizado: string
  errores: string[]
  incompleto: boolean
  formato: boolean
  duplicadoArchivo: boolean
  existeEnSistema: boolean
}

const ALIAS_COLUMNAS: Record<
  CampoImportable,
  string[]
> = {
  empresa: [
    "empresa",
    "nombreempresa",
    "razonsocial",
    "razon_social",
    "compania",
    "company",
    "nombre",
  ],
  contacto: [
    "contacto",
    "contact",
    "funcionario",
    "representante",
    "nombredelcontacto",
    "nombrecompleto",
    "nombres",
  ],
  ruc: ["ruc", "rucempresa", "identificacion", "documento", "nitoruc"],
  ciiu: ["ciiu", "codigociiu", "codigo_ciiu", "actividadeconomica"],
  descripcion: [
    "descripcion",
    "rubro",
    "giro",
    "actividad",
    "descripciondelaempresa",
  ],
  cargo: ["cargo", "puesto", "posicion", "ocupacion"],
  area: ["area", "departamento", "seccion", "gerencia"],
  ubigeo: ["ubigeo", "codigoubigeo", "codigo_ubigeo"],
  email: [
    "correoelectronico",
    "correo",
    "email",
    "mail",
    "emailcorporativo",
    "correocongenerico",
  ],
  phone: ["telefono", "celular", "phone", "tel", "whatsapp", "telefono1"],
  mensajePersonalizado: [
    "mensajepersonalizado",
    "mensaje",
    "custommessage",
    "nota",
    "observacion",
  ],
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

function construirIndiceColumnas(): Map<string, CampoImportable> {
  const indice = new Map<string, CampoImportable>()
  for (const [campo, alias] of Object.entries(ALIAS_COLUMNAS)) {
    for (const nombreAlias of alias) {
      indice.set(nombreAlias, campo as CampoImportable)
    }
  }
  return indice
}

const CAMPOS_OBLIGATORIOS: { campo: CampoImportable; etiqueta: string }[] = [
  { campo: "empresa", etiqueta: "Empresa" },
  { campo: "contacto", etiqueta: "Contacto" },
  { campo: "ruc", etiqueta: "RUC" },
  { campo: "ciiu", etiqueta: "CIIU" },
  { campo: "descripcion", etiqueta: "Descripción" },
  { campo: "cargo", etiqueta: "Cargo" },
  { campo: "area", etiqueta: "Área" },
  { campo: "ubigeo", etiqueta: "Ubigeo" },
  { campo: "email", etiqueta: "Correo electrónico" },
  { campo: "phone", etiqueta: "Teléfono" },
]

function mapearFila(
  filaOriginal: Record<string, unknown>,
  indiceColumnas: Map<string, CampoImportable>,
  numeroFila: number,
): FilaImportadaEmpresa {
  const valores: Record<string, string> = {
    empresa: "",
    contacto: "",
    ruc: "",
    ciiu: "",
    descripcion: "",
    cargo: "",
    area: "",
    ubigeo: "",
    email: "",
    phone: "",
    mensajePersonalizado: "",
  }

  for (const [headerOriginal, valorCelda] of Object.entries(filaOriginal)) {
    const headerNormalizado = normalizarTexto(headerOriginal)
    const campo = indiceColumnas.get(headerNormalizado)
    if (campo) {
      valores[campo] = String(valorCelda ?? "").trim()
    }
  }

  const errores: string[] = []
  const faltantes = CAMPOS_OBLIGATORIOS.filter(({ campo }) => !valores[campo]).map(
    ({ etiqueta }) => etiqueta,
  )
  if (faltantes.length > 0) {
    errores.push(`Faltan datos obligatorios: ${faltantes.join(", ")}`)
  }

  let formato = false
  const rucDigitos = valores.ruc.replace(/\D/g, "")
  if (valores.ruc && rucDigitos.length !== 11) {
    errores.push("El RUC debe tener 11 dígitos")
    formato = true
  }
  if (valores.ubigeo && !/^\d{6}$/.test(valores.ubigeo)) {
    errores.push("El ubigeo debe tener 6 dígitos")
    formato = true
  }
  if (valores.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) {
    errores.push("El correo no tiene un formato válido")
    formato = true
  }

  return {
    numeroFila,
    empresa: valores.empresa,
    contacto: valores.contacto,
    ruc: valores.ruc,
    ciiu: valores.ciiu,
    descripcion: valores.descripcion,
    cargo: valores.cargo,
    area: valores.area,
    ubigeo: valores.ubigeo,
    email: valores.email,
    phone: valores.phone,
    mensajePersonalizado: valores.mensajePersonalizado,
    errores,
    incompleto: faltantes.length > 0,
    formato,
    duplicadoArchivo: false,
    existeEnSistema: false,
  }
}

const ENCABEZADOS_PLANTILLA = [
  "Empresa",
  "Contacto",
  "RUC",
  "CIIU",
  "Descripción",
  "Cargo",
  "Área",
  "Ubigeo",
  "Correo electrónico",
  "Teléfono",
  "Mensaje personalizado",
]

const INSTRUCCIONES_PLANTILLA = [
  ["Campo", "Obligatorio", "Formato"],
  ["Empresa", "Sí", "Razón social de la empresa"],
  ["Contacto", "Sí", "Nombre de la persona de contacto"],
  ["RUC", "Sí", "11 dígitos"],
  ["CIIU", "Sí", "Código CIIU de la actividad"],
  ["Descripción", "Sí", "Giro o rubro de la empresa"],
  ["Cargo", "Sí", "Cargo del contacto"],
  ["Área", "Sí", "Área del contacto"],
  ["Ubigeo", "Sí", "Código de 6 dígitos"],
  ["Correo electrónico", "Sí", "Correo válido, por ejemplo nombre@empresa.com"],
  ["Teléfono", "Sí", "Número de contacto"],
  ["Mensaje personalizado", "No", "Texto opcional, máximo 1000 caracteres"],
]

function descargarPlantilla() {
  const libro = XLSX.utils.book_new()
  const hoja = XLSX.utils.aoa_to_sheet([ENCABEZADOS_PLANTILLA])
  hoja["!cols"] = ENCABEZADOS_PLANTILLA.map(() => ({ wch: 22 }))
  XLSX.utils.book_append_sheet(libro, hoja, "Empresas")
  const instrucciones = XLSX.utils.aoa_to_sheet(INSTRUCCIONES_PLANTILLA)
  instrucciones["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(libro, instrucciones, "Instrucciones")
  XLSX.writeFile(libro, "plantilla_empresas_embajadoras.xlsx")
}

function marcarDuplicadosEnArchivo(
  filas: FilaImportadaEmpresa[],
): FilaImportadaEmpresa[] {
  const normalizarRuc = (f: FilaImportadaEmpresa) => f.ruc.replace(/\D/g, "")
  const normalizarEmail = (f: FilaImportadaEmpresa) => f.email.trim().toLowerCase()

  const contarRuc = new Map<string, number>()
  const contarEmail = new Map<string, number>()
  for (const f of filas) {
    const r = normalizarRuc(f)
    const e = normalizarEmail(f)
    if (r) contarRuc.set(r, (contarRuc.get(r) ?? 0) + 1)
    if (e) contarEmail.set(e, (contarEmail.get(e) ?? 0) + 1)
  }

  return filas.map((f) => {
    const r = normalizarRuc(f)
    const e = normalizarEmail(f)
    const repetidoRuc = r !== "" && (contarRuc.get(r) ?? 0) > 1
    const repetidoEmail = e !== "" && (contarEmail.get(e) ?? 0) > 1
    if (!repetidoRuc && !repetidoEmail) return f
    const motivo = repetidoRuc ? "RUC repetido en el archivo" : "Correo repetido en el archivo"
    return {
      ...f,
      duplicadoArchivo: true,
      errores: [...f.errores, motivo],
    }
  })
}

async function marcarExistentesEnSistema(
  filas: FilaImportadaEmpresa[],
): Promise<FilaImportadaEmpresa[]> {
  const rucs = Array.from(
    new Set(
      filas
        .map((f) => f.ruc.replace(/\D/g, ""))
        .filter((r) => r.length === 11),
    ),
  )

  const existentes = new Set<string>()
  const TAMANO_LOTE = 10
  for (let i = 0; i < rucs.length; i += TAMANO_LOTE) {
    const lote = rucs.slice(i, i + TAMANO_LOTE)
    const resultados = await Promise.allSettled(
      lote.map((ruc) => empresasService.obtenerPorRuc(ruc)),
    )
    resultados.forEach((res, idx) => {
      if (res.status === "fulfilled" && res.value?.id) {
        existentes.add(lote[idx])
      }
    })
  }

  return filas.map((f) => ({
    ...f,
    existeEnSistema: existentes.has(f.ruc.replace(/\D/g, "")),
  }))
}

function descargarFilasNoImportadas(filasOmitidas: FilaImportadaEmpresa[]) {
  const encabezados = [...ENCABEZADOS_PLANTILLA, "Motivo"]
  const datos = filasOmitidas.map((f) => [
    f.empresa,
    f.contacto,
    f.ruc,
    f.ciiu,
    f.descripcion,
    f.cargo,
    f.area,
    f.ubigeo,
    f.email,
    f.phone,
    f.mensajePersonalizado,
    f.existeEnSistema ? "Ya existe en el sistema" : f.errores.join("; "),
  ])
  const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...datos])
  hoja["!cols"] = encabezados.map(() => ({ wch: 22 }))
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, "Filas no importadas")
  XLSX.writeFile(libro, "filas_no_importadas.xlsx")
}

interface ImportarInfluencersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportarInfluencersModal({
  open,
  onOpenChange,
}: ImportarInfluencersModalProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [archivo, setArchivo] = useState<File | null>(null)
  const [filas, setFilas] = useState<FilaImportadaEmpresa[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const [leyendoArchivo, setLeyendoArchivo] = useState(false)
  const [importando, setImportando] = useState(false)
  const [progresoTexto, setProgresoTexto] = useState("")
  const [confirmando, setConfirmando] = useState(false)

  const filasValidas = filas.filter(
    (f) => f.errores.length === 0 && !f.existeEnSistema,
  )
  const filasConError = filas.filter((f) => f.errores.length > 0)
  const filasYaExisten = filas.filter((f) => f.existeEnSistema)
  const filasNoImportadas = filas.filter((f) => !filasValidas.includes(f))
  const contadorIncompletos = filas.filter((f) => f.incompleto).length
  const contadorFormato = filas.filter((f) => f.formato).length
  const contadorDuplicadosArchivo = filas.filter((f) => f.duplicadoArchivo).length

  function limpiar() {
    setArchivo(null)
    setFilas([])
    setErrorArchivo(null)
    setProgresoTexto("")
    setConfirmando(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleClose(abrir: boolean) {
    if (!abrir && !importando) {
      limpiar()
      onOpenChange(false)
    }
  }

  async function handleArchivoSeleccionado(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
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
      setErrorArchivo(
        `El archivo supera el tamaño máximo permitido (${TAMANO_MAXIMO_MB} MB).`,
      )
      setArchivo(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setArchivo(file)
    setLeyendoArchivo(true)

    try {
      const buffer = await file.arrayBuffer()
      const libro = XLSX.read(buffer, { type: "array" })
      const primeraHoja = libro.SheetNames[0]

      if (!primeraHoja) {
        setErrorArchivo("El archivo no tiene ninguna hoja con datos.")
        setLeyendoArchivo(false)
        return
      }

      const filasCrudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        libro.Sheets[primeraHoja],
        { defval: "" },
      )

      if (filasCrudas.length === 0) {
        setErrorArchivo(
          "El archivo no tiene filas con datos (o falta la fila de encabezados).",
        )
        setLeyendoArchivo(false)
        return
      }

      if (filasCrudas.length > FILAS_MAXIMAS) {
        setErrorArchivo(
          `El archivo tiene ${filasCrudas.length} filas. Por ahora el límite es ${FILAS_MAXIMAS} por importación.`,
        )
        setLeyendoArchivo(false)
        return
      }

      const indiceColumnas = construirIndiceColumnas()
      const filasMapeadas = filasCrudas.map((fila, i) =>
        mapearFila(fila, indiceColumnas, i + 2),
      )

      setFilas(
        await marcarExistentesEnSistema(marcarDuplicadosEnArchivo(filasMapeadas)),
      )
    } catch {
      setErrorArchivo(
        "No se pudo leer el archivo. Confirma que sea un CSV o Excel válido y no esté dañado.",
      )
    } finally {
      setLeyendoArchivo(false)
    }
  }

  async function handleImportar() {
    if (filasValidas.length === 0 || importando) return

    setImportando(true)
    setConfirmando(false)
    setErrorArchivo(null)

    let exitosos = 0
    const errores: string[] = []

    for (let i = 0; i < filasValidas.length; i++) {
      const fila = filasValidas[i]
      setProgresoTexto(
        `Importando ${i + 1} de ${filasValidas.length}: ${fila.empresa}...`,
      )

      try {
        let empresaId: string | undefined
        let nuevaEmpresa: CrearEmpresaInput | undefined

        const rucLimpio = fila.ruc ? fila.ruc.replace(/\D/g, "") : ""

        if (rucLimpio) {
          try {
            const existente = await empresasService.obtenerPorRuc(rucLimpio)
            if (existente?.id) {
              empresaId = existente.id
            }
          } catch {
            // Si no existe, se registrará como nueva
          }
        }

        if (!empresaId) {
          try {
            const busqueda = await empresasService.buscar({
              q: fila.empresa.trim(),
              limite: 5,
            })
            const coincidencia = busqueda.find(
              (b) =>
                b.nombre.trim().toLowerCase() ===
                fila.empresa.trim().toLowerCase(),
            )
            if (coincidencia?.id) {
              empresaId = coincidencia.id
            }
          } catch {
            // Continuar
          }
        }

        if (!empresaId) {
          nuevaEmpresa = {
            nombre: fila.empresa.trim(),
            ruc: rucLimpio || undefined,
            ciiu: fila.ciiu?.trim() || undefined,
            descripcion: fila.descripcion?.trim() || undefined,
            ubigeo: fila.ubigeo?.trim() || undefined,
            emailCorporativo: fila.email?.trim() || undefined,
            telefono1: fila.phone?.trim() || undefined,
            contactos: fila.contacto?.trim()
              ? [
                  {
                    nombres: fila.contacto.trim(),
                    cargo: fila.cargo?.trim() || undefined,
                    area: fila.area?.trim() || undefined,
                    email: fila.email?.trim() || undefined,
                    telefono: fila.phone?.trim() || undefined,
                    principal: true,
                  },
                ]
              : [],
          }
        }

        const handleSugerido = rucLimpio
          ? `empresa_${rucLimpio}`
          : `empresa_${fila.empresa
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_")
              .slice(0, 20)}`

        await influencersService.crear({
          tipoEmbajador: TIPO_EMBAJADOR.EMPRESA,
          empresaId,
          nuevaEmpresa,
          nombre: fila.contacto?.trim() || fila.empresa.trim(),
          usuarioIg: handleSugerido,
          linkIg: `https://instagram.com/${handleSugerido}`,
          empresa: fila.empresa.trim(),
          ruc: rucLimpio || undefined,
          ciiu: fila.ciiu?.trim() || undefined,
          descripcion: fila.descripcion?.trim() || undefined,
          cargo: fila.cargo?.trim() || undefined,
          area: fila.area?.trim() || undefined,
          ubigeo: fila.ubigeo?.trim() || undefined,
          email: fila.email?.trim() || undefined,
          phone: fila.phone?.trim() || undefined,
          mensajePersonalizado: fila.mensajePersonalizado?.trim() || undefined,
          estadoValidacion: ESTADO_VALIDACION.VALIDADO,
        })

        exitosos++
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al registrar"
        errores.push(`Fila ${fila.numeroFila} (${fila.empresa}): ${msg}`)
      }
    }

    setImportando(false)
    setProgresoTexto("")

    queryClient.invalidateQueries({ queryKey: ["influencers"] })
    queryClient.invalidateQueries({ queryKey: ["empresas"] })

    if (exitosos > 0) {
      toast.success(
        `Se importaron ${exitosos} empresa(s) embajadora(s) correctamente.`,
      )
    }

    if (errores.length > 0) {
      toast.error(
        `Hubo inconvenientes en ${errores.length} fila(s).`,
        {
          description: errores.slice(0, 3).join("\n"),
        },
      )
    }

    if (exitosos > 0 && errores.length === 0) {
      handleClose(false)
    }
  }

  const columnasPreview: Columna<FilaImportadaEmpresa>[] = [
    {
      id: "fila",
      header: "Fila",
      cell: (fila) => fila.numeroFila,
      className: "w-14 text-muted-foreground",
    },
    {
      id: "empresa",
      header: "Empresa",
      cell: (fila) => (
        <span className="font-medium text-foreground">
          {fila.empresa || "-"}
        </span>
      ),
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (fila) => fila.contacto || "-",
    },
    {
      id: "ruc",
      header: "RUC",
      cell: (fila) => (
        <span className="font-mono text-xs text-foreground">
          {fila.ruc || "-"}
        </span>
      ),
    },
    {
      id: "ciiu",
      header: "CIIU",
      cell: (fila) => (
        <span className="font-mono text-xs text-foreground">
          {fila.ciiu || "-"}
        </span>
      ),
    },
    {
      id: "ubigeo",
      header: "Ubigeo",
      cell: (fila) => fila.ubigeo || "-",
    },
    {
      id: "correo",
      header: "Correo",
      cell: (fila) => (
        <span className="block max-w-[180px] truncate text-muted-foreground">
          {fila.email || "-"}
        </span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: (fila) =>
        fila.existeEnSistema ? (
          <Badge variant="secondary" className="w-fit">
            Ya existe en el sistema
          </Badge>
        ) : fila.errores.length === 0 ? (
          <Badge
            variant="default"
            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 size={12} />
            Listo
          </Badge>
        ) : (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive" className="w-fit gap-1">
              <AlertCircle size={12} />
              {fila.errores.length === 1
                ? "1 error"
                : `${fila.errores.length} errores`}
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
      <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar empresas embajadoras</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV o Excel con tus empresas. Columnas reconocidas:
            Empresa, Contacto, RUC, CIIU, Descripción, Cargo, Área, Ubigeo,
            Correo electrónico, Teléfono y Mensaje personalizado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={descargarPlantilla}>
              <Download size={14} />
              Descargar plantilla
            </Button>
          </div>

          {!archivo ? (
            <label
              htmlFor="archivo-importar-empresas"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <Upload size={28} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Haz clic para elegir un archivo Excel o CSV
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: {EXTENSIONES_PERMITIDAS.join(", ")} (máximo{" "}
                {TAMANO_MAXIMO_MB} MB)
              </p>
              <input
                id="archivo-importar-empresas"
                ref={inputRef}
                type="file"
                accept={EXTENSIONES_PERMITIDAS.join(",")}
                className="hidden"
                disabled={importando}
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
              {!importando && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar archivo"
                  onClick={limpiar}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          )}

          {errorArchivo && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorArchivo}</span>
            </div>
          )}

          {leyendoArchivo && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              <span>Leyendo archivo...</span>
            </div>
          )}

          {filas.length > 0 && !leyendoArchivo && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="default"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 size={12} />
                    {filasValidas.length} listos
                  </Badge>
                  {contadorIncompletos > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle size={12} />
                      {contadorIncompletos} incompletos
                    </Badge>
                  )}
                  {contadorFormato > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle size={12} />
                      {contadorFormato} con formato incorrecto
                    </Badge>
                  )}
                  {contadorDuplicadosArchivo > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle size={12} />
                      {contadorDuplicadosArchivo} repetidos en el archivo
                    </Badge>
                  )}
                  {filasYaExisten.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {filasYaExisten.length} ya existen en el sistema
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    de {filas.length} filas leídas
                  </span>
                </div>
                {importando && (
                  <span className="text-xs font-medium text-primary animate-pulse">
                    {progresoTexto}
                  </span>
                )}
              </div>

              {filasNoImportadas.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => descargarFilasNoImportadas(filasNoImportadas)}
                  >
                    <Download size={14} />
                    Descargar filas no importadas ({filasNoImportadas.length})
                  </Button>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto rounded-lg border">
                <DataTable
                  columnas={columnasPreview}
                  datos={filas}
                  getRowId={(fila) => String(fila.numeroFila)}
                />
              </div>
            </div>
          )}
          {confirmando && (
            <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Vas a importar {filasValidas.length} empresa(s) al sistema.
              </p>
              <p className="text-xs text-muted-foreground">
                Se omiten {filasYaExisten.length} que ya existen y {filasConError.length} con errores o repetidos.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirmando(false)}>
                  Volver
                </Button>
                <Button type="button" size="sm" onClick={handleImportar}>
                  Confirmar importación
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {filasValidas.length > 0
              ? "Solo se importan las filas listas. Las repetidas o que ya existen en el sistema se omiten."
              : "Selecciona un archivo con datos de empresas para comenzar."}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={importando}
              onClick={() => handleClose(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              disabled={filasValidas.length === 0 || importando}
              onClick={() => setConfirmando(true)}
            >
              {importando ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Importar {filasValidas.length > 0 ? `${filasValidas.length} ` : ""}
                  empresas
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
