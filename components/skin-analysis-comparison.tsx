"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, TrendingUp, TrendingDown } from "lucide-react"

interface MetricData {
  name: string
  name_th: string
  score: number
  grade: string
  trend: string
  description: string
  description_th: string
}

interface AnalysisData {
  overall_score: number
  skin_age: number
  actual_age: number
  metrics: MetricData[]
}

interface SkinAnalysisComparisonProps {
  currentData: AnalysisData
}

export function SkinAnalysisComparison({ currentData }: SkinAnalysisComparisonProps) {
  // Mock previous data for comparison
  const previousData = {
    overall_score: 72,
    date: "2 weeks ago",
    metrics: currentData.metrics.map((m) => ({
      ...m,
      score: m.score - Math.floor(Math.random() * 10) + 3,
    })),
  }

  const scoreDiff = currentData.overall_score - previousData.overall_score

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking / ติดตามผล</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare your current results with previous analysis / เปรียบเทียบผลปัจจุบันกับการวิเคราะห์ก่อนหน้า
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No Previous Analysis Found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload a previous photo to compare results
              <br />
              อัปโหลดรูปก่อนหน้าเพื่อเปรียบเทียบผล
            </p>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Previous Photo
            </Button>
          </div>

          {/* Mock Comparison Data */}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Overall Progress</h4>
                  <p className="text-sm text-muted-foreground">Since {previousData.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {scoreDiff > 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">+{scoreDiff}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">{scoreDiff}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Previous Score</div>
                  <div className="text-xl font-bold">{previousData.overall_score}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Current Score</div>
                  <div className="text-xl font-bold text-primary">{currentData.overall_score}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {currentData.metrics.map((metric, index) => {
                const prevMetric = previousData.metrics[index]
                const diff = metric.score - prevMetric.score

                return (
                  <div key={index} className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{metric.name}</h5>
                        <p className="text-xs text-muted-foreground">{metric.name_th}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {diff > 0 ? (
                          <Badge className="bg-green-500/10 text-green-700" variant="outline">
                            <TrendingUp className="mr-1 h-3 w-3" />+{diff}
                          </Badge>
                        ) : diff < 0 ? (
                          <Badge className="bg-red-500/10 text-red-700" variant="outline">
                            <TrendingDown className="mr-1 h-3 w-3" />
                            {diff}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No change</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Previous</span>
                          <span className="font-medium">{prevMetric.score}</span>
                        </div>
                        <Progress value={prevMetric.score} className="h-1.5" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Current</span>
                          <span className="font-medium text-primary">{metric.score}</span>
                        </div>
                        <Progress value={metric.score} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold">Track Your Progress Over Time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium users get unlimited progress tracking with detailed before/after comparisons
                <br />
                ผู้ใช้ Premium ได้รับการติดตามผลไม่จำกัดพร้อมการเปรียบเทียบก่อน-หลังแบบละเอียด
              </p>
            </div>
            <Button className="shrink-0">Upgrade to Premium</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
