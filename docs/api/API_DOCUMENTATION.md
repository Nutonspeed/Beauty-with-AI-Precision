# 📚 ClinicIQ API Documentation

## Overview

ClinicIQ provides a comprehensive REST API for aesthetic clinic management, AI skin analysis, and sales operations.

**Base URL:** `https://your-domain.com/api`

**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "staff"
  },
  "token": "jwt_token_here"
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

## 🏥 Health Check

### System Status
```http
GET /api/system/status
```

**Response:**
```json
{
  "overall": "operational",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": [
    {
      "name": "PostgreSQL Database",
      "status": "operational",
      "latency": 15
    }
  ],
  "metrics": {
    "database": { "connected": true, "latency": 15 },
    "auth": { "configured": true },
    "ai": { "geminiConfigured": true }
  }
}
```

### Basic Health
```http
GET /api/health
```

---

## 🔬 AI Skin Analysis

### Analyze Image
```http
POST /api/analysis/analyze
Content-Type: multipart/form-data
Authorization: Bearer <token>

image: <file>
mode: "comprehensive" | "spots" | "wrinkles" | "pores" | "texture" | "pigmentation" | "hydration" | "acne"
```

**Response:**
```json
{
  "id": "analysis_uuid",
  "overallScore": 75,
  "metrics": {
    "spots": { "score": 80, "count": 5, "severity": "mild" },
    "wrinkles": { "score": 70, "areas": ["forehead", "eyes"] },
    "pores": { "score": 85, "visibility": "minimal" },
    "texture": { "score": 78, "smoothness": "good" },
    "pigmentation": { "score": 72, "uniformity": "moderate" },
    "hydration": { "score": 65, "level": "slightly_dry" }
  },
  "recommendations": [
    {
      "treatment": "Botox",
      "reason": "Reduce forehead wrinkles",
      "priority": "high"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Analysis History
```http
GET /api/analysis/history?userId=<uuid>&limit=10
Authorization: Bearer <token>
```

---

## 👥 Customers

### List Customers
```http
GET /api/customers?page=1&limit=20&search=<query>
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "สมหญิง ใจดี",
      "email": "somying@email.com",
      "phone": "0812345678",
      "lastVisit": "2024-01-01",
      "totalSpent": 50000,
      "loyaltyPoints": 500
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Get Customer
```http
GET /api/customers/<id>
Authorization: Bearer <token>
```

### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "สมหญิง ใจดี",
  "email": "somying@email.com",
  "phone": "0812345678"
}
```

### Update Customer
```http
PUT /api/customers/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

---

## 📊 Sales & Leads

### List Leads
```http
GET /api/sales/leads?status=active&sortBy=score
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "customerName": "คุณนภา",
      "source": "Facebook Ads",
      "score": 85,
      "status": "hot",
      "interestedTreatments": ["Botox", "Filler"],
      "lastContact": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Create Lead
```http
POST /api/sales/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "คุณนภา",
  "phone": "0812345678",
  "source": "Walk-in",
  "interestedTreatments": ["Botox"]
}
```

### Update Lead Status
```http
PATCH /api/sales/leads/<id>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "converted",
  "notes": "Booked for Botox treatment"
}
```

---

## 📅 Bookings

### List Bookings
```http
GET /api/bookings?date=2024-01-01&status=confirmed
Authorization: Bearer <token>
```

### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "uuid",
  "treatmentId": "uuid",
  "date": "2024-01-15",
  "time": "10:00",
  "notes": "First visit"
}
```

### Update Booking
```http
PUT /api/bookings/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Treatment completed successfully"
}
```

---

## 💉 Treatments

### List Treatments
```http
GET /api/treatments?category=anti-aging
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Botox",
      "nameTh": "โบท็อกซ์",
      "category": "Anti-Aging",
      "price": 8900,
      "duration": 20,
      "description": "Reduce wrinkles and fine lines"
    }
  ]
}
```

### Get Treatment
```http
GET /api/treatments/<id>
Authorization: Bearer <token>
```

---

## 💬 Chat & Messaging

### Send Message
```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "uuid",
  "message": "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ?",
  "type": "text"
}
```

### Get Conversation History
```http
GET /api/chat/conversations/<id>/messages?limit=50
Authorization: Bearer <token>
```

---

## 📧 Email

### Send Email
```http
POST /api/email/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "customer@email.com",
  "subject": "ยืนยันการนัดหมาย",
  "template": "appointment_confirmation",
  "data": {
    "customerName": "คุณสมหญิง",
    "date": "15 มกราคม 2024",
    "time": "10:00"
  }
}
```

---

## 📊 Analytics

### Get Dashboard Stats
```http
GET /api/analytics/dashboard?period=month
Authorization: Bearer <token>
```

**Response:**
```json
{
  "revenue": {
    "total": 1500000,
    "growth": 15.5
  },
  "customers": {
    "total": 500,
    "new": 45
  },
  "bookings": {
    "total": 320,
    "completed": 298
  },
  "conversion": {
    "rate": 26.5
  }
}
```

### Get Revenue Report
```http
GET /api/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

---

## 🏢 Clinic Management

### Get Clinic Info
```http
GET /api/clinic
Authorization: Bearer <token>
```

### Update Clinic Settings
```http
PUT /api/clinic/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Beauty Clinic",
  "workingHours": {
    "monday": { "open": "09:00", "close": "18:00" }
  }
}
```

---

## 🔧 Error Responses

All API errors follow this format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request body",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 📝 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 10 req/min |
| Analysis | 20 req/min |
| General API | 100 req/min |

---

## 🔗 Webhooks

### Configure Webhook
```http
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["booking.created", "booking.completed", "lead.converted"]
}
```

### Webhook Payload
```json
{
  "event": "booking.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "treatmentId": "uuid"
  }
}
```

---

## 📌 SDK Examples

### JavaScript/TypeScript
```typescript
import { ClinicIQ } from '@cliniciq/sdk';

const client = new ClinicIQ({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.cliniciq.com'
});

// Get customers
const customers = await client.customers.list({ limit: 20 });

// Create booking
const booking = await client.bookings.create({
  customerId: 'uuid',
  treatmentId: 'uuid',
  date: '2024-01-15',
  time: '10:00'
});
```

---

## 📞 Support

- **Email:** api-support@cliniciq.com
- **Documentation:** https://docs.cliniciq.com
- **Status Page:** https://status.cliniciq.com
