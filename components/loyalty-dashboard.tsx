'use client';

/**
 * Loyalty Dashboard
 * Customer loyalty overview with points, tier, and rewards
 */

import { useState } from 'react';
import { useLoyalty, useTiers, useTransactions } from '@/hooks/useLoyalty';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  TrendingUp,
  Gift,
  Calendar,
  Share2,
  History,
  ChevronRight,
  Copy,
  Check,
  Crown,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

interface LoyaltyDashboardProps {
  customerId: string;
}

export function LoyaltyDashboard({ customerId }: LoyaltyDashboardProps) {
  const { customer, loading, error } = useLoyalty(customerId);
  const { tiers, getTierConfig, getNextTier, getProgressToNextTier } = useTiers();
  const { transactions } = useTransactions(customerId);
  const [copiedReferral, setCopiedReferral] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading loyalty data...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error || 'Customer not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTierConfig = getTierConfig(customer.tier);
  const nextTier = getNextTier(customer.tier);
  const progressToNext = getProgressToNextTier(customer.lifetimePoints, customer.tier);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(customer.referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'redeem':
        return <Gift className="w-4 h-4 text-blue-500" />;
      case 'expire':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'bonus':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Award className="w-8 h-8 mr-3 text-blue-600" />
            Loyalty Program
          </h1>
          <p className="text-muted-foreground mt-1">
            Earn points, unlock rewards, and enjoy exclusive benefits
          </p>
        </div>
      </div>

      {/* Points & Tier Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Points */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{formatPoints(customer.points)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Lifetime: {formatPoints(customer.lifetimePoints)} points
            </p>
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Membership Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{currentTierConfig?.icon}</span>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {customer.tier}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTierConfig?.multiplier}x points multiplier
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Share2 className="w-5 h-5 mr-2 text-green-600" />
              Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <code className="text-2xl font-bold text-green-600 bg-white px-3 py-2 rounded">
                {customer.referralCode}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopyReferral}>
                {copiedReferral ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share with friends and earn 500 points per referral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Progress to {nextTier.level}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {formatPoints(customer.lifetimePoints)} / {formatPoints(nextTier.minPoints)} points
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Earn {formatPoints(nextTier.minPoints - customer.lifetimePoints)} more points to unlock{' '}
              {nextTier.level} tier benefits
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Benefits, History, Tiers */}
      <Tabs defaultValue="benefits" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="tiers">All Tiers</TabsTrigger>
        </TabsList>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your {customer.tier} Tier Benefits</CardTitle>
              <CardDescription>Exclusive perks for {customer.tier} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentTierConfig?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {nextTier && (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">{nextTier.icon}</span>
                  Unlock {nextTier.level} Benefits
                </CardTitle>
                <CardDescription>
                  Reach {formatPoints(nextTier.minPoints)} lifetime points to upgrade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 opacity-60">
                  {nextTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your points activity history</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(transaction.createdAt, 'PPP')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.points > 0 ? '+' : ''}
                          {formatPoints(transaction.points)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {formatPoints(transaction.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          {tiers.map((tier) => (
            <Card
              key={tier.level}
              className={
                tier.level === customer.tier
                  ? 'border-2 border-primary bg-primary/5'
                  : 'opacity-75'
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-3xl mr-3">{tier.icon}</span>
                    <span className="font-bold">{tier.level}</span>
                  </span>
                  {tier.level === customer.tier && (
                    <Badge variant="default">Current Tier</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {tier.minPoints > 0
                    ? `${formatPoints(tier.minPoints)}+ lifetime points required`
                    : 'Starting tier for all members'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Member Since */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">{format(customer.joinedAt, 'MMMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Activity</p>
              <p className="text-lg font-semibold">
                {format(customer.lastActivityAt, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export as both named and default for compatibility
export default LoyaltyDashboard;
