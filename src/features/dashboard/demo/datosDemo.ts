import type { DashboardData, DashboardFiltros } from '@/types/dashboard'

/**
 * Datos de prueba del dashboard (solo desarrollo).
 * Se activan con NEXT_PUBLIC_DASHBOARD_DEMO=true en .env.local y no tocan la base de datos.
 * Los números son ficticios y siguen la misma forma que responde el backend.
 */

const USUARIOS = ['Cristian Salazar', 'Juan Pérez', 'Alina Miranda', 'Pedro Ramos']
const PESOS = [0.4, 0.25, 0.2, 0.15]

function generadorAleatorio(semilla: number) {
  let estado = semilla
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

const fechaISO = (anio: number, mes: number, dia: number) =>
  `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

export function datosDemo(filtros?: DashboardFiltros): DashboardData {
  const referencia = filtros?.fechaInicio ? new Date(filtros.fechaInicio) : new Date()
  const anio = referencia.getFullYear()
  const mes = referencia.getMonth()
  const diasMes = new Date(anio, mes + 1, 0).getDate()
  const rnd = generadorAleatorio(anio * 100 + mes + 7)

  // Correos por día: el total de todos los usuarios nunca pasa de 300.
  const totalesDia = Array.from({ length: diasMes }, () => 40 + Math.round(rnd() * 200))
  const labelsDias = totalesDia.map((_, i) => fechaISO(anio, mes, i + 1))
  const datasetsUsuarios = USUARIOS.map((nombre, u) => ({
    label: nombre,
    data: totalesDia.map((total) => Math.floor(total * PESOS[u])),
  }))
  // El resto del reparto va al primer usuario, así la suma de cada día es exactamente el total.
  totalesDia.forEach((total, i) => {
    const suma = datasetsUsuarios.reduce((acc, d) => acc + d.data[i], 0)
    datasetsUsuarios[0].data[i] += total - suma
  })

  // Semanas (lunes a domingo) que tocan el mes, con promedio diario por semana.
  const primerDia = new Date(anio, mes, 1)
  const desplazamiento = (primerDia.getDay() + 6) % 7
  const semanas: { clave: string; dias: number[] }[] = []
  for (let inicio = 1 - desplazamiento; inicio <= diasMes; inicio += 7) {
    const dias = Array.from({ length: 7 }, (_, k) => inicio + k).filter((d) => d >= 1 && d <= diasMes)
    semanas.push({ clave: fechaISO(anio, mes, Math.max(1, inicio)), dias })
  }
  const promedioSemana = semanas.map((s) => {
    const total = s.dias.reduce((acc, d) => acc + totalesDia[d - 1], 0)
    return Number((total / s.dias.length).toFixed(2))
  })
  const reunionesSemana = semanas.map(() => Math.floor(rnd() * 4))
  const reunionesMes = reunionesSemana.reduce((a, b) => a + b, 0)

  const empresas = 8 + Math.floor(rnd() * 12)
  const influencers = 20 + Math.floor(rnd() * 30)
  const correoEnviado = 25 + Math.floor(rnd() * 20)
  const reunionAgendada = 5 + Math.floor(rnd() * 6)
  const validados = correoEnviado + 10 + Math.floor(rnd() * 15)

  return {
    kpis: {
      totalInfluencers: validados + 40,
      pendientes: 30,
      validados,
      rechazados: 12,
      correoEnviado,
      reunionAgendada,
      sinContactar: validados - correoEnviado,
      reunionesHoy: reunionesSemana[0] ?? 0,
      reunionesSemana: reunionesSemana[0] ?? 0,
      reunionesMes,
    },
    charts: {
      embudo: {
        title: 'Embudo de Conversión',
        labels: ['PENDIENTE', 'VALIDADO', 'CORREO_ENVIADO', 'REUNIÓN'],
        datasets: [{ label: 'Influencers', data: [30, validados, correoEnviado, reunionAgendada] }],
      },
      topVoluntarios: {
        title: 'Top Voluntarios — Validaciones',
        labels: USUARIOS,
        datasets: [{ label: 'Validaciones', data: [23, 12, 9, 5] }],
      },
      correosPorSemana: {
        title: 'Correos por semana (promedio diario)',
        labels: semanas.map((s) => s.clave),
        datasets: [{ label: 'Promedio de correos por día', data: promedioSemana }],
      },
      correosPorUsuarioDia: {
        title: 'Correos por usuario y día',
        labels: labelsDias,
        datasets: datasetsUsuarios,
      },
      contactados: {
        title: 'Contactados — Empresas e Influencers',
        labels: ['Empresas', 'Influencers'],
        datasets: [{ label: 'Contactados', data: [empresas, influencers] }],
      },
      reunionesPorSemana: {
        title: 'Reuniones por semana',
        labels: semanas.map((s) => s.clave),
        datasets: [{ label: 'Reuniones', data: reunionesSemana }],
      },
    },
  }
}
