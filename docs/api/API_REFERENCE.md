# 📚 Beauty with AI Precision - API Documentation

## 🌐 Base URL
```
Development: http://localhost:3004
Production:  https://your-domain.com
```

## 🔐 Authentication

### JWT Authentication
```http
Authorization: Bearer <jwt_token>
```

### Session Authentication
```http
Cookie: next-auth.session-token=<session_token>
```

---

## 📊 API Endpoints

### 🔍 Health & Status

#### GET `/api/health`
Check application health status

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

#### GET `/api/health/ai-status`
Check AI service providers status

**Response:**
```json
{
  "status": "active",
  "message": "3 AI provider(s) active",
  "providers": [
    {
      "name": "openai",
      "available": true,
      "priority": 1
    }
  ]
}
```

---

## 🤖 AI Analysis APIs

### POST `/api/ai/analyze`
Perform AI skin analysis

**Request:**
```http
POST /api/ai/analyze
Content-Type: multipart/form-data
file: <image_file>
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "skinAge": 28,
    "biologicalAge": 30,
    "overallScore": 85,
    "concerns": [
      {
        "name": "Wrinkles",
        "severity": 0.3,
        "confidence": 0.92
      }
    ],
    "recommendations": [
      "Use anti-aging serum"
    ],
    "processingTime": 1250
  }
}
```

---

## 📝 Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3004/api/health

# AI status
curl http://localhost:3004/api/health/ai-status
```
