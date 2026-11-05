import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ChartData } from "@/types/dashboard"

/** Límite de correos por día para el TOTAL de todos los usuarios. */
export const LIMITE_DIARIO_EQUIPO = 300
export const TODOS_LOS_USUARIOS = "Todos los usuarios"

const COLORES = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#64748b", "#ec4899", "#14b8a6"]

interface ChartApiladoDiarioProps {
  chart: ChartData
  /** "Todos los usuarios" o el nombre de una persona. */
  usuario: string
  alto?: number
}

/**
 * Barras apiladas por día: cada color es un usuario.
 * Con un usuario elegido solo muestra sus envíos; la línea de 300 es el total del equipo.
 */
export function ChartApiladoDiario({ chart, usuario, alto = 260 }: ChartApiladoDiarioProps) {
  const visibles = chart.datasets
    .map((d, idx) => ({ ...d, color: COLORES[idx % COLORES.length] }))
    .filter((d) => usuario === TODOS_LOS_USUARIOS || d.label === usuario)

  const datos = chart.labels.map((label, i) => {
    const fila: Record<string, string | number> = { label }
    visibles.forEach((d) => {
      fila[d.label] = d.data[i] ?? 0
    })
    return fila
  })

  const totalesEquipo = chart.labels.map((_, i) =>
    chart.datasets.reduce((suma, d) => suma + (d.data[i] ?? 0), 0),
  )
  const techo = Math.max(LIMITE_DIARIO_EQUIPO, ...totalesEquipo) * 1.1

  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 24, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis hide domain={[0, techo]} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine
          y={LIMITE_DIARIO_EQUIPO}
          stroke="var(--destructive)"
          strokeDasharray="6 4"
          label={{
            value: "Total de todos: máx. 300 por día",
            position: "insideTopRight",
            fill: "var(--destructive)",
            fontSize: 12,
            fontWeight: 700,
          }}
        />
        {visibles.map((d) => (
          <Bar key={d.label} dataKey={d.label} stackId="dias" fill={d.color} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
