import { PageHeader } from "@/components/shared/page-header"
import { RegistroEmbajadorForm } from "@/features/influencers/components/RegistroEmbajadorForm"
import { TIPO_EMBAJADOR, type TipoEmbajador } from "@/types/empresa"

export default async function RegistroInfluencerPage({
  searchParams,
}: {
  searchParams: Promise<{ empresaId?: string; tipo?: string }>
}) {
  const params = await searchParams
  const tipoInicial =
    params.tipo === TIPO_EMBAJADOR.EMPRESA
      ? (TIPO_EMBAJADOR.EMPRESA as TipoEmbajador)
      : params.tipo === TIPO_EMBAJADOR.INFLUENCER
        ? (TIPO_EMBAJADOR.INFLUENCER as TipoEmbajador)
        : undefined

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Registro de Embajador"
        description="Registra un perfil personal o un embajador corporativo vinculado a una empresa."
        backHref="/influencers"
        backLabel="Volver a Embajadores"
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <RegistroEmbajadorForm
          empresaId={params.empresaId}
          tipoInicial={tipoInicial}
        />
      </div>
    </div>
  )
}
