"use client";

import { toast, type ExternalToast } from "sonner";
import { CheckCircle2, Eye, Download } from "lucide-react";
import { useTranslations } from "next-intl";

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

export function useSuccessToasts() {
  const t = useTranslations('toasts');

  const showSuccess = (
    message: string,
    options?: SuccessToastOptions
  ) => {
    const { action, actions, description, duration = 4000, ...restOptions } = options || {};

    return toast.success(message, {
      description,
      duration,
      icon: <CheckCircle2 className="size-6 text-emerald-500 shadow-glow-emerald" />,
      className: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-emerald-100/50 group-[.toaster]:shadow-premium group-[.toaster]:rounded-[2rem] group-[.toaster]:p-6",
      action: action
        ? {
            label: (
              <span className="flex items-center gap-2 font-black uppercase tracking-widest italic text-[10px]">
                {action.icon}
                {action.label}
              </span>
            ),
            onClick: action.onClick,
          }
        : undefined,
      ...restOptions,
    });
  };

  const showAnalysisSaved = (
    analysisId: string,
    onViewClick: () => void
  ) => {
    return showSuccess(t('analysisSaved.title'), {
      description: t('analysisSaved.description'),
      action: {
        label: t('analysisSaved.action'),
        onClick: onViewClick,
        icon: <Eye className="h-4 w-4" />,
      },
      duration: 5000,
    });
  };

  const showUploadSuccess = () => {
    return showSuccess(t('uploadSuccess.title'), {
      description: t('uploadSuccess.description'),
      duration: 3000,
    });
  };

  const showExportSuccess = (onDownloadClick: () => void) => {
    return showSuccess(t('exportSuccess.title'), {
      description: t('exportSuccess.description'),
      action: {
        label: t('exportSuccess.action'),
        onClick: onDownloadClick,
        icon: <Download className="h-4 w-4" />,
      },
    });
  };

  const showShareSuccess = () => {
    return showSuccess(t('shareSuccess.title'), {
      description: t('shareSuccess.description'),
      duration: 3000,
    });
  };

  const showAppointmentBooked = (
    appointmentDate: Date,
    onViewClick: () => void
  ) => {
    return showSuccess(t('appointmentBooked.title'), {
      description: t('appointmentBooked.description', {
        date: appointmentDate.toLocaleString()
      }),
      action: {
        label: t('appointmentBooked.action'),
        onClick: onViewClick,
        icon: <Eye className="h-4 w-4" />,
      },
      duration: 6000,
    });
  };

  const showProgramPlanCreated = (
    planId: string,
    onViewClick: () => void
  ) => {
    return showSuccess(t('programPlanCreated.title'), {
      description: t('programPlanCreated.description'),
      action: {
        label: t('programPlanCreated.action'),
        onClick: onViewClick,
        icon: <Eye className="h-4 w-4" />,
      },
      duration: 5000,
    });
  };

  const showProfileUpdated = () => {
    return showSuccess(t('profileUpdated.title'), {
      description: t('profileUpdated.description'),
      duration: 3000,
    });
  };

  const showSettingsSaved = () => {
    return showSuccess(t('settingsSaved.title'), {
      description: t('settingsSaved.description'),
      duration: 3000,
    });
  };

  return {
    showSuccess,
    showAnalysisSaved,
    showUploadSuccess,
    showExportSuccess,
    showShareSuccess,
    showAppointmentBooked,
    showProgramPlanCreated,
    showProfileUpdated,
    showSettingsSaved,
  };
}

export function showSuccessToast(
  message: string,
  options?: SuccessToastOptions
) {
  const { action, actions, description, duration = 4000, ...restOptions } = options || {};

  return toast.success(message, {
    description,
    duration,
    icon: <CheckCircle2 className="size-6 text-emerald-500 shadow-glow-emerald" />,
    className: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-emerald-100/50 group-[.toaster]:shadow-premium group-[.toaster]:rounded-[2rem] group-[.toaster]:p-6",
    action: action
      ? {
          label: (
            <span className="flex items-center gap-2 font-black uppercase tracking-widest italic text-[10px]">
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