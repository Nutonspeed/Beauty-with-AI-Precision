"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Clock, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface TreatmentPlan {
  id: string
  concern_type: string
  treatments: { name: string; sessions: number }[]
  estimated_duration: string
  estimated_cost: number
  is_active: boolean
  created_at: string
}

interface TreatmentPlanCardProps {
  plan: TreatmentPlan
  onUpdate: () => void
}

export function TreatmentPlanCard({ plan, onUpdate: _onUpdate }: TreatmentPlanCardProps) {
  const totalSessions = plan.treatments.reduce((sum, t) => sum + t.sessions, 0)
  const completedSessions = 0 // This would come from sessions data
  const progress = (completedSessions / totalSessions) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.concern_type}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(plan.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSessions}/{totalSessions} sessions
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2">
          {plan.treatments.map((treatment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{treatment.name}</span>
              <Badge variant="outline">{treatment.sessions} sessions</Badge>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{plan.estimated_duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${plan.estimated_cost.toLocaleString()}</span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/treatment-plans/${plan.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
