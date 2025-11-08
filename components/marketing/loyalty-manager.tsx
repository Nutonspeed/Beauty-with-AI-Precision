"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp, Users, Award } from "lucide-react"

export function LoyaltyManager() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalPointsIssued: 0,
    averagePoints: 0,
    tierDistribution: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
  })

  useEffect(() => {
    // Fetch loyalty stats
    // This would be a real API call
    setStats({
      totalMembers: 1250,
      totalPointsIssued: 125000,
      averagePoints: 100,
      tierDistribution: { bronze: 800, silver: 300, gold: 120, platinum: 30 },
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPointsIssued.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platinum Members</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tierDistribution.platinum}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Member distribution across loyalty tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={tier === "platinum" ? "default" : "secondary"}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{count} members</span>
                </div>
                <div className="w-48 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(count / stats.totalMembers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Award Points</CardTitle>
          <CardDescription>Manually award or adjust customer loyalty points</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Email</Label>
                <Input id="customer" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input id="points" type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="adjusted">Adjusted</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" placeholder="Reason for points adjustment" />
            </div>
            <Button type="submit">Award Points</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
