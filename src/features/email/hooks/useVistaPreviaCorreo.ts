import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { emailService } from '../services/email.service'
import type { VistaPreviaCorreoRequest } from '@/types/email'

const VistaPreviaSchema = z.object({
  asunto: z.string(),
  html: z.string(),
  diseno: z.string(),
})

/** Devuelve `valor` tras `ms` sin cambios (evita una petición por tecla). */
export function useDebounce<T>(valor: T, ms = 350): T {
  const [debounced, setDebounced] = useState(valor)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])
  return debounced
}

/**
 * Vista previa del correo renderizada por el backend (mismo HTML que se
 * envía). Se recalcula con debounce mientras se edita el texto y conserva la
 * vista anterior mientras llega la nueva para que no "parpadee".
 */
export function useVistaPreviaCorreo(
  input: VistaPreviaCorreoRequest,
  options?: { enabled?: boolean },
) {
  const debounced = useDebounce(input)
  return useQuery({
    queryKey: ['email', 'vista-previa', debounced],
    queryFn: async () => VistaPreviaSchema.parse(await emailService.vistaPrevia(debounced)),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
