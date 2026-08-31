"use client"

import { useRouter } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { InfluencerForm } from "@/features/influencers/components/InfluencerForm"

export default function RegistroInfluencerPage() {
  const router = useRouter()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Registro de Influencer"
        description="Ingresa los datos de perfil para añadirlo al sistema."
        backHref="/influencers"
        backLabel="Volver a Influencers"
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <InfluencerForm onSuccess={() => router.push("/influencers")} />
      </div>
    </div>
  )
}
