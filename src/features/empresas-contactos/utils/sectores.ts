import { ACTIVIDAD_A_SECTOR_CIIU } from './descripciones-ciiu'

export const SIN_SECTOR = 'Sin sector'

function normalizar(texto?: string | null): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Sector CIIU de una empresa, tal como figura en la base unificada.
 * Se usa el sector guardado y, si no lo tiene, se deduce de la actividad CIIU.
 */
export function sectorDeEmpresa(datos: {
  descripcion?: string | null
  sector?: string | null
}): string {
  const guardado = datos.sector?.trim()
  if (guardado) return guardado

  return ACTIVIDAD_A_SECTOR_CIIU[normalizar(datos.descripcion)] ?? SIN_SECTOR
}

/** Sectores presentes en los datos, ordenados alfabéticamente y con "Sin sector" al final. */
export function ordenarSectores(sectores: Iterable<string>): string[] {
  return [...sectores].sort((a, b) => {
    if (a === SIN_SECTOR) return 1
    if (b === SIN_SECTOR) return -1
    return a.localeCompare(b, 'es')
  })
}
