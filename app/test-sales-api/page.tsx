"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Video, 
  Mail, 
  FileText, 
  Loader2, 
  Check, 
  X,
  RefreshCw 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TestResult {
  endpoint: string
  method: string
  status: "pending" | "success" | "error"
  statusCode?: number
  data?: any
  error?: string
  duration?: number
}

export default function TestSalesApiPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [runningTests, setRunningTests] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const runTest = async (
    endpoint: string,
    method: string,
    body?: any
  ): Promise<TestResult> => {
    const startTime = performance.now()
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (body && method !== "GET") {
        options.body = JSON.stringify(body)
      }

      const url = endpoint.includes("?") ? endpoint : endpoint
      const response = await fetch(url, options)
      const endTime = performance.now()

      const data = response.ok ? await response.json() : await response.text()

      return {
        endpoint,
        method,
        status: response.ok ? "success" : "error",
        statusCode: response.status,
        data: response.ok ? data : undefined,
        error: !response.ok ? data : undefined,
        duration: Math.round(endTime - startTime),
      }
    } catch (error: any) {
      const endTime = performance.now()
      return {
        endpoint,
        method,
        status: "error",
        error: error.message,
        duration: Math.round(endTime - startTime),
      }
    }
  }

  const runAllTests = async () => {
    if (!user) {
      alert("คุณต้องเข้าสู่ระบบก่อนทดสอบ API")
      return
    }

    setRunningTests(true)
    setTestResults([])

    const tests: Array<() => Promise<TestResult>> = [
      // Email Templates
      () => runTest("/api/sales/email-templates", "GET"),
      () =>
        runTest("/api/sales/email-templates", "POST", {
          name: "Test Template",
          subject: "Test Subject",
          content: "Test Content {{customer_name}}",
          category: "follow_up",
          variables: ["customer_name"],
        }),

      // Chat Messages (need a test lead_id)
      () => runTest("/api/sales/chat-messages?lead_id=test-lead-123", "GET"),
      () =>
        runTest("/api/sales/chat-messages", "POST", {
          lead_id: "test-lead-123",
          content: "Test message from API test",
          sender_type: "sales",
          sent_at: new Date().toISOString(),
        }),

      // Video Call
      () => runTest("/api/sales/video-call?lead_id=test-lead-123", "GET"),
      () =>
        runTest("/api/sales/video-call", "POST", {
          lead_id: "test-lead-123",
          room_id: `test-room-${Date.now()}`,
          status: "scheduled",
          scheduled_at: new Date().toISOString(),
        }),

      // Email Tracking
      () => runTest("/api/sales/email-tracking?lead_id=test-lead-123", "GET"),
      () =>
        runTest("/api/sales/email-tracking", "POST", {
          lead_id: "test-lead-123",
          template_id: null,
          subject: "Test Email",
          content: "Test email content",
          recipient_email: "test@example.com",
          status: "sent",
          sent_at: new Date().toISOString(),
        }),
    ]

    const results: TestResult[] = []
    for (const test of tests) {
      const result = await test()
      results.push(result)
      setTestResults([...results])
    }

    setRunningTests(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-600" />
      case "error":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const getStatusBadge = (status: TestResult["status"], statusCode?: number) => {
    if (status === "success") {
      return (
        <Badge variant="default" className="bg-green-600">
          {statusCode} OK
        </Badge>
      )
    }
    if (status === "error") {
      return (
        <Badge variant="destructive">
          {statusCode || "Error"}
        </Badge>
      )
    }
    return <Badge variant="outline">Pending</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Sales Dashboard API Testing</h1>
          <p className="mb-6 text-muted-foreground">
            คุณต้องเข้าสู่ระบบก่อนใช้งาน API Test Page
          </p>
          <Button onClick={() => (window.location.href = "/login")}>
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Sales Dashboard API Testing</h1>
        <p className="text-muted-foreground">
          ทดสอบ API endpoints ทั้งหมดของระบบ Sales Dashboard
        </p>
      </div>

      {/* User Info */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Authenticated
          </Badge>
        </div>
      </Card>

      {/* Run Tests Button */}
      <div className="mb-6">
        <Button
          onClick={runAllTests}
          disabled={runningTests}
          size="lg"
          className="w-full sm:w-auto"
        >
          {runningTests ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังทดสอบ...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              เริ่มทดสอบทั้งหมด
            </>
          )}
        </Button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({testResults.length})</TabsTrigger>
            <TabsTrigger value="email-templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="mr-2 h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="email-tracking">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <code className="text-sm font-mono">
                        {result.method} {result.endpoint}
                      </code>
                      {getStatusBadge(result.status, result.statusCode)}
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                    </div>

                    {result.data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                          Response Data
                        </summary>
                        <pre className="mt-2 overflow-auto rounded-lg bg-muted p-3 text-xs">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {result.error && (
                      <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="email-templates">
            {testResults
              .filter((r) => r.endpoint.includes("email-templates"))
              .map((result, index) => (
                <Card key={index} className="mb-4 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono">
                      {result.method} {result.endpoint}
                    </code>
                    {getStatusBadge(result.status, result.statusCode)}
                  </div>
                  {result.data && (
                    <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="chat">
            {testResults
              .filter((r) => r.endpoint.includes("chat-messages"))
              .map((result, index) => (
                <Card key={index} className="mb-4 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono">
                      {result.method} {result.endpoint}
                    </code>
                    {getStatusBadge(result.status, result.statusCode)}
                  </div>
                  {result.data && (
                    <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="video">
            {testResults
              .filter((r) => r.endpoint.includes("video-call"))
              .map((result, index) => (
                <Card key={index} className="mb-4 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono">
                      {result.method} {result.endpoint}
                    </code>
                    {getStatusBadge(result.status, result.statusCode)}
                  </div>
                  {result.data && (
                    <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="email-tracking">
            {testResults
              .filter((r) => r.endpoint.includes("email-tracking"))
              .map((result, index) => (
                <Card key={index} className="mb-4 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono">
                      {result.method} {result.endpoint}
                    </code>
                    {getStatusBadge(result.status, result.statusCode)}
                  </div>
                  {result.data && (
                    <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Info */}
      <Card className="mt-6 border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">
          📋 API Endpoints ที่ทดสอบ
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✅ GET/POST /api/sales/email-templates</li>
          <li>✅ GET/POST /api/sales/chat-messages</li>
          <li>✅ GET/POST /api/sales/video-call</li>
          <li>✅ GET/POST /api/sales/email-tracking</li>
        </ul>
      </Card>
    </div>
  )
}
