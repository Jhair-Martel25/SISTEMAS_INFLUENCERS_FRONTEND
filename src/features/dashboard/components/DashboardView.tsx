"use client"

import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  Mail,
  UserX,
  Users,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"

import { useDashboard } from "../hooks/useDashboard"
import { ChartBarras } from "./ChartBarras"
import { KpiCard } from "./KpiCard"

interface KpiDef {
  icon: LucideIcon
  label: string
  value: number
}

export function DashboardView() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los datos del dashboard."
    : null

  const kpis = data?.kpis
  const charts = data?.charts

  const seccionInfluencers: KpiDef[] = kpis
    ? [
        { icon: Users, label: "Total influencers", value: kpis.totalInfluencers },
        { icon: Clock, label: "Pendientes", value: kpis.pendientes },
        { icon: CheckCircle2, label: "Validados", value: kpis.validados },
        { icon: XCircle, label: "Rechazados", value: kpis.rechazados },
      ]
    : []

  const seccionContacto: KpiDef[] = kpis
    ? [
        { icon: UserX, label: "Sin contactar", value: kpis.sinContactar },
        { icon: Mail, label: "Correo enviado", value: kpis.correoEnviado },
        { icon: Video, label: "Reunión agendada", value: kpis.reunionAgendada },
      ]
    : []

  const seccionReuniones: KpiDef[] = kpis
    ? [
        { icon: CalendarDays, label: "Hoy", value: kpis.reunionesHoy },
        { icon: CalendarRange, label: "Semana", value: kpis.reunionesSemana },
        { icon: Calendar, label: "Mes", value: kpis.reunionesMes },
      ]
    : []

  function renderSeccion(titulo: string, definiciones: KpiDef[], accent: "primary" | "mint") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>Resumen del estado actual del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {definiciones.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} accent={accent} />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Panel de Administración"
        description="KPIs y gráficos del embudo de conversión."
      />

      {isLoading ? (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 rounded-xl" />
                ))}
              </CardContent>
            </Card>
          ))}
          <Skeleton className="h-64 rounded-xl" />
        </>
      ) : errorMessage ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Cargando..." : "Reintentar"}
            </Button>
          </CardContent>
        </Card>
      ) : charts && kpis ? (
        <>
          {renderSeccion("Influencers", seccionInfluencers, "primary")}
          {renderSeccion("Contacto", seccionContacto, "mint")}
          {renderSeccion("Reuniones", seccionReuniones, "primary")}

          <Card>
            <CardHeader>
              <CardTitle>{charts.embudo.title}</CardTitle>
              <CardDescription>
                Progreso de los influencers a través del embudo de contacto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartBarras
                chart={charts.embudo}
                gradientId="grad-embudo"
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{charts.topVoluntarios.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBarras
                  chart={charts.topVoluntarios}
                  gradientId="grad-voluntarios"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{charts.usoPlantillas.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBarras
                  chart={charts.usoPlantillas}
                  gradientId="grad-plantillas"
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}