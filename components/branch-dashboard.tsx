"use client"

/**
 * Branch Dashboard Component
 * 
 * Overview dashboard for a single branch showing staff, inventory,
 * schedules, resources, and key metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  Package,
  Clock,
  Wrench,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import {
  useBranch,
  useBranchStaff,
  useBranchInventory,
  useBranchSchedule,
  useBranchResources,
  useBranchReport,
} from "@/hooks/useBranch"

interface BranchDashboardProps {
  branchId: string
}

export default function BranchDashboard({ branchId }: BranchDashboardProps) {
  const { branch, loading: branchLoading } = useBranch(branchId)
  const { staff, loading: staffLoading } = useBranchStaff(branchId)
  const { inventory, loading: inventoryLoading } = useBranchInventory(branchId)
  const { schedules, loading: schedulesLoading } = useBranchSchedule(branchId, new Date())
  const { resources, loading: resourcesLoading } = useBranchResources(branchId)
  const { report, loading: reportLoading } = useBranchReport(
    branchId,
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    new Date()
  )

  if (branchLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading branch data...</div>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Branch not found</div>
      </div>
    )
  }

  const activeStaff = staff.filter(s => s.isActive)
  const lowStockItems = inventory.filter(i => i.status === "low_stock")
  const outOfStockItems = inventory.filter(i => i.status === "out_of_stock")
  const availableResources = resources.filter(r => r.isAvailable && r.isActive)

  return (
    <div className="space-y-6">
      {/* Branch Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold">{branch.name}</h1>
              <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                {branch.status}
              </Badge>
            </div>
            <p className="text-blue-100 text-sm">Code: {branch.code}</p>
          </div>
          <Button variant="secondary">
            Edit Branch
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div>{branch.address.street}</div>
              <div>
                {branch.address.city}, {branch.address.province} {branch.address.postalCode}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">{branch.phone}</div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <div className="text-sm">{branch.email}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
            <p className="text-xs text-gray-500">
              {staff.length} total • {branch.capacity} capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-gray-500">
              {lowStockItems.length} low stock • {outOfStockItems.length} out of stock
            </p>
            {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
              <Badge variant="destructive" className="mt-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                Needs attention
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Schedule</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-gray-500">Staff scheduled today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <Wrench className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableResources.length}</div>
            <p className="text-xs text-gray-500">
              {resources.length} total • {branch.roomCount} rooms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="text-center py-8 text-gray-500">Loading staff...</div>
              ) : staff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No staff members</div>
              ) : (
                <div className="space-y-3">
                  {staff.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.role} • {member.employeeId}
                          </div>
                          {member.specialization && (
                            <div className="text-xs text-gray-400">{member.specialization}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="text-center py-8 text-gray-500">Loading inventory...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No inventory items</div>
              ) : (
                <div className="space-y-3">
                  {inventory.map(item => {
                    const statusColor =
                      item.status === "in_stock"
                        ? "bg-green-100 text-green-800"
                        : item.status === "low_stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">
                              {item.productCode} • {item.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.minQuantity} • Max: {item.maxQuantity}
                            </div>
                          </div>
                          <Badge className={statusColor}>{item.status}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading schedule...</div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No schedules for today</div>
              ) : (
                <div className="space-y-3">
                  {schedules.map(schedule => {
                    const staffMember = staff.find(s => s.id === schedule.staffId)
                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Clock className="h-8 w-8 text-gray-400" />
                          <div>
                            {staffMember && (
                              <div className="font-medium">
                                {staffMember.firstName} {staffMember.lastName}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{schedule.shiftType}</Badge>
                          {schedule.isOvertime && <Badge variant="secondary">Overtime</Badge>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branch Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No resources</div>
              ) : (
                <div className="space-y-3">
                  {resources.map(resource => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Wrench className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-gray-500">
                            {resource.code} • {resource.type}
                          </div>
                          {resource.description && (
                            <div className="text-xs text-gray-400">{resource.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={resource.isAvailable ? "default" : "secondary"}>
                          {resource.isAvailable ? "Available" : "In Use"}
                        </Badge>
                        <Badge variant={resource.isActive ? "default" : "secondary"}>
                          {resource.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branch Performance (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {reportLoading ? (
                <div className="text-center py-8 text-gray-500">Generating report...</div>
              ) : !report ? (
                <div className="text-center py-8 text-gray-500">No report data</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Staff Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Staff Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Staff</span>
                        <span className="font-medium">{report.metrics.totalStaff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Staff</span>
                        <span className="font-medium">{report.metrics.activeStaff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transfers In</span>
                        <span className="font-medium text-green-600">
                          +{report.metrics.transfersIn}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transfers Out</span>
                        <span className="font-medium text-red-600">
                          -{report.metrics.transfersOut}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Metrics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Inventory Metrics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Value</span>
                        <span className="font-medium">
                          ฿{report.metrics.totalInventoryValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Low Stock Items</span>
                        <span className="font-medium text-yellow-600">
                          {report.metrics.lowStockItems}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Out of Stock</span>
                        <span className="font-medium text-red-600">
                          {report.metrics.outOfStockItems}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
