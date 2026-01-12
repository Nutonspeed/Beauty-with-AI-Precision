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
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations } from "next-intl"

export function QuickActions() {
  const t = useTranslations()
  const lp = useLocalizePath()

  const quickActions = [
    {
      title: t('dashboard.quickActions.actions.viewCustomers.title'),
      description: t('dashboard.quickActions.actions.viewCustomers.description'),
      icon: Users,
      color: "bg-blue-500",
      action: "view-customers"
    },
    {
      title: t('dashboard.quickActions.actions.generateReport.title'),
      description: t('dashboard.quickActions.actions.generateReport.description'),
      icon: FileText,
      color: "bg-green-500",
      action: "generate-report"
    },
    {
      title: t('dashboard.quickActions.actions.contactLeads.title'),
      description: t('dashboard.quickActions.actions.contactLeads.description'),
      icon: Phone,
      color: "bg-red-500",
      action: "contact-leads",
      badge: `3 ${t('dashboard.quickActions.urgent')}`
    },
    {
      title: t('dashboard.quickActions.actions.scheduleAppointments.title'),
      description: t('dashboard.quickActions.actions.scheduleAppointments.description'),
      icon: Calendar,
      color: "bg-purple-500",
      action: "schedule-appointments"
    },
    {
      title: t('dashboard.quickActions.actions.liveChat.title'),
      description: t('dashboard.quickActions.actions.liveChat.description'),
      icon: MessageSquare,
      color: "bg-orange-500",
      action: "live-chat",
      badge: `2 ${t('dashboard.quickActions.active')}`
    },
    {
      title: t('dashboard.quickActions.actions.analyticsDashboard.title'),
      description: t('dashboard.quickActions.actions.analyticsDashboard.description'),
      icon: BarChart3,
      color: "bg-indigo-500",
      action: "analytics-dashboard"
    },
    {
      title: t('dashboard.quickActions.actions.exportData.title'),
      description: t('dashboard.quickActions.actions.exportData.description'),
      icon: Download,
      color: "bg-teal-500",
      action: "export-data"
    },
    {
      title: t('dashboard.quickActions.actions.importCustomers.title'),
      description: t('dashboard.quickActions.actions.importCustomers.description'),
      icon: Upload,
      color: "bg-pink-500",
      action: "import-customers"
    }
  ]

  const handleAction = (action: string) => {
    // ในโปรดักชั่นจะมี logic จริง
    console.log(`Executing action: ${action}`)
    // TODO: Implement actual navigation and actions
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ {t('dashboard.quickActions.title')}
          <Badge className="bg-blue-100 text-blue-800">{t('dashboard.quickActions.available', { count: 8 })}</Badge>
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
            {t('dashboard.quickActions.powerActions')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button className="justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              {t('dashboard.quickActions.centerSettings')}
            </Button>
            <Button className="justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('dashboard.quickActions.advancedAnalytics')}
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">{t('dashboard.quickActions.recentActivity')}</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{t('dashboard.quickActions.activity.newCustomer', { name: "นางสาว สมใจ รักสวย", program: "Complete Skin Renewal" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>{t('dashboard.quickActions.activity.targetAchieved', { percent: "+5.2%" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>{t('dashboard.quickActions.activity.hotLeadsFollowup', { count: 3 })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
