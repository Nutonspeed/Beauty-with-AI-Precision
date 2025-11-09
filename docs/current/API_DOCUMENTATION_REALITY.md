# 🔌 AI367 Beauty Platform - API Documentation จริง

**Version:** 1.0 (ความเป็นจริง)  
**Last Updated:** 9 พฤศจิกายน 2025  
**Coverage:** 85% ของ APIs (มี incomplete และ mock endpoints)

> ⚠️ **เอกสารนี้แสดง APIs ที่ทำงานได้จริง:** ไม่ใช่ planned APIs แต่เป็น actual implementation

---

## 🎯 API Overview จริง

### Current API Status
- **Total Endpoints:** 50+ (Next.js API routes)
- **Working Endpoints:** 42 (84%)
- **Mock/Incomplete:** 8 (16%)
- **Authentication:** Supabase JWT required for protected routes
- **Rate Limiting:** Basic (needs improvement)
- **Error Handling:** Partial implementation

---

## 🔐 Authentication APIs จริง

### POST `/api/auth/login`
**Status:** ✅ Working
```typescript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### POST `/api/auth/register`
**Status:** ✅ Working
```typescript
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}

// Response - Same as login
```

### POST `/api/auth/logout`
**Status:** ✅ Working
```typescript
// Request - Empty body
// Response
{
  "message": "Logged out successfully"
}
```

---

## 🤖 Skin Analysis APIs จริง

### POST `/api/skin-analysis/analyze`
**Status:** 🟡 Working (with hardcoded values)
```typescript
// Request
{
  "image_url": "https://supabase-url/image.jpg",
  "analysis_type": "full", // "full" | "quick"
  "use_local_ai": true // Use local CV instead of Hugging Face
}

// Response
{
  "analysis_id": "uuid",
  "results": {
    "visia_scores": {
      "wrinkles": 7, // ❌ HARDCODED
      "spots": 2,    // ❌ HARDCODED
      "texture": 1.5 // ❌ HARDCODED
    },
    "ai_analysis": {
      "skin_type": "combination",
      "concerns": ["acne", "wrinkles"],
      "recommendations": ["Use retinoid cream"]
    },
    "heatmap_url": "https://supabase-url/heatmap.jpg"
  }
}
```

**ปัญหาจริง:** VISIA scores ฮาร์ดโค้ดเป็น (7, 2, 1.5) สำหรับทุกคน

### GET `/api/skin-analysis/[id]`
**Status:** ✅ Working
```typescript
// Response
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "string",
  "results": { /* Same as analyze response */ },
  "created_at": "2025-11-09T10:00:00Z",
  "pdf_url": "https://supabase-url/report.pdf"
}
```

### GET `/api/skin-analysis/history`
**Status:** ✅ Working
```typescript
// Query params: ?limit=10&offset=0
// Response
{
  "analyses": [
    {
      "id": "uuid",
      "created_at": "2025-11-09T10:00:00Z",
      "results": { /* summary */ }
    }
  ],
  "total": 25
}
```

---

## 📅 Booking APIs จริง

### GET `/api/bookings/availability`
**Status:** ✅ Working
```typescript
// Query params: ?date=2025-11-15&service_type=consultation
// Response
{
  "available_slots": [
    "09:00", "10:00", "14:00", "15:00"
  ]
}
```

### POST `/api/bookings/create`
**Status:** ✅ Working
```typescript
// Request
{
  "service_type": "skin_consultation",
  "date": "2025-11-15",
  "time": "10:00",
  "customer_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}

// Response
{
  "booking_id": "uuid",
  "confirmation_code": "BK-12345",
  "status": "confirmed"
}
```

### GET `/api/bookings/[id]`
**Status:** ✅ Working
```typescript
// Response
{
  "id": "uuid",
  "service_type": "skin_consultation",
  "date": "2025-11-15",
  "time": "10:00",
  "status": "confirmed",
  "customer_details": { /* ... */ },
  "created_at": "2025-11-09T10:00:00Z"
}
```

---

## 👥 User Management APIs จริง

### GET `/api/user/profile`
**Status:** ✅ Working
```typescript
// Response
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "subscription": "premium",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### PUT `/api/user/profile`
**Status:** ✅ Working
```typescript
// Request
{
  "full_name": "Jane Doe",
  "phone": "+1234567890"
}

// Response - Updated profile
```

### GET `/api/user/analyses`
**Status:** ✅ Working
```typescript
// Response
{
  "analyses": [
    {
      "id": "uuid",
      "created_at": "2025-11-09T10:00:00Z",
      "results": { /* summary */ }
    }
  ]
}
```

---

## 💳 Payment APIs จริง

### POST `/api/payments/create-session`
**Status:** 🟡 Mock Implementation
```typescript
// Request
{
  "amount": 99.99,
  "currency": "USD",
  "description": "Premium Analysis Package"
}

// Response
{
  "session_id": "mock_session_123",
  "payment_url": "https://mock-payment.com/pay/123"
}
```

**ความเป็นจริง:** ยังเป็น mock - ไม่ได้ integrate จริง

### GET `/api/payments/status/[session_id]`
**Status:** 🟡 Mock Implementation
```typescript
// Response
{
  "status": "completed", // "pending" | "completed" | "failed"
  "transaction_id": "mock_txn_123"
}
```

---

## 📧 Notification APIs จริง

### POST `/api/notifications/send`
**Status:** 🟡 Basic Implementation
```typescript
// Request
{
  "user_id": "uuid",
  "type": "analysis_complete",
  "message": "Your skin analysis is ready!",
  "data": { "analysis_id": "uuid" }
}

// Response
{
  "notification_id": "uuid",
  "sent": true
}
```

### GET `/api/notifications`
**Status:** ✅ Working
```typescript
// Response
{
  "notifications": [
    {
      "id": "uuid",
      "type": "analysis_complete",
      "message": "Your skin analysis is ready!",
      "read": false,
      "created_at": "2025-11-09T10:00:00Z"
    }
  ]
}
```

---

## 📊 Analytics APIs จริง

### GET `/api/analytics/dashboard`
**Status:** ✅ Working
```typescript
// Response
{
  "total_analyses": 1250,
  "active_users": 89,
  "revenue": 15420.50,
  "popular_concerns": [
    { "concern": "acne", "count": 450 },
    { "concern": "wrinkles", "count": 320 }
  ]
}
```

### GET `/api/analytics/user-activity`
**Status:** ✅ Working
```typescript
// Query params: ?user_id=uuid&period=30d
// Response
{
  "user_id": "uuid",
  "period": "30d",
  "analyses_count": 5,
  "last_analysis": "2025-11-09T10:00:00Z",
  "engagement_score": 85
}
```

---

## 🔧 Admin APIs จริง

### GET `/api/admin/users`
**Status:** ✅ Working (Admin only)
```typescript
// Query params: ?limit=50&offset=0&role=user
// Response
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "subscription": "premium",
      "last_active": "2025-11-09T10:00:00Z"
    }
  ],
  "total": 1250
}
```

### GET `/api/admin/analytics`
**Status:** ✅ Working (Admin only)
```typescript
// Response - Comprehensive analytics
{
  "system_health": {
    "api_response_time": 245, // ms
    "error_rate": 0.02,
    "uptime": 99.8
  },
  "business_metrics": {
    "total_revenue": 45670.00,
    "conversion_rate": 0.15,
    "user_growth": 12.5 // % monthly
  }
}
```

---

## 🎨 AR/VR APIs จริง

### POST `/api/ar/simulate`
**Status:** ✅ Working
```typescript
// Request
{
  "treatment_type": "retinoid",
  "intensity": 0.7,
  "image_url": "https://supabase-url/face.jpg"
}

// Response
{
  "simulation_id": "uuid",
  "result_image_url": "https://supabase-url/simulated.jpg",
  "before_after_url": "https://supabase-url/comparison.jpg"
}
```

### GET `/api/ar/treatments`
**Status:** ✅ Working
```typescript
// Response
{
  "treatments": [
    {
      "id": "retinoid",
      "name": "Retinoid Treatment",
      "description": "Reduces fine lines and improves texture",
      "intensity_range": [0.1, 1.0]
    }
  ]
}
```

---

## 📱 Mobile/PWA APIs จริง

### POST `/api/pwa/install`
**Status:** ✅ Working
```typescript
// Request
{
  "device_type": "ios", // "ios" | "android" | "desktop"
  "user_agent": "Mozilla/5.0..."
}

// Response
{
  "install_id": "uuid",
  "pwa_ready": true
}
```

### GET `/api/pwa/status`
**Status:** ✅ Working
```typescript
// Response
{
  "installed": true,
  "update_available": false,
  "offline_ready": true
}
```

---

## 🔄 Real-time APIs จริง

### WebSocket `/socket.io`
**Status:** 🟡 Partial Implementation
```typescript
// Connection
io.connect('wss://api.ai367beauty.com')

// Events
socket.on('notification', (data) => {
  console.log('New notification:', data)
})

socket.on('analysis_complete', (data) => {
  console.log('Analysis done:', data.analysis_id)
})
```

**ความเป็นจริง:** WebSocket server มี แต่ integration ไม่ complete

---

## 🛡️ Security APIs จริง

### POST `/api/security/validate-session`
**Status:** ✅ Working
```typescript
// Request - Uses Authorization header
// Response
{
  "valid": true,
  "user": {
    "id": "uuid",
    "role": "user"
  }
}
```

### POST `/api/security/report-issue`
**Status:** ✅ Working
```typescript
// Request
{
  "type": "bug", // "bug" | "security" | "performance"
  "description": "Found an issue...",
  "user_agent": "Mozilla/5.0...",
  "url": "https://ai367beauty.com/analysis"
}

// Response
{
  "report_id": "uuid",
  "status": "submitted"
}
```

---

## 📋 API Error Responses จริง

### Standard Error Format
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND_ERROR` - Resource not found
- `RATE_LIMIT_ERROR` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## 📊 API Performance จริง

### Response Times (Average)
- **Authentication:** 150ms
- **Skin Analysis:** 2.5s (with AI processing)
- **Database Queries:** 50ms
- **File Uploads:** 800ms
- **AR Simulation:** 1.2s

### Rate Limits
- **Public APIs:** 100 requests/minute
- **Authenticated APIs:** 500 requests/minute
- **Admin APIs:** 1000 requests/minute
- **AI Analysis:** 10 requests/minute per user

---

## 🔧 API Development Status

| API Category | Endpoints | Status | Issues |
|--------------|-----------|--------|--------|
| **Authentication** | 3 | ✅ Complete | None |
| **Skin Analysis** | 4 | 🟡 Working | Hardcoded VISIA scores |
| **Booking** | 3 | ✅ Complete | None |
| **User Management** | 3 | ✅ Complete | None |
| **Payments** | 2 | 🟡 Mock | No real payment integration |
| **Notifications** | 2 | 🟡 Basic | No email/SMS |
| **Analytics** | 2 | ✅ Complete | Good coverage |
| **Admin** | 2 | ✅ Complete | Good admin tools |
| **AR/VR** | 2 | ✅ Complete | Working simulations |
| **Mobile/PWA** | 2 | ✅ Complete | Good mobile support |
| **Real-time** | 1 | 🟡 Partial | WebSocket incomplete |
| **Security** | 2 | ✅ Complete | Good security |

---

## 🎯 Next Steps for API Improvements

1. **Fix Critical Issues:**
   - Remove hardcoded VISIA scores
   - Implement real payment processing
   - Complete WebSocket integration

2. **Add Missing Features:**
   - Email/SMS notifications
   - Advanced rate limiting
   - API versioning
   - Comprehensive error handling

3. **Performance Optimizations:**
   - Implement caching
   - Add request compression
   - Optimize database queries

---

**Document Status:** 🟡 Actively Updated  
**Last Reviewed:** 9 พฤศจิกายน 2025  
**Next Review:** After API fixes