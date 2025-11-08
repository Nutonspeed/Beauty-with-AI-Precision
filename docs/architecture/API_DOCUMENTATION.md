# 📡 AI367 Beauty Platform - API Documentation

**Version:** 1.0  
**Base URL:** `https://ai367bar.com/api` (Production)  
**Base URL:** `http://localhost:3000/api` (Development)  
**Last Updated:** 3 พฤศจิกายน 2025

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Analysis API](#analysis-api)
3. [User Profile API](#user-profile-api)
4. [Booking API](#booking-api)
5. [Customer/Lead Management](#customer-lead-management)
6. [Clinic Management](#clinic-management)
7. [Service Management](#service-management)
8. [Treatment Plans](#treatment-plans)
9. [Loyalty & Rewards](#loyalty--rewards)
10. [Chat/Messages](#chat-messages)
11. [Webhooks](#webhooks)
12. [Error Handling](#error-handling)
13. [Rate Limiting](#rate-limiting)
14. [SDKs & Examples](#sdks--examples)

---

## 🔐 Authentication

AI367 API ใช้ **JWT (JSON Web Tokens)** สำหรับการ authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phone": "+66812345678",
  "role": "customer"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "customer",
      "createdAt": "2025-11-03T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
\`\`\`

---

### Login

Authenticate user and get access token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "customer",
      "clinicId": "clinic-uuid",
      "lastLogin": "2025-11-03T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
}
\`\`\`

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
\`\`\`json
{
  "refreshToken": "refresh_token_here"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
\`\`\`

---

### Using Bearer Token

Include JWT token in all authenticated requests:

**Header:**
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Example (curl):**
\`\`\`bash
curl -X GET https://ai367bar.com/api/v1/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

---

## 🔬 Analysis API

### Analyze Skin Image

Upload and analyze skin image using AI.

**Endpoint:** `POST /api/v1/analyses`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
\`\`\`

**Request Body (multipart/form-data):**
\`\`\`
image: File (JPG, PNG, WebP, max 10MB)
patientInfo: JSON string (optional)
\`\`\`

**patientInfo JSON:**
\`\`\`json
{
  "age": 28,
  "skinType": "combination",
  "concerns": ["acne", "dark_spots", "pores"],
  "medicalHistory": "No allergies"
}
\`\`\`

**Example (JavaScript):**
\`\`\`javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('patientInfo', JSON.stringify({
  age: 28,
  skinType: 'combination',
  concerns: ['acne', 'dark_spots']
}));

const response = await fetch('/api/v1/analyses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "analysisId": "analysis-uuid-123",
    "userId": "user-uuid",
    "overallScore": 78,
    "visiaScores": {
      "spots": 65,
      "pores": 72,
      "wrinkles": 45,
      "texture": 80,
      "porphyrins": 88,
      "uvSpots": 60,
      "brownSpots": 55,
      "redAreas": 75
    },
    "detections": {
      "acne": {
        "count": 12,
        "severity": "moderate",
        "locations": [
          { "x": 250, "y": 180, "radius": 15, "type": "inflammatory" },
          { "x": 310, "y": 220, "radius": 12, "type": "comedonal" }
        ]
      },
      "darkSpots": {
        "count": 8,
        "averageIntensity": 0.65
      },
      "wrinkles": {
        "count": 15,
        "maxDepth": 0.8,
        "areas": ["forehead", "eyes", "mouth"]
      }
    },
    "heatmaps": {
      "spots": "https://storage.supabase.co/.../heatmap_spots.png",
      "pores": "https://storage.supabase.co/.../heatmap_pores.png",
      "wrinkles": "https://storage.supabase.co/.../heatmap_wrinkles.png"
    },
    "recommendations": [
      {
        "type": "treatment",
        "name": "Botox Injection",
        "priority": "high",
        "target": "wrinkles",
        "estimatedCost": "8000-15000",
        "duration": "3-6 months"
      },
      {
        "type": "product",
        "name": "Retinol Serum 0.5%",
        "usage": "nightly",
        "expectedResults": "4-6 weeks"
      }
    ],
    "processingTime": 8.5,
    "confidence": 0.82,
    "aiProvider": "huggingface",
    "createdAt": "2025-11-03T10:15:30Z"
  }
}
\`\`\`

---

### Get Analysis by ID

Retrieve specific analysis results.

**Endpoint:** `GET /api/v1/analyses/{id}`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "analysisId": "analysis-uuid-123",
    "userId": "user-uuid",
    "imageUrl": "https://storage.supabase.co/.../original.jpg",
    "overallScore": 78,
    "visiaScores": { ... },
    "detections": { ... },
    "heatmaps": { ... },
    "recommendations": [ ... ],
    "createdAt": "2025-11-03T10:15:30Z"
  }
}
\`\`\`

---

### Get Analysis History

Get user's analysis history with pagination.

**Endpoint:** `GET /api/v1/analyses`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Query Parameters:**
\`\`\`
page: number (default: 1)
limit: number (default: 10, max: 50)
sortBy: string (default: "createdAt")
order: "asc" | "desc" (default: "desc")
filter: JSON string (optional)
\`\`\`

**Filter JSON Example:**
\`\`\`json
{
  "dateFrom": "2025-01-01",
  "dateTo": "2025-11-03",
  "minScore": 70,
  "maxScore": 100,
  "concerns": ["acne", "wrinkles"]
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "analysisId": "uuid-1",
        "overallScore": 82,
        "thumbnailUrl": "...",
        "createdAt": "2025-11-03T10:00:00Z"
      },
      {
        "analysisId": "uuid-2",
        "overallScore": 78,
        "thumbnailUrl": "...",
        "createdAt": "2025-10-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
\`\`\`

---

### Delete Analysis

Delete specific analysis (user can only delete own analyses).

**Endpoint:** `DELETE /api/v1/analyses/{id}`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
\`\`\`

---

## 👤 User Profile API

### Get User Profile

Get current user's profile.

**Endpoint:** `GET /api/v1/profile`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+66812345678",
    "dateOfBirth": "1995-05-15",
    "gender": "male",
    "role": "customer",
    "clinicId": "clinic-uuid",
    "preferences": {
      "language": "th",
      "theme": "system",
      "notifications": {
        "email": true,
        "sms": true,
        "push": false
      }
    },
    "subscription": {
      "tier": "premium",
      "creditsRemaining": 25,
      "expiresAt": "2025-12-03T00:00:00Z"
    },
    "createdAt": "2024-01-15T08:00:00Z",
    "lastLogin": "2025-11-03T10:00:00Z"
  }
}
\`\`\`

---

### Update User Profile

Update user profile information.

**Endpoint:** `PATCH /api/v1/profile`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "fullName": "John Smith",
  "phone": "+66898765432",
  "dateOfBirth": "1995-05-15",
  "preferences": {
    "language": "en",
    "notifications": {
      "email": true,
      "sms": false
    }
  }
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "fullName": "John Smith",
    "phone": "+66898765432",
    ...
  },
  "message": "Profile updated successfully"
}
\`\`\`

---

## 📅 Booking API

### Create Booking

Create new appointment booking.

**Endpoint:** `POST /api/v1/bookings`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "clinicId": "clinic-uuid",
  "customerId": "customer-uuid",
  "serviceId": "service-uuid",
  "treatmentType": "Botox Injection",
  "bookingDate": "2025-11-10",
  "bookingTime": "14:30",
  "durationMinutes": 60,
  "customerNotes": "First time getting Botox"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "bookingId": "booking-uuid",
    "clinicId": "clinic-uuid",
    "customerId": "customer-uuid",
    "serviceId": "service-uuid",
    "treatmentType": "Botox Injection",
    "bookingDate": "2025-11-10",
    "bookingTime": "14:30:00",
    "durationMinutes": 60,
    "price": 12000,
    "status": "pending",
    "customerNotes": "First time getting Botox",
    "createdAt": "2025-11-03T11:00:00Z"
  }
}
\`\`\`

---

### Get User Bookings

Get current user's bookings.

**Endpoint:** `GET /api/v1/bookings`

**Query Parameters:**
\`\`\`
status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
page: number (default: 1)
limit: number (default: 10)
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingId": "uuid-1",
        "clinicName": "Beauty Clinic Bangkok",
        "serviceName": "Botox Injection",
        "treatmentType": "Anti-aging",
        "bookingDate": "2025-11-10",
        "bookingTime": "14:30:00",
        "durationMinutes": 60,
        "price": 12000,
        "status": "confirmed",
        "staffName": "Dr. Sarah",
        "createdAt": "2025-11-03T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
\`\`\`

---

### Update Booking Status

Update booking status (clinic staff only).

**Endpoint:** `PATCH /api/v1/bookings/{id}`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "status": "confirmed",
  "staffId": "staff-uuid",
  "internalNotes": "Confirmed via phone"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "bookingId": "booking-uuid",
    "status": "confirmed",
    "confirmedAt": "2025-11-03T12:00:00Z",
    "staffId": "staff-uuid"
  },
  "message": "Booking updated successfully"
}
\`\`\`

---

## 👥 Customer/Lead Management

### Create Customer (Lead)

Create new customer/lead (sales staff only).

**Endpoint:** `POST /api/v1/customers`

**Headers:**
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

**Request Body:**
\`\`\`json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+66812345678",
  "dateOfBirth": "1992-08-20",
  "gender": "female",
  "skinType": "oily",
  "skinConcerns": ["acne", "dark_spots"],
  "leadSource": "facebook_ad",
  "leadStatus": "new",
  "marketingConsent": true
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "customerId": "customer-uuid",
    "clinicId": "clinic-uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+66812345678",
    "leadStatus": "new",
    "leadScore": 50,
    "createdAt": "2025-11-03T13:00:00Z"
  }
}
\`\`\`

---

### Get Customers

Get clinic's customers with filtering.

**Endpoint:** `GET /api/v1/customers`

**Query Parameters:**
\`\`\`
clinicId: uuid (required for multi-clinic)
leadStatus: "new" | "contacted" | "qualified" | "converted"
leadScore: number (min score filter)
search: string (name, email, phone)
page: number
limit: number
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customerId": "uuid-1",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+66812345678",
        "leadStatus": "qualified",
        "leadScore": 85,
        "lastContactedAt": "2025-11-02T15:00:00Z",
        "nextFollowUpAt": "2025-11-05T10:00:00Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "total": 150,
      "new": 45,
      "contacted": 60,
      "qualified": 30,
      "converted": 15
    }
  }
}
\`\`\`

---

### Update Customer/Lead

Update customer information.

**Endpoint:** `PATCH /api/v1/customers/{id}`

**Request Body:**
\`\`\`json
{
  "leadStatus": "qualified",
  "leadScore": 85,
  "notes": "Very interested in Botox",
  "nextFollowUpAt": "2025-11-05T10:00:00Z"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "customerId": "customer-uuid",
    "leadStatus": "qualified",
    "leadScore": 85,
    "updatedAt": "2025-11-03T14:00:00Z"
  }
}
\`\`\`

---

## 🏥 Clinic Management

### Get Clinic Info

Get clinic information.

**Endpoint:** `GET /api/v1/clinic/{id}`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "clinicId": "clinic-uuid",
    "name": "Beauty Clinic Bangkok",
    "slug": "beauty-clinic-bangkok",
    "description": "Premium beauty and aesthetic clinic",
    "address": "123 Sukhumvit Rd, Bangkok",
    "phone": "+6621234567",
    "email": "info@beautyclinic.com",
    "website": "https://beautyclinic.com",
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      ...
    },
    "branding": {
      "logoUrl": "https://...",
      "primaryColor": "#3B82F6",
      "secondaryColor": "#1F2937"
    },
    "isActive": true,
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

---

### Update Clinic Info

Update clinic information (clinic owner only).

**Endpoint:** `PATCH /api/v1/clinic/{id}`

**Request Body:**
\`\`\`json
{
  "name": "Beauty Clinic Bangkok Premium",
  "phone": "+6621234567",
  "businessHours": {
    "monday": { "open": "08:00", "close": "20:00" }
  },
  "branding": {
    "primaryColor": "#FF6B6B"
  }
}
\`\`\`

---

## 💆 Service Management

### Get Services

Get clinic's services.

**Endpoint:** `GET /api/v1/services`

**Query Parameters:**
\`\`\`
clinicId: uuid (required)
category: string (optional)
isActive: boolean (default: true)
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "services": [
      {
        "serviceId": "service-uuid",
        "clinicId": "clinic-uuid",
        "name": "Botox Injection",
        "description": "Anti-aging treatment for wrinkles",
        "category": "anti-aging",
        "serviceType": "injection",
        "price": 12000,
        "durationMinutes": 60,
        "currency": "THB",
        "isActive": true,
        "isFeatured": true,
        "imageUrl": "https://...",
        "benefits": [
          "Reduce wrinkles",
          "Natural-looking results",
          "No downtime"
        ],
        "createdAt": "2024-06-01T00:00:00Z"
      }
    ]
  }
}
\`\`\`

---

### Create Service

Create new service (clinic admin only).

**Endpoint:** `POST /api/v1/services`

**Request Body:**
\`\`\`json
{
  "name": "Laser Hair Removal",
  "description": "Permanent hair reduction",
  "category": "laser",
  "price": 5000,
  "durationMinutes": 45,
  "benefits": ["Long-lasting results", "Painless"],
  "contraindications": "Pregnancy, tanned skin",
  "requiresConsultation": true
}
\`\`\`

---

## 📋 Treatment Plans

### Get Treatment Plans

Get available treatment plans.

**Endpoint:** `GET /api/treatment-plans`

**Query Parameters:**
\`\`\`
concerns: string[] (e.g., "acne,wrinkles")
budget: number
ageRange: string (e.g., "25-35")
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "plans": [
      {
        "planId": "plan-uuid",
        "name": "Complete Anti-Aging Package",
        "description": "Comprehensive treatment for aging skin",
        "targetConcerns": ["wrinkles", "sagging", "dark_spots"],
        "treatments": [
          {
            "name": "Botox",
            "sessions": 1,
            "interval": "6 months",
            "cost": 12000
          },
          {
            "name": "Laser Resurfacing",
            "sessions": 4,
            "interval": "2 weeks",
            "cost": 20000
          }
        ],
        "totalCost": 32000,
        "duration": "3 months",
        "expectedImprovement": "70-80%",
        "beforeAfterImages": [ ... ]
      }
    ]
  }
}
\`\`\`

---

## 🎁 Loyalty & Rewards

### Get Loyalty Points

Get user's loyalty points and tier.

**Endpoint:** `GET /api/v1/loyalty`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "userId": "user-uuid",
    "points": 1250,
    "tier": "gold",
    "nextTier": "platinum",
    "pointsToNextTier": 750,
    "benefits": [
      "10% discount on all treatments",
      "Priority booking",
      "Free skin analysis (2/month)"
    ],
    "expiringPoints": {
      "amount": 200,
      "expiryDate": "2025-12-31"
    },
    "history": [
      {
        "date": "2025-11-01",
        "description": "Botox treatment",
        "points": 120,
        "type": "earned"
      },
      {
        "date": "2025-10-15",
        "description": "Redeemed for discount",
        "points": -50,
        "type": "redeemed"
      }
    ]
  }
}
\`\`\`

---

## 💬 Chat/Messages

### Send Message

Send message in clinic chat.

**Endpoint:** `POST /api/v1/messages`

**Request Body:**
\`\`\`json
{
  "recipientId": "user-uuid",
  "message": "Hello, how can I help you?",
  "metadata": {
    "type": "text",
    "context": "booking_inquiry"
  }
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "messageId": "message-uuid",
    "senderId": "sender-uuid",
    "recipientId": "recipient-uuid",
    "message": "Hello, how can I help you?",
    "sentAt": "2025-11-03T15:30:00Z",
    "read": false
  }
}
\`\`\`

---

### Get Messages

Get chat messages.

**Endpoint:** `GET /api/v1/messages`

**Query Parameters:**
\`\`\`
conversationId: uuid (optional)
userId: uuid (optional, get conversation with specific user)
limit: number (default: 50)
before: timestamp (for pagination)
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "uuid-1",
        "senderId": "sender-uuid",
        "senderName": "John Doe",
        "message": "Hello!",
        "sentAt": "2025-11-03T15:30:00Z",
        "read": true
      }
    ],
    "hasMore": false
  }
}
\`\`\`

---

## 🔔 Webhooks

### Webhook Events

Subscribe to real-time events.

**Supported Events:**
\`\`\`
analysis.completed
booking.created
booking.confirmed
booking.cancelled
payment.succeeded
payment.failed
user.registered
\`\`\`

**Webhook Payload Example:**
\`\`\`json
{
  "event": "analysis.completed",
  "timestamp": "2025-11-03T16:00:00Z",
  "data": {
    "analysisId": "uuid",
    "userId": "uuid",
    "overallScore": 82
  },
  "signature": "sha256_signature_here"
}
\`\`\`

**Setup Webhook:**
\`\`\`bash
POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["analysis.completed", "booking.created"],
  "secret": "your_webhook_secret"
}
\`\`\`

**Verify Signature (Node.js):**
\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return digest === signature;
}
\`\`\`

---

## ❌ Error Handling

### Error Response Format

All errors follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "reason": "Email already exists"
    }
  }
}
\`\`\`

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Invalid request body/parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 403 | `FORBIDDEN` | No permission to access resource |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists (duplicate) |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Validation Errors

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters"
        }
      ]
    }
  }
}
\`\`\`

---

## ⏱️ Rate Limiting

### Rate Limits

| Tier | Limit | Window |
|------|-------|--------|
| Free | 60 requests | per minute |
| Premium | 300 requests | per minute |
| Enterprise | 1000 requests | per minute |

### Rate Limit Headers

\`\`\`
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699012800
\`\`\`

### Rate Limit Exceeded (429)

\`\`\`json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retryAfter": 30
  }
}
\`\`\`

---

## 📦 SDKs & Examples

### JavaScript/TypeScript SDK

\`\`\`bash
npm install @ai367/sdk
\`\`\`

\`\`\`javascript
import { AI367Client } from '@ai367/sdk';

const client = new AI367Client({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://ai367bar.com/api'
});

// Analyze image
const analysis = await client.analyses.create({
  image: fileBlob,
  patientInfo: {
    age: 28,
    skinType: 'combination'
  }
});

console.log('Analysis ID:', analysis.analysisId);
console.log('Overall Score:', analysis.overallScore);
\`\`\`

### Python SDK

\`\`\`bash
pip install ai367-sdk
\`\`\`

\`\`\`python
from ai367 import AI367Client

client = AI367Client(api_key='YOUR_API_KEY')

# Analyze image
with open('face.jpg', 'rb') as f:
    analysis = client.analyses.create(
        image=f,
        patient_info={
            'age': 28,
            'skin_type': 'combination'
        }
    )

print(f"Analysis ID: {analysis.analysis_id}")
print(f"Overall Score: {analysis.overall_score}")
\`\`\`

### cURL Examples

**Login:**
\`\`\`bash
curl -X POST https://ai367bar.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
\`\`\`

**Analyze Image:**
\`\`\`bash
curl -X POST https://ai367bar.com/api/v1/analyses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@face.jpg" \
  -F 'patientInfo={"age":28,"skinType":"combination"}'
\`\`\`

**Get Profile:**
\`\`\`bash
curl -X GET https://ai367bar.com/api/v1/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

---

## 🔗 Additional Resources

- [User Guide](USER_GUIDE.md)
- [FAQ](FAQ.md)
- [Changelog](CHANGELOG.md)
- [Support](mailto:support@ai367bar.com)

---

## 📄 License & Terms

- [Terms of Service](TERMS_OF_SERVICE.md)
- [Privacy Policy](PRIVACY_POLICY.md)
- [API Terms](API_TERMS.md)

---

**API Documentation Version:** 1.0  
**Last Updated:** 3 พฤศจิกายน 2025  
**Maintained by:** AI367 Development Team

For API support: api-support@ai367bar.com
