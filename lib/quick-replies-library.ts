/**
 * Quick Replies Library for Sales Chat
 * Pre-written Thai messages categorized by scenario
 */

export type QuickReplyCategory = 
  | 'greetings' 
  | 'treatment_info' 
  | 'booking' 
  | 'pricing' 
  | 'objections' 
  | 'follow_up';

export interface QuickReplyCategoryInfo {
  id: QuickReplyCategory;
  name: string;
  emoji: string;
  description: string;
}

export interface QuickReply {
  id: string;
  text: string;
  category: QuickReplyCategory;
  emoji?: string;
  isCustom?: boolean; // User-created custom reply
}

// Category definitions
export const QUICK_REPLY_CATEGORIES: QuickReplyCategoryInfo[] = [
  {
    id: 'greetings',
    name: 'ทักทาย',
    emoji: '👋',
    description: 'Greeting messages'
  },
  {
    id: 'treatment_info',
    name: 'ข้อมูลทรีตเมนต์',
    emoji: '💆',
    description: 'Treatment information'
  },
  {
    id: 'booking',
    name: 'นัดหมาย',
    emoji: '📅',
    description: 'Booking and scheduling'
  },
  {
    id: 'pricing',
    name: 'ราคา',
    emoji: '💰',
    description: 'Pricing and packages'
  },
  {
    id: 'objections',
    name: 'ตอบข้อกังวล',
    emoji: '💡',
    description: 'Handling objections'
  },
  {
    id: 'follow_up',
    name: 'ติดตามผล',
    emoji: '📞',
    description: 'Follow-up messages'
  }
];

// Pre-defined quick replies
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  // Greetings (5)
  {
    id: 'greeting_1',
    text: 'สวัสดีค่ะ ยินดีให้คำปรึกษาค่ะ 😊',
    category: 'greetings',
    emoji: '👋'
  },
  {
    id: 'greeting_2',
    text: 'สวัสดีค่ะคุณลูกค้า มีอะไรให้ช่วยไหมคะ?',
    category: 'greetings',
    emoji: '🙏'
  },
  {
    id: 'greeting_3',
    text: 'ขอบคุณที่ทำ Skin Analysis กับเราค่ะ ผลออกมาดีมากเลยค่ะ ✨',
    category: 'greetings',
    emoji: '✨'
  },
  {
    id: 'greeting_4',
    text: 'ยินดีต้อนรับค่ะ! เห็นว่าคุณสนใจดูแลผิวใช่ไหมคะ?',
    category: 'greetings',
    emoji: '💕'
  },
  {
    id: 'greeting_5',
    text: 'สวัสดีค่ะ พอดีเห็นคุณออนไลน์อยู่เลยติดต่อมาค่ะ 😊',
    category: 'greetings',
    emoji: '🟢'
  },

  // Treatment Info (6)
  {
    id: 'treatment_1',
    text: 'จากผล AI Analysis ของคุณ แนะนำให้ทำ Laser Treatment ค่ะ จะช่วยแก้ปัญหาริ้วรอยและรอยด่างดำได้ดีมากค่ะ',
    category: 'treatment_info',
    emoji: '💆'
  },
  {
    id: 'treatment_2',
    text: 'ทรีตเมนต์นี้ใช้เวลาประมาณ 45-60 นาทีค่ะ ไม่เจ็บ ไม่มีแผล กลับบ้านได้เลย',
    category: 'treatment_info',
    emoji: '⏰'
  },
  {
    id: 'treatment_3',
    text: 'ผลจะเห็นได้ชัดภายใน 2-3 สัปดาห์ค่ะ แล้วจะดีขึ้นเรื่อยๆ ค่ะ',
    category: 'treatment_info',
    emoji: '📈'
  },
  {
    id: 'treatment_4',
    text: 'ขั้นตอนคือ: 1) ทำความสะอาดผิว 2) ทา Serum 3) ทำ Laser 4) ทา Mask เย็นๆ สบายมากเลยค่ะ',
    category: 'treatment_info',
    emoji: '📝'
  },
  {
    id: 'treatment_5',
    text: 'เทคโนโลยีของเรามาจากเกาหลี ปลอดภัย ได้รับมาตรฐาน FDA ค่ะ',
    category: 'treatment_info',
    emoji: '🏥'
  },
  {
    id: 'treatment_6',
    text: 'แนะนำให้ทำ 3-5 ครั้งค่ะ ห่างกัน 2-3 สัปดาห์ ผลจะคงทนและดีที่สุดค่ะ',
    category: 'treatment_info',
    emoji: '🎯'
  },

  // Booking (4)
  {
    id: 'booking_1',
    text: 'สะดวกวันไหนคะ? เรามีช่วงเช้า 10:00-12:00 หรือบ่าย 14:00-18:00 ค่ะ',
    category: 'booking',
    emoji: '📅'
  },
  {
    id: 'booking_2',
    text: 'วันนี้ยังมีที่ว่างช่วงบ่ายค่ะ จะจองไว้ให้เลยไหมคะ?',
    category: 'booking',
    emoji: '⚡'
  },
  {
    id: 'booking_3',
    text: 'จองเรียบร้อยแล้วค่ะ! วันพุธที่ 2 พ.ย. เวลา 14:00 น. จะส่ง SMS เตือนให้อีกครั้งค่ะ 📱',
    category: 'booking',
    emoji: '✅'
  },
  {
    id: 'booking_4',
    text: 'ถ้าต้องการเลื่อนนัด แจ้งล่วงหน้า 24 ชม. นะคะ สามารถโทรมาได้ตลอดเลยค่ะ ☎️',
    category: 'booking',
    emoji: '🔄'
  },

  // Pricing (4)
  {
    id: 'pricing_1',
    text: 'แพ็คเกจ 3 ครั้ง ปกติ 45,000฿ ตอนนี้โปรโมชั่นพิเศษเหลือ 29,900฿ ค่ะ (ประหยัด 33%! 🎉)',
    category: 'pricing',
    emoji: '💰'
  },
  {
    id: 'pricing_2',
    text: 'ทำครั้งเดียว 15,000฿ ค่ะ แต่ซื้อแพ็คเกจจะคุ้มกว่ามากเลยค่ะ 😊',
    category: 'pricing',
    emoji: '💵'
  },
  {
    id: 'pricing_3',
    text: 'รับบัตรเครดิต 0% นาน 3-6 เดือนค่ะ หรือแบ่งจ่ายผ่าน TrueMoney Wallet ก็ได้ค่ะ',
    category: 'pricing',
    emoji: '💳'
  },
  {
    id: 'pricing_4',
    text: 'โปรนี้เหลือถึงสิ้นเดือนนี้เท่านั้นนะคะ หลังจากนี้กลับไปราคาปกติเลยค่ะ ⏰',
    category: 'pricing',
    emoji: '⏳'
  },

  // Objection Handling (4)
  {
    id: 'objection_1',
    text: 'เข้าใจค่ะ ถ้าไม่สะดวกตอนนี้ รอพร้อมแล้วค่อยติดต่อกลับมาได้เลยนะคะ เรายินดีให้คำปรึกษาตลอดค่ะ 😊',
    category: 'objections',
    emoji: '💙'
  },
  {
    id: 'objection_2',
    text: 'ไม่ต้องกังวลค่ะ! ถ้าผลไม่ดีตามที่เราบอก เรารับประกันเงินคืน 100% เลยค่ะ (มั่นใจในคุณภาพมากๆ! 💪)',
    category: 'objections',
    emoji: '✅'
  },
  {
    id: 'objection_3',
    text: 'ปลอดภัยแน่นอนค่ะ! มีหมอผิวหนังคอยดูแลตลอด + เครื่องมือได้มาตรฐานสากล ลูกค้าเก่า 1,000+ คน ไม่มีใครมีปัญหาเลยค่ะ',
    category: 'objections',
    emoji: '🏆'
  },
  {
    id: 'objection_4',
    text: 'มาดูคลินิกก่อนก็ได้ค่ะ ไม่มีค่าใช้จ่าย พูดคุยกับหมอ ดูผลงานจริง แล้วค่อยตัดสินใจค่ะ วันนี้สะดวกไหมคะ?',
    category: 'objections',
    emoji: '🏥'
  },

  // Follow-up (4)
  {
    id: 'followup_1',
    text: 'ติดตามผลค่ะ ทำทรีตเมนต์ไปแล้วรู้สึกยังไงบ้างคะ? ผิวดีขึ้นไหมคะ? 😊',
    category: 'follow_up',
    emoji: '📞'
  },
  {
    id: 'followup_2',
    text: 'สัปดาห์หน้าถึงเวลานัดครั้งต่อไปแล้วค่ะ จะจองวันไหนดีคะ?',
    category: 'follow_up',
    emoji: '⏰'
  },
  {
    id: 'followup_3',
    text: 'วันนี้เรามีโปรพิเศษแค่วันเดียว! Flash Sale 50% สำหรับลูกค้าเก่าเท่านั้น สนใจไหมคะ? ⚡',
    category: 'follow_up',
    emoji: '🎁'
  },
  {
    id: 'followup_4',
    text: 'อยากทราบความคิดเห็นค่ะ ถ้าพอใจกับบริการ ช่วยรีวิวให้หน่อยได้ไหมคะ? จะเป็นกำลังใจมากเลยค่ะ 💕',
    category: 'follow_up',
    emoji: '⭐'
  }
];

// Local storage key for custom replies
const CUSTOM_REPLIES_KEY = 'ai367bar_custom_quick_replies';

/**
 * Get all quick replies (default + custom)
 */
export function getAllQuickReplies(): QuickReply[] {
  const customReplies = getCustomQuickReplies();
  return [...DEFAULT_QUICK_REPLIES, ...customReplies];
}

/**
 * Get quick replies by category
 */
export function getQuickRepliesByCategory(category: QuickReplyCategory): QuickReply[] {
  const allReplies = getAllQuickReplies();
  return allReplies.filter(reply => reply.category === category);
}

/**
 * Get custom quick replies from localStorage
 */
export function getCustomQuickReplies(): QuickReply[] {
  if (typeof globalThis.window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_REPLIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[QuickReplies] Error loading custom replies:', error);
    return [];
  }
}

/**
 * Save custom quick reply
 */
export function saveCustomQuickReply(text: string, category: QuickReplyCategory, emoji?: string): QuickReply {
  const customReplies = getCustomQuickReplies();
  
  const newReply: QuickReply = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    text,
    category,
    emoji,
    isCustom: true
  };
  
  const updated = [...customReplies, newReply];
  
  try {
    localStorage.setItem(CUSTOM_REPLIES_KEY, JSON.stringify(updated));
    console.log('[QuickReplies] Custom reply saved:', newReply);
  } catch (error) {
    console.error('[QuickReplies] Error saving custom reply:', error);
  }
  
  return newReply;
}

/**
 * Delete custom quick reply
 */
export function deleteCustomQuickReply(id: string): void {
  const customReplies = getCustomQuickReplies();
  const updated = customReplies.filter(reply => reply.id !== id);
  
  try {
    localStorage.setItem(CUSTOM_REPLIES_KEY, JSON.stringify(updated));
    console.log('[QuickReplies] Custom reply deleted:', id);
  } catch (error) {
    console.error('[QuickReplies] Error deleting custom reply:', error);
  }
}

/**
 * Search quick replies
 */
export function searchQuickReplies(query: string): QuickReply[] {
  if (!query.trim()) return getAllQuickReplies();
  
  const allReplies = getAllQuickReplies();
  const lowerQuery = query.toLowerCase();
  
  return allReplies.filter(reply => 
    reply.text.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get category info
 */
export function getCategoryInfo(categoryId: QuickReplyCategory): QuickReplyCategoryInfo | undefined {
  return QUICK_REPLY_CATEGORIES.find(cat => cat.id === categoryId);
}
