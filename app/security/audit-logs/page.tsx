import { Suspense } from "react"
import { checkUserRole } from "@/lib/auth/check-role"
import { AuditLogsTable } from "@/components/security/audit-logs-table"

export default async function AuditLogsPage() {
  await checkUserRole(["super_admin"])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">View system activity and security events</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AuditLogsTable />
      </Suspense>
    </div>
  )
}
