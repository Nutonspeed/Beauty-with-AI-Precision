# Beauty-with-AI-Precision API Documentation

## 📋 Overview

Beauty-with-AI-Precision is a comprehensive AI-powered aesthetic clinic platform featuring advanced skin analysis, 3D AR visualization, real-time CRM, and multi-tenant clinic management.

**Base URL:** `https://api.beauty-ai-precision.com`
**Version:** v1.0.0
**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication

All API endpoints require authentication except public endpoints.

### Authentication Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "clinic@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "clinic@example.com",
    "role": "clinic_admin",
    "clinic_id": "uuid"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/register
Register new clinic account.

#### POST /api/auth/refresh
Refresh JWT token.

---

## 🏥 Clinic Management

### GET /api/clinics
List clinics (admin only).

### GET /api/clinics/{id}
Get clinic details.

### PUT /api/clinics/{id}
Update clinic information.

### POST /api/clinics/{id}/staff
Add staff member to clinic.

---

## 👥 Customer Management

### GET /api/customers
List customers for clinic.

**Query Parameters:**
- `clinic_id` (required): Clinic identifier
- `search`: Search by name or email
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset

**Response:**
```json
{
  "customers": [
    {
      "id": "uuid",
      "full_name": "Alice Anderson",
      "email": "alice@example.com",
      "phone": "+1234567890",
      "skin_type": "combination",
      "total_analyses": 5,
      "last_visit": "2024-12-07T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

### POST /api/customers
Create new customer.

### GET /api/customers/{id}
Get customer details with full history.

### PUT /api/customers/{id}
Update customer information.

### DELETE /api/customers/{id}
Archive customer (soft delete).

---

## 🗓️ Appointment Management

### GET /api/appointments
List appointments with filters.

**Query Parameters:**
- `clinic_id`: Filter by clinic
- `date_from`: Start date filter
- `date_to`: End date filter
- `status`: Appointment status (pending, confirmed, completed, cancelled)
- `limit`: Results per page

### POST /api/appointments
Create new appointment.

**Request:**
```json
{
  "clinic_id": "uuid",
  "customer_id": "uuid",
  "service_id": "uuid",
  "appointment_date": "2024-12-15",
  "start_time": "10:00",
  "duration_minutes": 60,
  "notes": "Initial consultation"
}
```

### GET /api/appointments/{id}
Get appointment details.

### PUT /api/appointments/{id}
Update appointment.

### DELETE /api/appointments/{id}
Cancel appointment.

### POST /api/appointments/{id}/reschedule
Reschedule appointment.

### POST /api/appointments/{id}/cancel
Cancel appointment with policy.

---

## 🔍 AI Skin Analysis

### POST /api/analyze
Perform AI skin analysis.

**Request:**
- Content-Type: multipart/form-data
- `image`: Face image file
- `clinic_id`: Clinic identifier
- `customer_id`: Customer identifier (optional)

**Response:**
```json
{
  "analysis_id": "uuid",
  "overall_score": 7.8,
  "results": {
    "spots": { "score": 6.2, "severity": "moderate" },
    "wrinkles": { "score": 8.1, "severity": "high" },
    "texture": { "score": 7.5, "severity": "moderate" },
    "pores": { "score": 6.8, "severity": "moderate" },
    "hydration": { "score": 8.9, "severity": "good" }
  },
  "recommendations": [
    "Consider anti-aging treatment",
    "Increase hydration routine"
  ]
}
```

### GET /api/analyze/{id}
Get analysis results.

### GET /api/analyze/history
Get customer's analysis history.

### POST /api/analyze/compare
Compare before/after analyses.

---

## 📊 Analytics & Reporting

### GET /api/analytics/dashboard
Get clinic dashboard metrics.

**Response:**
```json
{
  "period": "30d",
  "metrics": {
    "total_customers": 150,
    "total_appointments": 89,
    "total_revenue": 45000,
    "avg_customer_value": 300,
    "popular_services": ["facial", "laser", "consultation"],
    "staff_performance": [...],
    "revenue_trend": [...]
  }
}
```

### GET /api/analytics/performance
Get performance metrics.

### GET /api/analytics/trends
Get trend analysis for customer.

### GET /api/analytics/reports/revenue
Generate revenue reports.

### GET /api/analytics/reports/treatments
Generate treatment reports.

---

## 💼 Sales & CRM

### GET /api/sales/leads
List sales leads.

### POST /api/sales/leads
Create new lead.

### GET /api/sales/leads/{id}
Get lead details.

### PUT /api/sales/leads/{id}
Update lead.

### GET /api/sales/proposals
List proposals.

### POST /api/sales/proposals
Create treatment proposal.

### GET /api/sales/proposals/{id}
Get proposal details.

### PUT /api/sales/proposals/{id}
Update proposal.

---

## 🏷️ Inventory Management

### GET /api/inventory/items
List inventory items.

### POST /api/inventory/items
Add inventory item.

### GET /api/inventory/items/{id}
Get item details.

### PUT /api/inventory/items/{id}
Update item.

### GET /api/inventory/alerts
Get low stock alerts.

### POST /api/inventory/transfers
Create inventory transfer between branches.

---

## 💳 Payments & Billing

### POST /api/payments/create-session
Create payment session.

### GET /api/payments/history
Get payment history.

### POST /api/payments/refund
Process refund.

---

## 📱 Real-time Features

### WebSocket: /api/ws
Real-time communication endpoint.

**Events:**
- `chat:message` - New chat message
- `appointment:reminder` - Appointment reminder
- `notification:new` - New notification

### POST /api/notifications
Send notification.

### GET /api/notifications
List notifications.

---

## 🔧 System Management

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-07T15:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_services": "operational"
  }
}
```

### GET /api/system/info
System information.

### POST /api/admin/backup
Trigger system backup.

---

## 📊 Error Responses

All endpoints use standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

---

## 🔒 Security Features

- **Multi-tenant isolation**: Clinics cannot access other clinics' data
- **Role-based access control**: Different permissions for staff, admins, customers
- **Row Level Security (RLS)**: Database-level data protection
- **JWT authentication**: Secure token-based authentication
- **Rate limiting**: Protection against abuse
- **Input validation**: All inputs validated and sanitized
- **Audit logging**: All operations logged for compliance

---

## 📈 Rate Limits

- **Authenticated users**: 1000 requests/hour
- **Public endpoints**: 100 requests/hour
- **AI analysis**: 50 requests/hour per user

---

## 🆘 Support

For API support or questions:
- Email: api-support@beauty-ai-precision.com
- Documentation: https://docs.beauty-ai-precision.com
- Status Page: https://status.beauty-ai-precision.com
