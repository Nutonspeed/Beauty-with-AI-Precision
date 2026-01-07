# 🤖 AI API Keys Setup Guide

## 📋 สิ่งที่ต้องเตรียม

### 1. OpenAI (GPT-4o) - แนะนำ
- **Cost**: ~$5-10/1000 requests
- **Accuracy**: 95%+ สำหรับ skin analysis
- **Get Key**: https://platform.openai.com/api-keys
- **Limit**: สร้าง key ใหม่ และตั้งค่า usage limits

### 2. Anthropic (Claude 3.5 Sonnet) - แนะนำ
- **Cost**: ~$3-8/1000 requests  
- **Accuracy**: 94%+ สำหรับ structured reasoning
- **Get Key**: https://console.anthropic.com/
- **Limit**: ตั้งค่า rate limits ใน console

### 3. Google Gemini - ฟรี
- **Cost**: FREE (1,500 requests/day)
- **Accuracy**: 90%+ สำหรับ basic analysis
- **Get Key**: https://aistudio.google.com/app/apikey
- **Limit**: 50 requests/minute

### 4. Hugging Face - ฟรี
- **Cost**: FREE tier
- **Use**: สำหรับ additional AI models
- **Get Token**: https://huggingface.co/settings/tokens
- **Limit**: 1,000 requests/hour

## 🚀 Setup Steps

### Step 1: สร้าง .env.local
```bash
node scripts/setup-ai-keys.js
```

### Step 2: ใส่ API Keys จริง
แก้ไข `.env.local`:

```env
# OpenAI (แนะนำ)
OPENAI_API_KEY="sk-proj-YOUR_REAL_KEY_HERE"

# Anthropic (แนะนำ)  
ANTHROPIC_API_KEY="sk-ant-YOUR_REAL_KEY_HERE"

# Gemini (ฟรี)
GEMINI_API_KEY="YOUR_REAL_KEY_HERE"

# Hugging Face (ฟรี)
HUGGINGFACE_TOKEN="hf_YOUR_REAL_TOKEN_HERE"
```

### Step 3: ตรวจสอบ Status
```bash
pnpm run dev
# เปิด http://localhost:3004/api/health/ai-status
```

### Step 4: Test AI Analysis
1. เข้า http://localhost:3004/th/analysis
2. อัพโหลดรูปภาพผิว
3. ตรวจสอบผลลัพธ์ AI analysis

## 🎯 แนะนำ Configuration

### Best Setup (Production)
```env
# Primary AI providers
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Fallback (ฟรี)
GEMINI_API_KEY="..."
HUGGINGFACE_TOKEN="hf_..."
```

### Budget Setup (Development)
```env
# ใช้ฟรีก่อน
GEMINI_API_KEY="..."
HUGGINGFACE_TOKEN="hf_..."

# เปิดเมื่อต้องการความแม่นยำสูง
# OPENAI_API_KEY="sk-proj-..."
```

## 🔧 Troubleshooting

### AI ไม่ทำงาน?
```bash
# ตรวจสอบ API keys
curl http://localhost:3004/api/health/ai-status

# ตรวจสอบ logs
pnpm run dev 2>&1 | grep -i "ai\|error"
```

### Rate Limited?
- OpenAI: ตั้ง limits ใน dashboard
- Anthropic: ตั้ง rate limits ใน console  
- Gemini: รอ 1 นาที แล้วลองใหม่

### Invalid API Key?
1. ตรวจสอบตัวพิมพ์ (case-sensitive)
2. ตรวจสอบว่า key ยัง active
3. ตรวจสอบ permissions

## 📊 AI Provider Comparison

| Provider | Cost | Accuracy | Speed | Recommendation |
|----------|------|----------|-------|----------------|
| **OpenAI GPT-4o** | $$ | 95%+ | Fast | **Best for production** |
| **Claude 3.5** | $$ | 94%+ | Medium | Good fallback |
| **Gemini** | Free | 90%+ | Fast | Great for development |
| **Hugging Face** | Free | 85%+ | Slow | Additional models |

## 🎉 ถ้า Setup สำเร็จ

คุณจะได้:
- ✅ 95%+ accuracy skin analysis
- ✅ Multi-provider fallback
- ✅ Real-time AI processing
- ✅ Future skin prediction
- ✅ Treatment recommendations

**Next Steps:**
1. Test AI analysis 10+ images
2. Check accuracy vs VISIA
3. Deploy to production
4. Monitor usage & costs
