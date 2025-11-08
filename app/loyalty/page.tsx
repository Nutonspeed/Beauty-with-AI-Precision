"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoyaltyDashboard from "@/components/loyalty-dashboard"
import RewardsCatalog from "@/components/rewards-catalog"
import RedemptionHistory from "@/components/redemption-history"
import { Award, Gift, History, User, UserPlus, Sparkles } from "lucide-react"

export default function LoyaltyPage() {
  // Demo customer IDs - in production these would come from authentication
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>("customer1")
  
  // Demo customers
  const demoCustomers = [
    { id: "customer1", name: "John Doe", tier: "Gold", points: 5500 },
    { id: "customer2", name: "Jane Smith", tier: "Silver", points: 1800 },
    { id: "customer3", name: "Bob Wilson", tier: "Bronze", points: 450 },
    { id: "customer4", name: "Alice Brown", tier: "Platinum", points: 15000 },
  ]

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Page header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Loyalty Program</h1>
            <p className="text-muted-foreground">Earn points, unlock rewards, and enjoy exclusive benefits</p>
          </div>
        </div>

        {/* Program highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Earn Points</p>
                  <p className="text-xs text-blue-700">On every purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">4 Tier Levels</p>
                  <p className="text-xs text-purple-700">Unlock better rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Exclusive Rewards</p>
                  <p className="text-xs text-green-700">Redeem anytime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Referral Bonuses</p>
                  <p className="text-xs text-orange-700">Share and earn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo customer selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Demo Customer Selection
          </CardTitle>
          <CardDescription>
            Select a demo customer to explore the loyalty program features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {demoCustomers.map(customer => (
              <Button
                key={customer.id}
                variant={selectedCustomerId === customer.id ? "default" : "outline"}
                className="h-auto py-4 flex flex-col items-start gap-2"
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                <span className="font-semibold">{customer.name}</span>
                <div className="flex items-center gap-2 w-full">
                  <Badge
                    variant="secondary"
                    className={
                      customer.tier === "Platinum"
                        ? "bg-purple-100 text-purple-800"
                        : customer.tier === "Gold"
                        ? "bg-yellow-100 text-yellow-800"
                        : customer.tier === "Silver"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {customer.tier}
                  </Badge>
                  <span className="text-xs">{customer.points.toLocaleString()} pts</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards Catalog
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Redemption History
          </TabsTrigger>
        </TabsList>

        {/* Dashboard tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Dashboard</CardTitle>
              <CardDescription>
                View your points, tier status, and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomerId ? (
                <LoyaltyDashboard customerId={selectedCustomerId} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a demo customer to view the dashboard
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards catalog tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rewards Catalog</CardTitle>
              <CardDescription>
                Browse available rewards and redeem with your points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomerId ? (
                <RewardsCatalog customerId={selectedCustomerId} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a demo customer to browse rewards
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemption history tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
              <CardDescription>
                View your redeemed rewards and redemption codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomerId ? (
                <RedemptionHistory customerId={selectedCustomerId} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a demo customer to view redemption history
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How it works section */}
      <Card>
        <CardHeader>
          <CardTitle>How the Loyalty Program Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Earning Points</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Purchase:</strong> Earn 1 point per ฿1 spent (× tier multiplier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Appointments:</strong> Earn 50 points when you complete an appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Reviews:</strong> Earn 100 points for leaving a review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Social Sharing:</strong> Earn 25 points for sharing on social media</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Profile Completion:</strong> Earn 200 points for completing your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>First Purchase:</strong> Earn 500 points as a welcome bonus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Referrals:</strong> Earn 500 points when your referral makes their first purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Birthday:</strong> Earn bonus points on your birthday (100-1000 pts based on tier)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Membership Tiers</h3>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🥉</span>
                    <strong className="text-orange-800">Bronze</strong>
                    <Badge variant="outline" className="ml-auto">1.0x</Badge>
                  </div>
                  <p className="text-xs text-orange-700">Starting tier • 0+ lifetime points</p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🥈</span>
                    <strong className="text-gray-800">Silver</strong>
                    <Badge variant="outline" className="ml-auto">1.25x</Badge>
                  </div>
                  <p className="text-xs text-gray-700">1,000+ lifetime points • 5% discount + priority booking</p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🥇</span>
                    <strong className="text-yellow-800">Gold</strong>
                    <Badge variant="outline" className="ml-auto">1.5x</Badge>
                  </div>
                  <p className="text-xs text-yellow-700">5,000+ lifetime points • 10% discount + free consultation</p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">💎</span>
                    <strong className="text-purple-800">Platinum</strong>
                    <Badge variant="outline" className="ml-auto">2.0x</Badge>
                  </div>
                  <p className="text-xs text-purple-700">10,000+ lifetime points • 15% discount + VIP services</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="text-blue-800">
                  <strong>Tier Upgrade Bonus:</strong> Earn 10% of the tier threshold as bonus points when you upgrade!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features overview */}
      <Card>
        <CardHeader>
          <CardTitle>Program Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Gift className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Rewards Catalog</h3>
              <p className="text-sm text-muted-foreground">
                Browse and redeem from a wide selection of services, products, discounts, and exclusive offers
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Award className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Tier Benefits</h3>
              <p className="text-sm text-muted-foreground">
                Unlock better rewards and higher point multipliers as you progress through tier levels
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <UserPlus className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Referral Program</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code and earn 500 points when friends make their first purchase
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Sparkles className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Special Promotions</h3>
              <p className="text-sm text-muted-foreground">
                Enjoy seasonal promotions, birthday bonuses, and limited-time point multiplier events
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <History className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Transaction History</h3>
              <p className="text-sm text-muted-foreground">
                Track all your points earned, redeemed, and expired with detailed transaction history
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <svg className="h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold mb-2">Points Expiry</h3>
              <p className="text-sm text-muted-foreground">
                Points expire after 1 year from earning date, encouraging regular engagement and redemption
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
