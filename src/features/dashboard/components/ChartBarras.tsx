import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ChartData } from "@/types/dashboard"

interface ChartBarrasProps {
  chart: ChartData
  gradientId: string
  className?: string
}

interface Barra {
  label: string
  value: number
}

const TICKS_GRID = "var(--border)"
const TICK_FILL = "var(--muted-foreground)"

/** Barras horizontales (recharts). Toma el primer dataset del chart. */
export function ChartBarras({ chart, gradientId, className }: ChartBarrasProps) {
  const dataset = chart.datasets[0]
  const barras: Barra[] = chart.labels.map((label, i) => ({
    label,
    value: dataset?.data[i] ?? 0,
  }))

  const maxValue = Math.max(1, ...barras.map((b) => b.value))
  const altura = Math.max(200, barras.length * 44)

  return (
    <ResponsiveContainer width="100%" height={altura} className={className}>
      <BarChart
        data={barras}
        layout="vertical"
        margin={{ top: 4, right: 32, bottom: 4, left: 0 }}
        title={chart.title}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--mint)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke={TICKS_GRID}
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, maxValue]}
          hide
          dataKey="value"
        />
        <YAxis
          type="category"
          dataKey="label"
          width={170}
          tick={{ fill: TICK_FILL, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) =>
            v.length > 20 ? `${v.slice(0, 19)}…` : v
          }
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--foreground)",
            fontSize: 13,
          }}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
        />
        <Bar
          dataKey="value"
          fill={`url(#${gradientId})`}
          radius={[0, 6, 6, 0]}
          background={{ fill: "var(--muted)" }}
          maxBarSize={28}
        >
          <LabelList
            dataKey="value"
            position="right"
            className="fill-foreground"
            fontSize={13}
            fontWeight={600}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}