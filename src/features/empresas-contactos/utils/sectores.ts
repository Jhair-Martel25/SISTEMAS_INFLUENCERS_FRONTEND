import { DESCRIPCION_A_DIVISION } from './descripciones-ciiu'

export const SIN_SECTOR = 'Sin sector'
export const OTROS_SECTOR = 'Otros'

/**
 * Agrupación de los códigos CIIU (los 2 primeros dígitos) en sectores
 * para el filtro de destinatarios.
 */
const GRUPOS_CIIU: { nombre: string; desde: number; hasta: number }[] = [
  { nombre: 'Agricultura, pesca y forestal', desde: 1, hasta: 5 },
  { nombre: 'Minería y canteras', desde: 10, hasta: 14 },
  { nombre: 'Manufactura', desde: 15, hasta: 37 },
  { nombre: 'Energía y agua', desde: 40, hasta: 41 },
  { nombre: 'Construcción', desde: 45, hasta: 45 },
  { nombre: 'Comercio, hoteles y restaurantes', desde: 50, hasta: 55 },
  { nombre: 'Transporte y comunicaciones', desde: 60, hasta: 64 },
  { nombre: 'Finanzas y seguros', desde: 65, hasta: 67 },
  { nombre: 'Servicios empresariales e inmobiliarios', desde: 70, hasta: 74 },
  { nombre: 'Sector público', desde: 75, hasta: 75 },
  { nombre: 'Educación', desde: 80, hasta: 80 },
  { nombre: 'Salud', desde: 85, hasta: 85 },
  { nombre: 'Otros servicios comunitarios', desde: 90, hasta: 93 },
]

/**
 * Palabras clave para clasificar empresas cuyo texto no está en la tabla CIIU
 * (por ejemplo, las registradas a mano con un sector escrito libremente).
 */
const PALABRAS_CLAVE: { nombre: string; claves: string[] }[] = [
  { nombre: 'Educación', claves: ['ensenanza', 'educa', 'universi', 'instituto', 'colegio', 'escuela'] },
  { nombre: 'Salud', claves: ['salud', 'hospital', 'clinica', 'medic', 'farmac'] },
  { nombre: 'Minería y canteras', claves: ['miner', 'cantera', 'extraccion de petroleo', 'extraccion de minerales'] },
  { nombre: 'Agricultura, pesca y forestal', claves: ['agricultura', 'agrario', 'agro', 'pesca', 'forestal', 'ganader', 'silvicultura'] },
  { nombre: 'Construcción', claves: ['construccion', 'obras de ingenieria'] },
  { nombre: 'Finanzas y seguros', claves: ['financ', 'banco', 'seguro', 'bancari'] },
  { nombre: 'Energía y agua', claves: ['energi', 'electricidad', 'suministro de agua', 'gas'] },
  { nombre: 'Transporte y comunicaciones', claves: ['transporte', 'telecomunica', 'comunicacion', 'correo', 'logistic'] },
  { nombre: 'Comercio, hoteles y restaurantes', claves: ['venta al por', 'comercio', 'hotel', 'restaurante'] },
  { nombre: 'Manufactura', claves: ['fabricacion', 'manufactur', 'industria'] },
  { nombre: 'Servicios empresariales e inmobiliarios', claves: ['inmobiliar', 'actividades empresariales', 'informatica', 'consultor', 'asesoramiento'] },
  { nombre: 'Sector público', claves: ['administracion publica', 'sector publico', 'estatal', 'municipal'] },
  { nombre: 'Otros servicios comunitarios', claves: ['sociocomunitario', 'comunitari', 'ambient', 'deport', 'cultur'] },
]

function normalizar(texto?: string | null): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function sectorDeDivision(division: string): string | null {
  const n = Number(division)
  if (!Number.isFinite(n)) return null
  return GRUPOS_CIIU.find((g) => n >= g.desde && n <= g.hasta)?.nombre ?? null
}

/**
 * Determina el sector de una empresa. Se intenta, en orden:
 * 1. El código CIIU, si el backend lo envía.
 * 2. La descripción de la actividad (tabla CIIU de la base importada).
 * 3. El texto del campo sector, por palabras clave.
 */
export function sectorDeEmpresa(datos: {
  ciiu?: string | null
  descripcion?: string | null
  sector?: string | null
}): string {
  const digitos = (datos.ciiu ?? '').replace(/\D/g, '').slice(0, 2)
  if (digitos.length === 2) {
    const porCodigo = sectorDeDivision(digitos)
    if (porCodigo) return porCodigo
  }

  const descripcion = normalizar(datos.descripcion)
  const division = DESCRIPCION_A_DIVISION[descripcion]
  if (division) {
    const porDescripcion = sectorDeDivision(division)
    if (porDescripcion) return porDescripcion
  }

  const textos = [normalizar(datos.sector), descripcion].filter(Boolean)
  for (const texto of textos) {
    const coincidencia = PALABRAS_CLAVE.find((grupo) => grupo.claves.some((clave) => texto.includes(clave)))
    if (coincidencia) return coincidencia.nombre
  }

  return datos.sector?.trim() || datos.descripcion?.trim() ? OTROS_SECTOR : SIN_SECTOR
}

export const SECTORES_FILTRO: string[] = [...GRUPOS_CIIU.map((g) => g.nombre), OTROS_SECTOR, SIN_SECTOR]
