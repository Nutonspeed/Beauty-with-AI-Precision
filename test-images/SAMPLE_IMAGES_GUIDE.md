# 📸 Sample Test Images for CV Algorithm Testing

## 🎯 Purpose

This guide helps you prepare test images for validating the accuracy of our Computer Vision algorithms (Spot Detector, Wrinkle Detector, Pore Analyzer).

## 📋 Image Requirements

### ✅ Good Test Images

1. **Clear, High-Quality Photos**
   - Resolution: At least 640x480 pixels
   - Format: JPG or PNG
   - Well-lit (natural daylight or studio lighting)
   - Face clearly visible
   - Minimal blur or motion artifacts

2. **Diverse Skin Conditions**
   - Clear skin (control/baseline)
   - Mild spots or acne
   - Moderate to severe spots
   - Fine lines (early wrinkles)
   - Deep wrinkles
   - Visible pores
   - Mixed conditions

3. **Varied Demographics**
   - Different age groups (20s, 30s, 40s, 50s+)
   - Different skin tones
   - Male and female subjects
   - Asian, Caucasian, African, Hispanic skin types

### ❌ Avoid These Images

- Low resolution (<400x300 pixels)
- Blurry or out-of-focus
- Poor lighting (too dark/bright)
- Face too small in frame (<20% of image)
- Heavy makeup (masks true skin condition)
- Filtered/edited photos (Instagram filters, beauty apps)
- Side angles (need frontal face view)

## 🔍 Where to Find Test Images

### Option 1: Medical Databases (Recommended)
- **DermNet**: https://dermnetnz.org/ (with permission)
- **OpenDerm**: Open-source dermatology images
- **HAM10000**: Academic dataset (non-commercial use)

### Option 2: Stock Photo Sites
- **Unsplash**: Free high-quality photos
- **Pexels**: Free stock photos
- Search terms: "face closeup", "skin texture", "facial skin", "portrait closeup"

### Option 3: Clinical Photos
- Partner with dermatology clinics
- Get patient consent
- Ensure HIPAA compliance
- Professional medical photography

### Option 4: Synthetic/AI-Generated
- **Generated Photos**: AI-generated faces
- **This Person Does Not Exist**: Synthetic faces
- **StyleGAN**: Generate diverse face photos
- Note: May not have realistic skin conditions

## 📝 Naming Convention

Use descriptive filenames to track test cases:

```
test-images/samples/
├── clear-skin-female-25yo.jpg
├── mild-acne-male-30yo.jpg
├── moderate-spots-female-35yo.jpg
├── fine-wrinkles-female-45yo.jpg
├── deep-wrinkles-male-60yo.jpg
├── visible-pores-male-28yo.jpg
├── mixed-condition-female-40yo.jpg
└── severe-acne-male-22yo.jpg
```

## 🧪 Testing Strategy

### Phase 1: Basic Validation (5-10 images)
- 2 clear skin images (baseline)
- 2 spot/acne images
- 2 wrinkle images
- 2 pore visibility images
- 2 mixed condition images

### Phase 2: Comprehensive Testing (20-50 images)
- 10 images per condition type
- Varied severity levels
- Different demographics
- Multiple lighting conditions

### Phase 3: Production Validation (100+ images)
- Expert-annotated ground truth
- Dermatologist ratings
- Standardized photography protocol
- Statistical validation

## 📊 Expected Test Results

### Spot Detector
- Clear skin: <1% dark pixels
- Mild spots: 1-3% dark pixels
- Moderate spots: 3-7% dark pixels
- Severe spots: >7% dark pixels

### Wrinkle Detector
- Smooth skin: <2% edge pixels
- Fine lines: 2-5% edge pixels
- Moderate wrinkles: 5-10% edge pixels
- Deep wrinkles: >10% edge pixels

### Pore Analyzer
- Low texture variance: <10 std dev
- Medium texture variance: 10-20 std dev
- High texture variance: >20 std dev

## 🔒 Privacy & Compliance

### Before Using Real Photos:
1. ✅ Obtain written consent from subjects
2. ✅ Anonymize/blur identifying features (eyes, tattoos)
3. ✅ Follow GDPR/HIPAA regulations
4. ✅ Document usage rights
5. ✅ Secure storage (encrypted, access-controlled)

### For Medical Images:
1. ✅ IRB approval (if research)
2. ✅ Patient consent forms
3. ✅ De-identification protocol
4. ✅ HIPAA compliance
5. ✅ Secure data handling

## 🚀 Quick Start

### 1. Download Sample Images

```bash
# Example: Download from Unsplash
curl -o test-images/samples/sample1.jpg "https://unsplash.com/photos/[photo-id]/download"
```

### 2. Verify Image Quality

```bash
# Check image size
identify test-images/samples/*.jpg

# Should show: 640x480 or larger
```

### 3. Run Tests

```bash
node scripts/test-cv-accuracy.mjs
```

### 4. Review Results

```bash
# View JSON report
cat test-images/results/test-report-*.json
```

## 📚 Additional Resources

- [Computer Vision Best Practices](https://opencv.org/)
- [Medical Image Analysis Standards](https://dicom.nema.org/)
- [Skin Condition Photography Guidelines](https://www.aad.org/)
- [GDPR Compliance for Medical AI](https://gdpr.eu/)

## 💡 Tips for Better Results

1. **Consistent Lighting**: Use same lighting setup for all photos
2. **Standard Distance**: Keep face at same distance from camera
3. **Frontal View**: Face camera directly (±15° angle max)
4. **No Filters**: Raw, unedited photos only
5. **High Resolution**: Bigger is better for detail analysis
6. **Multiple Angles**: Same subject, different angles to test robustness

---

**Questions?** Check `test-images/README.md` for testing instructions.
