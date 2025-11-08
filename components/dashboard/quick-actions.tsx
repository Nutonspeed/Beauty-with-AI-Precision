"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  MessageSquare,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  Download,
  Upload,
  Zap
} from "lucide-react"

const quickActions = [
  {
    title: "View All Customers",
    description: "Browse customer database and profiles",
    icon: Users,
    color: "bg-blue-500",
    action: "view-customers"
  },
  {
    title: "Generate Report",
    description: "Create monthly performance report",
    icon: FileText,
    color: "bg-green-500",
    action: "generate-report"
  },
  {
    title: "Contact Hot Leads",
    description: "Reach out to high-potential customers",
    icon: Phone,
    color: "bg-red-500",
    action: "contact-leads",
    badge: "3 urgent"
  },
  {
    title: "Schedule Appointments",
    description: "Manage booking calendar",
    icon: Calendar,
    color: "bg-purple-500",
    action: "schedule-appointments"
  },
  {
    title: "Live Chat",
    description: "Monitor customer conversations",
    icon: MessageSquare,
    color: "bg-orange-500",
    action: "live-chat",
    badge: "2 active"
  },
  {
    title: "Analytics Dashboard",
    description: "Deep dive into performance metrics",
    icon: BarChart3,
    color: "bg-indigo-500",
    action: "analytics-dashboard"
  },
  {
    title: "Export Data",
    description: "Download customer and sales data",
    icon: Download,
    color: "bg-teal-500",
    action: "export-data"
  },
  {
    title: "Import Customers",
    description: "Bulk import customer information",
    icon: Upload,
    color: "bg-pink-500",
    action: "import-customers"
  }
]

export function QuickActions() {
  const handleAction = (action: string) => {
    // ในโปรดักชั่นจะมี logic จริง
    console.log(`Executing action: ${action}`)
    // TODO: Implement actual navigation and actions
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ Quick Actions
          <Badge className="bg-blue-100 text-blue-800">8 Available</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <Button
                key={action.action}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors"
                onClick={() => handleAction(action.action)}
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                  {action.badge && (
                    <Badge className="mt-2 text-xs bg-red-100 text-red-800">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            )
          })}
        </div>

        {/* Power Actions */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Power Actions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button className="justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Clinic Settings & Configuration
            </Button>
            <Button className="justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Analytics & Insights
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">Recent Activity</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>New customer "นางสาว สมใจ รักสวย" booked Complete Skin Renewal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Revenue target achieved for the month (+5.2%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>3 hot leads require immediate follow-up</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
