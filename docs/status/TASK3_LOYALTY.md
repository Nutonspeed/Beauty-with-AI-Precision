# Task 3: Loyalty Program & Rewards System

**Phase 3 - Enterprise Scalability & Automation**

## Overview

Comprehensive loyalty program management system with points accumulation, tier-based benefits, rewards catalog, and redemption tracking. Designed to increase customer engagement, retention, and lifetime value through gamification and exclusive benefits.

## Features Implemented

### Core Loyalty Engine
- **Customer Enrollment**: Automatic enrollment with welcome bonus (500 points)
- **Points Accumulation**: Earn points through 8 different actions with tier multipliers
- **4-Tier System**: Bronze, Silver, Gold, Platinum with progressive benefits
- **Automatic Tier Upgrades**: Based on lifetime points with bonus rewards
- **Rewards Catalog**: Comprehensive catalog with categories, tiers, and stock management
- **Points Redemption**: Full validation system (points, tier, stock, limits)
- **Expiry Management**: Automatic points expiry after 1 year
- **Referral System**: Unique codes with rewards for both referrer and referee
- **Birthday Rewards**: Tier-based birthday bonuses (100-1000 points)
- **Promotions**: Seasonal and event-based promotions with multipliers
- **Transaction History**: Complete audit trail of all point activities

### Points Earning Actions
1. **Purchase**: 1 point per ฿1 spent (× tier multiplier)
2. **Appointment Completed**: 50 points (× tier multiplier)
3. **Review Submitted**: 100 points (× tier multiplier)
4. **Social Share**: 25 points (× tier multiplier)
5. **Profile Completion**: 200 points (× tier multiplier)
6. **First Purchase**: 500 points (welcome bonus)
7. **Referral**: 500 points for referrer, 200 for referee
8. **Birthday**: 100-1000 points based on tier

### Tier System

#### Bronze (Starting Tier)
- **Requirement**: 0+ lifetime points
- **Multiplier**: 1.0x
- **Benefits**:
  - Access to basic rewards
  - Standard point earning
  - Birthday bonus: 100 points

#### Silver
- **Requirement**: 1,000+ lifetime points
- **Multiplier**: 1.25x
- **Benefits**:
  - Access to premium rewards
  - 5% discount on all services
  - Priority booking
  - Extended appointment slots
  - Birthday bonus: 250 points

#### Gold
- **Requirement**: 5,000+ lifetime points
- **Multiplier**: 1.5x
- **Benefits**:
  - Access to exclusive rewards
  - 10% discount on all services
  - Free consultation session
  - Priority customer support
  - Exclusive event invitations
  - Birthday bonus: 500 points

#### Platinum (VIP Tier)
- **Requirement**: 10,000+ lifetime points
- **Multiplier**: 2.0x
- **Benefits**:
  - Access to all rewards
  - 15% discount on all services
  - VIP concierge service
  - Free annual health checkup
  - Exclusive product launches
  - Premium gift on birthday
  - Dedicated account manager
  - Birthday bonus: 1,000 points

### Tier Upgrade System
- **Automatic**: Upgrades happen automatically when lifetime points reach threshold
- **Bonus Points**: Earn 10% of threshold as bonus (e.g., 100 pts for Silver upgrade)
- **No Downgrade**: Tier based on lifetime points, never decreases
- **Instant Benefits**: New tier benefits apply immediately

### Rewards Catalog

#### Categories
1. **Service**: Free treatments, consultations, upgrades
2. **Product**: Skincare products, beauty items, wellness packages
3. **Discount**: Percentage or fixed amount discounts
4. **Voucher**: Gift vouchers for services or products
5. **Special**: Exclusive offers, VIP memberships, event access

#### Sample Rewards
1. **฿100 Discount Voucher** - 500 points (Any tier)
2. **฿500 Discount Voucher** - 2,000 points (Silver+)
3. **Free Facial Treatment** - 3,000 points (Gold+, max 2 per customer)
4. **Premium Skincare Set** - 5,000 points (Platinum, max 1 per customer)
5. **VIP Annual Membership** - 10,000 points (Platinum, max 1 per customer)

#### Reward Features
- **Stock Management**: Track availability and prevent over-redemption
- **Tier Restrictions**: Limit certain rewards to higher tiers
- **Redemption Limits**: Max redemptions per customer
- **Expiry Dates**: Valid from/until dates
- **Terms & Conditions**: Detailed usage terms
- **Active/Inactive**: Enable/disable rewards dynamically

### Redemption System
- **Unique Codes**: Each redemption gets a unique code
- **QR Codes**: Generated for easy scanning and verification
- **Status Tracking**: Pending → Confirmed → Used/Expired
- **Expiry**: 90 days from redemption date
- **Validation**: Multi-level validation before redemption
- **History**: Complete redemption history per customer

### Referral Program
- **Unique Codes**: Each customer gets a unique referral code
- **Dual Rewards**: Both referrer and referee earn points
- **Referrer**: 500 points when referee makes first purchase
- **Referee**: 200 points immediately upon signup
- **Tracking**: Complete referral tracking and completion status

### Promotions System
- **Types**: Birthday, Referral, Seasonal, Welcome, Milestone
- **Point Multipliers**: Boost point earning (e.g., 2x points weekend)
- **Fixed Bonuses**: Award specific point amounts
- **Usage Limits**: Per customer and total usage limits
- **Date Range**: Start and end dates for promotions
- **Conditions**: Flexible condition system for targeting

## Files Created

### 1. lib/loyalty/loyalty-engine.ts (890 lines)
Core loyalty program engine with business logic and data management.

**Key Components**:
- `LoyaltyEngine` class (singleton pattern)
- Customer management (enrollment, updates, retrieval)
- Points management (award, redeem, expire)
- Tier management (configs, calculation, upgrades)
- Rewards catalog (filters, stock, validation)
- Referral processing (codes, bonuses, completion)
- Promotion management (active, application)
- Transaction history (complete audit trail)

**Interfaces**:
\`\`\`typescript
interface CustomerLoyalty {
  customerId: string
  points: number
  lifetimePoints: number
  tier: "Bronze" | "Silver" | "Gold" | "Platinum"
  joinedAt: Date
  lastActivityAt: Date
  tierExpiry?: Date
  referralCode: string
  referredBy?: string
}

interface TierConfig {
  level: "Bronze" | "Silver" | "Gold" | "Platinum"
  minPoints: number
  multiplier: number
  benefits: string[]
  color: string
  icon: string
}

interface Reward {
  id: string
  name: string
  description: string
  category: "service" | "product" | "discount" | "voucher" | "special"
  pointCost: number
  value: number
  stock?: number
  imageUrl?: string
  termsAndConditions?: string
  validFrom?: Date
  validUntil?: Date
  isActive: boolean
  tierRestriction?: "Bronze" | "Silver" | "Gold" | "Platinum"
  maxRedemptionsPerCustomer?: number
}

interface PointTransaction {
  id: string
  customerId: string
  type: "earn" | "redeem" | "expire" | "bonus" | "refund"
  points: number
  balance: number
  description: string
  reference?: string
  rewardId?: string
  promotionId?: string
  expiresAt?: Date
  createdAt: Date
}

interface Redemption {
  id: string
  customerId: string
  rewardId: string
  pointsSpent: number
  status: "pending" | "confirmed" | "expired" | "used"
  redeemedAt: Date
  expiresAt: Date
  usedAt?: Date
  code: string
}

interface Promotion {
  id: string
  name: string
  description: string
  type: "birthday" | "referral" | "seasonal" | "welcome" | "milestone"
  pointsAwarded?: number
  multiplier?: number
  isActive: boolean
  startDate: Date
  endDate: Date
  conditions?: Record<string, any>
  maxUsesPerCustomer?: number
  totalUsageLimit?: number
  currentUsage: number
}

interface ReferralBonus {
  referrerId: string
  refereeId: string
  referrerPoints: number
  refereePoints: number
  status: "pending" | "completed"
  createdAt: Date
  completedAt?: Date
}

interface PointsEarnRule {
  action: string
  basePoints: number
  description: string
  conditions?: Record<string, any>
}
\`\`\`

**Key Methods**:
\`\`\`typescript
// Customer Management
enrollCustomer(customerId: string): CustomerLoyalty
getCustomerLoyalty(customerId: string): CustomerLoyalty | undefined
updateCustomerActivity(customerId: string): void

// Points Management
awardPoints(customerId: string, action: string, metadata?: any): PointTransaction
redeemPoints(customerId: string, rewardId: string): Redemption
expirePoints(customerId: string, points: number, reason: string): PointTransaction

// Tier Management
getTierConfig(tier: string): TierConfig | undefined
getAllTierConfigs(): TierConfig[]
calculateTier(lifetimePoints: number): string
handleTierUpgrade(customerId: string, newTier: string): PointTransaction

// Rewards Management
getRewards(filters?: RewardFilters): Reward[]
getReward(rewardId: string): Reward | undefined

// Referral Management
processReferral(referralCode: string, refereeId: string): ReferralBonus
completeReferral(refereeId: string): void

// Promotion Management
getActivePromotions(): Promotion[]
applyPromotion(customerId: string, promotionId: string): PointTransaction

// History & Reporting
getTransactionHistory(customerId: string): PointTransaction[]
getCustomerRedemptions(customerId: string, rewardId?: string): Redemption[]
\`\`\`

**Architecture**:
- Singleton pattern for consistent state
- In-memory storage (Maps) for development
- Event-driven point calculations
- Automatic tier upgrades on point changes
- Comprehensive validation before mutations

### 2. hooks/useLoyalty.ts (570 lines)
React hooks for seamless loyalty system integration.

**Hooks Provided**:

#### `useLoyalty(customerId?: string)`
Main hook for customer loyalty data.
\`\`\`typescript
const { customer, loading, error, enroll, refresh } = useLoyalty("customer123")
\`\`\`

#### `useTiers()`
Tier configuration and progress tracking.
\`\`\`typescript
const { 
  tiers, 
  getTierConfig, 
  getNextTier, 
  getProgressToNextTier 
} = useTiers()
\`\`\`

#### `useRewards(filters?: RewardFilters)`
Rewards catalog management.
\`\`\`typescript
const { 
  rewards, 
  loading, 
  error, 
  redeemReward, 
  getReward, 
  refresh 
} = useRewards({
  category: "service",
  tier: "Gold",
  minPoints: 1000,
  maxPoints: 5000,
  activeOnly: true
})
\`\`\`

#### `usePoints(customerId?: string)`
Point awarding functionality.
\`\`\`typescript
const { awardPoints, loading, error } = usePoints("customer123")

await awardPoints("purchase", {
  amount: 100,
  description: "Facial treatment purchase",
  reference: "INV-001"
})
\`\`\`

#### `useTransactions(customerId?: string)`
Transaction history retrieval.
\`\`\`typescript
const { transactions, loading, error, refresh } = useTransactions("customer123")
\`\`\`

#### `useRedemptions(customerId?: string, rewardId?: string)`
Redemption history tracking.
\`\`\`typescript
const { redemptions, loading, error, refresh } = useRedemptions("customer123")
\`\`\`

#### `usePromotions()`
Active promotions management.
\`\`\`typescript
const { 
  promotions, 
  loading, 
  error, 
  applyPromotion, 
  refresh 
} = usePromotions()
\`\`\`

#### `useReferral()`
Referral processing.
\`\`\`typescript
const { 
  processReferral, 
  completeReferral, 
  loading, 
  error 
} = useReferral()
\`\`\`

#### `useBirthdayRewards()`
Birthday bonus awarding.
\`\`\`typescript
const { awardBirthdayBonus, loading, error } = useBirthdayRewards()
\`\`\`

### 3. components/loyalty-dashboard.tsx (390 lines)
Comprehensive loyalty dashboard component.

**Sections**:
- **Header**: Program title and description
- **Points & Tier Overview**: 3 gradient cards showing current points, tier, and referral code
- **Tier Progress**: Visual progress bar to next tier
- **Benefits Tab**: Current tier benefits and next tier preview
- **Transaction History Tab**: Last 10 transactions with icons and details
- **All Tiers Tab**: Overview of all 4 tiers with benefits

**Features**:
- Real-time points and tier display
- Copy-to-clipboard for referral code
- Progress calculation to next tier
- Transaction type icons (earn, redeem, expire, bonus)
- Responsive design (1→3 columns)
- Loading and error states
- Member since and last activity dates

**Usage**:
\`\`\`typescript
<LoyaltyDashboard customerId="customer123" />
\`\`\`

### 4. components/rewards-catalog.tsx (685 lines)
Full-featured rewards catalog and redemption interface.

**Features**:
- **Filters**: Category, tier, point range, sort options
- **Rewards Grid**: Responsive grid layout (1→3 columns)
- **Reward Cards**: Image, name, description, points, value, stock, tier badge
- **Redemption Modal**: Confirmation dialog with validation
- **Active Filters**: Visual summary with quick clear
- **Empty States**: Helpful messages and clear actions
- **QR Codes**: For verified redemptions
- **Real-time Validation**: Check if customer can redeem

**Filters**:
- Category: All, Service, Product, Discount, Voucher, Special
- Tier: All, Bronze, Silver, Gold, Platinum
- Min/Max Points: Custom range
- Sort: Points (asc/desc), Value (asc/desc)

**Usage**:
\`\`\`typescript
<RewardsCatalog customerId="customer123" />
\`\`\`

### 5. components/redemption-history.tsx (475 lines)
Redemption history with QR codes and status tracking.

**Features**:
- **Status Tabs**: Active, Used, Expired, All
- **Redemption Cards**: Reward details, code, dates, status
- **QR Code Generation**: Automatic QR codes for active redemptions
- **Status Badges**: Color-coded status indicators
- **Expiry Warnings**: Highlight redemptions expiring soon
- **Empty States**: Per-tab empty states
- **Responsive Layout**: 1→2 columns
- **Date Formatting**: Localized date display

**Statuses**:
- **Pending**: Awaiting confirmation
- **Confirmed**: Ready to use (shows QR code)
- **Used**: Already redeemed
- **Expired**: Past expiry date

**Usage**:
\`\`\`typescript
<RedemptionHistory customerId="customer123" />
<RedemptionHistory customerId="customer123" rewardId="reward1" />
\`\`\`

### 6. app/loyalty/page.tsx (490 lines)
Complete loyalty program demo and documentation page.

**Sections**:
- **Header**: Program branding and highlights
- **Program Highlights**: 4 feature cards (earn, tiers, rewards, referrals)
- **Demo Customer Selector**: 4 sample customers with different tiers
- **Main Tabs**: Dashboard, Rewards Catalog, Redemption History
- **How It Works**: Detailed earning and tier explanations
- **Features Overview**: 6 feature cards with descriptions

**Demo Customers**:
1. John Doe - Gold tier, 5,500 points
2. Jane Smith - Silver tier, 1,800 points
3. Bob Wilson - Bronze tier, 450 points
4. Alice Brown - Platinum tier, 15,000 points

**Usage**:
Access via `/loyalty` route

## Integration Guide

### 1. Customer Enrollment
\`\`\`typescript
import { LoyaltyEngine } from "@/lib/loyalty/loyalty-engine"

const engine = LoyaltyEngine.getInstance()

// Enroll new customer
const customer = engine.enrollCustomer("user123")
console.log(`Welcome! You earned ${customer.points} welcome bonus points!`)
\`\`\`

### 2. Award Points
\`\`\`typescript
import { usePoints } from "@/hooks/useLoyalty"

function CheckoutPage() {
  const { awardPoints } = usePoints(customerId)
  
  const handlePurchase = async (amount: number) => {
    // Award points on purchase
    await awardPoints("purchase", {
      amount,
      description: `Purchase of ${amount} THB`,
      reference: invoiceId
    })
  }
}
\`\`\`

### 3. Display Customer Dashboard
\`\`\`typescript
import LoyaltyDashboard from "@/components/loyalty-dashboard"

function ProfilePage() {
  return (
    <div>
      <LoyaltyDashboard customerId={user.id} />
    </div>
  )
}
\`\`\`

### 4. Rewards Catalog
\`\`\`typescript
import RewardsCatalog from "@/components/rewards-catalog"

function RewardsPage() {
  return (
    <div>
      <RewardsCatalog customerId={user.id} />
    </div>
  )
}
\`\`\`

### 5. Process Referral
\`\`\`typescript
import { useReferral } from "@/hooks/useLoyalty"

function SignupPage() {
  const { processReferral } = useReferral()
  
  const handleSignup = async (referralCode: string, newUserId: string) => {
    // Process referral
    const bonus = await processReferral(referralCode, newUserId)
    console.log(`Referrer earned ${bonus.referrerPoints} points!`)
    console.log(`You earned ${bonus.refereePoints} points!`)
  }
}
\`\`\`

### 6. Complete Referral (on first purchase)
\`\`\`typescript
import { useReferral } from "@/hooks/useLoyalty"

function CheckoutPage() {
  const { completeReferral } = useReferral()
  
  const handleFirstPurchase = async (customerId: string) => {
    // Complete referral and award referrer
    await completeReferral(customerId)
  }
}
\`\`\`

### 7. Birthday Bonus
\`\`\`typescript
import { useBirthdayRewards } from "@/hooks/useLoyalty"

function BirthdayNotification() {
  const { awardBirthdayBonus } = useBirthdayRewards()
  
  useEffect(() => {
    if (isBirthday) {
      awardBirthdayBonus(customerId)
    }
  }, [isBirthday, customerId])
}
\`\`\`

### 8. Apply Promotion
\`\`\`typescript
import { usePromotions } from "@/hooks/useLoyalty"

function PromotionsPage() {
  const { promotions, applyPromotion } = usePromotions()
  
  return (
    <div>
      {promotions.map(promo => (
        <button onClick={() => applyPromotion(customerId, promo.id)}>
          Claim {promo.name}
        </button>
      ))}
    </div>
  )
}
\`\`\`

## Backend Integration (Production Requirements)

### Database Schema

#### customers_loyalty
\`\`\`sql
CREATE TABLE customers_loyalty (
  customer_id VARCHAR(255) PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(50) NOT NULL DEFAULT 'Bronze',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tier_expiry TIMESTAMP NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referred_by VARCHAR(255) NULL,
  FOREIGN KEY (referred_by) REFERENCES customers_loyalty(customer_id)
)
\`\`\`

#### point_transactions
\`\`\`sql
CREATE TABLE point_transactions (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(255) NULL,
  reward_id VARCHAR(255) NULL,
  promotion_id VARCHAR(255) NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers_loyalty(customer_id),
  FOREIGN KEY (reward_id) REFERENCES rewards(id),
  FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  INDEX idx_customer_created (customer_id, created_at),
  INDEX idx_expires (expires_at)
)
\`\`\`

#### rewards
\`\`\`sql
CREATE TABLE rewards (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  point_cost INTEGER NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  stock INTEGER NULL,
  image_url TEXT NULL,
  terms_and_conditions TEXT NULL,
  valid_from TIMESTAMP NULL,
  valid_until TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tier_restriction VARCHAR(50) NULL,
  max_redemptions_per_customer INTEGER NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_category (is_active, category),
  INDEX idx_points (point_cost)
)
\`\`\`

#### redemptions
\`\`\`sql
CREATE TABLE redemptions (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  reward_id VARCHAR(255) NOT NULL,
  points_spent INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  redeemed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers_loyalty(customer_id),
  FOREIGN KEY (reward_id) REFERENCES rewards(id),
  INDEX idx_customer_status (customer_id, status),
  INDEX idx_code (code),
  INDEX idx_expires (expires_at)
)
\`\`\`

#### promotions
\`\`\`sql
CREATE TABLE promotions (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  points_awarded INTEGER NULL,
  multiplier DECIMAL(3,2) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  conditions JSON NULL,
  max_uses_per_customer INTEGER NULL,
  total_usage_limit INTEGER NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_dates (is_active, start_date, end_date)
)
\`\`\`

#### referral_bonuses
\`\`\`sql
CREATE TABLE referral_bonuses (
  id VARCHAR(255) PRIMARY KEY,
  referrer_id VARCHAR(255) NOT NULL,
  referee_id VARCHAR(255) NOT NULL,
  referrer_points INTEGER NOT NULL,
  referee_points INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (referrer_id) REFERENCES customers_loyalty(customer_id),
  FOREIGN KEY (referee_id) REFERENCES customers_loyalty(customer_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_referee (referee_id)
)
\`\`\`

### API Endpoints

#### Customer Management
- `POST /api/loyalty/enroll` - Enroll customer
- `GET /api/loyalty/customer/:id` - Get customer loyalty data
- `PATCH /api/loyalty/customer/:id/activity` - Update last activity

#### Points Management
- `POST /api/loyalty/points/award` - Award points
- `POST /api/loyalty/points/redeem` - Redeem points for reward
- `POST /api/loyalty/points/expire` - Expire points
- `GET /api/loyalty/points/transactions/:customerId` - Get transaction history

#### Rewards Management
- `GET /api/loyalty/rewards` - Get rewards catalog (with filters)
- `GET /api/loyalty/rewards/:id` - Get reward details
- `POST /api/loyalty/rewards` - Create reward (admin)
- `PATCH /api/loyalty/rewards/:id` - Update reward (admin)
- `DELETE /api/loyalty/rewards/:id` - Delete reward (admin)

#### Redemptions
- `GET /api/loyalty/redemptions/:customerId` - Get customer redemptions
- `POST /api/loyalty/redemptions/:id/use` - Mark redemption as used
- `POST /api/loyalty/redemptions/:id/expire` - Expire redemption

#### Referrals
- `POST /api/loyalty/referrals/process` - Process referral code
- `POST /api/loyalty/referrals/complete/:refereeId` - Complete referral

#### Promotions
- `GET /api/loyalty/promotions` - Get active promotions
- `POST /api/loyalty/promotions/:id/apply` - Apply promotion
- `POST /api/loyalty/promotions` - Create promotion (admin)

#### Birthday Bonuses
- `POST /api/loyalty/birthday/:customerId` - Award birthday bonus

### Cron Jobs (Automated Tasks)

#### Daily Tasks
\`\`\`typescript
// Expire old points (run daily at midnight)
async function expireOldPoints() {
  const expiredTransactions = await db.point_transactions
    .where('expires_at', '<=', new Date())
    .where('type', '=', 'earn')
    .select()
  
  for (const transaction of expiredTransactions) {
    await loyaltyEngine.expirePoints(
      transaction.customer_id,
      transaction.points,
      'Points expired after 1 year'
    )
  }
}

// Expire old redemptions (run daily at midnight)
async function expireOldRedemptions() {
  await db.redemptions
    .where('expires_at', '<=', new Date())
    .where('status', '=', 'confirmed')
    .update({ status: 'expired' })
}
\`\`\`

#### Birthday Bonuses (run daily)
\`\`\`typescript
async function awardBirthdayBonuses() {
  const today = new Date()
  const customers = await db.customers
    .whereRaw('MONTH(birth_date) = ? AND DAY(birth_date) = ?', [
      today.getMonth() + 1,
      today.getDate()
    ])
    .select()
  
  for (const customer of customers) {
    await loyaltyEngine.awardBirthdayBonus(customer.id)
  }
}
\`\`\`

## Performance Optimizations

### Caching Strategy
\`\`\`typescript
// Use Redis for frequently accessed data
import Redis from 'ioredis'

const redis = new Redis()

// Cache customer loyalty data (5 minutes)
async function getCustomerLoyalty(customerId: string) {
  const cached = await redis.get(`loyalty:${customerId}`)
  if (cached) return JSON.parse(cached)
  
  const customer = await db.customers_loyalty.find(customerId)
  await redis.setex(`loyalty:${customerId}`, 300, JSON.stringify(customer))
  return customer
}

// Cache rewards catalog (1 hour)
async function getRewards() {
  const cached = await redis.get('loyalty:rewards')
  if (cached) return JSON.parse(cached)
  
  const rewards = await db.rewards.where('is_active', true).select()
  await redis.setex('loyalty:rewards', 3600, JSON.stringify(rewards))
  return rewards
}

// Invalidate cache on updates
async function updateReward(rewardId: string, data: any) {
  await db.rewards.update(rewardId, data)
  await redis.del('loyalty:rewards')
}
\`\`\`

### Database Indexing
- Index on `customer_id` + `created_at` for transaction queries
- Index on `expires_at` for expiry cleanup jobs
- Index on `is_active` + `category` for reward filters
- Index on `status` for redemption queries
- Unique index on `referral_code` for fast lookups

### Query Optimization
\`\`\`typescript
// Batch fetch related data
async function getTransactionHistory(customerId: string) {
  const transactions = await db.point_transactions
    .where('customer_id', customerId)
    .orderBy('created_at', 'desc')
    .limit(50)
    .select()
  
  // Batch fetch rewards for redemption transactions
  const rewardIds = transactions
    .filter(t => t.reward_id)
    .map(t => t.reward_id)
  
  const rewards = await db.rewards
    .whereIn('id', rewardIds)
    .select()
  
  return transactions.map(t => ({
    ...t,
    reward: rewards.find(r => r.id === t.reward_id)
  }))
}
\`\`\`

## Security Considerations

### Points Manipulation Prevention
- All point transactions logged with audit trail
- Server-side validation for all point awards
- Rate limiting on point-earning actions
- Fraud detection for suspicious patterns
- Redemption code verification before use

### Access Control
\`\`\`typescript
// Only allow customers to view their own data
async function getCustomerLoyalty(customerId: string, requestUserId: string) {
  if (customerId !== requestUserId && !isAdmin(requestUserId)) {
    throw new Error('Unauthorized')
  }
  
  return await db.customers_loyalty.find(customerId)
}
\`\`\`

### Redemption Security
- Unique redemption codes (12 characters alphanumeric)
- QR code verification at point of use
- Single-use codes (marked as used after redemption)
- Expiry validation before acceptance
- Staff verification interface for in-person redemptions

## Monitoring & Analytics

### Key Metrics
- **Enrollment Rate**: New customers joining per day/week/month
- **Points Earned**: Total points awarded per action type
- **Points Redeemed**: Total points spent on rewards
- **Redemption Rate**: Percentage of earned points redeemed
- **Tier Distribution**: Number of customers per tier
- **Tier Upgrade Rate**: Customers upgrading per period
- **Referral Success Rate**: Completed referrals / total referrals
- **Promotion Effectiveness**: Point multiplier impact on engagement
- **Popular Rewards**: Most redeemed rewards
- **Expiry Rate**: Percentage of points expiring unused

### Dashboard Queries
\`\`\`typescript
// Tier distribution
SELECT tier, COUNT(*) as count
FROM customers_loyalty
GROUP BY tier

// Most popular rewards
SELECT r.name, COUNT(*) as redemptions
FROM redemptions red
JOIN rewards r ON red.reward_id = r.id
WHERE red.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY r.id
ORDER BY redemptions DESC
LIMIT 10

// Points earned by action type
SELECT description, SUM(points) as total_points, COUNT(*) as count
FROM point_transactions
WHERE type = 'earn'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY description
ORDER BY total_points DESC
\`\`\`

## Testing

### Unit Tests
\`\`\`typescript
describe('LoyaltyEngine', () => {
  it('should enroll customer with welcome bonus', () => {
    const customer = engine.enrollCustomer('test123')
    expect(customer.points).toBe(500)
  })
  
  it('should upgrade tier automatically', () => {
    const customer = engine.enrollCustomer('test123')
    engine.awardPoints('test123', 'purchase', { amount: 1000 })
    expect(customer.tier).toBe('Silver')
  })
  
  it('should prevent redemption without enough points', () => {
    const customer = engine.enrollCustomer('test123')
    expect(() => {
      engine.redeemPoints('test123', 'expensive-reward')
    }).toThrow('Insufficient points')
  })
})
\`\`\`

### Integration Tests
\`\`\`typescript
describe('Loyalty Flow', () => {
  it('should complete full customer journey', async () => {
    // 1. Enroll
    const customer = await enrollCustomer('test123')
    expect(customer.tier).toBe('Bronze')
    
    // 2. Earn points
    await awardPoints('test123', 'purchase', { amount: 1500 })
    expect(customer.tier).toBe('Silver')
    
    // 3. Redeem reward
    const redemption = await redeemPoints('test123', 'reward1')
    expect(redemption.code).toBeDefined()
    
    // 4. Process referral
    const bonus = await processReferral(customer.referralCode, 'test456')
    expect(bonus.referrerPoints).toBe(500)
  })
})
\`\`\`

## Future Enhancements

### Phase 1 Enhancements
- [ ] Mobile app integration with push notifications
- [ ] Email notifications for tier upgrades and promotions
- [ ] SMS alerts for redemption codes
- [ ] Social media integration for sharing
- [ ] Gamification badges and achievements

### Phase 2 Enhancements
- [ ] AI-powered reward recommendations
- [ ] Personalized promotions based on behavior
- [ ] Dynamic tier thresholds based on market
- [ ] Partner rewards network
- [ ] Gift card integration

### Phase 3 Enhancements
- [ ] Blockchain-based points for transparency
- [ ] NFT rewards for exclusive items
- [ ] Cryptocurrency redemption options
- [ ] Augmented reality reward previews
- [ ] Voice assistant integration

## Dependencies

\`\`\`json
{
  "dependencies": {
    "react": "^18.2.0",
    "date-fns": "^2.30.0",
    "qrcode": "^1.5.3",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
\`\`\`

## Summary

Complete loyalty program system with:
- ✅ 4-tier membership system with auto-upgrades
- ✅ 8 point earning actions with tier multipliers
- ✅ Comprehensive rewards catalog with filters
- ✅ Redemption system with QR codes
- ✅ Referral program with dual rewards
- ✅ Birthday bonuses and promotions
- ✅ Transaction history and audit trail
- ✅ 6 production-ready components
- ✅ 9 React hooks for integration
- ✅ Complete documentation
- ✅ Database schema and API design
- ✅ Performance optimization strategies
- ✅ Security best practices

**Total**: 6 files, ~3,500 lines of code

Ready for production deployment with backend integration!
