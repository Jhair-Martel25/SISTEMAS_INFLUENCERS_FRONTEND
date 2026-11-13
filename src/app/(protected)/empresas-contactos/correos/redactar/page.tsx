"use client"

import dynamic from 'next/dynamic'

// Se carga solo en el navegador: lee la selección guardada en sessionStorage
const RedactarCorreoEmpresarial = dynamic(
  () => import('@/features/empresas-contactos/components/RedactarCorreoEmpresarial').then((m) => m.RedactarCorreoEmpresarial),
  { ssr: false, loading: () => <p className="p-8 text-center text-sm text-muted-foreground">Cargando…</p> }
)

export default function RedactarCorreoEmpresarialPage() {
  return <RedactarCorreoEmpresarial />
}
