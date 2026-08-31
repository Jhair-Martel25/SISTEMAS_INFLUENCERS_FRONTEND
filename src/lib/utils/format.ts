import {
  DIA_SEMANA,
  ESTADO_CONTACTO,
  ESTADO_REUNION,
  ESTADO_USUARIO,
  ESTADO_VALIDACION,
  type DiaSemana,
  type EstadoContacto,
  type EstadoReunion,
  type EstadoUsuario,
  type EstadoValidacion,
} from '@/types/api'

/**
 * Etiquetas amigables para los valores del backend.
 * Los catálogos pueden venir de `/categorias`; este mapa es el fallback
 * estático y la fuente para renderizar en UI.
 */

export const ETIQUETAS_VALIDACION: Record<EstadoValidacion, string> = {
  [ESTADO_VALIDACION.PENDIENTE]: 'Pendiente',
  [ESTADO_VALIDACION.VALIDADO]: 'Validado',
  [ESTADO_VALIDACION.RECHAZADO]: 'Rechazado',
}

export const ETIQUETAS_CONTACTO: Record<EstadoContacto, string> = {
  [ESTADO_CONTACTO.SIN_CONTACTAR]: 'Sin contactar',
  [ESTADO_CONTACTO.CORREO_ENVIADO]: 'Correo enviado',
  [ESTADO_CONTACTO.FORMULARIO_LLENADO]: 'Formulario llenado',
  [ESTADO_CONTACTO.REUNION_AGENDADA]: 'Reunión agendada',
  [ESTADO_CONTACTO.RECHAZO_CONTACTO]: 'Rechazo de contacto',
}

export const ETIQUETAS_REUNION: Record<EstadoReunion, string> = {
  [ESTADO_REUNION.PENDIENTE]: 'Pendiente',
  [ESTADO_REUNION.REALIZADA]: 'Realizada',
  [ESTADO_REUNION.CANCELADA]: 'Cancelada',
  [ESTADO_REUNION.NO_ASISTIO]: 'No asistió',
}

export const ETIQUETAS_USUARIO: Record<EstadoUsuario, string> = {
  [ESTADO_USUARIO.ACTIVO]: 'Activo',
  [ESTADO_USUARIO.INACTIVO]: 'Inactivo',
}

export const ETIQUETAS_DIA: Record<DiaSemana, string> = {
  [DIA_SEMANA.LUNES]: 'Lunes',
  [DIA_SEMANA.MARTES]: 'Martes',
  [DIA_SEMANA.MIERCOLES]: 'Miércoles',
  [DIA_SEMANA.JUEVES]: 'Jueves',
  [DIA_SEMANA.VIERNES]: 'Viernes',
  [DIA_SEMANA.SABADO]: 'Sábado',
  [DIA_SEMANA.DOMINGO]: 'Domingo',
}

export type TipoEtiqueta =
  | 'validacion'
  | 'contacto'
  | 'reunion'
  | 'usuario'
  | 'dia'

const MAPAS: Record<TipoEtiqueta, Record<string, string>> = {
  validacion: ETIQUETAS_VALIDACION,
  contacto: ETIQUETAS_CONTACTO,
  reunion: ETIQUETAS_REUNION,
  usuario: ETIQUETAS_USUARIO,
  dia: ETIQUETAS_DIA,
}

/** Devuelve la etiqueta legible de un valor del backend (o el valor si no existe). */
export function etiquetaEstado(
  valor: string,
  tipo: TipoEtiqueta,
): string {
  return MAPAS[tipo][valor] ?? valor
}
