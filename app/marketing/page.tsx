import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoyaltyManager } from "@/components/marketing/loyalty-manager"
import { PromoCodeManager } from "@/components/marketing/promo-code-manager"
import { CampaignManager } from "@/components/marketing/campaign-manager"
import { checkUserRole } from "@/lib/auth/check-role"

export default async function MarketingPage() {
  await checkUserRole(["super_admin", "sales_staff"])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing & Loyalty</h1>
        <p className="text-muted-foreground">Manage loyalty programs, promo codes, and email campaigns</p>
      </div>

      <Tabs defaultValue="loyalty" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="loyalty" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <LoyaltyManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="promo" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <PromoCodeManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <CampaignManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
