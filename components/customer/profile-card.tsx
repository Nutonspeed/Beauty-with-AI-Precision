"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Edit } from "lucide-react"
import { useState } from "react"

interface ProfileCardProps {
  user: {
    id: string
    email?: string
    created_at: string
  }
  profile: {
    full_name?: string
    phone?: string
    role?: string
  } | null
}

export function ProfileCard({ user, profile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input id="name" defaultValue={profile?.full_name || ""} placeholder="Enter your name" />
              ) : (
                <span>{profile?.full_name || "Not set"}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input id="phone" defaultValue={profile?.phone || ""} placeholder="Enter your phone" />
              ) : (
                <span>{profile?.phone || "Not set"}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {isEditing && <Button className="w-full">Save Changes</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Badge className="text-sm">
              {profile?.role === "customer_premium" ? "Premium Customer" : "Free Customer"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Subscription</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.role === "customer_premium" ? "Active Premium Subscription" : "Free Plan"}
            </p>
          </div>

          {profile?.role !== "customer_premium" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-2 font-semibold">Upgrade to Premium</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Get unlimited AI analyses, priority booking, and exclusive features
              </p>
              <Button className="w-full">Upgrade Now</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
