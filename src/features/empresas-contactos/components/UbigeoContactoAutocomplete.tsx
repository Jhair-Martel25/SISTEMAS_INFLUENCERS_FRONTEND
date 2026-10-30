"use client"

import { useEffect, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ubigeoService } from '@/features/influencers/services/ubigeo.service'
import type { UbigeoItem } from '@/types/ubigeo'

export function UbigeoContactoAutocomplete({ value, onChange }: { value: string; onChange: (codigo: string) => void }) {
  const [texto, setTexto] = useState(value)
  const [resultados, setResultados] = useState<UbigeoItem[]>([])
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  useEffect(() => {
    if (!abierto || texto.trim().length < 2 || texto === value) { setResultados([]); return }
    const timer = setTimeout(async () => { setCargando(true); try { setResultados(await ubigeoService.autocompletar(texto.trim(), 10)) } finally { setCargando(false) } }, 300)
    return () => clearTimeout(timer)
  }, [texto, abierto, value])
  return <div className="relative"><MapPin className="absolute left-3 top-3 z-10 h-4 w-4 text-muted-foreground"/><Input className="pl-9" value={texto} placeholder="Busca distrito, provincia o código INEI" onChange={(e) => { setTexto(e.target.value); setAbierto(true); onChange('') }} onFocus={() => setAbierto(true)} onBlur={() => setTimeout(() => setAbierto(false), 150)} />{cargando && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground"/>}{abierto && resultados.length > 0 && <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-lg">{resultados.map((item) => <li key={item.codigo}><button type="button" className="w-full rounded p-2 text-left text-sm hover:bg-muted" onMouseDown={(e) => e.preventDefault()} onClick={() => { setTexto(item.etiqueta); onChange(item.codigo); setAbierto(false) }}><span className="font-medium">{item.etiqueta}</span><span className="ml-2 text-xs text-muted-foreground">{item.codigo}</span></button></li>)}</ul>}</div>
}
