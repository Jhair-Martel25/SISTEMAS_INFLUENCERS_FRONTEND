"use client"

import { Input } from "@/components/ui/input"
import { MAX_DIAS_RANGO, diasEnRango, sumarDias } from "../utils/periodo"

export interface RangoDias {
  desde: string
  hasta: string
}

interface FiltroRangoDiasProps {
  valor: RangoDias
  onChange: (valor: RangoDias) => void
}

/** Elige un rango de días (máximo 7). Ajusta el otro extremo si se sale del límite. */
export function FiltroRangoDias({ valor, onChange }: FiltroRangoDiasProps) {
  function cambiarDesde(desde: string) {
    if (!desde) return
    const fueraDeLimite = valor.hasta < desde || diasEnRango(desde, valor.hasta) > MAX_DIAS_RANGO
    onChange({ desde, hasta: fueraDeLimite ? sumarDias(desde, MAX_DIAS_RANGO - 1) : valor.hasta })
  }

  function cambiarHasta(hasta: string) {
    if (!hasta) return
    const fueraDeLimite = valor.desde > hasta || diasEnRango(valor.desde, hasta) > MAX_DIAS_RANGO
    onChange({ desde: fueraDeLimite ? sumarDias(hasta, -(MAX_DIAS_RANGO - 1)) : valor.desde, hasta })
  }

  const dias = diasEnRango(valor.desde, valor.hasta)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Desde
        <Input type="date" value={valor.desde} onChange={(e) => cambiarDesde(e.target.value)} className="w-44" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Hasta
        <Input type="date" value={valor.hasta} onChange={(e) => cambiarHasta(e.target.value)} className="w-44" />
      </label>
      <span className="pb-2 text-xs text-muted-foreground">
        {dias} {dias === 1 ? "día" : "días"} (máximo {MAX_DIAS_RANGO})
      </span>
    </div>
  )
}
