# 🔬 แผนอัพเกรด AI System - Hybrid Open Source Architecture

## 📊 วิเคราะห์ระบบที่ทำงานไม่เต็มที่

### สถานะปัจจุบัน

| Component | สถานะ | ปัญหา | ความแม่นยำ |
|-----------|--------|-------|------------|
| **Face Detection** | ✅ ดี | - | 95%+ |
| **Skin Texture Analysis** | ⚠️ ปานกลาง | ใช้ algorithm ง่าย | 70-75% |
| **UV Damage Detection** | ⚠️ Simulated | ไม่มี UV camera | 60-70% |
| **Porphyrin Detection** | ❌ Estimated | ต้องใช้ UV light จริง | 50-60% |
| **Moisture/Hydration** | ❌ Estimated | ไม่มี sensor | 40-50% |
| **Skin Disease Detection** | ⚠️ Basic | ไม่มี trained model | 65-70% |
| **Age/Gender Analysis** | ⚠️ Basic | ใช้ estimation | 70-75% |

---

## 🚀 Hybrid Open Source Solution Architecture

### Layer 1: Browser-Side (Real-time, Low latency)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ MediaPipe   │  │ TensorFlow  │  │ ONNX Runtime Web    │  │
│  │ Face Mesh   │  │ .js Lite    │  │ (Optimized Models)  │  │
│  │ (468 pts)   │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                   │               │
│         └────────────────┴───────────────────┘               │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │   Ensemble Combiner   │                       │
│              │   (Voting + Weights)  │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Layer 2: Server-Side (High accuracy, Complex analysis)

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ DeepFace    │  │ HAM10000    │  │ Custom Skin Model   │  │
│  │ (Age/Gender │  │ Skin Lesion │  │ (Thai Skin Dataset) │  │
│  │  Emotion)   │  │ Classifier  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                   │               │
│         └────────────────┴───────────────────┘               │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │   AI Orchestrator     │                       │
│              │   (Python FastAPI)    │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Layer 3: Cloud AI (Premium features, Fallback)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ OpenAI      │  │ Anthropic   │  │ Google Gemini       │  │
│  │ GPT-4o      │  │ Claude      │  │ Vision              │  │
│  │ Vision      │  │ Vision      │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                   │               │
│         └────────────────┴───────────────────┘               │
│                          │                                   │
│              ┌───────────▼───────────┐                       │
│              │   Unified AI Gateway  │                       │
│              │   (Fallback Chain)    │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Open Source Technologies ที่แนะนำ

### 1. Face Analysis - DeepFace (Python)
```python
# pip install deepface
from deepface import DeepFace

# Age, Gender, Emotion, Race analysis
result = DeepFace.analyze(
    img_path="face.jpg",
    actions=['age', 'gender', 'race', 'emotion']
)
# Accuracy: Age ±4.65 years, Gender 97.44%
```

**ข้อดี:**
- 10+ face recognition models (VGG-Face, FaceNet, ArcFace, etc.)
- Age/Gender/Emotion analysis ในตัว
- Accuracy สูงกว่า 97%
- ฟรี, Open Source

### 2. Skin Lesion - HAM10000 Model
```python
# Pretrained on 10,015 dermatoscopic images
# 7 skin lesion categories:
# - Melanocytic nevi (nv)
# - Melanoma (mel)
# - Benign keratosis (bkl)
# - Basal cell carcinoma (bcc)
# - Actinic keratoses (akiec)
# - Vascular lesions (vasc)
# - Dermatofibroma (df)
```

**ข้อดี:**
- Dataset มาตรฐานทางการแพทย์
- มี pretrained models พร้อมใช้
- สามารถ convert เป็น TensorFlow.js ได้

### 3. Browser-Side - ONNX Runtime Web
```javascript
// Faster than TensorFlow.js in many cases
import * as ort from 'onnxruntime-web';

const session = await ort.InferenceSession.create('skin_model.onnx');
const results = await session.run({ input: imageTensor });
```

**ข้อดี:**
- WebGL/WebAssembly acceleration
- รองรับ models จากทุก framework (PyTorch, TensorFlow, etc.)
- 135ms inference time (vs 300ms+ TensorFlow.js)

### 4. Multi-Modal Analysis - Florence-2
```python
# Microsoft's foundation model for vision tasks
# Supports: captioning, detection, segmentation, OCR
from transformers import AutoProcessor, AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("microsoft/Florence-2-large")
processor = AutoProcessor.from_pretrained("microsoft/Florence-2-large")
```

**ข้อดี:**
- หลาย tasks ใน model เดียว
- Zero-shot capabilities
- ฟรี, Open Source

---

## 📈 Implementation Roadmap

### Phase 1: DeepFace Integration (1-2 สัปดาห์)
**เป้าหมาย:** เพิ่ม Age/Gender/Emotion analysis ที่แม่นยำ

```
Files to create:
├── lib/ai/deepface-service.ts     # TypeScript client
├── services/python/deepface_api.py # Python FastAPI server
├── docker/deepface.Dockerfile     # Docker container
└── components/analysis/age-gender-result.tsx
```

**Expected improvement:**
- Age estimation: 70% → 95%
- Gender detection: 75% → 97%
- Emotion analysis: NEW feature

### Phase 2: HAM10000 Skin Model (2-3 สัปดาห์)
**เป้าหมาย:** ตรวจจับโรคผิวหนังที่แม่นยำ

```
Files to create:
├── lib/ai/skin-lesion-model.ts    # TF.js model loader
├── models/ham10000_tfjs/          # Converted model
├── lib/ai/skin-disease-classifier.ts
└── components/analysis/skin-disease-result.tsx
```

**Expected improvement:**
- Skin disease detection: 65% → 85%
- 7 lesion categories support

### Phase 3: ONNX Runtime Optimization (1 สัปดาห์)
**เป้าหมาย:** เพิ่มความเร็ว browser analysis

```
Files to create:
├── lib/ai/onnx-runtime-service.ts
├── public/models/skin_texture.onnx
├── public/models/pore_detection.onnx
└── lib/ai/model-converter.py      # PyTorch → ONNX
```

**Expected improvement:**
- Inference speed: 300ms → 150ms
- Memory usage: -30%

### Phase 4: Custom Thai Skin Model (4-6 สัปดาห์)
**เป้าหมาย:** Model เฉพาะคนไทย/เอเชีย

```
Steps:
1. รวบรวม dataset ผิวคนไทย (1,000+ images)
2. Label ด้วย dermatologist
3. Fine-tune pretrained model
4. Convert to TensorFlow.js
5. Deploy & test
```

**Expected improvement:**
- Thai skin accuracy: 75% → 90%+
- Better Fitzpatrick scale support

---

## 🏗️ Proposed Architecture

```
                    ┌─────────────────┐
                    │   User Browser  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Next.js App    │
                    │  (React + TS)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼───────┐
│ Browser AI    │   │  Next.js API    │   │ Cloud AI     │
│ (TF.js/ONNX)  │   │  Routes         │   │ (GPT-4o)     │
│               │   │                 │   │              │
│ - MediaPipe   │   │ /api/analyze    │   │ - Fallback   │
│ - Skin Model  │   │ /api/deepface   │   │ - Premium    │
│ - Quick scan  │   │ /api/disease    │   │              │
└───────────────┘   └────────┬────────┘   └──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Python Service │
                    │  (FastAPI)      │
                    │                 │
                    │  - DeepFace     │
                    │  - HAM10000     │
                    │  - Custom Model │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL     │
                    │  (Supabase)     │
                    └─────────────────┘
```

---

## 💰 Cost Analysis

| Solution | Cost | Accuracy | Latency |
|----------|------|----------|---------|
| **Current (Cloud AI only)** | $0.01/request | 85% | 2-3s |
| **Hybrid (Browser + Server)** | $0.002/request | 90% | 0.5-1s |
| **Full Open Source** | $0/request | 88% | 1-2s |

**Recommendation:** Hybrid approach
- Browser: Quick scan (free, fast)
- Server: Detailed analysis (free, accurate)
- Cloud: Premium/Fallback (pay per use)

---

## 🎯 Expected Results After Upgrade

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Overall Accuracy** | 75-80% | 90-95% | +15-20% |
| **Age Estimation** | ±10 years | ±4.65 years | +54% |
| **Gender Detection** | 75% | 97% | +22% |
| **Skin Disease** | 65% | 85% | +20% |
| **Inference Speed** | 300ms | 150ms | +50% |
| **Cost per Analysis** | $0.01 | $0.002 | -80% |

---

## ✅ Action Items

### Immediate (Week 1-2)
- [ ] Setup Python FastAPI service
- [ ] Integrate DeepFace library
- [ ] Create API endpoints
- [ ] Test age/gender analysis

### Short-term (Week 3-4)
- [ ] Convert HAM10000 model to TF.js
- [ ] Integrate ONNX Runtime Web
- [ ] Create skin disease classifier
- [ ] Update UI components

### Medium-term (Week 5-8)
- [ ] Collect Thai skin dataset
- [ ] Fine-tune custom model
- [ ] Deploy to production
- [ ] A/B testing

---

## 📚 References

1. **DeepFace** - https://github.com/serengil/deepface
2. **HAM10000 Dataset** - https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
3. **ONNX Runtime Web** - https://github.com/microsoft/onnxruntime
4. **MediaPipe** - https://developers.google.com/mediapipe
5. **Florence-2** - https://huggingface.co/microsoft/Florence-2-large

---

*เอกสารนี้สร้างเมื่อ: 2024-12-01*
*ผู้จัดทำ: AI Engineering Team*
