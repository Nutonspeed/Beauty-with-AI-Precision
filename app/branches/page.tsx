"use client"

/**
 * Branch Management Demo Page
 * 
 * Complete demo showcasing multi-branch management, staff transfers,
 * inventory tracking, and analytics.
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  ArrowLeftRight,
  Package,
  BarChart3,
  Plus,
  Settings,
} from "lucide-react"
import BranchDashboard from "@/components/branch-dashboard"
import StaffTransferModal from "@/components/staff-transfer-modal"
import { useBranches, useBranchComparison } from "@/hooks/useBranch"

export default function BranchManagementPage() {
  const { branches } = useBranches({ status: "active" })
  const [selectedBranchId, setSelectedBranchId] = useState<string>()
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [transferMode, setTransferMode] = useState<"request" | "approve" | "view">("request")

  // Get comparison data for all branches
  const branchIds = branches.map(b => b.id)
  const { reports } = useBranchComparison(
    branchIds,
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date()
  )

  const selectedBranch = branches.find(b => b.id === selectedBranchId)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Branch Management System
            </h1>
            <p className="text-gray-600 mt-2">
              Multi-branch operations, staff transfers, and inventory management
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Branch
          </Button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{branches.length}</div>
              <p className="text-xs text-gray-500">
                {branches.filter(b => b.status === "active").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {reports.reduce((sum, r) => sum + r.metrics.totalStaff, 0)}
              </div>
              <p className="text-xs text-gray-500">
                {reports.reduce((sum, r) => sum + r.metrics.activeStaff, 0)} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Active Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {reports.reduce((sum, r) => sum + r.metrics.transfersIn + r.metrics.transfersOut, 0)}
              </div>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ฿{reports.reduce((sum, r) => sum + r.metrics.totalInventoryValue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Across all branches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="branches" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branches">
            <Building2 className="h-4 w-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Staff Transfers
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <BarChart3 className="h-4 w-4 mr-2" />
            Branch Comparison
          </TabsTrigger>
          <TabsTrigger value="how-it-works">
            <Settings className="h-4 w-4 mr-2" />
            How It Works
          </TabsTrigger>
        </TabsList>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          {/* Branch Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Branch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map(branch => (
                  <Card
                    key={branch.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedBranchId === branch.id ? "ring-2 ring-blue-600" : ""
                    }`}
                    onClick={() => setSelectedBranchId(branch.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-8 w-8 text-blue-600" />
                          <div>
                            <div className="font-semibold">{branch.name}</div>
                            <div className="text-sm text-gray-500">{branch.code}</div>
                          </div>
                        </div>
                        <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                          {branch.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{branch.address.city}, {branch.address.province}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span>{branch.staffCount} staff</span>
                          <span>{branch.roomCount} rooms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Branch Dashboard */}
          {selectedBranchId ? (
            <BranchDashboard branchId={selectedBranchId} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a branch to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Staff Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Staff Transfer Management</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTransferMode("view")
                      setTransferModalOpen(true)
                    }}
                  >
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTransferMode("approve")
                      setTransferModalOpen(true)
                    }}
                  >
                    Pending Approvals
                  </Button>
                  <Button
                    onClick={() => {
                      setTransferMode("request")
                      setTransferModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Transfer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">Manage staff transfers between branches</p>
                <p className="text-sm">
                  Click "Request Transfer" to move staff between branches or "Pending Approvals" to review requests
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branch Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch Performance Comparison (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Branch</th>
                      <th className="text-right py-3 px-4">Staff</th>
                      <th className="text-right py-3 px-4">Transfers In</th>
                      <th className="text-right py-3 px-4">Transfers Out</th>
                      <th className="text-right py-3 px-4">Inventory Value</th>
                      <th className="text-right py-3 px-4">Low Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => {
                      const branch = branches.find(b => b.id === report.branchId)
                      return (
                        <tr key={report.branchId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{branch?.name}</div>
                            <div className="text-sm text-gray-500">{branch?.code}</div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="font-medium">{report.metrics.activeStaff}</div>
                            <div className="text-sm text-gray-500">
                              of {report.metrics.totalStaff}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-green-600 font-medium">
                            +{report.metrics.transfersIn}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600 font-medium">
                            -{report.metrics.transfersOut}
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            ฿{report.metrics.totalInventoryValue.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4">
                            {report.metrics.lowStockItems > 0 ? (
                              <Badge variant="destructive">{report.metrics.lowStockItems}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works Tab */}
        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch Management System Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">🏢 Multi-Branch Management</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Create and manage multiple clinic branches</li>
                  <li>Configure operating hours, settings, and capacity per branch</li>
                  <li>Track branch status (active, maintenance, inactive, closed)</li>
                  <li>Manage branch contact information and location details</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">👥 Staff Transfer System</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Request staff transfers between branches with approval workflow</li>
                  <li>Set effective dates and provide transfer reasons</li>
                  <li>Approve or reject transfer requests with notes</li>
                  <li>Complete transfers to move staff to new branches</li>
                  <li>Track transfer history with full audit trail</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">📦 Per-Branch Inventory</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Track inventory separately for each branch</li>
                  <li>Monitor stock levels with low stock and out-of-stock alerts</li>
                  <li>Transfer inventory between branches with transaction history</li>
                  <li>Calculate total inventory value per branch</li>
                  <li>Categorize items and set min/max quantities</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">📊 Branch Analytics & Reports</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Compare performance metrics across all branches</li>
                  <li>Track staff count, transfers in/out, and utilization</li>
                  <li>Monitor inventory value and stock issues</li>
                  <li>Generate periodic reports for management review</li>
                  <li>View resource availability and utilization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">📅 Staff Scheduling</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Create staff schedules per branch</li>
                  <li>Support multiple shift types (morning, afternoon, evening, night, full day)</li>
                  <li>Track overtime shifts</li>
                  <li>View daily and weekly schedules</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">🔧 Resource Management</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Track equipment, rooms, vehicles, and tools per branch</li>
                  <li>Monitor resource availability and status</li>
                  <li>Schedule maintenance with reminders</li>
                  <li>Manage resource capacity and utilization</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">💡 Integration Points</h3>
                <p className="text-gray-700 mb-2">
                  This system integrates with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Phase 2 Employee Management:</strong> Staff data and assignments</li>
                  <li><strong>Phase 2 Inventory System:</strong> Product tracking and stock management</li>
                  <li><strong>Phase 3 Task 2 Analytics:</strong> Branch-level metrics and reporting</li>
                  <li><strong>Appointment System:</strong> Branch-specific bookings (future)</li>
                  <li><strong>Payment System:</strong> Branch revenue tracking (future)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Modal */}
      <StaffTransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        branchId={selectedBranchId}
        mode={transferMode}
      />
    </div>
  )
}
