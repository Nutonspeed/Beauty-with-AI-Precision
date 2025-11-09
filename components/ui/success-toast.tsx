"use client";

import { toast, type ExternalToast } from "sonner";
import { CheckCircle2, Eye, Download } from "lucide-react";

/**
 * Success Toast Component
 * Provides pre-configured success toasts with actions
 */

export interface SuccessToastAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface SuccessToastOptions extends ExternalToast {
  action?: SuccessToastAction;
  actions?: SuccessToastAction[];
  description?: string;
  duration?: number;
}

/**
 * Show a success toast with optional action buttons
 */
export function showSuccessToast(
  message: string,
  options?: SuccessToastOptions
) {
  const { action, actions, description, duration = 4000, ...restOptions } = options || {};

  return toast.success(message, {
    description,
    duration,
    icon: <CheckCircle2 className="h-5 w-5" />,
    action: action
      ? {
          label: (
            <span className="flex items-center gap-2">
              {action.icon}
              {action.label}
            </span>
          ),
          onClick: action.onClick,
        }
      : undefined,
    ...restOptions,
  });
}

/**
 * Analysis saved success toast with view action
 */
export function showAnalysisSavedToast(
  analysisId: string,
  onViewClick: () => void,
  locale: string = "th"
) {
  const messages = {
    th: {
      title: "บันทึกผลการวิเคราะห์สำเร็จ",
      description: "ระบบได้บันทึกผลการวิเคราะห์ผิวหน้าของคุณเรียบร้อยแล้ว",
      action: "ดูผลลัพธ์",
    },
    en: {
      title: "Analysis Saved Successfully",
      description: "Your skin analysis has been saved successfully",
      action: "View Results",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    action: {
      label: msg.action,
      onClick: onViewClick,
      icon: <Eye className="h-4 w-4" />,
    },
    duration: 5000,
  });
}

/**
 * Upload success toast
 */
export function showUploadSuccessToast(locale: string = "th") {
  const messages = {
    th: {
      title: "อัปโหลดรูปภาพสำเร็จ",
      description: "กำลังเริ่มวิเคราะห์ผิวหน้าของคุณ",
    },
    en: {
      title: "Image Uploaded Successfully",
      description: "Starting skin analysis...",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    duration: 3000,
  });
}

/**
 * Export success toast with download action
 */
export function showExportSuccessToast(
  onDownloadClick: () => void,
  locale: string = "th"
) {
  const messages = {
    th: {
      title: "ส่งออกข้อมูลสำเร็จ",
      description: "ไฟล์พร้อมดาวน์โหลดแล้ว",
      action: "ดาวน์โหลด",
    },
    en: {
      title: "Export Successful",
      description: "Your file is ready to download",
      action: "Download",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    action: {
      label: msg.action,
      onClick: onDownloadClick,
      icon: <Download className="h-4 w-4" />,
    },
  });
}

/**
 * Share success toast
 */
export function showShareSuccessToast(locale: string = "th") {
  const messages = {
    th: {
      title: "แชร์สำเร็จ",
      description: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว",
    },
    en: {
      title: "Shared Successfully",
      description: "Link copied to clipboard",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    duration: 3000,
  });
}

/**
 * Appointment booked success toast
 */
export function showAppointmentBookedToast(
  appointmentDate: Date,
  onViewClick: () => void,
  locale: string = "th"
) {
  const messages = {
    th: {
      title: "จองนัดหมายสำเร็จ",
      description: (date: Date) =>
        `นัดหมายของคุณได้รับการยืนยันแล้ว: ${date.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      action: "ดูรายละเอียด",
    },
    en: {
      title: "Appointment Booked Successfully",
      description: (date: Date) =>
        `Your appointment is confirmed for: ${date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      action: "View Details",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description(appointmentDate),
    action: {
      label: msg.action,
      onClick: onViewClick,
      icon: <Eye className="h-4 w-4" />,
    },
    duration: 6000,
  });
}

/**
 * Treatment plan created success toast
 */
export function showTreatmentPlanCreatedToast(
  planId: string,
  onViewClick: () => void,
  locale: string = "th"
) {
  const messages = {
    th: {
      title: "สร้างแผนการรักษาสำเร็จ",
      description: "แผนการรักษาส่วนบุคคลของคุณพร้อมใช้งานแล้ว",
      action: "ดูแผนการรักษา",
    },
    en: {
      title: "Treatment Plan Created Successfully",
      description: "Your personalized treatment plan is ready",
      action: "View Plan",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    action: {
      label: msg.action,
      onClick: onViewClick,
      icon: <Eye className="h-4 w-4" />,
    },
    duration: 5000,
  });
}

/**
 * Profile updated success toast
 */
export function showProfileUpdatedToast(locale: string = "th") {
  const messages = {
    th: {
      title: "อัปเดตโปรไฟล์สำเร็จ",
      description: "ข้อมูลของคุณได้รับการอัปเดตแล้ว",
    },
    en: {
      title: "Profile Updated Successfully",
      description: "Your information has been updated",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    duration: 3000,
  });
}

/**
 * Settings saved success toast
 */
export function showSettingsSavedToast(locale: string = "th") {
  const messages = {
    th: {
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "การตั้งค่าของคุณได้รับการบันทึกแล้ว",
    },
    en: {
      title: "Settings Saved Successfully",
      description: "Your settings have been saved",
    },
  };

  const msg = messages[locale as keyof typeof messages] || messages.th;

  return showSuccessToast(msg.title, {
    description: msg.description,
    duration: 3000,
  });
}

/**
 * Custom success toast with multiple actions
 */
export function showCustomSuccessToast(
  message: string,
  actions: SuccessToastAction[],
  description?: string,
  duration: number = 5000
) {
  // Sonner doesn't support multiple actions natively,
  // so we'll show the first action in the toast and log others
  const primaryAction = actions[0];

  if (actions.length > 1) {
    console.warn("Multiple actions provided, only the first one will be shown in the toast");
  }

  return showSuccessToast(message, {
    description,
    action: primaryAction,
    duration,
  });
}
