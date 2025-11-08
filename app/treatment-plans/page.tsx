"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreatmentPlanCard } from "@/components/treatment-plans/treatment-plan-card"
import { CreatePlanDialog } from "@/components/treatment-plans/create-plan-dialog"
import { Plus, Loader2 } from "lucide-react"

interface TreatmentPlan {
  id: string
  concern_type: string
  treatments: { name: string; sessions: number }[]
  estimated_duration: string
  estimated_cost: number
  is_active: boolean
  created_at: string
}

export default function TreatmentPlansPage() {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/treatment-plans")
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error("[v0] Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treatment Plans</h1>
          <p className="text-muted-foreground">Manage and track treatment progress</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96">
            <p className="text-muted-foreground mb-4">No treatment plans yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <TreatmentPlanCard key={plan.id} plan={plan} onUpdate={fetchPlans} />
          ))}
        </div>
      )}

      <CreatePlanDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchPlans} />
    </div>
  )
}
