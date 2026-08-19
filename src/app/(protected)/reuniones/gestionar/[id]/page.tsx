import { use } from "react"
import { ReunionDetalle } from "@/features/reuniones/components/ReunionDetalle"

export default function GestionarReunionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <ReunionDetalle id={id} />
}
