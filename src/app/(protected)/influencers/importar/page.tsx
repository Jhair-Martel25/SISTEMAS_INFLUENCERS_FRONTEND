"use client"

import { useRouter } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { GenerarInfluencersIA } from "@/features/influencers/components/GenerarInfluencersIA"

export default function GenerarInfluencersPage() {
  const router = useRouter()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Generar influencers con IA"
        description="Indica el tema, el rango de seguidores y la cantidad. La IA busca y guarda los influencers automaticamente."
        backHref="/influencers"
        backLabel="Volver a Influencers"
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <GenerarInfluencersIA onFinalizar={() => router.push("/influencers")} />
      </div>
    </div>
  )
}
