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
    title: 'ยินดีต้อนรับสู่การวิเคราะห์ผิว',
    description: 'ระบบจะแนะนำคุณทีละขั้นตอนในการวิเคราะห์ผิวหน้าด้วย AI ที่แม่นยำ อัปโหลดรูป → ดูเคล็ดลับ → กดวิเคราะห์',
    element: 'body',
    position: 'center',
  },
  {
    id: 'analysis-upload',
    title: 'ขั้นตอนที่ 1: อัปโหลดรูปภาพ',
    description: 'คลิกที่นี่เพื่ออัปโหลดรูปภาพใบหน้าของคุณ แนะนำให้ถ่ายในที่ที่มีแสงสว่างเพียงพอ',
    element: '[data-tour="upload-button"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'analysis-photo-tips',
    title: 'ขั้นตอนที่ 2: เคล็ดลับการถ่ายภาพ',
    description: 'อ่านคำแนะนำ: ใบหน้าอยู่ตรงกลาง, แสงสว่างพอดี, ไม่มีแว่นตา, สีหน้าเป็นกลาง',
    element: '[data-tour="photo-tips"]',
    position: 'bottom',
    highlightPadding: 15,
  },
  {
    id: 'analysis-start',
    title: 'ขั้นตอนที่ 3: เริ่มวิเคราะห์',
    description: 'คลิกปุ่มนี้เพื่อเริ่มวิเคราะห์ด้วย AI (ใช้เวลา 5-10 วินาที)',
    element: '[data-tour="analyze-button"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
];

/**
 * AR Simulator Tutorial
 * Guides user through AR controls → treatment selection → intensity adjustment
 */
export const arTutorialSteps: TutorialStep[] = [
  {
    id: 'ar-welcome',
    title: 'ยินดีต้อนรับสู่ AR Simulator',
    description: 'ลองดูผลลัพธ์การรักษาแบบ Before/After ด้วยเทคโนโลยี AR แบบ 360 องศา',
    element: 'body',
    position: 'center',
  },
  {
    id: 'ar-upload',
    title: 'อัปโหลดรูปภาพ',
    description: 'อัปโหลดรูปภาพของคุณเพื่อเห็นผลการรักษาแบบ Real-time',
    element: '[data-tour="ar-upload"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'ar-controls',
    title: 'การควบคุม 3D',
    description: 'ลากเพื่อหมุนดูมุมต่างๆ, ซูมเข้า-ออกได้, ดูได้ทุกมุม 360 องศา',
    element: '[data-tour="ar-canvas"]',
    position: 'right',
    highlightPadding: 20,
  },
  {
    id: 'ar-treatments',
    title: 'เลือกประเภทการรักษา',
    description: 'เลือกประเภทการรักษาที่สนใจ: Botox, Filler, Laser, Thread Lift, PRP, Acne Treatment',
    element: '[data-tour="treatment-selector"]',
    position: 'left',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'ar-intensity',
    title: 'ปรับระดับความเข้ม',
    description: 'เลื่อนแถบเพื่อดูผลลัพธ์ในระดับความเข้มต่างๆ (เบา, กลาง, เข้ม)',
    element: '[data-tour="intensity-slider"]',
    position: 'top',
    highlightPadding: 10,
  },
  {
    id: 'ar-compare',
    title: 'เปรียบเทียบ Before/After',
    description: 'สลับดู Before/After เพื่อเห็นความแตกต่างอย่างชัดเจน',
    element: '[data-tour="compare-toggle"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'ar-save',
    title: 'บันทึกผลลัพธ์',
    description: 'บันทึกผลลัพธ์ที่ชอบเพื่อนำไปปรึกษากับคลินิก',
    element: '[data-tour="save-button"]',
    position: 'top',
    highlightPadding: 10,
  },
];

/**
 * Booking Page Tutorial
 * Guides user through clinic selection → date/time → confirmation
 */
export const bookingTutorialSteps: TutorialStep[] = [
  {
    id: 'booking-welcome',
    title: 'ยินดีต้อนรับสู่ระบบจองนัดหมาย',
    description: 'จองนัดหมายกับคลินิกได้ง่ายๆ ใน 3 ขั้นตอน',
    element: 'body',
    position: 'center',
  },
  {
    id: 'booking-clinic',
    title: 'เลือกคลินิก',
    description: 'เลือกคลินิกที่คุณต้องการ ดูรีวิว, ที่อยู่, และบริการที่ให้',
    element: '[data-tour="clinic-list"]',
    position: 'right',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'booking-service',
    title: 'เลือกบริการ',
    description: 'เลือกบริการที่ต้องการ เช่น ฉีด Botox, Filler, รักษาสิว, Laser',
    element: '[data-tour="service-selector"]',
    position: 'left',
    action: 'click',
    highlightPadding: 15,
  },
  {
    id: 'booking-date',
    title: 'เลือกวันที่',
    description: 'เลือกวันที่ที่ต้องการจองนัดหมาย (ดูวันว่างได้จากปฏิทิน)',
    element: '[data-tour="date-picker"]',
    position: 'top',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-time',
    title: 'เลือกเวลา',
    description: 'เลือกช่วงเวลาที่สะดวก (เฉพาะช่วงเวลาที่ว่างเท่านั้น)',
    element: '[data-tour="time-slots"]',
    position: 'bottom',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-confirm',
    title: 'ยืนยันการจอง',
    description: 'ตรวจสอบข้อมูลและยืนยันการจอง คุณจะได้รับการแจ้งเตือนทาง Email และ LINE',
    element: '[data-tour="confirm-button"]',
    position: 'top',
    action: 'click',
    highlightPadding: 10,
  },
  {
    id: 'booking-history',
    title: 'ประวัติการจอง',
    description: 'ดูประวัติการจองทั้งหมด, ยกเลิกนัดหมาย, หรือแก้ไขนัดหมาย',
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
