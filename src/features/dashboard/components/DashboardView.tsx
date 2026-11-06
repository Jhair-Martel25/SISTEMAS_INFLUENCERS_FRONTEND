"use client"

// Nota: en la interfaz, los "influencers" se muestran como "embajadores".
// Solo cambia el texto visible; nombres de código, rutas, API y BD siguen como "influencer".

import { useMemo, useState } from "react"
import { Building2, Mail, Users, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"

import { useDashboard } from "../hooks/useDashboard"
import { MESES, filtrosDeDias, rangoMes, rangoPrimerosDias, recortarDias } from "../utils/periodo"
import { FiltroRangoDias, type RangoDias } from "./FiltroRangoDias"
import { ChartApiladoDiario, LIMITE_DIARIO_EQUIPO, TODOS_LOS_USUARIOS } from "./ChartApiladoDiario"
import { ChartColumnas } from "./ChartColumnas"
import { KpiCard } from "./KpiCard"

const ANIO_INICIO = 2025

function SinDatos() {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
      Aún no hay datos para este gráfico.
    </div>
  )
}

export function DashboardView() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [usuario, setUsuario] = useState(TODOS_LOS_USUARIOS)
  const [rango, setRango] = useState<RangoDias>(() => rangoPrimerosDias(hoy.getFullYear(), hoy.getMonth() + 1))
  const filtrosRango = useMemo(() => filtrosDeDias(rango.desde, rango.hasta), [rango])
  const { data: datosRango } = useDashboard(filtrosRango)

  const filtros = useMemo(() => rangoMes(anio, mes), [anio, mes])
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(filtros)

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar los datos del dashboard."
    : null

  const kpis = data?.kpis
  const charts = data?.charts
  const anios = Array.from(
    { length: hoy.getFullYear() - ANIO_INICIO + 1 },
    (_, i) => ANIO_INICIO + i,
  )

  // Correos por usuario y por día (un dataset por persona).
  const porUsuario = charts?.correosPorUsuarioDia
  const usuarios = porUsuario?.datasets.map((d) => d.label) ?? []
  const correosRango = recortarDias(datosRango?.charts.correosPorUsuarioDia, rango.desde, rango.hasta)
  const totalRango = correosRango?.datasets.reduce((acc, d) => acc + d.data.reduce((a, b) => a + b, 0), 0) ?? 0
  const totalesPorUsuario = Object.fromEntries(
    (porUsuario?.datasets ?? []).map((d) => [d.label, d.data.reduce((a, b) => a + b, 0)]),
  )
  const totalEquipo = Object.values(totalesPorUsuario).reduce((a, b) => a + b, 0)
  const contactados = charts?.contactados
  const empresas = contactados?.labels.indexOf("Empresas") ?? -1
  const influencers = contactados?.labels.indexOf("Influencers") ?? -1

  // Resumen de la persona elegida (o del equipo).
  const perfil = (() => {
    if (!correosRango) return null
    const datasets = usuario === TODOS_LOS_USUARIOS
      ? correosRango.datasets
      : correosRango.datasets.filter((d) => d.label === usuario)
    const diarios = correosRango.labels.map((_, i) =>
      datasets.reduce((s, d) => s + (d.data[i] ?? 0), 0),
    )
    const total = diarios.reduce((a, b) => a + b, 0)
    const diasActivos = diarios.filter((v) => v > 0).length
    return {
      total,
      promedio: diasActivos ? Math.round(total / diasActivos) : 0,
      maximo: Math.max(0, ...diarios),
      diasActivos,
    }
  })()

  const weekly = charts?.correosPorSemana
  const reunionesSemana = charts?.reunionesPorSemana
  // El KPI reunionesMes del backend usa siempre el mes actual; la serie sí respeta el filtro.
  const reunionesDelPeriodo = reunionesSemana
    ? reunionesSemana.datasets[0]?.data.reduce((a, b) => a + b, 0) ?? 0
    : kpis?.reunionesMes ?? 0

  function renderSeccion(titulo: string, descripcion: string, contenido: React.ReactNode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descripcion}</CardDescription>
        </CardHeader>
        <CardContent>{contenido}</CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Estado del sistema de embajadores"
        description="Solo embajadores validados. Usa los filtros de mes y año para cambiar el periodo."
        actions={
          <>
            <Select value={String(mes)} onValueChange={(v) => { const n = Number(v); setMes(n); setRango(rangoPrimerosDias(anio, n)) }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(anio)} onValueChange={(v) => { const n = Number(v); setAnio(n); setRango(rangoPrimerosDias(n, mes)) }}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      {isLoading ? (
        <>
          <Skeleton className="h-12 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </>
      ) : errorMessage ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Cargando..." : "Reintentar"}
            </Button>
          </CardContent>
        </Card>
      ) : kpis && charts ? (
        <>
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-foreground dark:bg-amber-950/30">
            <span className="font-semibold">
              {kpis.validados} {kpis.validados === 1 ? "embajador validado" : "embajadores validados"}.
            </span>{" "}
            Según el estado de contacto actual: {kpis.correoEnviado} con correo enviado y {kpis.reunionAgendada} con reunión agendada.
          </p>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              icon={Mail}
              label="Correos enviados del mes"
              value={porUsuario ? totalEquipo.toLocaleString("es-PE") : "—"}
            />
            <KpiCard icon={Video} label="Reuniones agendadas" value={reunionesDelPeriodo} accent="mint" />
            <KpiCard
              icon={Building2}
              label="Empresas contactadas"
              value={empresas >= 0 ? contactados!.datasets[0].data[empresas] : "—"}
              accent="mint"
            />
            <KpiCard
              icon={Users}
              label="Influencers contactados"
              value={influencers >= 0 ? contactados!.datasets[0].data[influencers] : "—"}
              accent="mint"
            />
          </div>

          {renderSeccion(
            "¿Cuántos correos envía cada usuario por día?",
            "Elige un rango de hasta 7 días. Cada barra es un día; los colores muestran cuántos correos envió cada persona. La suma de todos nunca pasa de 300 por día.",
            correosRango ? (
              <div className="flex flex-col gap-4">
                <FiltroRangoDias valor={rango} onChange={setRango} />
                {totalRango === 0 && (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    No hay correos registrados en este periodo. Solo se cuentan los correos enviados desde que se activó el registro.
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Usuario:</span>
                  <Select value={usuario} onValueChange={setUsuario}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TODOS_LOS_USUARIOS}>{TODOS_LOS_USUARIOS}</SelectItem>
                      {usuarios.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ChartApiladoDiario chart={correosRango!} usuario={usuario} />

                {perfil && (
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3 sm:grid-cols-4">
                    <Dato etiqueta="Correos del rango" valor={perfil.total.toLocaleString("es-PE")} />
                    <Dato etiqueta="Promedio por día con envíos" valor={String(perfil.promedio)} />
                    <Dato etiqueta="Día con más envíos" valor={String(perfil.maximo)} />
                    <Dato etiqueta="Días con envíos" valor={String(perfil.diasActivos)} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  El límite de {LIMITE_DIARIO_EQUIPO} se aplica al total de todos los usuarios de cada día, no a cada persona.
                </p>
              </div>
            ) : (
              <SinDatos />
            ),
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {renderSeccion(
              "¿Cuántos correos enviamos por día, en promedio por semana?",
              "Promedio diario de cada semana del mes, frente al límite de 300.",
              weekly ? (
                <ChartColumnas
                  chart={weekly}
                  color="var(--primary)"
                  referencia={{ valor: LIMITE_DIARIO_EQUIPO, etiqueta: "Límite 300 por día" }}
                />
              ) : (
                <SinDatos />
              ),
            )}

            {renderSeccion(
              "¿Cuántas reuniones agendamos por semana?",
              "Reuniones agendadas en el mes elegido.",
              reunionesSemana ? (
                <ChartColumnas chart={reunionesSemana} color="var(--mint)" />
              ) : (
                <SinDatos />
              ),
            )}
          </div>

          {renderSeccion(
            "¿Cuántos validados avanzan hasta la reunión?",
            "Embajadores validados que llegan a cada etapa.",
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Etapa valor={kpis.validados} etiqueta="Validados" />
                <span className="text-muted-foreground">→</span>
                <Etapa valor={kpis.correoEnviado} etiqueta="Con correo" />
                <span className="text-muted-foreground">→</span>
                <Etapa valor={kpis.reunionAgendada} etiqueta="Con reunión" />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Cifras según el estado de contacto actual de todos los embajadores.
              </p>
              {kpis.correoEnviado > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  De cada 5 embajadores que reciben correo, {Math.round((kpis.reunionAgendada / kpis.correoEnviado) * 5)} agenda reunión.
                </p>
              )}
            </div>,
          )}
        </>
      ) : null}
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="text-center">
      <p className="font-heading text-xl font-semibold text-foreground">{valor}</p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  )
}

function Etapa({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-xl bg-mint/10 p-4 text-center">
      <span className="font-heading text-2xl font-semibold text-foreground">{valor}</span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </div>
  )
}
