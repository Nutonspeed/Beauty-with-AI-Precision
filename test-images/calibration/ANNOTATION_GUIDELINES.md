# Annotation Guidelines for Ground Truth Dataset

**Version**: 1.0.0  
**Last Updated**: November 10, 2025  
**For**: Expert dermatologists and certified aestheticians

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Before You Begin](#before-you-begin)
3. [Step-by-Step Annotation Process](#step-by-step-annotation-process)
4. [Concern Identification Guidelines](#concern-identification-guidelines)
5. [Location Marking](#location-marking)
6. [Confidence & Severity Scoring](#confidence--severity-scoring)
7. [Quality Control Checklist](#quality-control-checklist)
8. [Common Pitfalls & How to Avoid Them](#common-pitfalls--how-to-avoid-them)
9. [Examples](#examples)
10. [FAQ](#faq)

---

## Introduction

### Purpose

These guidelines ensure **consistent, high-quality annotations** across all expert annotators. Consistency is critical for:

- Reliable AI model validation
- Fair comparison between models
- Accurate performance metrics
- Meaningful threshold optimization

### Annotation Philosophy

**"When in doubt, be conservative."**

- ✅ Only mark concerns you are confident about
- ✅ It's better to miss a borderline case than to over-diagnose
- ✅ Document uncertainty in notes field
- ✅ Use lower confidence scores for ambiguous cases

---

## Before You Begin

### 1. Review Required Materials

- [ ] Read this entire guideline document
- [ ] Review JSON schema: `ground-truth-schema.json`
- [ ] Examine example annotations in `examples/`
- [ ] Understand severity level thresholds

### 2. Setup Your Environment

- [ ] Calibrated monitor (accurate color representation)
- [ ] Good ambient lighting (avoid reflections)
- [ ] Magnification tool ready (for detailed inspection)
- [ ] Annotation tool installed and tested
- [ ] Your annotator ID ready (format: ANN-####)

### 3. Confirm Image Quality

Before annotating, verify the image meets standards:

**Accept if**:
- ✅ Resolution ≥ 1280x720px
- ✅ Sharp focus on face
- ✅ Even, neutral lighting
- ✅ Correct angle (front or profile as requested)
- ✅ No makeup visible
- ✅ No digital filters applied

**Reject if**:
- ❌ Blurred or out of focus
- ❌ Poor lighting (too dark, harsh shadows)
- ❌ Low resolution
- ❌ Makeup present (foundation, concealer)
- ❌ Beauty filters or editing detected
- ❌ Face partially occluded

**If rejecting**: Document rejection reason in quality control notes.

---

## Step-by-Step Annotation Process

### Step 1: Initial Assessment (2 minutes)

1. **View the entire image at normal zoom**
2. **Form initial impression of severity level**
   - Clear: Minimal concerns, healthy skin
   - Mild: Some concerns, generally good
   - Moderate: Multiple concerns, needs attention
   - Severe: Extensive concerns, medical attention advised
3. **Note overall skin characteristics**
   - Skin type (oily, dry, combination)
   - Age range estimate
   - Overall texture quality

### Step 2: Systematic Inspection (10-15 minutes)

**Follow this sequence** to ensure complete coverage:

1. **Forehead**
   - Check for: acne, texture, fine lines, pigmentation
   - Zoom to 200% for detailed inspection
   - Mark each concern found

2. **Eye Area**
   - Check for: crow's feet, fine lines, dark circles
   - Note: Be conservative, age-appropriate lines are normal
   - Mark severity accurately (mild lines vs deep wrinkles)

3. **Cheeks (Left & Right)**
   - Check for: acne, pores, pigmentation, texture, redness
   - Most concerns often found here
   - Differentiate between acne types (active vs marks)

4. **Nose**
   - Check for: blackheads, whiteheads, enlarged pores, oiliness
   - T-zone typically has more visible pores (normal)
   - Only mark if significantly enlarged (> 1mm visible)

5. **Perioral (Around Mouth)**
   - Check for: fine lines, texture, pigmentation
   - Smile lines are age-appropriate (don't over-mark)
   - Check for acne near mouth/chin

6. **Chin & Jawline**
   - Check for: acne (hormonal acne common here), texture
   - Mark cystic acne with higher severity (7-10)

7. **Overall Skin**
   - General texture assessment
   - Overall pigmentation evenness
   - Skin tone uniformity

### Step 3: Concern Marking (15-20 minutes)

For **each concern found**:

1. **Select concern type** from predefined list
2. **Mark location**:
   - Click center point of concern
   - Drag to mark bounding box (if area vs point)
   - Normalize coordinates (0-1 scale automatically)
3. **Set confidence** (0-100):
   - 90-100: Absolutely certain
   - 80-89: Very confident
   - 70-79: Confident
   - 60-69: Moderately confident
   - 50-59: Low confidence (consider not marking)
4. **Set severity** (1-10):
   - 1-3: Minimal, barely noticeable
   - 4-6: Moderate, clearly visible
   - 7-9: Significant, prominent
   - 10: Severe, requires immediate attention
5. **Add notes** (optional but recommended):
   - Helpful context for ambiguous cases
   - Differential diagnosis notes
   - Reasons for lower confidence

### Step 4: Count & Classify (2 minutes)

1. **Count total concerns** marked
2. **Determine severity level**:
   - Clear: 0-5 concerns
   - Mild: 6-15 concerns
   - Moderate: 16-30 concerns
   - Severe: 31+ concerns
3. **Verify consistency**:
   - Does concern count match your initial impression?
   - If not, review: did you over/under-mark?

### Step 5: Quality Control Review (5 minutes)

1. **Review at normal zoom**: Does annotation look reasonable?
2. **Check for duplicates**: Did you mark same concern twice?
3. **Verify locations**: Are bounding boxes accurate?
4. **Read your notes**: Are they clear and helpful?
5. **Final confidence check**: Remove low-confidence marks (< 60)?

### Step 6: Metadata & Save (2 minutes)

1. **Fill annotator information**:
   - Your annotator ID
   - Qualification type
   - Years of experience
   - Current timestamp
2. **Add image metadata**:
   - Width, height (auto-detected)
   - Format (auto-detected)
   - Capture date (if known)
3. **Quality control flags**:
   - Note any image quality issues
   - Mark if requires verification
4. **Save annotation** as JSON file

---

## Concern Identification Guidelines

### Acne-Related Concerns

#### Acne (Active Inflamed Lesions)

**Include**:
- ✅ Papules (red bumps, no pus)
- ✅ Pustules (red with white/yellow center)
- ✅ Nodules (large, painful, deep)
- ✅ Cysts (large, pus-filled, deep)

**Exclude**:
- ❌ Post-acne marks (use "dark_spot" instead)
- ❌ Healed acne (no active inflammation)
- ❌ Sebaceous filaments (use "blackhead" if very prominent)

**Severity Scoring**:
- 1-3: Small papule, barely visible
- 4-6: Moderate pustule, clearly visible
- 7-9: Large nodule or cyst
- 10: Severe cystic acne requiring medical care

**Confidence Tips**:
- High confidence (80-100): Clear inflammation, raised, red
- Low confidence (60-79): Might be ingrown hair, unclear

#### Blackhead (Open Comedones)

**Include**:
- ✅ Visible dark plugs in pores
- ✅ Oxidized sebum (dark brown/black color)
- ✅ Clearly defined, not just shadows

**Exclude**:
- ❌ Normal pores (even if enlarged)
- ❌ Shadows from facial contours
- ❌ Sebaceous filaments (unless very dark)

**Severity Scoring**:
- 1-3: Small, barely noticeable
- 4-6: Moderate size, clearly visible
- 7-9: Large, prominent
- 10: Extremely large (> 3mm)

#### Whitehead (Closed Comedones)

**Include**:
- ✅ Small white/flesh-colored bumps
- ✅ Closed by thin layer of skin
- ✅ Slightly raised texture

**Exclude**:
- ❌ Milia (harder, pearly white)
- ❌ Pustules (inflamed, use "acne" instead)
- ❌ Normal skin texture variation

**Severity Scoring**:
- 1-3: Tiny, barely visible
- 4-6: Moderate, clearly textured
- 7-9: Large, prominent
- 10: Very large or clustered

### Pigmentation Concerns

#### Dark Spot

**Include**:
- ✅ Post-inflammatory hyperpigmentation (PIH)
- ✅ Age spots / solar lentigines
- ✅ Localized darker areas
- ✅ Well-defined borders

**Exclude**:
- ❌ Melasma (larger patches, use "melasma")
- ❌ Overall skin tone variation
- ❌ Shadows from lighting

**Severity Scoring**:
- 1-3: Light brown, small (< 5mm)
- 4-6: Medium brown, moderate (5-10mm)
- 7-9: Dark brown, large (> 10mm)
- 10: Very dark, very large (> 20mm)

**Confidence Tips**:
- Check multiple angles if available
- Confirm it's not just lighting/shadows
- Document if unsure about cause

#### Hyperpigmentation

**Include**:
- ✅ Generalized darker areas
- ✅ Sun damage
- ✅ Hormonal darkening
- ✅ Less defined borders than dark spots

**Exclude**:
- ❌ Normal skin tone variation
- ❌ Bronzed/tanned skin (even tone)
- ❌ Temporary discoloration

**Severity Scoring**:
- 1-3: Slight darkening, barely noticeable
- 4-6: Moderate darkening, visible
- 7-9: Significant darkening, prominent
- 10: Severe, extensive coverage

#### Melasma

**Include**:
- ✅ Symmetric brown/gray patches
- ✅ Typically on cheeks, forehead, upper lip
- ✅ Irregular borders
- ✅ Larger than dark spots (usually > 2cm)

**Exclude**:
- ❌ Individual dark spots (use "dark_spot")
- ❌ Freckles
- ❌ Sun damage without typical melasma pattern

**Severity Scoring**:
- 1-3: Light patches, small area (< 3cm²)
- 4-6: Moderate patches, medium area (3-10cm²)
- 7-9: Dark patches, large area (> 10cm²)
- 10: Very dark, extensive, bilateral

**Note**: Melasma is clinically significant. If suspected, use higher confidence (80+).

### Texture Concerns

#### Rough Texture

**Include**:
- ✅ Bumpy, uneven surface
- ✅ Keratosis pilaris appearance
- ✅ Irregular skin texture
- ✅ Not smooth to appearance

**Exclude**:
- ❌ Normal pores
- ❌ Active acne (mark separately)
- ❌ Age-appropriate texture variation

**Severity Scoring**:
- 1-3: Slight texture, visible at 200% zoom
- 4-6: Moderate, visible at 100% zoom
- 7-9: Significant, very visible
- 10: Severe, disfiguring

#### Enlarged Pores

**Include**:
- ✅ Pores visible at normal viewing distance
- ✅ Typically > 0.5mm visible size
- ✅ Usually on T-zone (forehead, nose, chin)

**Exclude**:
- ❌ Normal pores (< 0.5mm, only visible zoomed)
- ❌ Blackheads (mark separately if filled)
- ❌ Age-appropriate pore size

**Severity Scoring**:
- 1-3: Visible at 150% zoom (0.5-1mm)
- 4-6: Visible at 100% zoom (1-2mm)
- 7-9: Very visible (> 2mm)
- 10: Extremely large (> 3mm)

**Note**: Be conservative. Many people have visible pores – only mark if significantly enlarged.

#### Uneven Texture

**Include**:
- ✅ Atrophic scarring (indented)
- ✅ Hypertrophic scarring (raised)
- ✅ Ice pick scars
- ✅ Rolling scars
- ✅ Surface irregularities

**Exclude**:
- ❌ Active acne (mark as "acne")
- ❌ Normal texture variation
- ❌ Post-inflammatory erythema (redness)

**Severity Scoring**:
- 1-3: Shallow, barely visible (< 1mm depth)
- 4-6: Moderate depth (1-2mm)
- 7-9: Deep, prominent (> 2mm)
- 10: Severe scarring, disfiguring

### Lines & Wrinkles

#### Fine Lines

**Include**:
- ✅ Superficial lines
- ✅ Expression lines (when face relaxed)
- ✅ Early aging signs
- ✅ Dehydration lines

**Exclude**:
- ❌ Deep wrinkles (use "wrinkles" instead)
- ❌ Expression lines only visible when smiling/frowning
- ❌ Age-appropriate lines (be conservative)

**Severity Scoring**:
- 1-3: Very fine, barely visible
- 4-6: Clearly visible, shallow
- 7-9: Deep for fine lines
- 10: Very deep (but still not full wrinkle)

**Age-Appropriate Guidelines**:
- 20s: Almost no fine lines expected (mark conservatively)
- 30s: Some fine lines normal (mark if prominent)
- 40s: Fine lines expected (mark if excessive)
- 50+: Fine lines very common (mark if severe only)

#### Wrinkles

**Include**:
- ✅ Deep creases
- ✅ Nasolabial folds (if very deep)
- ✅ Forehead lines (deep, visible when relaxed)
- ✅ Marionette lines

**Exclude**:
- ❌ Fine lines (use "fine_lines")
- ❌ Expression lines only visible during expression
- ❌ Age-appropriate wrinkles

**Severity Scoring**:
- 1-3: Moderate depth, age-appropriate
- 4-6: Deep, prominent
- 7-9: Very deep, significant
- 10: Severe, disfiguring

#### Crow's Feet

**Include**:
- ✅ Lines radiating from outer corners of eyes
- ✅ Lateral canthal lines
- ✅ Visible when face is relaxed (not just when smiling)

**Exclude**:
- ❌ Lines only visible when smiling
- ❌ Under-eye lines (use "fine_lines" or "wrinkles")

**Severity Scoring**:
- 1-3: Very fine, barely visible when relaxed
- 4-6: Clearly visible when relaxed
- 7-9: Deep, prominent
- 10: Very deep, extensive

### Other Concerns

#### Redness

**Include**:
- ✅ Inflammation
- ✅ Rosacea
- ✅ Irritation
- ✅ Visible blood vessels (telangiectasia)
- ✅ Post-inflammatory erythema

**Exclude**:
- ❌ Normal skin tone variation
- ❌ Blushing (temporary)
- ❌ Makeup (reject image)

**Severity Scoring**:
- 1-3: Slight pink tint
- 4-6: Moderate redness
- 7-9: Significant redness
- 10: Severe inflammation, purple tint

#### Dryness

**Include**:
- ✅ Flaky appearance
- ✅ Tight-looking skin
- ✅ Dull, matte finish
- ✅ Visible scaling

**Exclude**:
- ❌ Normal matte skin
- ❌ Powder makeup (reject image)

**Severity Scoring**:
- 1-3: Slight dullness
- 4-6: Visible dryness, some flaking
- 7-9: Significant flaking, scaling
- 10: Severe dryness, cracking

**Note**: Difficult to assess from photos. Use lower confidence (60-75) unless obvious.

#### Oiliness

**Include**:
- ✅ Shiny appearance (not from flash)
- ✅ Greasy look
- ✅ Visible sebum

**Exclude**:
- ❌ Normal skin sheen
- ❌ Flash reflection
- ❌ Highlighter makeup (reject image)

**Severity Scoring**:
- 1-3: Slight shine
- 4-6: Moderate shine, visible oil
- 7-9: Very shiny, greasy
- 10: Extremely oily, dripping

**Note**: Check if it's lighting artifact. Use lower confidence if unsure.

#### Dark Circles

**Include**:
- ✅ Vascular dark circles (bluish/purple)
- ✅ Pigmented dark circles (brown)
- ✅ Structural (shadows from hollowing)

**Exclude**:
- ❌ Normal shadows from facial structure
- ❌ Temporary (from lack of sleep, crying)
- ❌ Makeup (reject image)

**Severity Scoring**:
- 1-3: Slight discoloration
- 4-6: Noticeable dark circles
- 7-9: Prominent, significant
- 10: Severe, very dark

---

## Location Marking

### Coordinate System

- **X-axis**: 0 (left) to 1 (right)
- **Y-axis**: 0 (top) to 1 (bottom)
- **Normalized**: Coordinates relative to image dimensions

### Point vs Area

**Use Point (x, y only)**:
- Individual acne lesions
- Blackheads
- Whiteheads
- Dark spots (small)

**Use Area (x, y, width, height)**:
- Pigmentation patches
- Melasma
- Redness zones
- Texture issues (scars)
- Dark circles
- Enlarged pore areas

### Accuracy Guidelines

- **Precision**: Place marker at **center** of concern
- **Bounding Box**: Include entire concern + small margin (5-10% padding)
- **Overlap**: OK if concerns overlap (e.g., acne with PIH)

### Example Locations

```json
{
  "type": "acne",
  "location": {
    "x": 0.45,
    "y": 0.52
  }
}
```

```json
{
  "type": "melasma",
  "location": {
    "x": 0.35,
    "y": 0.50,
    "width": 0.15,
    "height": 0.12
  }
}
```

---

## Confidence & Severity Scoring

### Confidence (0-100)

#### High Confidence (90-100)

**Use when**:
- Concern is absolutely obvious
- No ambiguity in diagnosis
- Clear clinical presentation
- Multiple confirming features

**Example**: Large inflamed pustule with clear white center

#### Very Confident (80-89)

**Use when**:
- Concern is very clear
- Minimal ambiguity
- Standard clinical presentation

**Example**: Typical melasma pattern on cheeks

#### Confident (70-79)

**Use when**:
- Concern is clear but has minor ambiguity
- Typical presentation with one atypical feature
- Would diagnose clinically but prefer better image

**Example**: Likely acne but could be folliculitis

#### Moderately Confident (60-69)

**Use when**:
- Concern is probable but uncertain
- Image quality makes assessment difficult
- Borderline case

**Example**: Possible fine lines but might be image compression artifact

#### Low Confidence (< 60)

**Use when**:
- Very uncertain
- Multiple possible diagnoses
- Poor image quality in that area

**Recommendation**: Consider **not marking** concerns with confidence < 60.

### Severity (1-10)

#### Minimal (1-3)

- Barely noticeable
- Would not mention in clinical exam unless asked
- Age-appropriate or normal variation

#### Moderate (4-6)

- Clearly visible
- Would mention in clinical exam
- Warrants skincare recommendation

#### Significant (7-9)

- Prominent
- Would definitely address in consultation
- May recommend medical treatment

#### Severe (10)

- Extreme
- Requires medical intervention
- Potential health impact

---

## Quality Control Checklist

Before submitting annotation:

- [ ] Image meets quality standards
- [ ] All visible concerns marked
- [ ] No duplicates
- [ ] Confidence scores appropriate (most > 70)
- [ ] Severity scores appropriate
- [ ] Locations accurate (checked at zoom)
- [ ] Total concern count matches severity level
- [ ] Notes added for ambiguous cases
- [ ] Annotator info filled correctly
- [ ] Timestamp current
- [ ] File named correctly (matches image filename)
- [ ] JSON validates against schema

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: Over-Marking Normal Features

**Problem**: Marking age-appropriate fine lines, normal pores

**Solution**:
- Be conservative
- Consider age of subject
- Ask: "Would I treat this clinically?"
- Only mark if clearly beyond normal

### Pitfall 2: Inconsistent Severity Scoring

**Problem**: Same type of concern gets different scores across images

**Solution**:
- Review your previous annotations
- Use reference images
- Create personal calibration set
- Take breaks to maintain consistency

### Pitfall 3: Lighting Artifacts

**Problem**: Marking shadows or reflections as concerns

**Solution**:
- Check multiple angles if available
- Look for bilateral symmetry (shadows unlikely)
- Zoom in to see actual skin texture
- Use lower confidence if unsure

### Pitfall 4: Confusing Concern Types

**Problem**: Marking PIH as active acne, or vice versa

**Solution**:
- Active acne: Raised, inflamed, 3D
- PIH: Flat, brown, 2D
- Check for inflammation signs
- Read notes from previous annotator if available

### Pitfall 5: Location Inaccuracy

**Problem**: Markers not centered or bounding boxes too small/large

**Solution**:
- Zoom to 200% for placement
- Use center of concern as anchor
- Bounding box should have 5-10% margin
- Review locations before saving

### Pitfall 6: Ignoring Image Quality Issues

**Problem**: Annotating poor-quality images

**Solution**:
- Check quality before starting
- Document quality issues
- Consider rejecting image
- Don't force annotations on bad images

---

## Examples

### Example 1: Clear Severity

**Image**: `clear/example-001.jpg`

**Total Concerns**: 3

**Annotations**:

1. **Enlarged Pores** (nose)
   - Confidence: 85
   - Severity: 3
   - Location: (0.50, 0.58, 0.08, 0.06)
   - Notes: "Visible pores on nose, age-appropriate"

2. **Fine Lines** (crow's feet)
   - Confidence: 75
   - Severity: 2
   - Location: (0.72, 0.42, 0.05, 0.03)
   - Notes: "Very fine, only visible at close inspection"

3. **Dark Spot** (cheek)
   - Confidence: 90
   - Severity: 2
   - Location: (0.38, 0.55)
   - Notes: "Small PIH, likely from previous acne"

**Severity Level**: Clear (3 concerns)

---

### Example 2: Moderate Severity

**Image**: `moderate/example-002.jpg`

**Total Concerns**: 22

**Annotations** (sample):

1. **Acne** (forehead)
   - Confidence: 95
   - Severity: 5
   - Location: (0.42, 0.28)
   - Notes: "Active pustule, moderate size"

2. **Hyperpigmentation** (cheeks)
   - Confidence: 88
   - Severity: 6
   - Location: (0.35, 0.52, 0.12, 0.10)
   - Notes: "Sun damage, bilateral but asymmetric"

3. **Rough Texture** (chin)
   - Confidence: 80
   - Severity: 5
   - Location: (0.50, 0.75, 0.10, 0.08)
   - Notes: "Post-acne texture irregularity"

...(19 more concerns)

**Severity Level**: Moderate (22 concerns)

---

## FAQ

### Q1: What if I'm unsure about a concern?

**A**: Use confidence score to reflect uncertainty (60-75). Add detailed notes explaining why you're unsure. If confidence would be < 60, consider not marking it.

### Q2: Should I mark age-appropriate lines/wrinkles?

**A**: Be conservative. Only mark if they're more prominent than typical for the age range. When in doubt, don't mark.

### Q3: How do I differentiate between acne and PIH?

**A**: 
- **Acne**: Raised, 3D, inflamed (red), may have white/yellow center
- **PIH**: Flat, 2D, brown discoloration, no inflammation

### Q4: What if the same area has multiple concerns?

**A**: Mark all applicable concerns with overlapping locations. Example: Active acne on top of PIH mark.

### Q5: How precise should location coordinates be?

**A**: Within 5% of true center is acceptable. Use 200% zoom for accuracy.

### Q6: What if I disagree with the severity level based on concern count?

**A**: Follow the count-based guidelines strictly. If you think severity should differ, document in notes but use the standard classification.

### Q7: Should I annotate makeup or filters?

**A**: No. Reject the image and document the issue in quality control notes.

### Q8: How long should annotation take per image?

**A**: 
- Clear: 15-20 minutes
- Mild: 20-30 minutes
- Moderate: 30-45 minutes
- Severe: 45-60 minutes

### Q9: What if image quality is borderline?

**A**: Document issues in `qualityControl.imageQualityIssues` array. If issues severely impact annotation accuracy, reject the image.

### Q10: Can I annotate if I'm not a dermatologist?

**A**: Yes, if you're a certified aesthetician with 3+ years experience. Your annotator ID range will be ANN-0100 to ANN-0199.

---

## Revision History

- **v1.0.0** (2025-11-10): Initial version

---

**Questions?** Contact the Dataset Coordinator or Technical Team.

**Thank you for your expert contribution to improving AI accuracy!** 🙏
