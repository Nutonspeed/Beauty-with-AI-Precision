# ClinicIQ API Documentation

## Overview

ClinicIQ provides a comprehensive REST API for AI-powered skin analysis, clinic management, and CRM functionality.

**Base URL:** `https://api.cliniciq.app` (Production) | `http://localhost:3000` (Development)

**Authentication:** JWT Bearer Token (via Supabase Auth)

---

## Authentication

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
    "name": "John Doe",
    "role": "customer"
  },
  "session": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## AI Analysis

### Start Analysis
```http
POST /api/analyze
Content-Type: multipart/form-data
Authorization: Bearer <access_token>

image: <file>
userId: "uuid"
language: "th" | "en"
```

**Response:**
```json
{
  "success": true,
  "analysisId": "ana_abc123",
  "provider": "openai",
  "data": {
    "concerns": [
      {
        "type": "fine_lines",
        "severity": "mild",
        "confidence": 0.85,
        "location": "forehead",
        "description": "Minor expression lines"
      }
    ],
    "visiaScores": {
      "wrinkles": 82,
      "spots": 75,
      "pores": 78,
      "texture": 85,
      "evenness": 72,
      "firmness": 88,
      "radiance": 76,
      "hydration": 70
    },
    "recommendations": [
      "Apply SPF 50+ daily",
      "Use vitamin C serum"
    ],
    "overallScore": 78
  },
  "processingTime": 1500
}
```

### Get Analysis History
```http
GET /api/analysis/history?userId=<uuid>&limit=10
Authorization: Bearer <access_token>
```

---

## Clinic Management

### Get Clinic Info
```http
GET /api/clinic?clinicId=<uuid>
Authorization: Bearer <access_token>
```

### Update Clinic
```http
PUT /api/clinic
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clinicId": "uuid",
  "name": "Beauty Clinic",
  "address": "123 Main St"
}
```

---

## Bookings

### Create Booking
```http
POST /api/bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clinicId": "uuid",
  "customerId": "uuid",
  "treatmentId": "uuid",
  "dateTime": "2024-12-15T10:00:00Z",
  "notes": "Optional notes"
}
```

### Get Bookings
```http
GET /api/bookings?clinicId=<uuid>&date=2024-12-15
Authorization: Bearer <access_token>
```

---

## Health Checks

### Basic Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T00:00:00Z",
  "version": "0.1.0",
  "uptime": 12345
}
```

### Liveness Probe
```http
GET /api/health/live
```

### Readiness Probe
```http
GET /api/health/ready
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable message",
  "statusCode": 400
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Anonymous:** 60 requests/minute
- **Authenticated:** 120 requests/minute
- **AI Analysis:** 10 requests/minute

---

## Webhooks

ClinicIQ can send webhooks for these events:

- `booking.created`
- `booking.cancelled`
- `analysis.completed`
- `payment.received`

Configure webhooks in Clinic Settings.

---

## SDKs

- **JavaScript/TypeScript:** `npm install @cliniciq/sdk`
- **Python:** `pip install cliniciq`

---

## Support

- **Email:** support@cliniciq.app
- **Documentation:** https://docs.cliniciq.app
- **Status Page:** https://status.cliniciq.app
