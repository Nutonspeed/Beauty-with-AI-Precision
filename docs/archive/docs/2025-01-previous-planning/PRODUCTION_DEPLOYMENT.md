# Production Deployment Guide

## AI Beauty Platform - Production Deployment

### Prerequisites

- Vercel account with Pro plan (for AI Gateway)
- Supabase project (production)
- Domain name (optional)
- AI Gateway API key configured

### Environment Variables

Required environment variables for production:

\`\`\`bash
# Database (Supabase PostgreSQL)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=

# AI Gateway (Vercel)
AI_GATEWAY_API_KEY=vck_21OTwoeeh20LtPP0R2aNrWJcF3XAE2H3hAzQuS9tTpdvEsXinR3l3m9I

# Feature Flags
NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES=true
NEXT_PUBLIC_ENABLE_AR_FEATURES=true
NEXT_PUBLIC_ENABLE_LIVE_CAMERA=true
\`\`\`

### Deployment Steps

#### 1. Database Migration

\`\`\`bash
# Run Prisma migrations on production database
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
\`\`\`

#### 2. Build Optimization

\`\`\`bash
# Test production build locally
npm run build

# Check bundle size
npm run analyze
\`\`\`

#### 3. Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or use GitHub integration (recommended)
# Push to main branch → auto-deploy
\`\`\`

#### 4. Post-Deployment Checks

- [ ] Test AI analysis with real images
- [ ] Verify AR simulator works
- [ ] Check live camera AR functionality
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Check API response times
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate

### Performance Optimization

#### Edge Functions

API routes are automatically deployed as Edge Functions for low latency:

\`\`\`typescript
// app/api/analyze/route.ts
export const runtime = 'edge' // Enable Edge Runtime
export const maxDuration = 30 // 30s timeout for AI processing
\`\`\`

#### Image Optimization

\`\`\`typescript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['blob.vercel-storage.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
\`\`\`

#### Caching Strategy

\`\`\`typescript
// Cache AI results for 1 hour
export const revalidate = 3600
\`\`\`

### Monitoring

#### Vercel Analytics

Enable analytics in Vercel dashboard:
- Web Vitals monitoring
- Real User Monitoring (RUM)
- Error tracking

#### Custom Logging

\`\`\`typescript
// lib/logger.ts
export function logAnalysis(result: SkinAnalysisResult) {
  console.log('[AI Analysis]', {
    confidence: result.overallConfidence,
    processingTime: result.processingTime,
    tier: result.tier,
    timestamp: new Date().toISOString()
  })
}
\`\`\`

### Security

#### Rate Limiting

\`\`\`typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
})
\`\`\`

#### CORS Configuration

\`\`\`typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        ],
      },
    ]
  },
}
\`\`\`

### Scaling

#### Database Connection Pooling

Supabase automatically handles connection pooling via `POSTGRES_PRISMA_URL`.

#### AI Gateway Load Balancing

Vercel AI Gateway automatically load balances across multiple AI providers.

#### CDN Configuration

Static assets are automatically served via Vercel Edge Network.

### Rollback Strategy

\`\`\`bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
\`\`\`

### Cost Optimization

- Use Free tier for development
- Premium tier for production (AI Gateway access)
- Monitor AI API usage in Vercel dashboard
- Set up billing alerts

### Support

For issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check AI Gateway status
4. Contact support at vercel.com/help
