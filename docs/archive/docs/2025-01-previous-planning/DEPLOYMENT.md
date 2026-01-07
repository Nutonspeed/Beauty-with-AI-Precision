# Production Deployment Guide

## Overview
This guide covers deploying the AI Beauty Platform to production using Vercel, Supabase, and other cloud services.

## Prerequisites

### System Requirements
- Node.js 20+
- pnpm or npm
- Git
- Vercel account
- Supabase account
- Stripe account (for payments)

### Required Services
1. **Vercel** - Application hosting
2. **Supabase** - Database and authentication
3. **Stripe** - Payment processing
4. **Resend** - Email notifications (optional)
5. **Twilio** - SMS notifications (optional)

## Quick Start

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd ai-beauty-platform
pnpm install
\`\`\`

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# Notifications (Optional)
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
\`\`\`

### 3. Database Setup
Run all SQL scripts in Supabase SQL Editor:

\`\`\`bash
# In order:
scripts/001-setup-demo-users.sql
scripts/002-create-demo-clinic.sql
scripts/003-create-payments-table.sql
scripts/004-create-staff-availability.sql
scripts/005-create-treatment-sessions.sql
scripts/006-create-inventory-tables.sql
scripts/007-create-marketing-tables.sql
scripts/008-create-audit-logs.sql
scripts/009-create-referral-system.sql
\`\`\`

### 4. Local Testing
\`\`\`bash
pnpm dev
# Visit http://localhost:3000
\`\`\`

## Vercel Deployment

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project settings

### 2. Environment Variables
Add all environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable from `.env.local`
- Set for Production, Preview, and Development

### 3. Build Settings
\`\`\`bash
Framework Preset: Next.js
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
\`\`\`

### 4. Deploy
\`\`\`bash
# Via Vercel CLI
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
\`\`\`

## Supabase Setup

### 1. Create Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Wait for database provisioning

### 2. Run Migrations
1. Go to SQL Editor
2. Run each script from `/scripts` directory in order
3. Verify tables are created

### 3. Configure Authentication
1. Go to Authentication → Settings
2. Enable Email provider
3. Configure email templates
4. Set Site URL to your Vercel domain

### 4. Storage Setup
1. Go to Storage
2. Create bucket: `analyses`
3. Set public access policies
4. Create bucket: `progress-photos`

## Stripe Setup

### 1. Create Account
1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete business verification
3. Get API keys from Developers → API keys

### 2. Configure Products
1. Go to Products
2. Create subscription tiers:
   - Free (0/month)
   - Premium ($29/month)
   - Clinical ($99/month)
3. Note product IDs for configuration

### 3. Webhook Setup
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to environment variables

## Email Setup (Resend)

### 1. Create Account
1. Sign up at [Resend](https://resend.com)
2. Verify your domain
3. Get API key

### 2. Configure DNS
Add DNS records for email verification:
\`\`\`
Type: TXT
Name: @
Value: [provided by Resend]
\`\`\`

### 3. Test Email
\`\`\`bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"noreply@yourdomain.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
\`\`\`

## SMS Setup (Twilio)

### 1. Create Account
1. Sign up at [Twilio](https://www.twilio.com)
2. Get phone number
3. Get Account SID and Auth Token

### 2. Configure
Add credentials to environment variables

### 3. Test SMS
\`\`\`bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json \
  --data-urlencode "From=+1234567890" \
  --data-urlencode "To=+0987654321" \
  --data-urlencode "Body=Test message" \
  -u YOUR_SID:YOUR_AUTH_TOKEN
\`\`\`

## Post-Deployment

### 1. Health Check
\`\`\`bash
curl https://your-domain.com/api/health
\`\`\`

### 2. Create Demo Accounts
Run the demo user creation script:
\`\`\`bash
npx tsx scripts/create-demo-users.ts
\`\`\`

### 3. Test Core Features
- [ ] User registration and login
- [ ] AI skin analysis
- [ ] Booking creation
- [ ] Payment processing
- [ ] Email notifications
- [ ] Admin dashboard access

### 4. Configure Domain
1. Add custom domain in Vercel
2. Update DNS records
3. Update NEXTAUTH_URL environment variable
4. Update Supabase Site URL

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor performance and errors

### Supabase Monitoring
- Database performance in Dashboard
- API usage and quotas
- Real-time connections

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for APM

## Backup Strategy

### Database Backup
\`\`\`bash
# Daily automated backups in Supabase
# Manual backup:
# Go to Database → Backups → Create backup
\`\`\`

### Code Backup
- Git repository (GitHub/GitLab)
- Vercel deployment history
- Regular tagged releases

## Scaling

### Vercel
- Automatic scaling included
- Upgrade plan for higher limits
- Enable Edge Functions for global performance

### Supabase
- Upgrade to Pro for better performance
- Enable connection pooling
- Add read replicas for high traffic

### CDN
- Vercel Edge Network included
- Configure caching headers
- Optimize images with Next.js Image

## Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Supabase RLS policies enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Audit logging enabled
- [ ] Regular security updates
- [ ] Backup strategy implemented

## Troubleshooting

### Build Failures
\`\`\`bash
# Check build logs in Vercel
# Common issues:
- Missing environment variables
- TypeScript errors
- Dependency conflicts

# Fix:
vercel env pull .env.local
pnpm install
pnpm build
\`\`\`

### Database Connection Issues
\`\`\`bash
# Verify Supabase credentials
# Check connection pooling
# Review RLS policies
\`\`\`

### Payment Issues
\`\`\`bash
# Verify Stripe webhook endpoint
# Check webhook secret
# Review Stripe logs
\`\`\`

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review audit logs monthly
- Update dependencies monthly
- Database maintenance (automatic in Supabase)
- Review and rotate API keys quarterly

### Updates
\`\`\`bash
# Update dependencies
pnpm update

# Test locally
pnpm dev

# Deploy
git push origin main
\`\`\`

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check environment variables
4. Verify API integrations
5. Contact support if needed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Integration](https://stripe.com/docs)
