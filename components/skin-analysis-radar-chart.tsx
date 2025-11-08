"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MetricData {
  name: string
  name_th: string
  score: number
  grade: string
  trend: string
  description: string
  description_th: string
}

interface SkinAnalysisRadarChartProps {
  data: MetricData[]
}

export function SkinAnalysisRadarChart({ data }: SkinAnalysisRadarChartProps) {
  // Transform data for radar chart
  const chartData = data.map((metric) => ({
    metric: metric.name,
    score: metric.score,
  }))

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Metric Radar Chart / กราฟเรดาร์หลายมิติ</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual representation of all 8 skin metrics / แสดงภาพรวมทั้ง 8 ตัวชี้วัด
        </p>
      </CardHeader>
      <CardContent>
        {/* <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[500px]"> */}
        <div className="mx-auto aspect-square max-h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              {/* <ChartTooltip content={<ChartTooltipContent />} /> */}
              <Tooltip />
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* </ChartContainer> */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {data.map((metric, index) => (
            <div key={index} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <div className="text-xs text-muted-foreground">{metric.name}</div>
              <div className="text-lg font-bold text-primary">{metric.score}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
