"use client"

/**
 * Staff Transfer Modal Component
 * 
 * Modal for requesting, approving, and tracking staff transfers between branches.
 */

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
} from "lucide-react"
import { useBranches, useBranchStaff, useStaffTransfers } from "@/hooks/useBranch"
import type { StaffTransfer } from "@/lib/branch/branch-manager"

interface StaffTransferModalProps {
  open: boolean
  onClose: () => void
  branchId?: string
  staffId?: string
  mode?: "request" | "approve" | "view"
}

export default function StaffTransferModal({
  open,
  onClose,
  branchId,
  staffId,
  mode = "request",
}: StaffTransferModalProps) {
  const { branches } = useBranches({ status: "active" })
  const { staff } = useBranchStaff(branchId)
  const { transfers, requestTransfer, approveTransfer, rejectTransfer, completeTransfer } =
    useStaffTransfers({ branchId })

  // Form state
  const [selectedStaffId, setSelectedStaffId] = useState(staffId || "")
  const [fromBranchId, setFromBranchId] = useState(branchId || "")
  const [toBranchId, setToBranchId] = useState("")
  const [effectiveDate, setEffectiveDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedStaff = staff.find(s => s.id === selectedStaffId)
  const fromBranch = branches.find(b => b.id === fromBranchId)
  const toBranch = branches.find(b => b.id === toBranchId)

  const handleSubmitRequest = async () => {
    if (!selectedStaffId || !fromBranchId || !toBranchId || !effectiveDate || !reason) {
      alert("Please fill all required fields")
      return
    }

    try {
      setLoading(true)
      await requestTransfer({
        staffId: selectedStaffId,
        fromBranchId,
        toBranchId,
        requestedBy: "current-user-id", // Should come from auth
        reason,
        effectiveDate,
        notes: notes || undefined,
      })
      alert("Transfer request submitted successfully")
      onClose()
      resetForm()
    } catch (error) {
      console.error("Failed to submit transfer:", error)
      alert("Failed to submit transfer request")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transferId: string) => {
    try {
      setLoading(true)
      await approveTransfer(transferId, "current-user-id") // Should come from auth
      alert("Transfer approved successfully")
    } catch (error) {
      console.error("Failed to approve transfer:", error)
      alert("Failed to approve transfer")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (transferId: string, rejectReason: string) => {
    try {
      setLoading(true)
      await rejectTransfer(transferId, "current-user-id", rejectReason) // Should come from auth
      alert("Transfer rejected")
    } catch (error) {
      console.error("Failed to reject transfer:", error)
      alert("Failed to reject transfer")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (transferId: string) => {
    try {
      setLoading(true)
      await completeTransfer(transferId)
      alert("Transfer completed successfully")
    } catch (error) {
      console.error("Failed to complete transfer:", error)
      alert("Failed to complete transfer")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedStaffId("")
    setFromBranchId("")
    setToBranchId("")
    setEffectiveDate(undefined)
    setReason("")
    setNotes("")
  }

  const getStatusColor = (status: StaffTransfer["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: StaffTransfer["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "request" && "Request Staff Transfer"}
            {mode === "approve" && "Approve Staff Transfers"}
            {mode === "view" && "Staff Transfer History"}
          </DialogTitle>
        </DialogHeader>

        {mode === "request" && (
          <div className="space-y-6">
            {/* Staff Selection */}
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member *</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter(s => s.isActive)
                    .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-branch">From Branch *</Label>
                <Select value={fromBranchId} onValueChange={setFromBranchId}>
                  <SelectTrigger id="from-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-branch">To Branch *</Label>
                <Select value={toBranchId} onValueChange={setToBranchId}>
                  <SelectTrigger id="to-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches
                      .filter(b => b.id !== fromBranchId)
                      .map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transfer Preview */}
            {selectedStaff && fromBranch && toBranch && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedStaff.firstName} {selectedStaff.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{selectedStaff.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">{fromBranch.name}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-6 w-6 text-blue-600" />

                    <div className="text-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">{toBranch.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Effective Date */}
            <div className="space-y-2">
              <Label>Effective Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !effectiveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveDate ? format(effectiveDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={effectiveDate}
                    onSelect={setEffectiveDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Enter reason for transfer"
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional information"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest} disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        )}

        {(mode === "approve" || mode === "view") && (
          <div className="space-y-4">
            {transfers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No transfer requests found
              </div>
            ) : (
              transfers.map(transfer => {
                const transferStaff = staff.find(s => s.id === transfer.staffId)
                const fromBranchData = branches.find(b => b.id === transfer.fromBranchId)
                const toBranchData = branches.find(b => b.id === transfer.toBranchId)

                return (
                  <Card key={transfer.id} className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            {transferStaff && (
                              <div className="font-medium">
                                {transferStaff.firstName} {transferStaff.lastName}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              Requested: {format(new Date(transfer.requestedDate), "PPP")}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(transfer.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transfer.status)}
                            {transfer.status}
                          </span>
                        </Badge>
                      </div>

                      {/* Transfer Route */}
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">From</div>
                          <div className="font-medium">{fromBranchData?.name}</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">To</div>
                          <div className="font-medium">{toBranchData?.name}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Effective Date</div>
                          <div className="font-medium">
                            {format(new Date(transfer.effectiveDate), "PPP")}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Reason: </span>
                          <span className="text-sm">{transfer.reason}</span>
                        </div>
                        {transfer.notes && (
                          <div>
                            <span className="text-sm text-gray-500">Notes: </span>
                            <span className="text-sm">{transfer.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {mode === "approve" && transfer.status === "pending" && (
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rejectReason = prompt("Enter rejection reason:")
                              if (rejectReason) {
                                handleReject(transfer.id, rejectReason)
                              }
                            }}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(transfer.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}

                      {mode === "approve" && transfer.status === "approved" && (
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            onClick={() => handleComplete(transfer.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete Transfer
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
