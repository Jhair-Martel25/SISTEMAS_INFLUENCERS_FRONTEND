import { Badge } from "@/components/ui/badge"
import { etiquetaEstado, type TipoEtiqueta } from "@/lib/utils/format"
import {
  ESTADO_CONTACTO,
  ESTADO_REUNION,
  ESTADO_USUARIO,
  ESTADO_VALIDACION,
} from "@/types/api"

type VarianteBadge = "default" | "secondary" | "destructive" | "outline"

const VARIANTES_VALIDACION: Record<string, VarianteBadge> = {
  [ESTADO_VALIDACION.PENDIENTE]: "secondary",
  [ESTADO_VALIDACION.VALIDADO]: "default",
  [ESTADO_VALIDACION.RECHAZADO]: "destructive",
}

const VARIANTES_CONTACTO: Record<string, VarianteBadge> = {
  [ESTADO_CONTACTO.SIN_CONTACTAR]: "outline",
  [ESTADO_CONTACTO.CORREO_ENVIADO]: "default",
  [ESTADO_CONTACTO.FORMULARIO_LLENADO]: "default",
  [ESTADO_CONTACTO.REUNION_AGENDADA]: "secondary",
  [ESTADO_CONTACTO.RECHAZO_CONTACTO]: "destructive",
}

const VARIANTES_REUNION: Record<string, VarianteBadge> = {
  [ESTADO_REUNION.PENDIENTE]: "secondary",
  [ESTADO_REUNION.REALIZADA]: "default",
  [ESTADO_REUNION.CANCELADA]: "destructive",
  [ESTADO_REUNION.NO_ASISTIO]: "destructive",
}

const VARIANTES_USUARIO: Record<string, VarianteBadge> = {
  [ESTADO_USUARIO.ACTIVO]: "default",
  [ESTADO_USUARIO.INACTIVO]: "secondary",
}

const VARIANTES: Record<TipoEtiqueta, Record<string, VarianteBadge>> = {
  validacion: VARIANTES_VALIDACION,
  contacto: VARIANTES_CONTACTO,
  reunion: VARIANTES_REUNION,
  usuario: VARIANTES_USUARIO,
  dia: {},
}

export function varianteEstado(valor: string, tipo: TipoEtiqueta): VarianteBadge {
  return VARIANTES[tipo]?.[valor] ?? "outline"
}

interface EstadoBadgeProps {
  estado: string
  tipo: TipoEtiqueta
  className?: string
}

export function EstadoBadge({ estado, tipo, className }: EstadoBadgeProps) {
  return (
    <Badge variant={varianteEstado(estado, tipo)} className={className}>
      {etiquetaEstado(estado, tipo)}
    </Badge>
  )
}
