// @ts-nocheck
"use client"

import { useMemo } from "react"
import { useRedemptions, useRewards, useLoyalty } from "@/hooks/useLoyalty"
import type { Redemption } from "@/lib/loyalty/loyalty-engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Gift, CheckCircle, Clock, XCircle, Calendar, QrCode, History, Package } from "lucide-react"
import { format } from "date-fns"
import QRCode from "qrcode"
import { useEffect, useState } from "react"

interface RedemptionHistoryProps {
  customerId?: string
  rewardId?: string
}

export default function RedemptionHistory({ customerId, rewardId }: RedemptionHistoryProps) {
  const { redemptions, loading: redemptionsLoading, error } = useRedemptions(customerId, rewardId)
  const { rewards, loading: rewardsLoading } = useRewards()
  const { customer } = useLoyalty(customerId)
  
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({})

  // Generate QR codes for redemption codes
  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: { [key: string]: string } = {}
      
      for (const redemption of redemptions) {
        if (redemption.code && redemption.status !== "expired") {
          try {
            const qrDataUrl = await QRCode.toDataURL(redemption.code, {
              width: 200,
              margin: 1,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            })
            codes[redemption.id] = qrDataUrl
          } catch (error) {
            console.error("Failed to generate QR code:", error)
          }
        }
      }
      
      setQrCodes(codes)
    }
    
    if (redemptions.length > 0) {
      generateQRCodes()
    }
  }, [redemptions])

  // Get reward details for redemption
  const getRewardForRedemption = (redemptionRewardId: string) => {
    return rewards.find(r => r.id === redemptionRewardId)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "used":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "expired":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "used":
        return <Package className="h-4 w-4" />
      case "expired":
        return <XCircle className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  // Group redemptions by status
  const redemptionsByStatus = useMemo(() => {
    return {
      active: redemptions.filter(r => r.status === "confirmed" || r.status === "pending"),
      used: redemptions.filter(r => r.status === "used"),
      expired: redemptions.filter(r => r.status === "expired"),
      all: redemptions,
    }
  }, [redemptions])

  // Format points
  const formatPoints = (points: number) => {
    return points.toLocaleString()
  }

  // Check if redemption is expiring soon (within 7 days)
  const isExpiringSoon = (expiresAt: Date) => {
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  // Loading state
  if (redemptionsLoading || rewardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading redemption history...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center text-destructive">
            <XCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render redemption card
  const renderRedemptionCard = (redemption: Redemption) => {
    const reward = getRewardForRedemption(redemption.rewardId)
    const qrCode = qrCodes[redemption.id]
    const expiringSoon = isExpiringSoon(redemption.expiresAt)
    
    return (
      <Card key={redemption.id} className="overflow-hidden">
        <CardHeader className={redemption.status === "expired" ? "opacity-60" : ""}>
          <div className="flex items-start justify-between mb-2">
            <Badge className={`flex items-center gap-1 ${getStatusColor(redemption.status)}`}>
              {getStatusIcon(redemption.status)}
              {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
            </Badge>
            {expiringSoon && redemption.status === "confirmed" && (
              <Badge variant="destructive" className="animate-pulse">
                Expiring Soon
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">
            {reward ? reward.name : "Unknown Reward"}
          </CardTitle>
          <CardDescription>
            {reward ? reward.description : `Reward ID: ${redemption.rewardId}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className={redemption.status === "expired" ? "opacity-60" : ""}>
          <div className="space-y-4">
            {/* Points spent */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Points Spent:</span>
              <span className="text-xl font-bold text-primary">
                {formatPoints(redemption.pointsSpent)}
              </span>
            </div>
            
            {/* Redemption code and QR */}
            {redemption.code && redemption.status !== "expired" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Redemption Code:</span>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
                  <p className="text-2xl font-mono font-bold text-center tracking-wider">
                    {redemption.code}
                  </p>
                </div>
                {qrCode && (
                  <div className="flex justify-center pt-2">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded" />
                  </div>
                )}
              </div>
            )}
            
            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Redeemed:
                </span>
                <span>{format(redemption.redeemedAt, "PPP")}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires:
                </span>
                <span className={expiringSoon ? "text-destructive font-semibold" : ""}>
                  {format(redemption.expiresAt, "PPP")}
                </span>
              </div>
              
              {redemption.usedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Used:
                  </span>
                  <span>{format(redemption.usedAt, "PPP")}</span>
                </div>
              )}
            </div>
            
            {/* Reward details */}
            {reward && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reward Value:</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat("th-TH", {
                      style: "currency",
                      currency: "THB",
                      minimumFractionDigits: 0,
                    }).format(reward.value)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8" />
          Redemption History
        </h2>
        <p className="text-muted-foreground mt-2">
          View and manage your redeemed rewards
        </p>
        {customer && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Total redemptions: <span className="font-semibold text-foreground">{redemptions.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* Empty state */}
      {redemptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No redemptions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start redeeming rewards to see them here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active" className="relative">
              Active
              {redemptionsByStatus.active.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {redemptionsByStatus.active.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="used" className="relative">
              Used
              {redemptionsByStatus.used.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {redemptionsByStatus.used.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired" className="relative">
              Expired
              {redemptionsByStatus.expired.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {redemptionsByStatus.expired.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {redemptionsByStatus.all.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Active redemptions */}
          <TabsContent value="active" className="space-y-4">
            {redemptionsByStatus.active.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No active redemptions</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {redemptionsByStatus.active.map(renderRedemptionCard)}
              </div>
            )}
          </TabsContent>

          {/* Used redemptions */}
          <TabsContent value="used" className="space-y-4">
            {redemptionsByStatus.used.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No used redemptions</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {redemptionsByStatus.used.map(renderRedemptionCard)}
              </div>
            )}
          </TabsContent>

          {/* Expired redemptions */}
          <TabsContent value="expired" className="space-y-4">
            {redemptionsByStatus.expired.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No expired redemptions</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {redemptionsByStatus.expired.map(renderRedemptionCard)}
              </div>
            )}
          </TabsContent>

          {/* All redemptions */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {redemptionsByStatus.all.map(renderRedemptionCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
