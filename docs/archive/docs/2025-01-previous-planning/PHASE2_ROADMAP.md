# Phase 2 Roadmap: Custom AI Models for Thai Skin Analysis

**Status:** ๐“ **PLANNED**  
**Current Phase:** Phase 1 Complete (88% accuracy)  
**Phase 2 Goal:** 93% accuracy (+5%)  
**Timeline:** 12 weeks  
**Budget:** $250  
**Start Date:** TBD

---

## ๐ฏ Overview

Phase 2 focuses on training **custom AI models specifically for Thai skin** to close the 7% accuracy gap with VISIA clinical devices (88% โ’ 95%). 

### Why Custom Models?

**Current Limitation:**
- Google Vision API trained primarily on Western/Caucasian skin
- Thai skin has different characteristics:
  - Higher melanin content
  - Different texture patterns
  - Unique aging characteristics
  - Climate-related skin conditions (tropical)

**Solution:**
- Train custom models on 1,000+ Thai skin images
- Focus on wrinkles, pores, and texture specific to Thai population
- Fine-tune for local lighting conditions and clinic environments

**Expected Improvement:**
- Custom models: +3% (88% โ’ 91%)
- Depth estimation: +2% (91% โ’ 93%)
- **Total Phase 2:** 88% โ’ 93% (+5%)

---

## ๐“ Phase 2 Components

### 1. Dataset Collection Tool โ… (Already Complete)

**Status:** Done in Phase 1  
**File:** `app/dataset-collection/page.tsx` (481 lines)

**Features:**
- Upload multiple images
- Canvas-based annotation (wrinkles, pores, spots, texture)
- Metadata form (age, gender, skin type, lighting, angle)
- Export to JSON format

**Target:** 1,000+ annotated images

---

### 2. Data Collection Campaign

**Timeline:** Weeks 1-4 (4 weeks)  
**Goal:** Collect 1,000+ high-quality Thai skin images

**Strategy:**

#### Week 1-2: Setup & Initial Collection (500 images)
- Partner with 3-5 clinics in Bangkok
- Train staff on dataset collection tool
- Collect from walk-in patients (with consent)
- Target demographics:
  - Age: 20-60 years
  - Gender: 50% male, 50% female
  - Skin types: All types (oily, dry, combination, normal, sensitive)

#### Week 3-4: Expand Collection (500 images)
- Expand to Chiang Mai and Phuket clinics
- Social media campaign (incentivize with free skin analysis)
- Ensure diversity:
  - Different age groups
  - Various skin conditions
  - Multiple angles (front, left, right)
  - Different lighting conditions

**Annotation Requirements:**
- Each image needs:
  - Wrinkle annotations (red lines)
  - Pore annotations (blue circles)
  - Spot annotations (yellow areas)
  - Texture annotations (purple regions)
  - Metadata (age, gender, skin type, etc.)

**Quality Control:**
- Review all annotations
- Discard poor quality images (bad lighting, blur)
- Ensure balanced dataset

---

### 3. Model Training

**Timeline:** Weeks 5-10 (6 weeks)  
**Budget:** $200 (GPU compute)

#### Model Architecture

**3 Specialized Models:**

##### Model 1: Wrinkle Detection (ResNet50)
\`\`\`python
# Architecture
Input: 512x512 RGB image
โ”โ”€โ”€ ResNet50 backbone (pre-trained on ImageNet)
โ”โ”€โ”€ Feature Pyramid Network (FPN)
โ”โ”€โ”€ Detection head
โ””โ”€โ”€ Output: Wrinkle masks + severity scores

# Training
- Dataset: 1,000 images with wrinkle annotations
- Augmentation: Rotation, flip, brightness, contrast
- Loss: Focal Loss + Dice Loss
- Optimizer: AdamW
- Learning rate: 1e-4 โ’ 1e-6 (cosine decay)
- Epochs: 50
- Batch size: 8
- GPU: NVIDIA T4 (Google Colab Pro)
- Training time: ~30 hours
- Cost: $60
\`\`\`

**Expected Accuracy:** 90% โ’ 93% (+3%)

##### Model 2: Pore Detection (U-Net)
\`\`\`python
# Architecture
Input: 512x512 RGB image
โ”โ”€โ”€ U-Net encoder (5 levels)
โ”โ”€โ”€ Attention gates
โ”โ”€โ”€ U-Net decoder
โ””โ”€โ”€ Output: Pore segmentation map

# Training
- Dataset: 1,000 images with pore annotations
- Augmentation: Zoom, rotate, elastic deformation
- Loss: Binary Cross Entropy + IoU Loss
- Optimizer: Adam
- Learning rate: 1e-3 โ’ 1e-5
- Epochs: 40
- Batch size: 16
- GPU: NVIDIA T4
- Training time: ~25 hours
- Cost: $50
\`\`\`

**Expected Accuracy:** 81% โ’ 85% (+4%)

##### Model 3: Texture Analysis (EfficientNet-B3)
\`\`\`python
# Architecture
Input: 512x512 RGB image
โ”โ”€โ”€ EfficientNet-B3 backbone
โ”โ”€โ”€ Global Average Pooling
โ”โ”€โ”€ Dense layers (512 โ’ 256 โ’ 128)
โ””โ”€โ”€ Output: Texture quality score (0-100)

# Training
- Dataset: 1,000 images with texture annotations
- Augmentation: Color jitter, noise, blur
- Loss: Mean Squared Error
- Optimizer: SGD with momentum
- Learning rate: 1e-2 โ’ 1e-4
- Epochs: 60
- Batch size: 32
- GPU: NVIDIA T4
- Training time: ~35 hours
- Cost: $70
\`\`\`

**Expected Accuracy:** 84% โ’ 88% (+4%)

#### Training Infrastructure

**Platform:** Google Colab Pro  
**Cost:** $10/month ร— 2 months = $20  
**GPU Compute:** $180 total  
**Storage:** Google Drive (free)

**Total Training Cost:** $200

---

### 4. Depth Estimation Integration

**Timeline:** Weeks 8-10 (3 weeks, parallel with training)  
**Budget:** $30 (research & testing)

**Purpose:** Add depth information to improve 3D understanding of skin features

**Approach:**

#### Option 1: MiDaS (Monocular Depth Estimation)
\`\`\`python
# MiDaS v3.1 (Intel)
- Input: Single RGB image
- Output: Depth map
- Speed: ~100ms on GPU
- Accuracy: Relative depth (not absolute)
- Cost: Free (open-source)

# Integration
depth_map = midas_model(image)
wrinkle_depth = analyze_wrinkle_depth(depth_map, wrinkle_mask)
severity_score = combine_2d_and_depth(wrinkle_mask, wrinkle_depth)
\`\`\`

**Expected Improvement:** +2% (depth context for wrinkles)

#### Option 2: ZoeDepth (NYU)
\`\`\`python
# ZoeDepth (Zero-shot)
- Input: Single RGB image
- Output: Metric depth map
- Speed: ~150ms on GPU
- Accuracy: Better than MiDaS for close-up
- Cost: Free (open-source)
\`\`\`

**Expected Improvement:** +2% (better depth accuracy)

**Final Decision:** Test both, choose best performer

---

### 5. Model Evaluation & Optimization

**Timeline:** Weeks 11-12 (2 weeks)  
**Budget:** $20 (compute for testing)

**Evaluation Metrics:**

\`\`\`python
# Test Set: 200 images (20% holdout)
metrics = {
  'wrinkles': {
    'precision': 0.93,
    'recall': 0.91,
    'f1_score': 0.92,
    'iou': 0.85
  },
  'pores': {
    'precision': 0.87,
    'recall': 0.84,
    'f1_score': 0.855,
    'iou': 0.78
  },
  'texture': {
    'mse': 12.5,
    'mae': 8.3,
    'r2_score': 0.89
  },
  'overall_accuracy': 0.93  # Target!
}
\`\`\`

**Optimization:**

1. **Model Quantization**
   - Convert FP32 โ’ FP16 (2x smaller)
   - Convert FP32 โ’ INT8 (4x smaller, TensorFlow Lite)
   - Speed improvement: 2-3x
   - Accuracy loss: <1%

2. **Model Pruning**
   - Remove 30% least important weights
   - Size reduction: 30%
   - Speed improvement: 1.5x
   - Accuracy loss: <0.5%

3. **Deployment Format**
   - Export to ONNX (cross-platform)
   - Export to TensorFlow Lite (mobile)
   - Export to CoreML (iOS)

**Target Performance:**
- Inference time: <500ms (all 3 models + depth)
- Model size: <50MB total
- Accuracy: 93% (no degradation)

---

## ๐“… 12-Week Timeline

### Weeks 1-4: Data Collection
| Week | Tasks | Deliverables |
|------|-------|-------------|
| 1 | Setup clinics, train staff | 125 images |
| 2 | Continue collection Bangkok | 250 images (total 375) |
| 3 | Expand to Chiang Mai/Phuket | 400 images (total 775) |
| 4 | Final collection, quality check | 225 images (total 1,000) |

### Weeks 5-7: Model Training (Part 1)
| Week | Tasks | Deliverables |
|------|-------|-------------|
| 5 | Data preprocessing, augmentation setup | Training pipeline ready |
| 6 | Train ResNet50 (wrinkles) | Wrinkle model v1.0 |
| 7 | Train U-Net (pores) | Pore model v1.0 |

### Weeks 8-10: Model Training (Part 2) + Depth
| Week | Tasks | Deliverables |
|------|-------|-------------|
| 8 | Train EfficientNet (texture) + Research depth | Texture model v1.0 |
| 9 | Integrate MiDaS/ZoeDepth | Depth estimation working |
| 10 | Combine all models, end-to-end testing | Complete Phase 2 system |

### Weeks 11-12: Evaluation & Optimization
| Week | Tasks | Deliverables |
|------|-------|-------------|
| 11 | Evaluation, quantization, pruning | Optimized models |
| 12 | Final testing, documentation, deployment | Phase 2 complete! |

---

## ๐’ฐ Budget Breakdown

| Item | Cost | Notes |
|------|------|-------|
| **Data Collection** | $0 | Use existing clinic resources |
| **Annotation Labor** | $0 | Clinic staff (already budgeted) |
| **Google Colab Pro** | $20 | $10/month ร— 2 months |
| **GPU Training (ResNet50)** | $60 | ~30 hours on T4 |
| **GPU Training (U-Net)** | $50 | ~25 hours on T4 |
| **GPU Training (EfficientNet)** | $70 | ~35 hours on T4 |
| **Depth Model Research** | $30 | Testing & integration |
| **Evaluation & Testing** | $20 | Compute for optimization |
| **Total** | **$250** | One-time cost |

**ROI:** 
- Phase 1 savings: $39,000/year
- Phase 2 cost: $250
- Phase 2 value: Close 5% accuracy gap โ’ competitive with VISIA
- Payback period: <1 week of clinic operation

---

## ๐ฏ Success Criteria

### Must-Have (Phase 2 Complete)
- โ… 1,000+ annotated Thai skin images collected
- โ… 3 custom models trained (wrinkles, pores, texture)
- โ… Depth estimation integrated
- โ… **93% overall accuracy achieved**
- โ… <500ms inference time
- โ… Models deployed to production

### Nice-to-Have
- 1,500+ images (50% extra data)
- 95% accuracy (match VISIA exactly)
- <300ms inference time
- Mobile model (TensorFlow Lite)
- Real-time video analysis

---

## ๐” Alternative: Hybrid AI Strategy

**If Phase 2 is too slow/expensive, consider Hybrid approach:**

**Timeline:** 1-2 weeks (vs 12 weeks)  
**Budget:** $20-50 (vs $250)  
**Expected Accuracy:** 93-95% (vs 93%)

**Approach:**
- MediaPipe Face Mesh (+2%)
- TensorFlow Hub pre-trained models (+2%)
- Hugging Face transformers (+1-3%)

**See:** `docs/HYBRID_AI_STRATEGY.md`

**Comparison:**

| Aspect | Phase 2 Custom Models | Hybrid Strategy |
|--------|----------------------|-----------------|
| Timeline | 12 weeks | 1-2 weeks |
| Budget | $250 | $20-50 |
| Accuracy | 93% (guaranteed) | 93-95% (uncertain) |
| Thai-specific | โ… Yes | โ No |
| Maintenance | Custom updates needed | Use latest pre-trained |
| Learning value | High (ML expertise) | Medium (integration) |

**Recommendation:** Start with Hybrid Strategy, then do Phase 2 if needed

---

## ๐“ File Structure (Phase 2)

\`\`\`
lib/ai/
โ”โ”€โ”€ models/
โ”   โ”โ”€โ”€ wrinkle-detector.ts         # ResNet50 wrapper
โ”   โ”โ”€โ”€ pore-detector.ts            # U-Net wrapper
โ”   โ”โ”€โ”€ texture-analyzer.ts         # EfficientNet wrapper
โ”   โ””โ”€โ”€ depth-estimator.ts          # MiDaS/ZoeDepth wrapper
โ”โ”€โ”€ training/
โ”   โ”โ”€โ”€ train-wrinkles.py           # Training script
โ”   โ”โ”€โ”€ train-pores.py              # Training script
โ”   โ”โ”€โ”€ train-texture.py            # Training script
โ”   โ””โ”€โ”€ evaluate-models.py          # Evaluation
โ””โ”€โ”€ phase2-analyzer.ts              # Main integration

models/
โ”โ”€โ”€ wrinkle-resnet50.onnx           # 25MB
โ”โ”€โ”€ pore-unet.onnx                  # 15MB
โ”โ”€โ”€ texture-efficientnet.onnx       # 12MB
โ””โ”€โ”€ depth-midas.onnx                # 100MB (optional)

data/
โ”โ”€โ”€ thai-skin-dataset/
โ”   โ”โ”€โ”€ images/                     # 1,000+ images
โ”   โ”โ”€โ”€ annotations/                # JSON annotations
โ”   โ””โ”€โ”€ metadata.json               # Dataset info
โ””โ”€โ”€ training-logs/                  # TensorBoard logs
\`\`\`

---

## ๐€ Getting Started

### Prerequisites
\`\`\`bash
# Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install tensorflow==2.13.0
pip install torch torchvision
pip install onnx onnxruntime
pip install opencv-python pillow
pip install wandb tensorboard
pip install albumentations
\`\`\`

### Data Collection
\`\`\`bash
# Start dataset collection tool
npm run dev
# Navigate to: http://localhost:3000/dataset-collection

# Export dataset
# Click "Export" button โ’ saves JSON file

# Verify dataset
python scripts/verify-dataset.py --dataset data/thai-skin-dataset.json
\`\`\`

### Training
\`\`\`bash
# Train wrinkle detector
python lib/ai/training/train-wrinkles.py \
  --dataset data/thai-skin-dataset.json \
  --epochs 50 \
  --batch-size 8 \
  --output models/wrinkle-resnet50.pt

# Train pore detector
python lib/ai/training/train-pores.py \
  --dataset data/thai-skin-dataset.json \
  --epochs 40 \
  --batch-size 16 \
  --output models/pore-unet.pt

# Train texture analyzer
python lib/ai/training/train-texture.py \
  --dataset data/thai-skin-dataset.json \
  --epochs 60 \
  --batch-size 32 \
  --output models/texture-efficientnet.pt
\`\`\`

### Evaluation
\`\`\`bash
# Evaluate all models
python lib/ai/training/evaluate-models.py \
  --wrinkle-model models/wrinkle-resnet50.pt \
  --pore-model models/pore-unet.pt \
  --texture-model models/texture-efficientnet.pt \
  --test-set data/thai-skin-dataset.json \
  --output evaluation-report.json

# Expected output:
# Overall Accuracy: 93.2%
# Wrinkle Detection: 93.1%
# Pore Detection: 85.4%
# Texture Analysis: 88.7%
\`\`\`

### Export to ONNX
\`\`\`bash
# Convert PyTorch โ’ ONNX
python scripts/export-onnx.py \
  --model models/wrinkle-resnet50.pt \
  --output models/wrinkle-resnet50.onnx

# Verify ONNX
python scripts/verify-onnx.py \
  --model models/wrinkle-resnet50.onnx
\`\`\`

---

## ๐“ Expected Results

### Accuracy Progression

| Phase | Wrinkles | Pores | Texture | Overall |
|-------|----------|-------|---------|---------|
| Baseline | 62% | 60% | 60% | 62% |
| Phase 1 | 90% | 81% | 84% | 88% |
| **Phase 2** | **93%** | **85%** | **88%** | **93%** |
| VISIA Target | 95% | 92% | 93% | 95% |
| Gap to VISIA | -2% | -7% | -5% | -2% |

### Performance Metrics

| Metric | Phase 1 | Phase 2 | Improvement |
|--------|---------|---------|-------------|
| Accuracy | 88% | 93% | +5% |
| Inference Time | 3-5s | 3-7s | +2s (acceptable) |
| Model Size | 0 MB (API) | 50 MB | Minimal |
| Cost per Analysis | API call | $0 | Free |
| Offline Capable | โ No | โ… Yes | Major benefit |

---

## ๐“ Lessons Expected

### Technical Learnings
1. Custom model training workflow
2. Data annotation best practices
3. Model optimization techniques
4. Deployment strategies

### Business Learnings
1. Data collection in clinic environment
2. Staff training effectiveness
3. Patient consent procedures
4. Quality control processes

---

## ๐”— Related Documentation

- **Phase 1 Complete:** `docs/PHASE1_COMPLETE.md`
- **Hybrid AI Strategy:** `docs/HYBRID_AI_STRATEGY.md` (alternative approach)
- **Validation Report:** `docs/PHASE1_VALIDATION_REPORT.md`
- **Dataset Tool:** `app/dataset-collection/page.tsx`

---

## โจ Conclusion

Phase 2 will close 71% of the remaining gap to VISIA (5% out of 7% gap), bringing us from **88% โ’ 93% accuracy** through:

1. **Custom models** trained on 1,000+ Thai skin images (+3%)
2. **Depth estimation** for 3D understanding (+2%)

**Timeline:** 12 weeks  
**Budget:** $250  
**ROI:** Infinite (one-time cost, ongoing value)

This positions us to **match or exceed VISIA** in accuracy while maintaining our **100x speed advantage** and **$30,000 cost savings**.

**Decision Point:** Evaluate Hybrid Strategy first (1-2 weeks, $20-50) before committing to full Phase 2.

---

**Phase 2 Status:** ๐“ **PLANNED**  
**Prerequisite:** Phase 1 Complete โ…  
**Alternative:** Hybrid AI Strategy (faster, cheaper)
