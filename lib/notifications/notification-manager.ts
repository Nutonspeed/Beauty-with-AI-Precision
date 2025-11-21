/**
 * Notification Manager
 * Centralized notification system for the application
 */

import { toast, type ExternalToast } from "sonner";
import {
  showSuccessToast,
  showAnalysisSavedToast,
  showUploadSuccessToast,
  showExportSuccessToast,
  showShareSuccessToast,
  showAppointmentBookedToast,
  showTreatmentPlanCreatedToast,
  showProfileUpdatedToast,
  showSettingsSavedToast,
} from "@/components/ui/success-toast";
import { AnalysisError } from "@/lib/errors/analysis-errors";

/**
 * Notification types
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Notification options
 */
export interface NotificationOptions extends ExternalToast {
  type?: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Error notification messages
 */
const ERROR_MESSAGES = {
  th: {
    generic: "เกิดข้อผิดพลาด",
    network: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
    upload: "ไม่สามารถอัปโหลดรูปภาพได้",
    save: "ไม่สามารถบันทึกข้อมูลได้",
    load: "ไม่สามารถโหลดข้อมูลได้",
    auth: "กรุณาเข้าสู่ระบบก่อน",
    permission: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
  },
  en: {
    generic: "An error occurred",
    network: "Unable to connect to server",
    upload: "Unable to upload image",
    save: "Unable to save data",
    load: "Unable to load data",
    auth: "Please login first",
    permission: "You don't have permission to access this data",
  },
};

/**
 * Warning notification messages
 */
const WARNING_MESSAGES = {
  th: {
    unsavedChanges: "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก",
    slowConnection: "การเชื่อมต่ออินเทอร์เน็ตช้า",
    lowQuality: "คุณภาพของรูปภาพต่ำ",
    outdatedBrowser: "เบราว์เซอร์ของคุณล้าสมัย",
  },
  en: {
    unsavedChanges: "You have unsaved changes",
    slowConnection: "Slow internet connection",
    lowQuality: "Low image quality",
    outdatedBrowser: "Your browser is outdated",
  },
};

/**
 * Info notification messages
 */
const INFO_MESSAGES = {
  th: {
    processing: "กำลังประมวลผล...",
    uploading: "กำลังอัปโหลด...",
    saving: "กำลังบันทึก...",
    loading: "กำลังโหลด...",
  },
  en: {
    processing: "Processing...",
    uploading: "Uploading...",
    saving: "Saving...",
    loading: "Loading...",
  },
};

/**
 * NotificationManager class
 */
class NotificationManagerClass {
  private defaultLocale: string = "th";

  /**
   * Set default locale
   */
  setLocale(locale: string) {
    this.defaultLocale = locale;
  }

  /**
   * Get locale
   */
  getLocale(): string {
    return this.defaultLocale;
  }

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions) {
    return showSuccessToast(message, options as any);
  }

  /**
   * Show error notification
   * Supports string messages, Error objects, and AnalysisError
   */
  error(
    error: string | Error | AnalysisError,
    options?: NotificationOptions & {
      showTechnical?: boolean;
      onRetry?: () => void;
    }
  ) {
    const { duration = 5000, action, showTechnical = false, onRetry, ...restOptions } =
      options || {};

    // Handle AnalysisError
    if (error instanceof AnalysisError) {
      const message = error.userMessage[this.defaultLocale as "th" | "en"] || error.userMessage.th;
      const description = showTechnical ? error.technicalMessage : undefined;

      return toast.error(message, {
        description,
        duration: error.retryable ? 6000 : duration,
        action:
          error.retryable && onRetry
            ? {
                label: this.defaultLocale === "th" ? "ลองใหม่" : "Retry",
                onClick: onRetry,
              }
            : action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
        ...restOptions,
      });
    }

    // Handle regular Error
    if (error instanceof Error) {
      return toast.error(
        this.defaultLocale === "th" ? "เกิดข้อผิดพลาด" : "Error Occurred",
        {
          description: error.message,
          duration,
          action: action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
          ...restOptions,
        }
      );
    }

    // Handle string error
    return toast.error(error, {
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      ...restOptions,
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions) {
    const { duration = 5000, action, ...restOptions } = options || {};

    return toast.warning(message, {
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      ...restOptions,
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions) {
    const { duration = 4000, action, ...restOptions } = options || {};

    return toast.info(message, {
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      ...restOptions,
    });
  }

  /**
   * Show loading notification
   */
  loading(message: string, options?: Omit<NotificationOptions, "duration">) {
    return toast.loading(message, options);
  }

  /**
   * Dismiss notification
   */
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Promise-based notification
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, messages);
  }

  // ============================================
  // Predefined Notifications
  // ============================================

  /**
   * Analysis saved notification
   */
  analysisSaved(analysisId: string, onViewClick: () => void, locale?: string) {
    return showAnalysisSavedToast(
      analysisId,
      onViewClick,
      locale || this.defaultLocale
    );
  }

  /**
   * Upload success notification
   */
  uploadSuccess(locale?: string) {
    return showUploadSuccessToast(locale || this.defaultLocale);
  }

  /**
   * Export success notification
   */
  exportSuccess(onDownloadClick: () => void, locale?: string) {
    return showExportSuccessToast(
      onDownloadClick,
      locale || this.defaultLocale
    );
  }

  /**
   * Share success notification
   */
  shareSuccess(locale?: string) {
    return showShareSuccessToast(locale || this.defaultLocale);
  }

  /**
   * Appointment booked notification
   */
  appointmentBooked(
    appointmentDate: Date,
    onViewClick: () => void,
    locale?: string
  ) {
    return showAppointmentBookedToast(
      appointmentDate,
      onViewClick,
      locale || this.defaultLocale
    );
  }

  /**
   * Treatment plan created notification
   */
  treatmentPlanCreated(planId: string, onViewClick: () => void, locale?: string) {
    return showTreatmentPlanCreatedToast(
      planId,
      onViewClick,
      locale || this.defaultLocale
    );
  }

  /**
   * Profile updated notification
   */
  profileUpdated(locale?: string) {
    return showProfileUpdatedToast(locale || this.defaultLocale);
  }

  /**
   * Settings saved notification
   */
  settingsSaved(locale?: string) {
    return showSettingsSavedToast(locale || this.defaultLocale);
  }

  // ============================================
  // Common Error Notifications
  // ============================================

  /**
   * Show error notification from AnalysisError
   * This is the recommended way to display AnalysisError to users
   */
  analysisError(error: AnalysisError, onRetry?: () => void, showTechnical?: boolean) {
    return this.error(error, {
      showTechnical,
      onRetry: error.retryable ? onRetry : undefined,
    });
  }

  /**
   * Network error notification
   */
  networkError(locale?: string, onRetry?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.network, {
      action: onRetry
        ? {
            label: loc === "th" ? "ลองอีกครั้ง" : "Retry",
            onClick: onRetry,
          }
        : undefined,
    });
  }

  /**
   * Upload error notification
   */
  uploadError(locale?: string, onRetry?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.upload, {
      action: onRetry
        ? {
            label: loc === "th" ? "ลองอีกครั้ง" : "Retry",
            onClick: onRetry,
          }
        : undefined,
    });
  }

  /**
   * Save error notification
   */
  saveError(locale?: string, onRetry?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.save, {
      action: onRetry
        ? {
            label: loc === "th" ? "ลองอีกครั้ง" : "Retry",
            onClick: onRetry,
          }
        : undefined,
    });
  }

  /**
   * Load error notification
   */
  loadError(locale?: string, onRetry?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.load, {
      action: onRetry
        ? {
            label: loc === "th" ? "ลองอีกครั้ง" : "Retry",
            onClick: onRetry,
          }
        : undefined,
    });
  }

  /**
   * Auth error notification
   */
  authError(locale?: string, onLogin?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.auth, {
      action: onLogin
        ? {
            label: loc === "th" ? "เข้าสู่ระบบ" : "Login",
            onClick: onLogin,
          }
        : undefined,
    });
  }

  /**
   * Permission error notification
   */
  permissionError(locale?: string) {
    const loc = locale || this.defaultLocale;
    const messages = ERROR_MESSAGES[loc as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.th;

    return this.error(messages.permission);
  }

  // ============================================
  // Common Warning Notifications
  // ============================================

  /**
   * Unsaved changes warning
   */
  unsavedChanges(locale?: string, onSave?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = WARNING_MESSAGES[loc as keyof typeof WARNING_MESSAGES] || WARNING_MESSAGES.th;

    return this.warning(messages.unsavedChanges, {
      action: onSave
        ? {
            label: loc === "th" ? "บันทึก" : "Save",
            onClick: onSave,
          }
        : undefined,
      duration: 0, // Don't auto-dismiss
    });
  }

  /**
   * Slow connection warning
   */
  slowConnection(locale?: string) {
    const loc = locale || this.defaultLocale;
    const messages = WARNING_MESSAGES[loc as keyof typeof WARNING_MESSAGES] || WARNING_MESSAGES.th;

    return this.warning(messages.slowConnection);
  }

  /**
   * Low quality warning
   */
  lowQuality(locale?: string, onReupload?: () => void) {
    const loc = locale || this.defaultLocale;
    const messages = WARNING_MESSAGES[loc as keyof typeof WARNING_MESSAGES] || WARNING_MESSAGES.th;

    return this.warning(messages.lowQuality, {
      action: onReupload
        ? {
            label: loc === "th" ? "อัปโหลดใหม่" : "Re-upload",
            onClick: onReupload,
          }
        : undefined,
    });
  }

  // ============================================
  // Common Info Notifications
  // ============================================

  /**
   * Processing info notification
   */
  processing(locale?: string) {
    const loc = locale || this.defaultLocale;
    const messages = INFO_MESSAGES[loc as keyof typeof INFO_MESSAGES] || INFO_MESSAGES.th;

    return this.loading(messages.processing);
  }

  /**
   * Uploading info notification
   */
  uploading(locale?: string) {
    const loc = locale || this.defaultLocale;
    const messages = INFO_MESSAGES[loc as keyof typeof INFO_MESSAGES] || INFO_MESSAGES.th;

    return this.loading(messages.uploading);
  }

  /**
   * Saving info notification
   */
  saving(locale?: string) {
    const loc = locale || this.defaultLocale;
    const messages = INFO_MESSAGES[loc as keyof typeof INFO_MESSAGES] || INFO_MESSAGES.th;

    return this.loading(messages.saving);
  }
}

// Export singleton instance
export const NotificationManager = new NotificationManagerClass();

// Export type for external use
export type NotificationManager = NotificationManagerClass;
