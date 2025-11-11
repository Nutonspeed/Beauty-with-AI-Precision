# Calibration Dataset

Expert-annotated ground truth images for AI model validation and accuracy benchmarking.

## 📁 Directory Structure

```
calibration/
├── clear/              # 0-5 concerns detected
├── mild/               # 6-15 concerns detected
├── moderate/           # 16-30 concerns detected
├── severe/             # 31+ concerns detected
├── annotations/        # Ground truth JSON files
├── ground-truth-schema.json
├── ANNOTATION_GUIDELINES.md
└── README.md (this file)
```

## 🎯 Purpose

This calibration dataset serves as the **gold standard** for:

1. **Accuracy Validation**: Measure how well AI models detect skin concerns
2. **Model Comparison**: Compare performance across different AI models
3. **Threshold Tuning**: Optimize detection thresholds based on real data
4. **Regression Testing**: Ensure model updates don't reduce accuracy
5. **Quality Assurance**: Continuous monitoring of production AI performance

## 📊 Dataset Requirements

### Minimum Dataset Size

- **Phase 1 (Initial)**: 40 images minimum
  - Clear: 10 images
  - Mild: 10 images
  - Moderate: 10 images
  - Severe: 10 images

- **Phase 2 (Production)**: 200+ images recommended
  - Balanced distribution across severity levels
  - Multiple angles per subject when possible
  - Diverse skin types, ages, and lighting conditions

### Image Quality Standards

All images must meet these criteria:

- ✅ **Resolution**: Minimum 1280x720px, preferred 1920x1080px
- ✅ **Format**: JPG, PNG, or WebP
- ✅ **Lighting**: Even, neutral lighting (no harsh shadows)
- ✅ **Angle**: Clear front-facing or profile shots
- ✅ **Focus**: Sharp, not blurred
- ✅ **No Makeup**: Natural skin only (no foundation, concealer)
- ✅ **No Filters**: Original photos only (no beauty filters)
- ✅ **Consent**: Proper consent forms signed

### Exclusion Criteria

Images will be rejected if:

- ❌ Poor lighting (too dark, too bright, uneven)
- ❌ Blurred or out of focus
- ❌ Low resolution (< 1280x720)
- ❌ Makeup applied (foundation, concealer, powder)
- ❌ Beauty filters or digital editing
- ❌ Occlusion (hair covering face, hands, masks)
- ❌ Wrong angle (side view when front required)
- ❌ Missing consent documentation

## 👨‍⚕️ Annotator Qualifications

### Required Qualifications

Annotations must be performed by qualified professionals:

1. **Dermatologist** (preferred)
   - Board-certified dermatologist
   - Minimum 2 years clinical experience
   - Annotator ID: ANN-0001 to ANN-0099

2. **Certified Aesthetician**
   - State/country certification required
   - Minimum 3 years experience in skin analysis
   - Annotator ID: ANN-0100 to ANN-0199

3. **Medical Student** (verification only)
   - Dermatology rotation completed
   - Supervised by board-certified dermatologist
   - Annotator ID: ANN-0200 to ANN-0299

### Annotation Process

1. **Primary Annotation**: Expert reviews image and creates annotation
2. **Verification**: Second expert reviews and verifies (for 30% of dataset)
3. **Conflict Resolution**: If agreement < 80%, third expert reviews
4. **Quality Control**: Random audits of 10% of annotations

## 📝 Annotation Format

Each image has a corresponding JSON annotation file following this structure:

### Example: `clear/sample-001.json`

```json
{
  "annotationId": "GT-20251110-A1B2C3D4",
  "imageFile": "clear/sample-001.jpg",
  "severityLevel": "clear",
  "concerns": [
    {
      "type": "enlarged_pores",
      "location": { "x": 0.45, "y": 0.52, "width": 0.08, "height": 0.06 },
      "confidence": 85,
      "severity": 3,
      "notes": "Visible pores on nose area"
    },
    {
      "type": "fine_lines",
      "location": { "x": 0.38, "y": 0.42, "width": 0.05, "height": 0.02 },
      "confidence": 75,
      "severity": 2,
      "notes": "Mild crow's feet, age-appropriate"
    }
  ],
  "totalConcerns": 2,
  "annotator": {
    "id": "ANN-0001",
    "qualification": "dermatologist",
    "yearsExperience": 8,
    "annotatedAt": "2025-11-10T10:30:00Z"
  },
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpg"
  },
  "qualityControl": {
    "verified": true,
    "verifiedBy": "ANN-0002",
    "imageQualityIssues": [],
    "agreementScore": 0.95
  },
  "schemaVersion": "1.0.0",
  "createdAt": "2025-11-10T10:30:00Z",
  "updatedAt": "2025-11-10T14:20:00Z"
}
```

## 🔍 Severity Level Guidelines

### Clear (0-5 concerns)

Minimal skin concerns, generally healthy skin:

- **Typical**: Slightly enlarged pores, very mild texture
- **Count**: 0-5 total concerns detected
- **Severity Range**: Individual concerns rated 1-3/10
- **Examples**:
  - Clean skin with minor pores
  - 1-2 small dark spots
  - Age-appropriate fine lines

### Mild (6-15 concerns)

Noticeable but minor concerns:

- **Typical**: Some acne, mild pigmentation, visible pores
- **Count**: 6-15 total concerns
- **Severity Range**: Individual concerns rated 2-5/10
- **Examples**:
  - 3-5 active acne spots
  - Moderate pore visibility
  - Light hyperpigmentation patches

### Moderate (16-30 concerns)

Multiple visible concerns requiring attention:

- **Typical**: Active acne, significant pigmentation, texture issues
- **Count**: 16-30 total concerns
- **Severity Range**: Individual concerns rated 4-7/10
- **Examples**:
  - 10-15 active acne lesions
  - Multiple dark spots or melasma
  - Noticeable texture irregularities

### Severe (31+ concerns)

Significant concerns, may require medical treatment:

- **Typical**: Severe acne, extensive pigmentation, deep wrinkles
- **Count**: 31+ concerns
- **Severity Range**: Individual concerns rated 6-10/10
- **Examples**:
  - 20+ active acne cysts/nodules
  - Extensive melasma coverage
  - Severe texture damage

## 🎨 Concern Type Definitions

### Acne-Related

- **acne**: Active inflamed lesions (papules, pustules, cysts)
- **blackhead**: Open comedones (oxidized sebum, dark appearance)
- **whitehead**: Closed comedones (covered by skin, white appearance)

### Pigmentation

- **dark_spot**: Localized hyperpigmentation (post-inflammatory, age spots)
- **hyperpigmentation**: Generalized darker areas (sun damage, hormonal)
- **melasma**: Symmetric brown patches (typically cheeks, forehead)

### Texture

- **rough_texture**: Irregular skin surface (bumpy, uneven)
- **enlarged_pores**: Visible pores (typically T-zone)
- **uneven_texture**: Surface inconsistencies (scarring, damage)

### Lines & Wrinkles

- **fine_lines**: Superficial lines (expression lines, early aging)
- **wrinkles**: Deeper creases (advanced aging, sun damage)
- **crow_feet**: Lines around eyes (lateral canthal lines)

### Other

- **redness**: Inflammation, rosacea, irritation
- **dryness**: Flaky, tight, dehydrated appearance
- **oiliness**: Excess sebum production (shiny, greasy)
- **dark_circles**: Under-eye discoloration (vascular, pigmented)

## 📈 Using the Calibration Dataset

### 1. Validate New AI Model

```bash
# Run AI prediction on calibration dataset
pnpm run validate:model --model=mediapipe --dataset=calibration

# Compare with ground truth annotations
# Generate validation report
```

### 2. Compare Model Performance

```bash
# Test all models
pnpm run validate:compare --dataset=calibration

# Output: Comparison report showing accuracy per model
```

### 3. Tune Detection Thresholds

```bash
# Find optimal thresholds
pnpm run validate:tune-threshold --model=ensemble --dataset=calibration

# Suggests threshold adjustments for best F1 score
```

### 4. Monitor Production Quality

```bash
# Regular validation runs (weekly/monthly)
pnpm run validate:scheduled --model=ensemble --dataset=calibration

# Track accuracy trends over time
```

## 📊 Validation Metrics

### Primary Metrics

1. **Accuracy**: % of images with correct severity classification
2. **Precision**: TP / (TP + FP) - How many detected concerns are real?
3. **Recall**: TP / (TP + FN) - How many real concerns were detected?
4. **F1 Score**: Harmonic mean of precision and recall

### Confusion Matrix

Shows how predicted severity levels compare to actual:

```
                Predicted
              C    M    Mo   S
Actual  C   [10]  [2]  [0]  [0]
        M   [1]  [8]   [1]  [0]
        Mo  [0]  [1]   [8]  [1]
        S   [0]  [0]   [1]  [9]
```

### Target Performance Goals

- **Overall Accuracy**: ≥ 85%
- **Precision**: ≥ 80% per severity level
- **Recall**: ≥ 80% per severity level
- **F1 Score**: ≥ 0.80
- **Inter-rater Agreement**: ≥ 0.85 (between annotators)

## 🔐 Data Privacy & Ethics

### Privacy Requirements

- ✅ All images must have signed consent forms
- ✅ Personal identifiers removed (metadata stripped)
- ✅ Anonymized annotator IDs used
- ✅ Secure storage (encrypted at rest)
- ✅ Access restricted to authorized personnel

### Ethical Considerations

- ✅ Diverse representation (skin types, ages, ethnicities)
- ✅ No exploitation or coercion in data collection
- ✅ Clear explanation of AI training usage
- ✅ Right to withdraw consent honored
- ✅ Results used only for validation, not diagnosis

## 📚 Additional Documentation

- **[ANNOTATION_GUIDELINES.md](./ANNOTATION_GUIDELINES.md)**: Detailed annotation instructions
- **[ground-truth-schema.json](./ground-truth-schema.json)**: JSON schema specification
- **[types/calibration.ts](../../types/calibration.ts)**: TypeScript type definitions

## 🤝 Contributing

To contribute images or annotations:

1. Review [ANNOTATION_GUIDELINES.md](./ANNOTATION_GUIDELINES.md)
2. Ensure images meet quality standards
3. Provide expert annotations following JSON schema
4. Submit via proper consent and review process
5. Wait for quality control verification

## 📞 Contact

For questions about the calibration dataset:

- **Dataset Coordinator**: [Pending assignment]
- **Technical Questions**: Development team
- **Annotation Issues**: Quality Control team

---

**Last Updated**: November 10, 2025  
**Dataset Version**: 1.0.0  
**Schema Version**: 1.0.0
