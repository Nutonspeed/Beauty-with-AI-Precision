# Task 9: Error Handling & Monitoring - Documentation

## 📋 Overview

Task 9 implements comprehensive error handling and performance monitoring for the AI367Bar application, ensuring reliability, monitoring, and debugging capabilities.

**Completion Date**: 2025-01-08
**Status**: ✅ Complete

---

## 🎯 Objectives

1. ✅ Implement React Error Boundary for catching errors
2. ✅ Create error logging API endpoint
3. ✅ Build performance monitoring utilities
4. ✅ Create admin error dashboard
5. ✅ Set up database tables for logs and metrics
6. ✅ Provide integration examples

---

## 📁 Files Created

### 1. Error Boundary Component
**File**: `components/error/error-boundary.tsx` (320+ lines)

- **ErrorBoundary class component**: Catches React errors
- **Error UI**: User-friendly error display with bilingual support (Thai/English)
- **Error logging**: Automatically sends errors to API endpoint
- **Actions**: Retry, Go Home, Report Issue (clipboard copy)
- **Technical details**: Stack traces, component stacks (collapsible)
- **Development mode**: Shows detailed error information

**Key Features**:
- Catches all unhandled React errors in component tree
- Logs errors to `/api/errors/log` endpoint
- Displays helpful tips for users
- Provides error details for developers
- Full Thai/English translations

### 2. Error Logging API
**File**: `app/api/errors/log/route.ts` (270+ lines)

**POST Endpoint**: `/api/errors/log`
- Accepts error data from client
- Validates required fields
- Stores in `error_logs` table
- Prepares for Sentry integration
- Returns success response

**GET Endpoint**: `/api/errors/log` (Admin only)
- Retrieves error logs with filters
- Requires authentication
- Checks admin role (super_admin, clinic_admin)
- Supports filtering by: severity, userId, date range
- Returns statistics: total errors, last 24h count, by severity

**Error Types**:
```typescript
interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  severity: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
}
```

### 3. Performance Monitoring Utilities
**File**: `lib/utils/performance-monitoring.ts` (470+ lines)

**Core Functions**:
- `observeWebVitals()`: Tracks LCP, FID, CLS, FCP automatically
- `markPerformance(name)`: Create performance marks
- `measurePerformance(name, start, end)`: Measure durations
- `getNavigationMetrics()`: DNS, TCP, SSL, TTFB, DOM processing
- `getResourceMetrics()`: Resource loading times and sizes
- `observeLongTasks(callback)`: Detect main thread blocking (>50ms)
- `getMemoryUsage()`: JS heap size and usage percentage
- `initPerformanceMonitoring()`: Initialize all monitoring

**Web Vitals Tracked**:
- **LCP** (Largest Contentful Paint): Good < 2.5s, Poor > 4s
- **FID** (First Input Delay): Good < 100ms, Poor > 300ms
- **CLS** (Cumulative Layout Shift): Good < 0.1, Poor > 0.25
- **FCP** (First Contentful Paint): Good < 1.8s, Poor > 3s
- **TTFB** (Time to First Byte): Good < 800ms, Poor > 1.8s
- **INP** (Interaction to Next Paint): Good < 200ms, Poor > 500ms

**Performance Reports**:
- Automatically sent to `/api/analytics/performance`
- Reports every 10 seconds
- Reports on page unload
- Uses `keepalive` flag for reliability

### 4. Performance Monitoring Hooks
**File**: `hooks/use-performance-monitor.ts` (270+ lines)

**Hooks Available**:

**`usePerformanceMonitor`**: Track component performance
```typescript
const { getMetrics, resetMetrics, renderCount } = usePerformanceMonitor({
  componentName: 'MyComponent',
  trackRenders: true,
  trackMemory: true,
  onSlowRender: (duration) => console.warn('Slow render'),
  slowRenderThreshold: 16, // 60fps
});
```

**`useAsyncPerformance`**: Measure async operations
```typescript
const { measureAsync } = useAsyncPerformance();

const data = await measureAsync('fetch-users', async () => {
  return await fetchUsers();
}, {
  onSlow: (duration) => alert('Slow operation'),
  slowThreshold: 2000,
});
```

**`usePagePerformance`**: Track page view performance
```typescript
usePagePerformance('dashboard'); // Automatically tracks page timing
```

**`useApiPerformance`**: Track API call performance
```typescript
const { trackApiCall } = useApiPerformance();

const user = await trackApiCall('/api/users/me', async () => {
  return await fetch('/api/users/me').then(r => r.json());
});
```

**Metrics Collected**:
- Render count
- Average render time
- Slowest/fastest render
- Memory usage (if tracking enabled)

### 5. Performance Analytics API
**File**: `app/api/analytics/performance/route.ts` (320+ lines)

**POST Endpoint**: `/api/analytics/performance`
- Accepts performance metrics from client
- Stores in `performance_metrics` table
- Validates required fields
- Logs to console in development
- Checks for critical performance issues
- Alerts on long tasks (>500ms) and slow APIs (>5s)

**GET Endpoint**: `/api/analytics/performance` (Admin only)
- Retrieves performance metrics
- Requires admin authentication
- Supports filtering by: type, page, date range
- Returns statistics:
  - Total metrics
  - Last 24h metrics
  - Count by type
  - Count by rating (good/needs-improvement/poor)
  - Average values by type

**Performance Data Types**:
```typescript
interface PerformanceData {
  type: 'web-vital' | 'page-view' | 'api-call' | 'long-task';
  metrics?: PerformanceMetric[];
  duration?: number;
  endpoint?: string;
  page?: string;
  loadTime?: number;
  url: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  context?: Record<string, unknown>;
}
```

### 6. Database Migration
**File**: `supabase/migrations/20250108_error_logging_performance.sql` (540+ lines)

**Tables Created**:

**`error_logs` table**:
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT REFERENCES users(id),
  resolution_notes TEXT
);
```

**`performance_metrics` table**:
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  metric_type TEXT NOT NULL,
  metric_name TEXT,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  page_url TEXT NOT NULL,
  page_name TEXT,
  endpoint TEXT,
  user_agent TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes Created** (13 total):
- User ID indexes for both tables
- Severity, created_at, URL indexes for error_logs
- Type, name, rating, page indexes for performance_metrics
- Composite indexes for common query patterns

**RLS Policies**:
- Users can insert their own errors
- Users can view their own errors
- Admins can view/update/delete all errors
- Anyone can insert performance metrics (anonymous tracking)
- Admins can view/delete performance metrics

**Helper Functions**:
- `cleanup_old_error_logs()`: Delete resolved errors >90 days
- `cleanup_old_performance_metrics()`: Delete metrics >30 days
- `get_error_stats(start_date, end_date)`: Get error statistics
- `get_performance_stats(start_date, end_date)`: Get performance stats

### 7. Error Dashboard Component
**File**: `components/admin/error-dashboard.tsx` (590+ lines)

**Features**:
- **Statistics Cards**: Total errors, last 24h, by severity (error/warning/info)
- **Filters**: Filter by severity, date range
- **Error Table**: Sortable, paginated list of errors
- **Error Details Modal**: Full error information with stack traces
- **Actions**: Refresh, export to CSV
- **Bilingual**: Full Thai/English support
- **Real-time**: Auto-refresh capability

**Components**:
- Statistics dashboard (5 cards)
- Filter controls
- Error logs table with icons and badges
- Error details modal with full information
- Export to CSV functionality

### 8. Admin Error Dashboard Page
**File**: `app/[locale]/admin/errors/page.tsx` (30 lines)

Simple page wrapper that renders the ErrorDashboard component with locale support.

**Route**: `/[locale]/admin/errors`
**Access**: Admin only (super_admin, clinic_admin)

### 9. Integration Examples
**File**: `docs/INTEGRATION_EXAMPLES.tsx` (380+ lines)

Comprehensive examples showing:
1. Root layout with Error Boundary
2. Performance monitoring initialization
3. Page-level error boundaries
4. Component performance monitoring
5. Page performance tracking
6. API call performance tracking
7. Async operation performance
8. Manual performance marks
9. Custom error logging
10. Environment-based configuration

---

## 🔧 Integration Guide

### Step 1: Add Error Boundary to Root Layout

```tsx
// app/layout.tsx
import { ErrorBoundaryWrapper } from '@/components/error/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ErrorBoundaryWrapper locale="th" showDetails={process.env.NODE_ENV === 'development'}>
          {/* Your existing providers and components */}
          {children}
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
```

### Step 2: Initialize Performance Monitoring

```tsx
// Create app/performance-init.tsx
'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/utils/performance-monitoring';

export function PerformanceInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      initPerformanceMonitoring();
    }
  }, []);
  return null;
}

// Add to layout:
import { PerformanceInit } from './performance-init';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PerformanceInit />
        {/* ... */}
      </body>
    </html>
  );
}
```

### Step 3: Deploy Database Migration

```bash
# Run the migration
supabase db push

# Or if using hosted Supabase:
# Go to Supabase Dashboard > SQL Editor
# Copy and paste contents of 20250108_error_logging_performance.sql
# Click "Run"
```

### Step 4: Add Admin Link (Optional)

Add link to error dashboard in admin navigation:

```tsx
<Link href="/admin/errors">
  <AlertTriangle className="h-4 w-4 mr-2" />
  Error Logs
</Link>
```

---

## 📊 Usage Examples

### Monitor Component Performance

```tsx
'use client';

import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

export function HeavyComponent() {
  const { getMetrics, renderCount } = usePerformanceMonitor({
    componentName: 'HeavyComponent',
    trackRenders: true,
    trackMemory: true,
    onSlowRender: (duration) => {
      console.warn(`Slow render: ${duration}ms`);
    },
    slowRenderThreshold: 16, // 60fps
  });

  return (
    <div>
      {/* Component content */}
      {process.env.NODE_ENV === 'development' && (
        <div>Renders: {renderCount}</div>
      )}
    </div>
  );
}
```

### Track Page Performance

```tsx
'use client';

import { usePagePerformance } from '@/hooks/use-performance-monitor';

export default function DashboardPage() {
  usePagePerformance('dashboard');

  return <div>{/* Page content */}</div>;
}
```

### Track API Performance

```tsx
'use client';

import { useApiPerformance } from '@/hooks/use-performance-monitor';

export function UserProfile() {
  const { trackApiCall } = useApiPerformance();

  const fetchUser = async () => {
    return await trackApiCall('/api/users/me', async () => {
      const res = await fetch('/api/users/me');
      return res.json();
    });
  };

  // Use in your component
}
```

### Manual Error Logging

```tsx
import { logError } from '@/lib/utils/error-logging';

try {
  // Some operation
} catch (error) {
  await fetch('/api/errors/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'error',
      context: { action: 'user-action' },
    }),
  });
}
```

---

## 🎨 UI Components

### Error Boundary UI

When an error occurs, users see:
- ⚠️ Error icon with gradient background
- Error message in red alert
- Helpful tips card (4 tips)
- Technical details (collapsible, dev mode only)
- Action buttons:
  - **Try Again**: Resets error state
  - **Go to Home**: Redirects to homepage
  - **Report Issue**: Copies error details to clipboard

### Admin Error Dashboard

Admins can access `/admin/errors` to see:
- **Statistics Cards**:
  - Total errors
  - Last 24 hours count
  - Errors by severity (error/warning/info)
- **Filters**: Severity filter dropdown
- **Error Table**:
  - Timestamp
  - Severity badge with icon
  - Error message (truncated)
  - URL (truncated)
  - User ID
  - View Details button
- **Error Details Modal**:
  - Full error message
  - Stack trace
  - Component stack
  - URL
  - User agent
  - Additional context (JSON)
- **Actions**:
  - Refresh button
  - Export to CSV button

---

## 🔐 Security & Permissions

### Error Logs Access
- **Anonymous users**: Can insert errors (for error logging)
- **Authenticated users**: Can view their own errors
- **Admins**: Can view, update, delete all errors

### Performance Metrics Access
- **Anyone**: Can insert metrics (anonymous tracking)
- **Admins**: Can view and delete metrics

### Admin Dashboard Access
- Requires authentication
- Requires role: `super_admin` or `clinic_admin`
- Returns 401 if not authenticated
- Returns 403 if not authorized

---

## 📈 Performance Thresholds

### Web Vitals
- **LCP (Largest Contentful Paint)**:
  - Good: ≤ 2.5s
  - Needs Improvement: 2.5s - 4s
  - Poor: > 4s

- **FID (First Input Delay)**:
  - Good: ≤ 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)**:
  - Good: ≤ 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

- **FCP (First Contentful Paint)**:
  - Good: ≤ 1.8s
  - Needs Improvement: 1.8s - 3s
  - Poor: > 3s

- **TTFB (Time to First Byte)**:
  - Good: ≤ 800ms
  - Needs Improvement: 800ms - 1.8s
  - Poor: > 1.8s

### Custom Thresholds
- **Component Render**: 16ms (60fps)
- **API Call**: 2000ms (2 seconds)
- **Long Task**: 50ms (main thread blocking)
- **Critical Long Task**: 500ms (alert threshold)
- **Critical Slow API**: 5000ms (alert threshold)

---

## 🧹 Maintenance

### Cleanup Functions

**Error Logs** (run monthly):
```sql
SELECT cleanup_old_error_logs();
-- Deletes resolved errors older than 90 days
```

**Performance Metrics** (run weekly):
```sql
SELECT cleanup_old_performance_metrics();
-- Deletes metrics older than 30 days
```

### Statistics Queries

**Error Statistics** (last 24 hours):
```sql
SELECT * FROM get_error_stats();
```

**Performance Statistics** (last 7 days):
```sql
SELECT * FROM get_performance_stats(NOW() - INTERVAL '7 days', NOW());
```

**Most Common Errors**:
```sql
SELECT error_message, COUNT(*) as count
FROM error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_message
ORDER BY count DESC
LIMIT 10;
```

**Slowest Pages** (by LCP):
```sql
SELECT page_name, AVG(metric_value) as avg_lcp
FROM performance_metrics
WHERE metric_name = 'LCP'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY page_name
ORDER BY avg_lcp DESC
LIMIT 10;
```

---

## 🚀 Next Steps (Future Enhancements)

### Optional Features Not Implemented

1. **Sentry Integration** (Recommended for Production):
   - Install `@sentry/nextjs`
   - Run setup wizard
   - Configure DSN in environment
   - Update error logging API to use `Sentry.captureException()`

2. **Session Replay** (Privacy considerations):
   - Evaluate LogRocket, FullStory, or Sentry Session Replay
   - Configure privacy settings (mask sensitive data)
   - Add user consent mechanism

3. **Automated Alerts**:
   - Email notifications for critical errors
   - Slack webhook integration
   - Alert configuration UI
   - Rate limiting to prevent spam

4. **Advanced Analytics**:
   - Error trends dashboard with charts
   - Performance trends over time
   - User journey tracking
   - Error correlation analysis

5. **Error Resolution Workflow**:
   - Assign errors to team members
   - Mark as resolved with notes
   - Link to issue tracking (GitHub, Jira)
   - Resolution tracking dashboard

---

## 🧪 Testing

### Manual Testing

1. **Test Error Boundary**:
   - Create a component that throws an error
   - Verify Error Boundary catches it
   - Check error is logged to API
   - Test retry button
   - Test report issue (clipboard)

2. **Test Performance Monitoring**:
   - Open browser DevTools > Network
   - Navigate pages
   - Verify performance metrics sent to `/api/analytics/performance`
   - Check console for Web Vitals logs

3. **Test Admin Dashboard**:
   - Log in as admin
   - Navigate to `/admin/errors`
   - Verify error logs displayed
   - Test filters
   - Test export to CSV
   - View error details

### Automated Testing (Future)

```typescript
// Example test for Error Boundary
describe('ErrorBoundary', () => {
  it('should catch errors and display fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

---

## 📝 Summary

### What Was Completed

✅ **Error Handling**:
- React Error Boundary component (320+ lines)
- Error logging API endpoint (270+ lines)
- Database table with RLS policies
- Admin error dashboard UI (590+ lines)
- Bilingual support (Thai/English)

✅ **Performance Monitoring**:
- Web Vitals tracking (LCP, FID, CLS, FCP, TTFB, INP)
- Performance utilities (470+ lines)
- React hooks for monitoring (270+ lines)
- Performance analytics API (320+ lines)
- Database table with indexes

✅ **Database & Infrastructure**:
- Comprehensive SQL migration (540+ lines)
- 2 tables with full RLS policies
- 13 indexes for performance
- 4 helper functions
- Sample queries documented

✅ **Documentation**:
- Integration examples (380+ lines)
- Usage examples for all features
- Maintenance guide
- Security documentation

### Total Code Created

- **9 new files**
- **~3,460 lines of code**
- **2 database tables**
- **13 indexes**
- **10+ RLS policies**
- **4 helper functions**

### Key Features

1. Automatic error catching with React Error Boundary
2. Comprehensive error logging with context
3. Admin dashboard for error monitoring
4. Web Vitals tracking (Core Web Vitals)
5. Custom performance metrics
6. Component render performance
7. API call performance tracking
8. Memory usage monitoring
9. Long task detection
10. Bilingual UI (Thai/English)
11. Export to CSV functionality
12. Role-based access control

---

## 🎉 Conclusion

Task 9 is **complete** with comprehensive error handling and performance monitoring capabilities. The system is production-ready with:

- Robust error catching and logging
- Detailed performance metrics
- Admin monitoring dashboard
- Secure access control
- Automatic cleanup functions
- Full documentation and examples

**Next**: Proceed to Task 10 after deploying all SQL migrations from Tasks 1-10.

---

**Created**: 2025-01-08  
**Last Updated**: 2025-01-08  
**Version**: 1.0.0
