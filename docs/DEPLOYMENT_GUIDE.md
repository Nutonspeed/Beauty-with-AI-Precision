# 🚀 Beauty with AI Precision - Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: v20.19+ (required for Prisma)
- **PNPM**: v8.0+ (package manager)
- **PostgreSQL**: v14+ (via Supabase)
- **Redis**: v6+ (optional, for caching)
- **Docker**: v20+ (for DeepFace service)

### Environment Setup
```bash
# Install Node.js (v20.19+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PNPM
npm install -g pnpm

# Verify versions
node -v  # Should be v20.19+
pnpm -v  # Should be v8.0+
```

---

## 🔧 Environment Configuration

### 1. Clone Repository
```bash
git clone https://github.com/Nutonspeed/Beauty-with-AI-Precision.git
cd Beauty-with-AI-Precision
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
```bash
# Copy example environment
cp .env.example .env.local

# Setup AI keys
node scripts/setup-ai-keys.js
```

**Required Environment Variables:**
```env
# Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AI Services
OPENAI_API_KEY="sk-proj-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
GEMINI_API_KEY="your-gemini-key"
HUGGINGFACE_TOKEN="hf-your-huggingface-token"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note project URL and anon key

### 2. Run Database Migrations
```bash
# Push schema to Supabase
pnpm run db:push

# Generate Prisma client
pnpm run db:generate

# Verify schema
pnpm run schema:verify
```

### 3. Enable Row Level Security (RLS)
```bash
# Check RLS policies
node scripts/check-rls-policies.mjs

# Verify data isolation
node scripts/verify-data-isolation.mjs
```

---

## 🐳 Docker Services

### 1. Deploy DeepFace Service
```bash
# Build and run DeepFace container
node scripts/deploy-deepface.js

# Or manually
docker build -f docker/deepface.Dockerfile -t beauty-deepface .
docker run -d --name beauty-deepface -p 5000:5000 beauty-deepface
```

### 2. Deploy AI Service (Optional)
```bash
# Build Python AI service
docker build -f python/Dockerfile -t beauty-ai .
docker run -d --name beauty-ai -p 8000:8000 beauty-ai
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy frontend
vercel --prod

# Deploy API (separate project)
vercel --prod --name beauty-ai-api
```

#### 3. Configure Environment Variables
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add NEXTAUTH_SECRET production
```

### Option 2: Docker Deployment

#### 1. Build Application Image
```bash
docker build -t beauty-ai-app .
```

#### 2. Run with Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - deepface
      - redis

  deepface:
    build:
      context: .
      dockerfile: docker/deepface.Dockerfile
    ports:
      - "5000:5000"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

```bash
docker-compose up -d
```

### Option 3: Traditional Server

#### 1. Build Application
```bash
pnpm run build
```

#### 2. Setup PM2
```bash
# Install PM2
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'beauty-ai',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Setup Nginx
```nginx
# /etc/nginx/sites-available/beauty-ai
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/beauty-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring Setup

### 1. Sentry Error Tracking
```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure in .env.local
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
```

### 2. Vercel Analytics
```bash
# Enable in Vercel dashboard
# Settings > Analytics > Enable
```

### 3. Custom Monitoring
```bash
# Health check endpoint
curl https://your-domain.com/api/health

# Performance metrics
curl https://your-domain.com/api/monitoring/metrics
```

---

## 🧪 Testing Deployment

### 1. Health Checks
```bash
# Application health
curl https://your-domain.com/api/health

# AI services status
curl https://your-domain.com/api/health/ai-status

# Database connection
curl https://your-domain.com/api/health/db
```

### 2. E2E Tests
```bash
# Run Playwright tests
pnpm test:e2e

# Test specific endpoints
pnpm test:api
```

### 3. Performance Tests
```bash
# Bundle analysis
pnpm run build:analyze

# Lighthouse audit
npx lighthouse https://your-domain.com --output html
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests
      run: pnpm test
    
    - name: Build application
      run: pnpm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📈 Performance Optimization

### 1. Bundle Optimization
```bash
# Analyze bundle size
node scripts/analyze-bundle.js

# Optimize imports
pnpm run build:optimized
```

### 2. Caching Strategy
```bash
# Redis setup
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Configure caching
export REDIS_URL="redis://localhost:6379"
```

### 3. CDN Configuration
```bash
# Configure CDN in next.config.js
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
  assetPrefix: 'https://your-cdn-domain.com',
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Clear cache
rm -rf .next
pnpm install
pnpm run build
```

#### 2. Database Connection
```bash
# Check Supabase connection
pnpm run check:db

# Verify RLS policies
node scripts/check-rls-policies.mjs
```

#### 3. AI Services Down
```bash
# Check DeepFace service
curl http://localhost:5000/health

# Restart containers
docker restart beauty-deepface
```

#### 4. Performance Issues
```bash
# Check bundle size
pnpm run build:analyze

# Monitor memory
pm2 monit

# Check logs
pm2 logs beauty-ai
```

---

## 📞 Support

### Deployment Support
- 📧 Email: deploy@beauty-ai.com
- 📖 Documentation: https://docs.beauty-ai.com
- 🐛 Issues: https://github.com/Nutonspeed/Beauty-with-AI-Precision/issues

### Monitoring Dashboards
- **Sentry**: https://your-org.sentry.io
- **Vercel**: https://vercel.com/your-account
- **Custom**: https://your-domain.com/admin/monitoring

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Node.js v20.19+ installed
- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] AI keys configured
- [ ] Tests passing

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificate active
- [ ] Monitoring configured
- [ ] Performance optimized
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 🎉 Success Metrics

After deployment, monitor:
- **Uptime**: >99.9%
- **Page Load**: <2 seconds
- **API Response**: <500ms
- **Error Rate**: <1%
- **Performance Score**: >90

---

**🚀 Your Beauty with AI Precision platform is now live!**
