/**
 * Notification Manager
 * Centralized notification system for the application
 */

import { toast, type ExternalToast } from "sonner";
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
 * @deprecated Use i18n keys instead
 */
/*
const ERROR_MESSAGES = {};
const WARNING_MESSAGES = {};
const INFO_MESSAGES = {};
*/

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
    const { description, duration = 4000, ...restOptions } = options || {};
    return toast.success(message, {
      description,
      duration,
      ...restOptions,
    });
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

    const isThai = this.defaultLocale === "th";

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
                label: isThai ? "ลองใหม่" : "Retry",
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
      return toast.error(isThai ? "เกิดข้อผิดพลาด" : "Error Occurred", {
        description: error.message,
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
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "บันทึกผลการวิเคราะห์แล้ว" : "Analysis saved successfully", {
      description: isThai ? "ผลการวิเคราะห์ของคุณถูกบันทึกลงในโปรไฟล์แล้ว" : "Your skin analysis has been saved to your profile",
      action: {
        label: isThai ? "ดูผล" : "View",
        onClick: onViewClick,
      },
      duration: 5000,
    });
  }

  /**
   * Upload success notification
   */
  uploadSuccess(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "อัปโหลดสำเร็จ" : "Upload successful", {
      description: isThai ? "รูปภาพของคุณถูกอัปโหลดและพร้อมสำหรับการวิเคราะห์" : "Your image has been uploaded and is ready for analysis",
      duration: 3000,
    });
  }

  /**
   * Export success notification
   */
  exportSuccess(onDownloadClick: () => void, locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "ส่งออกรายงานสำเร็จ" : "Report exported successfully", {
      description: isThai ? "รายงานของคุณพร้อมสำหรับการดาวน์โหลดแล้ว" : "Your report is ready for download",
      action: {
        label: isThai ? "ดาวน์โหลด" : "Download",
        onClick: onDownloadClick,
      },
    });
  }

  /**
   * Share success notification
   */
  shareSuccess(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "แชร์สำเร็จ" : "Shared successfully", {
      description: isThai ? "ลิงก์ของคุณถูกคัดลอกไปยังคลิปบอร์ดแล้ว" : "Your link has been copied to the clipboard",
      duration: 3000,
    });
  }

  /**
   * Appointment booked notification
   */
  appointmentBooked(
    appointmentDate: Date,
    onViewClick: () => void,
    locale?: string
  ) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    const dateStr = appointmentDate.toLocaleString(isThai ? 'th-TH' : 'en-US');
    return this.success(isThai ? "จองนัดหมายสำเร็จ" : "Appointment booked successfully", {
      description: isThai ? `นัดหมายของคุณคือวันที่ ${dateStr}` : `Your appointment is scheduled for ${dateStr}`,
      action: {
        label: isThai ? "ดูรายละเอียด" : "View",
        onClick: onViewClick,
      },
      duration: 6000,
    });
  }

  /**
   * Program plan created notification
   */
  programPlanCreated(planId: string, onViewClick: () => void, locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "สร้างแผนงานสำเร็จ" : "Program plan created", {
      description: isThai ? "แผนงานการดูแลผิวส่วนบุคคลของคุณพร้อมแล้ว" : "Your personalized skin care plan is ready",
      action: {
        label: isThai ? "ดูแผนงาน" : "View Plan",
        onClick: onViewClick,
      },
      duration: 5000,
    });
  }

  /**
   * Profile updated notification
   */
  profileUpdated(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "อัปเดตโปรไฟล์สำเร็จ" : "Profile updated", {
      description: isThai ? "ข้อมูลโปรไฟล์ของคุณถูกบันทึกแล้ว" : "Your profile information has been saved",
      duration: 3000,
    });
  }

  /**
   * Settings saved notification
   */
  settingsSaved(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    return this.success(isThai ? "บันทึกการตั้งค่าแล้ว" : "Settings saved", {
      description: isThai ? "การตั้งค่าของคุณถูกนำไปใช้แล้ว" : "Your settings have been applied",
      duration: 3000,
    });
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
    const isThai = loc === "th";
    const message = isThai ? "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" : "Unable to connect to server";
    
    return this.error(message, {
      action: onRetry
        ? {
            label: isThai ? "ลองอีกครั้ง" : "Retry",
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
    const isThai = loc === "th";
    const message = isThai ? "ไม่สามารถอัปโหลดรูปภาพได้" : "Unable to upload image";

    return this.error(message, {
      action: onRetry
        ? {
            label: isThai ? "ลองอีกครั้ง" : "Retry",
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
    const isThai = loc === "th";
    const message = isThai ? "ไม่สามารถบันทึกข้อมูลได้" : "Unable to save data";

    return this.error(message, {
      action: onRetry
        ? {
            label: isThai ? "ลองอีกครั้ง" : "Retry",
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
    const isThai = loc === "th";
    const message = isThai ? "ไม่สามารถโหลดข้อมูลได้" : "Unable to load data";

    return this.error(message, {
      action: onRetry
        ? {
            label: isThai ? "ลองอีกครั้ง" : "Retry",
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
    const isThai = loc === "th";
    const message = isThai ? "กรุณาเข้าสู่ระบบก่อน" : "Please login first";

    return this.error(message, {
      action: onLogin
        ? {
            label: isThai ? "เข้าสู่ระบบ" : "Login",
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
    const isThai = loc === "th";
    const message = isThai ? "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" : "You don't have permission to access this data";
    
    return this.error(message);
  }

  // ============================================
  // Common Warning Notifications
  // ============================================

  /**
   * Unsaved changes warning
   */
  unsavedChanges(locale?: string, onSave?: () => void) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    const message = isThai ? "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" : "You have unsaved changes";

    return this.warning(message, {
      action: onSave
        ? {
            label: isThai ? "บันทึก" : "Save",
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
    const isThai = loc === "th";
    const message = isThai ? "การเชื่อมต่ออินเทอร์เน็ตช้า" : "Slow internet connection";
    
    return this.warning(message);
  }

  /**
   * Low quality warning
   */
  lowQuality(locale?: string, onReupload?: () => void) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    const message = isThai ? "คุณภาพของรูปภาพต่ำ" : "Low image quality";

    return this.warning(message, {
      action: onReupload
        ? {
            label: isThai ? "อัปโหลดใหม่" : "Re-upload",
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
    const isThai = loc === "th";
    const message = isThai ? "กำลังประมวลผล..." : "Processing...";
    
    return this.loading(message);
  }

  /**
   * Uploading info notification
   */
  uploading(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    const message = isThai ? "กำลังอัปโหลด..." : "Uploading...";
    
    return this.loading(message);
  }

  /**
   * Saving info notification
   */
  saving(locale?: string) {
    const loc = locale || this.defaultLocale;
    const isThai = loc === "th";
    const message = isThai ? "กำลังบันทึก..." : "Saving...";
    
    return this.loading(message);
  }
}

// Export singleton instance
export const NotificationManager = new NotificationManagerClass();

// Export type for external use
export type NotificationManager = NotificationManagerClass;
