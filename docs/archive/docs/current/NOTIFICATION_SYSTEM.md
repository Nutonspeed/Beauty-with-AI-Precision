# Notification System Documentation

## Overview

The notification system provides a centralized way to display toast notifications throughout the application. It uses the `sonner` library and supports both Thai and English languages.

## Components

### 1. Success Toast Component (`components/ui/success-toast.tsx`)

Pre-configured success toast functions with action buttons:

- `showSuccessToast()` - Generic success toast
- `showAnalysisSavedToast()` - Analysis saved with view action
- `showUploadSuccessToast()` - Upload success
- `showExportSuccessToast()` - Export success with download action
- `showShareSuccessToast()` - Share success
- `showAppointmentBookedToast()` - Appointment booking confirmation
- `showTreatmentPlanCreatedToast()` - Treatment plan created
- `showProfileUpdatedToast()` - Profile update success
- `showSettingsSavedToast()` - Settings saved

### 2. Notification Manager (`lib/notifications/notification-manager.ts`)

Singleton instance that manages all notifications:

```typescript
import { NotificationManager } from "@/lib/notifications/notification-manager";

// Basic notifications
NotificationManager.success("Operation successful");
NotificationManager.error("Something went wrong");
NotificationManager.warning("Please be careful");
NotificationManager.info("Here's some information");
NotificationManager.loading("Processing...");

// With actions
NotificationManager.success("File saved", {
  action: {
    label: "View",
    onClick: () => router.push("/file"),
  },
});

// Analysis specific
NotificationManager.analysisSaved(analysisId, () => {
  router.push(`/analysis/detail/${analysisId}`);
}, locale);

// Error notifications with retry
NotificationManager.networkError(locale, onRetry);
NotificationManager.uploadError(locale, onRetry);
NotificationManager.saveError(locale, onRetry);
NotificationManager.loadError(locale, onRetry);
NotificationManager.authError(locale, onLogin);

// Warning notifications
NotificationManager.unsavedChanges(locale, onSave);
NotificationManager.slowConnection(locale);
NotificationManager.lowQuality(locale, onReupload);

// Promise-based notifications
NotificationManager.promise(
  saveData(),
  {
    loading: "Saving...",
    success: "Saved successfully!",
    error: "Failed to save",
  }
);
```

## Usage Examples

### 1. Analysis Flow (Already Integrated)

```typescript
// In components/skin-analysis-upload.tsx

// Show success after analysis
NotificationManager.analysisSaved(
  analysisData.id,
  () => router.push(`/${locale}/analysis/detail/${analysisData.id}`),
  locale
);

// Show error on failure
NotificationManager.error(
  locale === "th" ? "การวิเคราะห์ล้มเหลว" : "Analysis Failed",
  {
    description: analysisData.error || "Unknown error",
    action: {
      label: locale === "th" ? "ลองอีกครั้ง" : "Retry",
      onClick: retryAnalysis,
    },
  }
);

// Show network error
NotificationManager.networkError(locale, retryConnection);
```

### 2. Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  const toastId = NotificationManager.saving(locale);

  try {
    await saveProfile(data);
    NotificationManager.dismiss(toastId);
    NotificationManager.profileUpdated(locale);
  } catch (error) {
    NotificationManager.dismiss(toastId);
    NotificationManager.saveError(locale, () => handleSubmit(data));
  }
};
```

### 3. File Upload

```typescript
const handleUpload = async (file: File) => {
  try {
    await uploadFile(file);
    NotificationManager.uploadSuccess(locale);
  } catch (error) {
    NotificationManager.uploadError(locale, () => handleUpload(file));
  }
};
```

### 4. Promise-based Operations

```typescript
NotificationManager.promise(
  exportReport(analysisId),
  {
    loading: locale === "th" ? "กำลังส่งออกข้อมูล..." : "Exporting...",
    success: (data) => {
      return locale === "th"
        ? "ส่งออกข้อมูลสำเร็จ"
        : "Export successful";
    },
    error: locale === "th"
      ? "ไม่สามารถส่งออกข้อมูลได้"
      : "Export failed",
  }
);
```

### 5. Unsaved Changes Warning

```typescript
useEffect(() => {
  if (hasUnsavedChanges) {
    const toastId = NotificationManager.unsavedChanges(locale, handleSave);
    
    return () => {
      NotificationManager.dismiss(toastId);
    };
  }
}, [hasUnsavedChanges]);
```

### 6. Custom Notifications

```typescript
// Custom success with icon
NotificationManager.success("Custom success message", {
  description: "Additional details here",
  duration: 5000,
  action: {
    label: "Action",
    onClick: handleAction,
  },
});

// Custom error with retry
NotificationManager.error("Custom error message", {
  description: error.message,
  action: {
    label: "Retry",
    onClick: handleRetry,
  },
});
```

## Configuration

### Set Default Locale

```typescript
// In app initialization or user settings
NotificationManager.setLocale(userLocale);
```

### Toaster Configuration

The Toaster is configured in `app/layout.tsx`:

```typescript
<Toaster position="top-right" richColors closeButton />
```

Available positions:
- `top-left`
- `top-center`
- `top-right` (default)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Features

✅ **Bilingual Support** - Thai and English messages
✅ **Action Buttons** - Navigate or retry from notifications
✅ **Icons** - Visual indicators for success/error/warning/info
✅ **Auto-dismiss** - Configurable duration (default 4-5 seconds)
✅ **Manual Control** - Dismiss specific toasts programmatically
✅ **Promise Support** - Show loading/success/error states automatically
✅ **Rich Colors** - Color-coded by notification type
✅ **Accessible** - ARIA labels and keyboard navigation
✅ **Mobile Responsive** - Works on all screen sizes

## Best Practices

1. **Use Specific Methods**: Prefer `NotificationManager.analysisSaved()` over generic `success()`
2. **Provide Retry Actions**: Always offer retry for network/upload errors
3. **Keep Messages Short**: Use description for details
4. **Use Appropriate Duration**: 3s for info, 5s for success/error, 0 for warnings requiring action
5. **Dismiss Loading States**: Always dismiss loading toasts when operation completes
6. **Use Promise Wrapper**: For async operations, use `promise()` method for automatic state management

## Integration Checklist

- [x] Sonner library installed
- [x] Toaster component added to layout
- [x] Success toast component created
- [x] Notification manager implemented
- [x] Analysis flow integrated
- [ ] Form submissions integrated
- [ ] File upload integrated
- [ ] Settings page integrated
- [ ] Profile page integrated
- [ ] Appointment booking integrated

## Next Steps

To complete the notification system integration:

1. **Forms**: Add notifications to all form submissions
2. **File Operations**: Integrate upload/download notifications
3. **Settings**: Add save confirmations
4. **Appointments**: Add booking confirmations
5. **Treatment Plans**: Add creation confirmations
6. **Analytics**: Track notification interactions
7. **Error Logging**: Send errors to monitoring service
