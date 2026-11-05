import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ChartData } from "@/types/dashboard"

interface ChartColumnasProps {
  chart: ChartData
  color: string
  /** Línea de referencia opcional (por ejemplo, el límite de 300 por día). */
  referencia?: { valor: number; etiqueta: string }
  alto?: number
}

/** Barras verticales de un solo dataset. */
export function ChartColumnas({
  chart,
  color,
  referencia,
  alto = 260,
}: ChartColumnasProps) {
  const dataset = chart.datasets[0]
  const datos = chart.labels.map((label, i) => ({
    label,
    value: dataset?.data[i] ?? 0,
  }))

  const maxDato = Math.max(0, ...datos.map((d) => d.value))
  const techo = Math.max(maxDato, referencia?.valor ?? 0) * 1.15 || 1

  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={datos} margin={{ top: 24, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
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
        {referencia && (
          <ReferenceLine
            y={referencia.valor}
            stroke="var(--destructive)"
            strokeDasharray="6 4"
            label={{
              value: referencia.etiqueta,
              position: "insideTopRight",
              fill: "var(--destructive)",
              fontSize: 12,
              fontWeight: 700,
            }}
          />
        )}
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={56}>
          <LabelList
            dataKey="value"
            position="top"
            className="fill-foreground"
            fontSize={13}
            fontWeight={600}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
