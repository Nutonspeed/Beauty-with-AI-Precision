"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function FixRLSPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null)

  const handleFix = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/fix-rls", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to fix RLS policies",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Fix RLS Infinite Recursion</CardTitle>
          <CardDescription>
            This will fix the "infinite recursion detected in policy for relation users" error by recreating the RLS
            policies with security definer functions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What this does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Drops problematic RLS policies that cause infinite recursion</li>
              <li>Creates helper functions that bypass RLS for role checks</li>
              <li>Recreates policies using the new helper functions</li>
            </ul>
          </div>

          <Button onClick={handleFix} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Fixing RLS Policies..." : "Fix RLS Policies"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message || result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
