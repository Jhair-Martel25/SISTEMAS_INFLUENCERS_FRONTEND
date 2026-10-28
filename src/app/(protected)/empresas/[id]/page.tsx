import { use } from 'react'
import { EmpresaDetalle } from '@/features/empresas/components/EmpresaDetalle'

export default function EmpresaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <EmpresaDetalle id={id} />
}
