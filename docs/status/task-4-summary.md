# งาน 4: Error Handling + Retry Logic

## ✅ สรุปการทำงาน

เพิ่ม retry mechanism แบบ exponential backoff ให้กับทุก AI models เพื่อเพิ่มความเสถียรและลดการ fallback ไป Mock Data

---

## 📦 ไฟล์ที่สร้างใหม่

### 1. `lib/ai/retry-utils.ts` (171 บรรทัด)
**Shared retry utilities สำหรับทุก AI models**

#### ฟังก์ชันหลัก:
- `retryWithBackoff<T>()` - retry ด้วย exponential backoff
- `createUserErrorMessage()` - สร้าง error message ที่เป็นมิตรกับผู้ใช้
- `logRetryStats()` - log สถิติการ retry

#### Retry Configurations:
```typescript
DEFAULT_AI_RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error) => /* ตรวจสอบว่าควร retry หรือไม่ */
}

MEDIAPIPE_RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 500,
  backoffMultiplier: 2,
  shouldRetry: (error) => /* MediaPipe-specific errors */
}

TENSORFLOW_RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error) => /* TensorFlow-specific errors */
}

HUGGINGFACE_RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 2000,
  backoffMultiplier: 2,
  shouldRetry: (error) => /* ไม่ retry 401, retry 429/503 */
}
```

#### User Error Messages:
- 🌐 Network errors → "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
- ⏱️ Timeout → "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง"
- 📦 Load errors → "ไม่สามารถโหลด AI model ได้ กรุณารีเฟรชหน้าเว็บ"
- 🎮 WebGL errors → "เบราว์เซอร์ไม่รองรับ WebGL กรุณาอัปเดตเบราว์เซอร์"

---

## 🔧 ไฟล์ที่แก้ไข

### 2. `lib/ai/face-detection.ts`
**เพิ่ม retry ให้ 2 ฟังก์ชันหลัก**

#### `detectFace()` - Face Detection
- **Before**: 1 attempt → immediate fallback
- **After**: 3 attempts with exponential backoff (500ms → 1s → 2s)
- **Fallback**: ใช้ mock data ถ้าล้มเหลวทั้งหมด
- **User Feedback**: แสดง error message แบบไทย + log retry stats

```typescript
// ตัวอย่าง log output:
// ⚠️ Attempt 1/3 failed: MediaPipe not loaded. Retrying in 500ms...
// ⚠️ Attempt 2/3 failed: MediaPipe not loaded. Retrying in 1000ms...
// ✅ Face Detection สำเร็จหลังจากพยายาม 3 ครั้ง (2500ms)
```

#### `analyzeSkinConcerns()` - Skin Analysis
- **Before**: 1 attempt → immediate fallback
- **After**: 2 attempts with 500ms delay
- **Fallback**: ใช้ mock data ถ้าล้มเหลวทั้งหมด
- **User Feedback**: แสดง error "การวิเคราะห์ผิว" + reason

---

### 3. `lib/ai/tensorflow-analyzer.ts`
**เพิ่ม retry ให้ Texture + Segmentation**

#### `analyzeTexture()` - MobileNetV3
- **Before**: 1 attempt → throw error
- **After**: 3 attempts with exponential backoff (1s → 2s → 4s)
- **Error Handling**: throw error พร้อม user message
- **Retry on**: TensorFlow, MobileNet, WebGL errors

#### `analyzeSegmentation()` - DeepLabV3+
- **Before**: 1 attempt → throw error
- **After**: 3 attempts with exponential backoff (1s → 2s → 4s)
- **Error Handling**: throw error พร้อม user message
- **Retry on**: DeepLab, segmentation, backend errors

---

### 4. `lib/ai/huggingface-analyzer.ts`
**เพิ่ม retry ให้ API requests**

#### `makeAPIRequest()` - Hugging Face API
- **Before**: 1 attempt → throw error
- **After**: 3 attempts with exponential backoff (2s → 4s → 8s)
- **Smart Retry**:
  - ❌ ไม่ retry: 401 (Unauthorized)
  - ✅ Retry: 429 (Rate limit), 503 (Model loading), Timeout, Network
- **User Feedback**: แสดง model name + error reason

```typescript
// ตัวอย่าง log output:
// ⚠️ Attempt 1/3 failed: 503 Service Unavailable. Retrying in 2000ms...
// ⚠️ Attempt 2/3 failed: 503 Service Unavailable. Retrying in 4000ms...
// ✅ Hugging Face (dinov2-base) สำเร็จหลังจากพยายาม 3 ครั้ง (8500ms)
```

---

## 🎯 ผลลัพธ์

### ความเสถียรที่เพิ่มขึ้น:
- **Face Detection**: 500ms → 1s → 2s backoff (MediaPipe CDN + detection)
- **Skin Analysis**: 500ms retry สำหรับ ML models
- **Texture Analysis**: 1s → 2s → 4s backoff (TensorFlow)
- **Segmentation**: 1s → 2s → 4s backoff (DeepLab)
- **Hugging Face API**: 2s → 4s → 8s backoff (API calls)

### User Experience:
- ✅ แสดง error message เป็นภาษาไทย
- ✅ บอกสาเหตุและวิธีแก้ไข (check network, refresh, update browser)
- ✅ Log retry progress สำหรับ debugging
- ✅ Fallback ไป mock data อย่างราบรื่น (ไม่ crash)

### การจัดการ Error:
- Network errors → retry
- Timeout errors → retry
- Model loading errors → retry
- Auth errors (401) → ไม่ retry (fail fast)
- Rate limit (429) → retry with longer delay
- Model loading (503) → retry

---

## 📊 ตัวอย่างการใช้งาน

### Demo file: `lib/ai/__demo__/retry-demo.ts`
```bash
# ตัวอย่าง 1: API Retry
✅ Success after 3 attempts (3000ms)

# ตัวอย่าง 2: User Error Message
❌ Face Detection ไม่สามารถวิเคราะห์ได้หลังจากพยายาม 3 ครั้ง
🌐 กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

# ตัวอย่าง 3: Conditional Retry
⏭️ Skipped retry for auth error (1 attempt)

# ตัวอย่าง 4: Face Detection Retry
✅ Face detected! (2 attempts, 500ms)
```

---

## 🔍 Testing

### ทดสอบ Retry Mechanism:
```typescript
import { retryWithBackoff } from './retry-utils'

// ทดสอบ network error
const result = await retryWithBackoff(
  async () => {
    throw new Error('Network error: Failed to fetch')
  },
  { maxAttempts: 3, delayMs: 1000 }
)

console.log(result.success) // false
console.log(result.attempts) // 3
console.log(result.totalTime) // ~3000ms
```

### ทดสอบ Face Detection:
```typescript
import { detectFace } from './face-detection'

const imageData = /* ... */
const result = await detectFace(imageData)

// Log output:
// ⚠️ Attempt 1/3 failed: MediaPipe not loaded. Retrying in 500ms...
// ✅ Face Detection สำเร็จหลังจากพยายาม 2 ครั้ง (1000ms)
```

---

## 📈 ความแตกต่างก่อน/หลัง

### Before (งาน 1-3):
```typescript
try {
  const result = await someAIModel.detect(image)
  return result
} catch (error) {
  console.error('Failed:', error)
  return mockData // Immediate fallback
}
```

### After (งาน 4):
```typescript
const result = await retryWithBackoff(
  async () => await someAIModel.detect(image),
  {
    maxAttempts: 3,
    delayMs: 1000,
    onRetry: (attempt, error) => {
      console.warn(`🔄 Retry ${attempt}: ${error.message}`)
    }
  }
)

if (result.success) {
  return result.data
}

const userMessage = createUserErrorMessage('AI Model', result.error, result.attempts)
console.error(userMessage)
return mockData // Fallback only after all retries
```

---

## ✅ Checklist

- [x] สร้าง `retry-utils.ts` พร้อม retry configurations
- [x] เพิ่ม retry ใน `face-detection.ts` (2 ฟังก์ชัน)
- [x] เพิ่ม retry ใน `tensorflow-analyzer.ts` (2 ฟังก์ชัน)
- [x] เพิ่ม retry ใน `huggingface-analyzer.ts` (1 ฟังก์ชัน)
- [x] สร้าง user-friendly error messages (ภาษาไทย)
- [x] เพิ่ม logging และ statistics
- [x] สร้างไฟล์ demo (`retry-demo.ts`)
- [x] ทดสอบ fallback mechanism

---

## 🎉 สรุป

งาน 4 เสร็จสมบูรณ์! เพิ่ม retry mechanism แบบ exponential backoff ให้กับ:
- ✅ Face Detection (MediaPipe)
- ✅ Skin Analysis (ML Models)
- ✅ Texture Analysis (TensorFlow MobileNet)
- ✅ Segmentation (TensorFlow DeepLab)
- ✅ Feature Extraction (Hugging Face API)

ผลลัพธ์:
- 🚀 **ความเสถียรเพิ่มขึ้น**: retry 2-3 ครั้งก่อน fallback
- 💬 **User Experience ดีขึ้น**: error messages ภาษาไทย + แนะนำวิธีแก้
- 📊 **Monitoring**: log retry stats สำหรับ debugging
- 🛡️ **Smart Retry**: ไม่ retry auth errors, retry network/timeout/503
