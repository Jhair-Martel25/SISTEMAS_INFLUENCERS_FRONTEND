"use client"

import { useRouter } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { CaptarInfluencers } from "@/features/influencers/components/CaptarInfluencers"

export default function CaptarInfluencersPage() {
  const router = useRouter()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Captar influencers"
        description="Describe el tipo de influencers que quieres encontrar y selecciona las redes sociales."
        backHref="/influencers"
        backLabel="Volver a Influencers"
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <CaptarInfluencers onFinalizar={() => router.push("/influencers")} />
      </div>
    </div>
  )
}