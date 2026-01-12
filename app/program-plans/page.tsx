"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgramPlanCard } from "@/components/program-plans/program-plan-card"
import { CreatePlanDialog } from "@/components/program-plans/create-plan-dialog"
import { Plus, Loader2 } from "lucide-react"

interface ProgramPlan {
  id: string
  concern_type: string
  programs: { name: string; sessions: number }[]
  estimated_duration: string
  estimated_cost: number
  is_active: boolean
  created_at: string
}

export default function ProgramPlansPage() {
  const [plans, setPlans] = useState<ProgramPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/program-plans")
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
          <h1 className="text-3xl font-bold">Program Plans</h1>
          <p className="text-muted-foreground">Manage and track program progress</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-96">
            <p className="text-muted-foreground mb-4">No program plans yet</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <ProgramPlanCard key={plan.id} plan={plan} onUpdate={fetchPlans} />
          ))}
        </div>
      )}

      <CreatePlanDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchPlans} />
    </div>
  )
}
