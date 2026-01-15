/**
 * Tutorial Step Configuration
 * Defines step-by-step tutorials for main features
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  element: string; // CSS selector
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  action?: 'click' | 'hover' | 'scroll';
  highlightPadding?: number;
}

/**
 * Analysis Page Tutorial
 * Guides user through photo upload → analysis process
 * Note: Results viewing happens on a separate page after analysis
 */
export const analysisTutorialSteps: TutorialStep[] = [
  {
    id: 'analysis-welcome',
    title: 'tutorials.analysis.welcome.title',
    description: 'tutorials.analysis.welcome.description',
    element: 'body',
    position: 'center',
  },
  {
    id: 'analysis-upload',
    title: 'tutorials.analysis.upload.title',
    description: 'tutorials.analysis.upload.description',
    element: '[data-tour="upload-button"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'analysis-photo-tips',
    title: 'tutorials.analysis.photoTips.title',
    description: 'tutorials.analysis.photoTips.description',
    element: '[data-tour="photo-tips"]',
    position: 'bottom',
    highlightPadding: 15,
  },
  {
    id: 'analysis-start',
    title: 'tutorials.analysis.start.title',
    description: 'tutorials.analysis.start.description',
    element: '[data-tour="analyze-button"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
];

/**
 * AR Simulator Tutorial
 * Guides user through AR controls → program selection → intensity adjustment
 */
export const arTutorialSteps: TutorialStep[] = [
  {
    id: 'ar-welcome',
    title: 'tutorials.ar.welcome.title',
    description: 'tutorials.ar.welcome.description',
    element: 'body',
    position: 'center',
  },
  {
    id: 'ar-upload',
    title: 'tutorials.ar.upload.title',
    description: 'tutorials.ar.upload.description',
    element: '[data-tour="ar-upload"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'ar-controls',
    title: 'tutorials.ar.controls.title',
    description: 'tutorials.ar.controls.description',
    element: '[data-tour="ar-canvas"]',
    position: 'right',
    highlightPadding: 20,
  },
  {
    id: 'ar-programs',
    title: 'tutorials.ar.programs.title',
    description: 'tutorials.ar.programs.description',
    element: '[data-tour="program-selector"]',
    position: 'left',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'ar-intensity',
    title: 'tutorials.ar.intensity.title',
    description: 'tutorials.ar.intensity.description',
    element: '[data-tour="intensity-slider"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    id: 'ar-compare',
    title: 'tutorials.ar.compare.title',
    description: 'tutorials.ar.compare.description',
    element: '[data-tour="compare-toggle"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'ar-save',
    title: 'tutorials.ar.save.title',
    description: 'tutorials.ar.save.description',
    element: '[data-tour="save-button"]',
    position: 'top',
    highlightPadding: 10,
  },
];

/**
 * Booking Page Tutorial
 * Guides user through center selection → date/time → confirmation
 */
export const bookingTutorialSteps: TutorialStep[] = [
  {
    id: 'booking-welcome',
    title: 'tutorials.booking.welcome.title',
    description: 'tutorials.booking.welcome.description',
    element: 'body',
    position: 'center',
  },
  {
    id: 'booking-center',
    title: 'tutorials.booking.center.title',
    description: 'tutorials.booking.center.description',
    element: '[data-tour="center-list"]',
    position: 'right',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'booking-service',
    title: 'tutorials.booking.service.title',
    description: 'tutorials.booking.service.description',
    element: '[data-tour="service-selector"]',
    position: 'left',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'booking-date',
    title: 'tutorials.booking.date.title',
    description: 'tutorials.booking.date.description',
    element: '[data-tour="date-picker"]',
    position: 'top',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-time',
    title: 'tutorials.booking.time.title',
    description: 'tutorials.booking.time.description',
    element: '[data-tour="time-slots"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-confirm',
    title: 'tutorials.booking.confirm.title',
    description: 'tutorials.booking.confirm.description',
    element: '[data-tour="confirm-button"]',
    position: 'top',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-history',
    title: 'tutorials.booking.history.title',
    description: 'tutorials.booking.history.description',
    element: '[data-tour="booking-history"]',
    position: 'left',
    highlightPadding: 10,
  },
];

/**
 * Tutorial Configuration Type
 */
export type TutorialType = 'analysis' | 'ar-simulator' | 'booking';

/**
 * Get tutorial steps by type
 */
export function getTutorialSteps(type: TutorialType): TutorialStep[] {
  switch (type) {
    case 'analysis':
      return analysisTutorialSteps;
    case 'ar-simulator':
      return arTutorialSteps;
    case 'booking':
      return bookingTutorialSteps;
    default:
      return [];
  }
}
