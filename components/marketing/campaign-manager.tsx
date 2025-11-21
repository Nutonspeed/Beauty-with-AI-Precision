"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Send, Eye } from "lucide-react"

export function CampaignManager() {
  const [campaigns, _setCampaigns] = useState([
    {
      id: "1",
      name: "Summer Promotion",
      subject: "Get 20% off all treatments this summer!",
      status: "sent",
      recipientsCount: 1200,
      openedCount: 480,
      clickedCount: 120,
      sentAt: "2024-01-15",
    },
    {
      id: "2",
      name: "New Treatment Launch",
      subject: "Introducing our latest anti-aging treatment",
      status: "scheduled",
      recipientsCount: 850,
      openedCount: 0,
      clickedCount: 0,
      sentAt: null,
    },
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>Design and send email campaigns to customers</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input id="campaign-name" placeholder="Spring Sale 2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" placeholder="Don't miss our spring sale!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea id="content" placeholder="Write your email content here..." rows={6} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>View past and scheduled email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{campaign.name}</h4>
                    <Badge
                      variant={
                        campaign.status === "sent"
                          ? "default"
                          : campaign.status === "scheduled"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{campaign.recipientsCount} recipients</span>
                    {campaign.status === "sent" && (
                      <>
                        <span className="text-muted-foreground">
                          {((campaign.openedCount / campaign.recipientsCount) * 100).toFixed(1)}% opened
                        </span>
                        <span className="text-muted-foreground">
                          {((campaign.clickedCount / campaign.recipientsCount) * 100).toFixed(1)}% clicked
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
