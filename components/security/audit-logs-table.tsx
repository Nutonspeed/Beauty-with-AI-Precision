"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export function AuditLogsTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/security/audit-logs")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Audit Logs</CardTitle>
            <CardDescription>Complete history of system activities and user actions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="flex items-center gap-4 flex-1">
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                  <code className="font-mono text-xs">{log.action}</code>
                  <span className="text-muted-foreground">{log.user?.email || "System"}</span>
                  <span className="text-muted-foreground">{log.resource_type}</span>
                </div>
                <div className="text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
