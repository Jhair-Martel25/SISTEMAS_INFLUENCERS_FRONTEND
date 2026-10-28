'use client'

import { useRouter } from 'next/navigation'

import type { TipoEmbajador } from '@/types/empresa'
import { InfluencerForm } from './InfluencerForm'

interface RegistroEmbajadorFormProps {
  empresaId?: string
  tipoInicial?: TipoEmbajador
}

/** Envoltorio cliente del formulario de alta (necesita `useRouter`). */
export function RegistroEmbajadorForm({
  empresaId,
  tipoInicial,
}: RegistroEmbajadorFormProps) {
  const router = useRouter()

  return (
    <InfluencerForm
      empresaInicialId={empresaId}
      tipoInicial={tipoInicial}
      onSuccess={() => router.push('/influencers')}
    />
  )
}
