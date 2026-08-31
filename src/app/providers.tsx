'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Proveedores globales de la aplicación.
 *
 * Configura TanStack Query con valores pensados para este proyecto:
 *  - `staleTime` 30s: evita re-consultar datos recientes al navegar.
 *  - `refetchOnWindowFocus` false: no re-dispara peticiones al cambiar de
 *    pestaña (relevante por el rate limiting del backend).
 *  - `retry` 1: reintenta una vez ante errores transitorios.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
