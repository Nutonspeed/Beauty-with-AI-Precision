"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export default function RoiMiniCalculator() {
  const [leads, setLeads] = useState(120)
  const [avgBill, setAvgBill] = useState(4500)
  const [conv, setConv] = useState(12)
  const [improve, setImprove] = useState(8)

  const emit = (payload: any) => {
    try {
      if (typeof window !== "undefined") {
        const ev = new CustomEvent("roi:change", { detail: { ...payload, ts: Date.now() } })
        window.dispatchEvent(ev)
      }
    } catch {}
  }

  const { newConv, addedDeals, addedRevenue } = useMemo(() => {
    const baseConv = Math.max(0, Math.min(100, conv)) / 100
    const uplift = Math.max(0, Math.min(100, improve)) / 100
    const newConv = Math.min(1, baseConv * (1 + uplift))
    const addedDeals = Math.round(leads * (newConv - baseConv))
    const addedRevenue = Math.max(0, Math.round(addedDeals * avgBill))
    return { newConv, addedDeals, addedRevenue }
  }, [leads, avgBill, conv, improve])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">ROI (ประมาณการ)</CardTitle>
        <CardDescription>ลองใส่ตัวเลขของคลินิกคุณ ผลลัพธ์นี้เป็นการประมาณการเบื้องต้น</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="leads">จำนวนลีดต่อเดือน</Label>
            <Input
              id="leads"
              type="number"
              inputMode="numeric"
              value={leads}
              onChange={(e) => {
                const v = Number(e.target.value || 0)
                setLeads(v)
                emit({ leads: v, avgBill, conv, improve })
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avg">บิลเฉลี่ย (บาท)</Label>
            <Input
              id="avg"
              type="number"
              inputMode="numeric"
              value={avgBill}
              onChange={(e) => {
                const v = Number(e.target.value || 0)
                setAvgBill(v)
                emit({ leads, avgBill: v, conv, improve })
              }}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="conv">Conversion ปัจจุบัน (%)</Label>
              <span className="text-xs text-muted-foreground">{conv}%</span>
            </div>
            <Slider
              value={[conv]}
              min={1}
              max={60}
              step={1}
              onValueChange={(v) => {
                setConv(v[0])
                emit({ leads, avgBill, conv: v[0], improve })
              }}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="improve">คาดว่าเพิ่มขึ้นด้วย AI (%)</Label>
              <span className="text-xs text-muted-foreground">{improve}%</span>
            </div>
            <Slider
              value={[improve]}
              min={0}
              max={50}
              step={1}
              onValueChange={(v) => {
                setImprove(v[0])
                emit({ leads, avgBill, conv, improve: v[0] })
              }}
            />
          </div>
        </div>
        <div className="grid content-center gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Conversion ใหม่</span>
            <span className="text-2xl font-bold text-primary">{Math.round(newConv * 100)}%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">ดีลที่เพิ่มขึ้น/เดือน</span>
            <span className="text-2xl font-bold">{addedDeals}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">รายได้เพิ่ม/เดือน</span>
            <span className="text-2xl font-bold text-foreground">฿{addedRevenue.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground">ขึ้นกับจำนวนลีด/บิลเฉลี่ย/อัตราเปลี่ยนแปลงจริงของแต่ละคลินิก</div>
        </div>
      </CardContent>
    </Card>
  )
}
