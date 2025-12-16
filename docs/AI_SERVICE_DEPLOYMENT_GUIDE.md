# 🤖 AI Service Deployment Guide

## Overview
The Python AI service provides advanced skin analysis using MediaPipe, TensorFlow, and Hugging Face models.

## Option 1: Deploy to Railway (Recommended) ⭐

### Why Railway?
- ✅ Easy deployment
- ✅ $5/month (500MB RAM, 0.5 vCPU)
- ✅ Automatic SSL
- ✅ Auto-restart on crash
- ✅ GitHub integration

### Steps (30 minutes)

#### 1. Prepare Repository
```bash
cd services/ai-service/

# Ensure Dockerfile exists (already created)
# Ensure requirements.txt exists (already created)
```

#### 2. Deploy to Railway
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects `Dockerfile` in `services/ai-service/`
6. Click "Deploy"

#### 3. Configure Environment Variables
In Railway dashboard:
```bash
HUGGINGFACE_TOKEN=hf_your-token-here
GEMINI_API_KEY=your-gemini-key  # Optional
OPENAI_API_KEY=sk-your-key      # Optional
PORT=8000
```

#### 4. Get Service URL
- Railway provides: `https://your-service.railway.app`
- Copy this URL

#### 5. Update Next.js App
Add to Vercel Environment Variables:
```bash
AI_SERVICE_URL=https://your-service.railway.app
```

#### 6. Test
```bash
curl https://your-service.railway.app/api/health
# Should return: {"status": "healthy"}
```

---

## Option 2: Deploy to Render

### Steps (30 minutes)

#### 1. Create Account
1. Go to https://render.com/
2. Sign up with GitHub

#### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect repository
3. Configure:
   - **Name:** beauty-ai-service
   - **Root Directory:** `ai-service`
   - **Environment:** Docker
   - **Plan:** Free (512MB RAM) or Starter ($7/month)

#### 3. Environment Variables
```bash
HUGGINGFACE_TOKEN=hf_your-token
GEMINI_API_KEY=your-key
PORT=8000
```

#### 4. Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for build

#### 5. Get URL
- Render provides: `https://beauty-ai-service.onrender.com`
- Update `AI_SERVICE_URL` in Vercel

---

## Option 3: Client-Side Fallback (Quick Fix) ⚡

If you need to launch quickly without deploying Python service:

### Use Hugging Face Inference API

#### 1. Get Hugging Face Token
1. Go to https://huggingface.co/settings/tokens
2. Create new token (read access)
3. Copy token (starts with `hf_`)

#### 2. Install SDK
```bash
pnpm add @huggingface/inference
```

#### 3. Create Client-Side Analyzer
Create `lib/ai/client-analyzer.ts`:
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN);

export async function analyzeImageClientSide(imageUrl: string) {
  try {
    // Use image classification model
    const result = await hf.imageClassification({
      data: await fetch(imageUrl).then(r => r.blob()),
      model: 'microsoft/resnet-50',
    });
    
    return {
      success: true,
      analysis: result,
    };
  } catch (error) {
    console.error('Client-side analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

#### 4. Add Fallback Logic
Update `lib/ai/hybrid-analyzer.ts`:
```typescript
import { analyzeImageClientSide } from './client-analyzer';

export async function analyzeWithFallback(imageUrl: string) {
  // Try Python service first
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze`, {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl }),
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Python service unavailable, using fallback');
  }
  
  // Fallback to client-side
  return await analyzeImageClientSide(imageUrl);
}
```

**Trade-offs:**
- ✅ No server required
- ✅ Quick to implement
- ❌ Lower accuracy (10-15% less)
- ❌ Limited models
- ❌ API rate limits

---

## Comparison

| Feature | Railway | Render | Client-Side |
|---------|---------|--------|-------------|
| **Cost** | $5/month | Free/7$ | Free |
| **Setup Time** | 30 min | 30 min | 10 min |
| **Accuracy** | High | High | Medium |
| **Performance** | Fast | Medium | Fast |
| **Reliability** | High | Medium | High |
| **Scalability** | Good | Good | Limited |

**Recommendation:** 
- **For Launch:** Railway (best balance)
- **For Testing:** Client-Side (quickest)
- **For Budget:** Render Free Tier

---

## Environment Variables Needed

### Hugging Face (Required)
```bash
HUGGINGFACE_TOKEN="hf_your-token-here"
```
Get from: https://huggingface.co/settings/tokens

### Google Gemini (Optional, but recommended)
```bash
GEMINI_API_KEY="your-gemini-api-key"
```
Get from: https://aistudio.google.com/app/apikey
- FREE: 1,500 requests/day
- Improves analysis quality

### OpenAI (Optional)
```bash
OPENAI_API_KEY="sk-your-openai-key"
```
Get from: https://platform.openai.com/api-keys
- Pay-as-you-go
- Best for detailed analysis

---

## Health Check Endpoint

All deployments should respond to:
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": true
}
```

---

## Monitoring

### Railway
- Dashboard → Metrics
- Shows CPU, RAM, requests

### Render
- Dashboard → Metrics
- Free tier: basic metrics
- Paid: detailed monitoring

### Custom Monitoring
Add to Python service (`main.py`):
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
)
```

---

## Troubleshooting

### Service Won't Start
1. Check logs in Railway/Render dashboard
2. Verify `Dockerfile` is correct
3. Check `requirements.txt` dependencies
4. Ensure PORT is set correctly

### Out of Memory
1. Upgrade plan (Railway: $5 → $10 for 1GB RAM)
2. Optimize model loading
3. Use model quantization

### Slow Response
1. Check service location (select region closest to users)
2. Enable caching
3. Optimize image preprocessing

### Connection Refused
1. Verify `AI_SERVICE_URL` is correct
2. Check service is running
3. Test health endpoint directly

---

## Next Steps

1. [ ] Choose deployment option (Railway recommended)
2. [ ] Get Hugging Face token
3. [ ] Deploy AI service
4. [ ] Test health endpoint
5. [ ] Update `AI_SERVICE_URL` in Vercel
6. [ ] Test analysis from Next.js app
7. [ ] Setup monitoring
8. [ ] Configure auto-scaling (if needed)

---

## Cost Estimates

### Railway (Recommended)
- **Starter:** $5/month (500MB RAM)
- **Pro:** $10/month (1GB RAM)
- **Estimated:** $5-10/month

### Render
- **Free:** $0 (512MB RAM, sleeps after 15min)
- **Starter:** $7/month (512MB RAM, always on)
- **Estimated:** $0-7/month

### Client-Side
- **Hugging Face API:** Free (rate limited)
- **Estimated:** $0/month

**Total Launch Cost:** $5-10/month (with Railway)

---

## Support
- Railway: https://docs.railway.app/
- Render: https://render.com/docs
- Hugging Face: https://huggingface.co/docs
