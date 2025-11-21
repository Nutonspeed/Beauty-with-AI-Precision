// @ts-nocheck
"use client"

import { useState } from "react"
import { useRewards, useLoyalty } from "@/hooks/useLoyalty"
import type { Reward } from "@/lib/loyalty/loyalty-engine"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Gift, Award, Star, ShoppingBag, Tag, CheckCircle, AlertCircle, Package, Sparkles } from "lucide-react"

interface RewardsCatalogProps {
  customerId?: string
}

export default function RewardsCatalog({ customerId }: RewardsCatalogProps) {
  const { customer, loading: customerLoading } = useLoyalty(customerId)
  const { rewards, loading: rewardsLoading, error, redeemReward } = useRewards()
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [minPointsFilter, setMinPointsFilter] = useState<number | undefined>()
  const [maxPointsFilter, setMaxPointsFilter] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<"points-asc" | "points-desc" | "value-asc" | "value-desc">("points-asc")
  
  // Redemption state
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRedemptionDialogOpen, setIsRedemptionDialogOpen] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redemptionError, setRedemptionError] = useState<string | null>(null)
  const [redemptionSuccess, setRedemptionSuccess] = useState(false)

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "service":
        return <Sparkles className="h-4 w-4" />
      case "product":
        return <ShoppingBag className="h-4 w-4" />
      case "discount":
        return <Tag className="h-4 w-4" />
      case "voucher":
        return <Gift className="h-4 w-4" />
      case "special":
        return <Star className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  // Filter and sort rewards
  const filteredRewards = rewards
    .filter(reward => {
      // Category filter
      if (categoryFilter !== "all" && reward.category !== categoryFilter) return false
      
      // Tier filter
      if (tierFilter !== "all" && reward.tierRestriction && reward.tierRestriction !== tierFilter) return false
      
      // Points filters
      if (minPointsFilter !== undefined && reward.pointCost < minPointsFilter) return false
      if (maxPointsFilter !== undefined && reward.pointCost > maxPointsFilter) return false
      
      // Active only
      if (!reward.isActive) return false
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "points-asc":
          return a.pointCost - b.pointCost
        case "points-desc":
          return b.pointCost - a.pointCost
        case "value-asc":
          return a.value - b.value
        case "value-desc":
          return b.value - a.value
        default:
          return 0
      }
    })

  // Check if customer can redeem reward
  const canRedeem = (reward: Reward): { canRedeem: boolean; reason?: string } => {
    if (!customer) return { canRedeem: false, reason: "Please log in to redeem rewards" }
    
    if (customer.points < reward.pointCost) {
      return { canRedeem: false, reason: `Need ${reward.pointCost - customer.points} more points` }
    }
    
    if (reward.tierRestriction) {
      const tierOrder = ["Bronze", "Silver", "Gold", "Platinum"]
      const customerTierIndex = tierOrder.indexOf(customer.tier)
      const requiredTierIndex = tierOrder.indexOf(reward.tierRestriction)
      
      if (customerTierIndex < requiredTierIndex) {
        return { canRedeem: false, reason: `Requires ${reward.tierRestriction} tier` }
      }
    }
    
    if (reward.stock !== undefined && reward.stock <= 0) {
      return { canRedeem: false, reason: "Out of stock" }
    }
    
    return { canRedeem: true }
  }

  // Handle redemption
  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setIsRedemptionDialogOpen(true)
    setRedemptionError(null)
    setRedemptionSuccess(false)
  }

  const handleConfirmRedemption = async () => {
    if (!selectedReward || !customerId) return
    
    setIsRedeeming(true)
    setRedemptionError(null)
    
    try {
      await redeemReward(customerId, selectedReward.id)
      setRedemptionSuccess(true)
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsRedemptionDialogOpen(false)
        setRedemptionSuccess(false)
        setSelectedReward(null)
      }, 2000)
    } catch (error) {
      setRedemptionError(error instanceof Error ? error.message : "Failed to redeem reward")
    } finally {
      setIsRedeeming(false)
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Format points
  const formatPoints = (points: number) => {
    return points.toLocaleString()
  }

  // Loading state
  if (customerLoading || rewardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading rewards catalog...</p>
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
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
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
          <Gift className="h-8 w-8" />
          Rewards Catalog
        </h2>
        <p className="text-muted-foreground mt-2">
          Browse and redeem exciting rewards with your loyalty points
        </p>
        {customer && (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              {formatPoints(customer.points)} points available
            </Badge>
            <Badge variant="secondary" className={`text-lg px-4 py-2 ${getTierColor(customer.tier)}`}>
              {customer.tier} Member
            </Badge>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Category filter */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="discount">Discounts</SelectItem>
                  <SelectItem value="voucher">Vouchers</SelectItem>
                  <SelectItem value="special">Special Offers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tier filter */}
            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min points filter */}
            <div>
              <Label htmlFor="minPoints">Min Points</Label>
              <Input
                id="minPoints"
                type="number"
                placeholder="0"
                value={minPointsFilter || ""}
                onChange={e => setMinPointsFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Max points filter */}
            <div>
              <Label htmlFor="maxPoints">Max Points</Label>
              <Input
                id="maxPoints"
                type="number"
                placeholder="No limit"
                value={maxPointsFilter || ""}
                onChange={e => setMaxPointsFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Sort by */}
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points-asc">Points (Low to High)</SelectItem>
                  <SelectItem value="points-desc">Points (High to Low)</SelectItem>
                  <SelectItem value="value-asc">Value (Low to High)</SelectItem>
                  <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters summary */}
          {(categoryFilter !== "all" || tierFilter !== "all" || minPointsFilter !== undefined || maxPointsFilter !== undefined) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                  Category: {categoryFilter} ×
                </Badge>
              )}
              {tierFilter !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setTierFilter("all")}>
                  Tier: {tierFilter} ×
                </Badge>
              )}
              {minPointsFilter !== undefined && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setMinPointsFilter(undefined)}>
                  Min: {formatPoints(minPointsFilter)} pts ×
                </Badge>
              )}
              {maxPointsFilter !== undefined && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setMaxPointsFilter(undefined)}>
                  Max: {formatPoints(maxPointsFilter)} pts ×
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all")
                  setTierFilter("all")
                  setMinPointsFilter(undefined)
                  setMaxPointsFilter(undefined)
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRewards.length} {filteredRewards.length === 1 ? "reward" : "rewards"}
          </p>
        </div>

        {filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rewards match your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setCategoryFilter("all")
                    setTierFilter("all")
                    setMinPointsFilter(undefined)
                    setMaxPointsFilter(undefined)
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map(reward => {
              const { canRedeem: canRedeemReward, reason } = canRedeem(reward)
              
              return (
                <Card key={reward.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(reward.category)}
                        {reward.category}
                      </Badge>
                      {reward.tierRestriction && (
                        <Badge className={getTierColor(reward.tierRestriction)}>
                          {reward.tierRestriction}+
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Point Cost:</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPoints(reward.pointCost)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(reward.value)}
                        </span>
                      </div>
                      
                      {reward.stock !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <Badge variant={reward.stock > 10 ? "default" : reward.stock > 0 ? "secondary" : "destructive"}>
                            {reward.stock > 0 ? `${reward.stock} available` : "Out of stock"}
                          </Badge>
                        </div>
                      )}
                      
                      {reward.maxRedemptionsPerCustomer && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Limit:</span>
                          <span className="text-sm">
                            {reward.maxRedemptionsPerCustomer} per customer
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={!canRedeemReward || !customerId}
                      onClick={() => handleRedeemClick(reward)}
                    >
                      {canRedeemReward ? (
                        <>
                          <Gift className="h-4 w-4 mr-2" />
                          Redeem Now
                        </>
                      ) : (
                        reason || "Cannot redeem"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Redemption dialog */}
      <Dialog open={isRedemptionDialogOpen} onOpenChange={setIsRedemptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold text-lg">{selectedReward.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm">Points to be deducted:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPoints(selectedReward.pointCost)}
                  </span>
                </div>
                {customer && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining points:</span>
                    <span className="font-semibold">
                      {formatPoints(customer.points - selectedReward.pointCost)}
                    </span>
                  </div>
                )}
              </div>
              
              {selectedReward.termsAndConditions && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Terms & Conditions:</p>
                  <p>{selectedReward.termsAndConditions}</p>
                </div>
              )}
              
              {redemptionError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{redemptionError}</p>
                </div>
              )}
              
              {redemptionSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm">Reward redeemed successfully!</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRedemptionDialogOpen(false)}
              disabled={isRedeeming || redemptionSuccess}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRedemption}
              disabled={isRedeeming || redemptionSuccess}
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : redemptionSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Redeemed!
                </>
              ) : (
                "Confirm Redemption"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
