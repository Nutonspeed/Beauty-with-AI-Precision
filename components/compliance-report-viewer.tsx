/**
 * Compliance Report Viewer Component
 *
 * HIPAA/PDPA/GDPR/SOX compliance reporting and management
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useComplianceReports, useComplianceReport } from "@/hooks/useSecurity"
import { ComplianceStatus } from "@/lib/security/security-manager"
import {
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Calendar,
  Shield,
  Lock,
  Users,
  Database,
} from "lucide-react"

export default function ComplianceReportViewer() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [reportType, setReportType] = useState<"HIPAA" | "PDPA" | "GDPR" | "SOX">("HIPAA")

  const { reports, loading: reportsLoading, generateReport } = useComplianceReports()
  const { report: selectedReport, loading: reportLoading } = useComplianceReport(selectedReportId || "")

  const handleGenerateReport = async () => {
    // Generate report for the last 90 days
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    // In a real app, get current user from auth context
    const currentUserId = "USR001" // Placeholder
    const currentUserName = "System Administrator" // Placeholder
    
    await generateReport(reportType.toLowerCase() as any, { start: startDate, end: endDate }, currentUserId, currentUserName)
  }

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "violation":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "violation":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getComplianceIcon = (type: string) => {
    switch (type) {
      case "HIPAA":
        return <Shield className="h-4 w-4" />
      case "PDPA":
        return <Lock className="h-4 w-4" />
      case "GDPR":
        return <Users className="h-4 w-4" />
      case "SOX":
        return <Database className="h-4 w-4" />
      default:
        return <FileCheck className="h-4 w-4" />
    }
  }

  const exportReport = (report: any) => {
    const content = `
# ${report.reportType.toUpperCase()} Compliance Report
Generated: ${new Date(report.generatedAt).toLocaleString()}
Period: ${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}

## Overall Status: ${report.status.toUpperCase()}

## Summary
- Total Findings: ${report.findings.length}
- Compliant: ${report.findings.filter((f: any) => f.status === "compliant").length}
- Warnings: ${report.findings.filter((f: any) => f.status === "warning").length}
- Violations: ${report.findings.filter((f: any) => f.status === "violation").length}

## Findings
${report.findings.map((finding: any, index: number) => {
  const remediationSteps = finding.remediationSteps && finding.remediationSteps.length > 0
    ? finding.remediationSteps.map((step: string) => `- ${step}`).join('\n')
    : ''
  
  const remediationSection = remediationSteps
    ? `**Remediation Steps:**\n${remediationSteps}`
    : ''
  
  return `
### ${index + 1}. ${finding.requirement}
**Status:** ${finding.status.toUpperCase()}
**Category:** ${finding.category}
**Description:** ${finding.description}
**Evidence:** ${finding.evidence.join(', ')}
${remediationSection}
`.trim()
}).join('\n')}

## Recommendations
${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## Next Review Date
${new Date(report.period.end.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.reportType}-compliance-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Reports</h2>
          <p className="text-muted-foreground mt-2">
            HIPAA, PDPA, GDPR, and SOX compliance monitoring and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="PDPA">PDPA</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="SOX">SOX</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === "compliant").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === "warning").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.status === "violation").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>
            Historical compliance reports and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reports...
            </div>
          ) : (
            <>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-2" />
                  <p>No compliance reports generated yet</p>
                  <p className="text-sm">Generate your first report to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      className={`w-full p-4 border rounded-lg cursor-pointer transition-colors text-left ${
                        selectedReportId === report.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedReportId(
                        selectedReportId === report.id ? null : report.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getComplianceIcon(report.reportType)}
                          <div>
                            <h4 className="font-semibold">{report.reportType.toUpperCase()} Compliance Report</h4>
                            <p className="text-sm text-muted-foreground">
                              Generated {new Date(report.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status}</span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              exportReport(report)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Compliance Score</span>
                          <span>
                            {report.findings.filter((f: any) => f.status === "compliant").length}/
                            {report.findings.length} findings compliant
                          </span>
                        </div>
                        <Progress
                          value={(report.findings.filter((f: any) => f.status === "compliant").length / report.findings.length) * 100}
                          className="h-2"
                        />
                      </div>

                      {/* Next Review */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Next review: {new Date(report.period.end.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Report Details */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getComplianceIcon(selectedReport.reportType)}
              {selectedReport.reportType} Compliance Report Details
            </CardTitle>
            <CardDescription>
              Generated on {new Date(selectedReport.generatedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading report details...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedReport.status)}
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      {selectedReport.status} Status
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedReport.findings.length} findings reviewed
                    </p>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Compliance Findings</h4>
                  <div className="space-y-4">
                    {selectedReport.findings.map((finding: any, index: number) => {
                      const getBadgeVariant = (status: string) => {
                        if (status === "compliant") return "default";
                        if (status === "warning") return "secondary";
                        return "destructive";
                      };
                      const badgeVariant = getBadgeVariant(finding.status);
                      return (
                        <Card key={`${finding.title}-${index}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-semibold">{finding.title}</h5>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {finding.description}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={badgeVariant}>
                                  {finding.severity.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(finding.status)}>
                                  {finding.status.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                          {/* Recommendation */}
                          <div className="bg-muted p-3 rounded-lg">
                            <h6 className="font-medium text-sm mb-1">Recommendation</h6>
                            <p className="text-sm">{finding.recommendation}</p>
                          </div>

                          {/* Remediation Steps */}
                          {finding.remediationSteps && finding.remediationSteps.length > 0 && (
                            <div className="mt-3">
                              <h6 className="font-medium text-sm mb-2">Remediation Steps</h6>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                {finding.remediationSteps.map((step: string, stepIndex: number) => (
                                  <li key={`${finding.title}-step-${stepIndex}`}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => exportReport(selectedReport)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReportId(null)}>
                    Close Details
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
