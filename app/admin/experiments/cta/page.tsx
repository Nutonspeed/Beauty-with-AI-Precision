"use client";
import React, { useEffect, useState } from 'react'

type Result = {
  ok: boolean
  result?: {
    exposures: { A: number; B: number }
    clicks: { A: { primary: number; secondary: number }; B: { primary: number; secondary: number } }
    ctr: { A: { primary: number; secondary: number }; B: { primary: number; secondary: number } }
  }
  error?: string
}

export default function CtaExperimentDashboard() {
  const [data, setData] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch('/api/analytics/collect', { cache: 'no-store' })
        const json = (await res.json()) as Result
        if (!mounted) return
        setData(json)
        if (!json.ok) setErr(json.error || 'Unknown error')
      } catch (e: any) {
        if (!mounted) return
        setErr(e?.message || String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const r = data?.result

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">CTA A/B Experiment</h1>
      <p className="text-sm text-neutral-600 mt-1">Live aggregates from local analytics store (auto-refresh 5s)</p>
      {loading && <div className="mt-6 text-sm">Loading…</div>}
      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
      {r && (
        <div className="mt-6 grid gap-6">
          <section className="rounded-xl border p-4 bg-white/70 backdrop-blur">
            <h2 className="font-medium">Exposures</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-3"><div className="text-xs text-neutral-500">Variant A</div><div className="text-lg font-semibold">{r.exposures.A}</div></div>
              <div className="rounded-lg border p-3"><div className="text-xs text-neutral-500">Variant B</div><div className="text-lg font-semibold">{r.exposures.B}</div></div>
            </div>
          </section>
          <section className="rounded-xl border p-4 bg-white/70 backdrop-blur">
            <h2 className="font-medium">Clicks</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-neutral-500">A</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><div className="text-[11px] text-neutral-500">Primary</div><div className="font-semibold">{r.clicks.A.primary}</div></div>
                  <div><div className="text-[11px] text-neutral-500">Secondary</div><div className="font-semibold">{r.clicks.A.secondary}</div></div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-neutral-500">B</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><div className="text-[11px] text-neutral-500">Primary</div><div className="font-semibold">{r.clicks.B.primary}</div></div>
                  <div><div className="text-[11px] text-neutral-500">Secondary</div><div className="font-semibold">{r.clicks.B.secondary}</div></div>
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-xl border p-4 bg-white/70 backdrop-blur">
            <h2 className="font-medium">CTR</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-neutral-500">A</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><div className="text-[11px] text-neutral-500">Primary</div><div className="font-semibold">{(r.ctr.A.primary*100).toFixed(1)}%</div></div>
                  <div><div className="text-[11px] text-neutral-500">Secondary</div><div className="font-semibold">{(r.ctr.A.secondary*100).toFixed(1)}%</div></div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-neutral-500">B</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><div className="text-[11px] text-neutral-500">Primary</div><div className="font-semibold">{(r.ctr.B.primary*100).toFixed(1)}%</div></div>
                  <div><div className="text-[11px] text-neutral-500">Secondary</div><div className="font-semibold">{(r.ctr.B.secondary*100).toFixed(1)}%</div></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
