"use client"

import { useEffect, useState } from "react"

type UsageEvent = {
  id?: string
  event_type: string
  user_id?: string | null
  properties?: {
    category?: string
    tenantId?: string
    sessionId?: string
    metadata?: Record<string, any>
    timestamp?: string
  }
  timestamp?: string
}

type EventsResponse = {
  success: boolean
  events?: UsageEvent[]
  stats?: {
    total: number
    byCategory: Record<string, number>
    byEvent: Record<string, number>
    uniqueUsers: number
    dateRange: { start?: string; end?: string }
  }
  error?: { message: string }
}

type PerfResponse = {
  success: boolean
  data?: {
    metrics: any[]
    stats: {
      total: number
      last24h: number
      byType: Record<string, number>
      byRating: { good: number; "needs-improvement": number; poor: number }
      averageValues: Record<string, number>
    }
  }
  error?: { message: string }
}

function BarChart({ series, height = 120, color = '#a78bfa' }: { series: { x: number; y: number }[]; height?: number; color?: string }) {
  const maxY = Math.max(1, ...series.map(s => s.y))
  const barWidth = Math.max(2, Math.floor(600 / Math.max(1, series.length)))
  const svgWidth = Math.max(600, barWidth * series.length)
  return (
    <svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`} role="img" aria-label="Bar chart">
      {series.map((s, i) => {
        const h = Math.round((s.y / maxY) * (height - 16))
        return (
          <g key={i}>
            <rect x={i * barWidth} y={height - h} width={barWidth - 1} height={h} fill={color} opacity={0.8} />
          </g>
        )
      })}
    </svg>
  )
}

function bucketByHour(timestamps: string[]) {
  const counts: Record<string, number> = {}
  timestamps.forEach(ts => {
    if (!ts) return
    const d = new Date(ts)
    if (isNaN(d.getTime())) return
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} ${String(d.getUTCHours()).padStart(2,'0')}:00`
    counts[key] = (counts[key] || 0) + 1
  })
  const entries = Object.entries(counts).sort((a,b) => a[0] < b[0] ? -1 : 1)
  return entries.map(([k, v], idx) => ({ x: idx, y: v }))
}

export default function AnalyticsClientPage() {
  const [events, setEvents] = useState<UsageEvent[]>([])
  const [eventStats, setEventStats] = useState<EventsResponse["stats"]>()
  const [perfStats, setPerfStats] = useState<PerfResponse["data"]>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [category, setCategory] = useState("")
  const [eventName, setEventName] = useState("")
  const [type, setType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [evRes, perfRes] = await Promise.all([
          fetch(`/api/analytics/events?limit=50`, { cache: "no-store" }),
          fetch(`/api/analytics/performance?limit=50`, { cache: "no-store" }),
        ])

        const evJson: EventsResponse = await evRes.json()
        const perfJson: PerfResponse = await perfRes.json()

        if (cancelled) return

        if (!evRes.ok) throw new Error(evJson?.error?.message || "Failed to load events")
        if (!perfRes.ok) throw new Error(perfJson?.error?.message || "Failed to load performance")

        setEvents(evJson.events || [])
        setEventStats(evJson.stats)
        setPerfStats(perfJson.data)
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const evParams = new URLSearchParams()
      evParams.set('limit', '100')
      if (category) evParams.set('category', category)
      if (eventName) evParams.set('event', eventName)
      if (startDate) evParams.set('startDate', startDate)
      if (endDate) evParams.set('endDate', endDate)

      const perfParams = new URLSearchParams()
      perfParams.set('limit', '100')
      if (type) perfParams.set('type', type)
      if (startDate) perfParams.set('startDate', startDate)
      if (endDate) perfParams.set('endDate', endDate)

      const [evRes, perfRes] = await Promise.all([
        fetch(`/api/analytics/events?${evParams.toString()}`, { cache: 'no-store' }),
        fetch(`/api/analytics/performance?${perfParams.toString()}`, { cache: 'no-store' }),
      ])
      const evJson: EventsResponse = await evRes.json()
      const perfJson: PerfResponse = await perfRes.json()
      if (!evRes.ok) throw new Error(evJson?.error?.message || 'Failed to load events')
      if (!perfRes.ok) throw new Error(perfJson?.error?.message || 'Failed to load performance')
      setEvents(evJson.events || [])
      setEventStats(evJson.stats)
      setPerfStats(perfJson.data)
    } catch (err: any) {
      setError(err?.message || 'Failed to apply filters')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
        <p className="text-sm text-gray-500">Loading analytics…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <p className="font-medium">Unable to load analytics</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-gray-400">Usage events and performance stats (admin)</p>
      </header>

      {/* Filters */}
      <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Category</label>
          <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="engagement/feature/..." className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Event</label>
          <input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="event name" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Type (perf)</label>
          <input value={type} onChange={e=>setType(e.target.value)} placeholder="LCP/CLS/long-task" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-xs text-gray-400 mb-1">Start</label>
          <input id="startDate" aria-label="Start date" type="datetime-local" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-xs text-gray-400 mb-1">End</label>
          <input id="endDate" aria-label="End date" type="datetime-local" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm outline-none" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-white/10 border border-white/20 text-sm hover:bg-white/20">Apply</button>
          <button type="button" onClick={()=>{setCategory('');setEventName('');setType('');setStartDate('');setEndDate('');applyFilters();}} className="px-3 py-2 rounded bg-white/5 border border-white/10 text-sm hover:bg-white/10">Reset</button>
        </div>
      </form>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-400">Events (total)</p>
          <p className="text-2xl font-semibold">{eventStats?.total ?? 0}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-400">Perf (24h)</p>
          <p className="text-2xl font-semibold">{perfStats?.stats.last24h ?? 0}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-400">Unique users</p>
          <p className="text-2xl font-semibold">{eventStats?.uniqueUsers ?? 0}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent Events</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">User</th>
              </tr>
            </thead>
            <tbody>
              {events?.slice(0, 20).map((e, i) => (
                <tr key={i} className="odd:bg-white/0 even:bg-white/5">
                  <td className="px-3 py-2 text-gray-300">{e.timestamp || e.properties?.timestamp}</td>
                  <td className="px-3 py-2 font-mono">{e.event_type}</td>
                  <td className="px-3 py-2">{e.properties?.category || '—'}</td>
                  <td className="px-3 py-2">{e.user_id || 'anonymous'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Events by hour (UTC) */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-400 mb-2">Events by hour (UTC)</p>
          <div className="overflow-x-auto">
            <BarChart series={bucketByHour((events||[]).map(e => e.timestamp || e.properties?.timestamp || ''))} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Performance (last 24h)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-400">By type</p>
            <ul className="mt-2 space-y-1">
              {perfStats?.stats && Object.entries(perfStats.stats.byType).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="opacity-80">{v}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-400">By rating</p>
            <ul className="mt-2 space-y-1">
              {perfStats?.stats && Object.entries(perfStats.stats.byRating).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="opacity-80">{v}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-400">Avg values</p>
            <ul className="mt-2 space-y-1">
              {perfStats?.stats && Object.entries(perfStats.stats.averageValues).map(([k, v]) => (
                <li key={k} className="flex justify-between"><span>{k}</span><span className="opacity-80">{Math.round(v)}</span></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Perf logs by hour (UTC) */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-400 mb-2">Performance logs by hour (UTC)</p>
          <div className="overflow-x-auto">
            <BarChart series={bucketByHour((perfStats?.metrics||[]).map((m:any) => m.created_at || m.timestamp || ''))} color="#34d399" />
          </div>
        </div>
      </section>
    </div>
  )
}
