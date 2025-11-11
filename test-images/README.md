# 🧪 CV Algorithms Testing

This directory contains test images and results for validating the accuracy of our Computer Vision algorithms.

## 📁 Directory Structure

```
test-images/
├── samples/          # Test images (add your images here)
├── results/          # Test results (JSON reports)
└── README.md         # This file
```

## 🚀 How to Run Tests

### 1. Add Test Images

Add face images to `test-images/samples/` directory:
- Supported formats: JPG, PNG
- Recommended: 5-10 images with different skin conditions
- Image types:
  - Clear skin (no visible issues)
  - Mild spots/acne
  - Moderate wrinkles
  - Visible pores
  - Mixed conditions

### 2. Run Test Script

```bash
node scripts/test-cv-accuracy.mjs
```

### 3. Review Results

The script will:
- ✅ Test **Spot Detector** (dark spots, hyperpigmentation)
- ✅ Test **Wrinkle Detector** (fine lines, deep wrinkles)
- ✅ Test **Pore Analyzer** (texture, pore visibility)
- 📊 Generate detailed JSON report in `test-images/results/`
- 📋 Display summary in console

## 📊 What Gets Tested

### Spot Detector
- Dark pixel percentage
- Estimated spot severity (1-10 scale)
- Image quality validation

### Wrinkle Detector
- Edge pixel detection
- Wrinkle density estimation
- Line pattern analysis

### Pore Analyzer
- Texture variance calculation
- Roughness measurement
- Pore visibility estimation

## 📋 Interpreting Results

### Success Metrics
- ✅ **100% pass rate**: All algorithms working correctly
- ⚠️ **50-99% pass rate**: Some images failed (review thresholds)
- ❌ **<50% pass rate**: Algorithm issues (needs debugging)

### Expected Output
```
📊 TEST SUMMARY
═════════════════════════════════════════════════════════════
📁 Total Images Tested: 5
✅ Successful Tests: 5
❌ Failed Tests: 0

🔧 Algorithm Performance:
─────────────────────────────────────────────────────────────
1️⃣ Spot Detector:
   Tested: 5
   Passed: 5 ✅
   Failed: 0 ❌
   Success Rate: 100.0%
```

## 🎯 Next Steps After Testing

1. **If tests pass**: Proceed to threshold tuning with medical data
2. **If tests fail**: Debug algorithms, adjust thresholds
3. **Compare with manual inspection**: Verify AI results match human observation
4. **Document findings**: Note which skin conditions are detected accurately

## 🔧 Troubleshooting

### No images found
```
❌ No test images found in: test-images/samples/
```
**Solution**: Add JPG/PNG images to `samples/` directory

### Tests failing
```
✗ Failed: Cannot read image
```
**Solution**: Check image format (must be valid JPG/PNG)

### Low accuracy
```
⚠️ Success Rate: 60%
```
**Solution**: Review algorithm thresholds in:
- `lib/cv/spot-detector.ts`
- `lib/cv/wrinkle-detector.ts`
- `lib/cv/pore-analyzer.ts`

## 📝 Notes

- Test images are **not** included in git (add to .gitignore)
- Results are saved with timestamp for tracking
- Each test is independent (one failure doesn't stop others)
- Tests use actual CV algorithms (not mocks)

## 🎓 Understanding the Algorithms

### Spot Detector
Uses **Flood Fill** algorithm:
- Converts image to grayscale
- Finds pixels darker than threshold (brightness < 100)
- Groups connected dark pixels (blobs)
- Filters by size (5-100 pixels)
- Calculates severity from area percentage

### Wrinkle Detector
Uses **Sobel Edge Detection**:
- Applies Sobel operator (3x3 kernels)
- Detects edges in image
- Traces lines in 4 directions
- Classifies as fine lines (<20px) or deep wrinkles (≥20px)
- Severity based on total line length

### Pore Analyzer
Uses **Hough Circle Transform**:
- Detects circular patterns
- Searches for circles radius 2-10 pixels
- Validates circle completeness (>60% edge pixels)
- Analyzes texture variance
- Calculates pore visibility score

---

**Last Updated**: November 10, 2025
