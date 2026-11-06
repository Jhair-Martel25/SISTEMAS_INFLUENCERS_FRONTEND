"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, Mail, Search, Send, Users, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import { ESTADO_VALIDACION } from "@/types/api"
import { TIPO_EMBAJADOR } from "@/types/empresa"
import type { Influencer } from "@/types/influencer"
import { useEnviarEmailMasivo } from "@/features/email/hooks/useEmail"
import { useTodosInfluencers } from "../hooks/useInfluencers"
import { SelectorPlantillaCorreo } from "./SelectorPlantillaCorreo"

type Filtro = "PENDIENTES" | "ENVIADOS" | "TODOS"

function iniciales(nombre: string) {
  return nombre.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

/**
 * Envío de mensajes (correo) SOLO a influencers: elige destinatarios, una
 * plantilla con su diseño, edita el texto y envía. Misma experiencia que el
 * envío de mensajes de Empresas y Contactos.
 */
export function EnvioMensajesInfluencers() {
  const { data, isLoading, isError, error } = useTodosInfluencers({
    estadoValidacion: ESTADO_VALIDACION.VALIDADO,
    tipoEmbajador: TIPO_EMBAJADOR.INFLUENCER,
  })
  const enviar = useEnviarEmailMasivo()

  const [buscar, setBuscar] = useState("")
  const [filtro, setFiltro] = useState<Filtro>("PENDIENTES")
  const [seleccion, setSeleccion] = useState<string[]>([])
  const [plantillaId, setPlantillaId] = useState("")
  const [asunto, setAsunto] = useState("")
  const [cuerpo, setCuerpo] = useState("")
  const [confirmar, setConfirmar] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; fallidos: { nombre: string; error: string }[] } | null>(null)

  // Solo influencers (no empresas) con correo registrado.
  const conCorreo = useMemo(
    () => (data ?? []).filter((i) => i.tipoEmbajador !== TIPO_EMBAJADOR.EMPRESA && i.email?.trim()),
    [data],
  )
  const enviadosCount = conCorreo.filter((i) => i.estadoContacto !== "SIN_CONTACTAR").length

  const filtrados = useMemo(() => {
    const t = buscar.trim().toLowerCase()
    return conCorreo.filter((i) => {
      const enviado = i.estadoContacto !== "SIN_CONTACTAR"
      if (filtro === "PENDIENTES" && enviado) return false
      if (filtro === "ENVIADOS" && !enviado) return false
      if (!t) return true
      return [i.nombre, i.email ?? "", i.usuarioIg].join(" ").toLowerCase().includes(t)
    })
  }, [conCorreo, buscar, filtro])

  const seleccionados = conCorreo.filter((i) => seleccion.includes(i.id))
  const todosMarcados = filtrados.length > 0 && filtrados.every((i) => seleccion.includes(i.id))
  const listo = seleccionados.length > 0 && plantillaId && asunto.trim() && cuerpo.trim()

  function alternarTodos(marcar: boolean) {
    setSeleccion((s) =>
      marcar ? [...new Set([...s, ...filtrados.map((i) => i.id)])] : s.filter((id) => !filtrados.some((i) => i.id === id)),
    )
  }

  async function enviarMensajes() {
    setConfirmar(false)
    try {
      const res = await enviar.mutateAsync({
        influencerIds: seleccionados.map((i) => i.id),
        plantillaId,
        asunto: asunto.trim(),
        cuerpo: cuerpo.trim(),
      })
      const ok = res.filter((r) => r.exitoso).length
      const fallidos = res
        .filter((r) => !r.exitoso)
        .map((r) => ({
          nombre: seleccionados.find((i) => i.id === r.influencerId)?.nombre ?? r.email ?? r.influencerId,
          error: r.error ?? "Error desconocido",
        }))
      setResultado({ ok, fallidos })
      setSeleccion([])
      if (fallidos.length) toast.warning(`${ok} mensajes enviados, ${fallidos.length} fallaron.`)
      else toast.success(`${ok} mensaje${ok === 1 ? "" : "s"} enviado${ok === 1 ? "" : "s"}.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudieron enviar los mensajes.")
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <PageHeader
        title="Envío de mensajes"
        description="Envía correos con plantilla a los influencers validados. Elige destinatarios, la plantilla y ajusta el texto."
        backHref="/empresas"
        backLabel="Volver a Influencers"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(480px,1.25fr)]">
        {/* Destinatarios */}
        <section className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="space-y-3 border-b p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <Users size={18} /> Destinatarios ({seleccion.length})
              </h2>
              <span className="text-xs text-muted-foreground">
                {conCorreo.length} con correo · {enviadosCount} ya contactados
              </span>
            </div>
            <div className="flex gap-1 rounded-lg bg-muted/60 p-1 text-xs">
              {(
                [
                  ["PENDIENTES", `Sin contactar (${conCorreo.length - enviadosCount})`],
                  ["ENVIADOS", `Contactados (${enviadosCount})`],
                  ["TODOS", `Todos (${conCorreo.length})`],
                ] as [Filtro, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFiltro(v)}
                  className={cn(
                    "flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors",
                    filtro === v ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar por nombre, @usuario o correo…"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <Checkbox
              checked={todosMarcados}
              onCheckedChange={(v) => alternarTodos(v === true)}
              aria-label="Seleccionar todos los visibles"
            />
            Seleccionar todos los visibles
          </div>

          <div className="max-h-[620px] flex-1 overflow-auto">
            {isError ? (
              <p className="p-6 text-sm text-destructive">
                {error instanceof Error ? error.message : "No se pudieron cargar los influencers."}
              </p>
            ) : isLoading ? (
              <p className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" /> Cargando influencers…
              </p>
            ) : filtrados.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No hay influencers validados con correo que coincidan con el filtro.
              </p>
            ) : (
              filtrados.map((i: Influencer) => {
                const enviado = i.estadoContacto !== "SIN_CONTACTAR"
                const marcado = seleccion.includes(i.id)
                return (
                  <label
                    key={i.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30",
                      marcado && "bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={marcado}
                      onCheckedChange={(v) =>
                        setSeleccion((s) => (v === true ? [...s, i.id] : s.filter((x) => x !== i.id)))
                      }
                      aria-label={`Seleccionar ${i.nombre}`}
                    />
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {iniciales(i.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{i.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{i.usuarioIg} · <span className="font-mono">{i.email}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        enviado
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                      )}
                    >
                      {enviado ? "Contactado" : "Pendiente"}
                    </span>
                  </label>
                )
              })
            )}
          </div>
          {seleccion.length > 0 && (
            <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                Seleccionados: <strong>{seleccion.length}</strong>
              </span>
              <button type="button" onClick={() => setSeleccion([])} className="font-medium text-primary hover:underline">
                Limpiar selección
              </button>
            </div>
          )}
        </section>

        {/* Redacción */}
        <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <Mail className="text-primary" size={20} />
            <div>
              <h2 className="text-base font-semibold">Redactar mensaje</h2>
              <p className="text-xs text-muted-foreground">
                Elige una plantilla; el diseño se mantiene y puedes ajustar el texto.
              </p>
            </div>
          </div>

          <SelectorPlantillaCorreo
            plantillaId={plantillaId}
            onChange={(id) => setPlantillaId(id)}
            asunto={asunto}
            onAsuntoChange={setAsunto}
            cuerpo={cuerpo}
            onCuerpoChange={setCuerpo}
            tipo="INFLUENCER"
            destinatario={{ nombre: seleccionados[0]?.nombre }}
            disabled={enviar.isPending}
          />

          {resultado && (
            <div className="rounded-xl border bg-muted/30 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> {resultado.ok} enviados
              </p>
              {resultado.fallidos.map((f) => (
                <p key={f.nombre} className="mt-1 flex items-start gap-2 text-xs text-destructive">
                  <XCircle size={14} className="mt-0.5 shrink-0" /> {f.nombre}: {f.error}
                </p>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-[11px] text-muted-foreground">
              Al enviarse, el estado del influencer cambia a &quot;Correo enviado&quot;.
            </p>
            <Button onClick={() => setConfirmar(true)} disabled={!listo || enviar.isPending}>
              {enviar.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {enviar.isPending
                ? "Enviando…"
                : seleccionados.length
                  ? `Enviar a ${seleccionados.length} influencer${seleccionados.length === 1 ? "" : "s"}`
                  : "Selecciona destinatarios"}
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmar}
        onOpenChange={setConfirmar}
        title="Enviar mensajes"
        description={`Se enviará el correo a ${seleccionados.length} influencer${seleccionados.length === 1 ? "" : "s"}. ¿Continuar?`}
        confirmLabel="Enviar"
        isPending={enviar.isPending}
        onConfirm={() => void enviarMensajes()}
      />
    </div>
  )
}
