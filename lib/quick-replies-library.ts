/**
 * Quick Replies Library for Sales Chat
 * Pre-written Thai messages categorized by scenario
 */

export type QuickReplyCategory = 
  | 'greetings' 
  | 'program_info' 
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
    name: 'quickReplies.categories.greetings',
    emoji: '👋',
    description: 'Greeting messages'
  },
  {
    id: 'program_info',
    name: 'quickReplies.categories.program_info',
    emoji: '💆',
    description: 'Program information'
  },
  {
    id: 'booking',
    name: 'quickReplies.categories.booking',
    emoji: '📅',
    description: 'Booking and scheduling'
  },
  {
    id: 'pricing',
    name: 'quickReplies.categories.pricing',
    emoji: '💰',
    description: 'Pricing and packages'
  },
  {
    id: 'objections',
    name: 'quickReplies.categories.objections',
    emoji: '💡',
    description: 'Handling objections'
  },
  {
    id: 'follow_up',
    name: 'quickReplies.categories.follow_up',
    emoji: '📞',
    description: 'Follow-up messages'
  }
];

// Pre-defined quick replies
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  // Greetings (5)
  {
    id: 'greeting_1',
    text: 'quickReplies.items.greeting_1',
    category: 'greetings',
    emoji: '👋'
  },
  {
    id: 'greeting_2',
    text: 'quickReplies.items.greeting_2',
    category: 'greetings',
    emoji: '🙏'
  },
  {
    id: 'greeting_3',
    text: 'quickReplies.items.greeting_3',
    category: 'greetings',
    emoji: '✨'
  },
  {
    id: 'greeting_4',
    text: 'quickReplies.items.greeting_4',
    category: 'greetings',
    emoji: '💕'
  },
  {
    id: 'greeting_5',
    text: 'quickReplies.items.greeting_5',
    category: 'greetings',
    emoji: '👋'
  },

  // Program Info (6)
  {
    id: 'program_1',
    text: 'quickReplies.items.program_1',
    category: 'program_info',
    emoji: '💆'
  },
  {
    id: 'program_2',
    text: 'quickReplies.items.program_2',
    category: 'program_info',
    emoji: '⏰'
  },
  {
    id: 'program_3',
    text: 'quickReplies.items.program_3',
    category: 'program_info',
    emoji: '📈'
  },
  {
    id: 'program_4',
    text: 'quickReplies.items.program_4',
    category: 'program_info',
    emoji: '📝'
  },
  {
    id: 'program_5',
    text: 'quickReplies.items.program_5',
    category: 'program_info',
    emoji: '🏥'
  },
  {
    id: 'program_6',
    text: 'quickReplies.items.program_6',
    category: 'program_info',
    emoji: '🎯'
  },

  // Booking (4)
  {
    id: 'booking_1',
    text: 'quickReplies.items.booking_1',
    category: 'booking',
    emoji: '📅'
  },
  {
    id: 'booking_2',
    text: 'quickReplies.items.booking_2',
    category: 'booking',
    emoji: '⚡'
  },
  {
    id: 'booking_3',
    text: 'quickReplies.items.booking_3',
    category: 'booking',
    emoji: '✅'
  },
  {
    id: 'booking_4',
    text: 'quickReplies.items.booking_4',
    category: 'booking',
    emoji: '🔄'
  },

  // Pricing (4)
  {
    id: 'pricing_1',
    text: 'quickReplies.items.pricing_1',
    category: 'pricing',
    emoji: '💰'
  },
  {
    id: 'pricing_2',
    text: 'quickReplies.items.pricing_2',
    category: 'pricing',
    emoji: '💵'
  },
  {
    id: 'pricing_3',
    text: 'quickReplies.items.pricing_3',
    category: 'pricing',
    emoji: '💳'
  },
  {
    id: 'pricing_4',
    text: 'quickReplies.items.pricing_4',
    category: 'pricing',
    emoji: '⏳'
  },

  // Objection Handling (4)
  {
    id: 'objection_1',
    text: 'quickReplies.items.objection_1',
    category: 'objections',
    emoji: '💙'
  },
  {
    id: 'objection_2',
    text: 'quickReplies.items.objection_2',
    category: 'objections',
    emoji: '✅'
  },
  {
    id: 'objection_3',
    text: 'quickReplies.items.objection_3',
    category: 'objections',
    emoji: '🏆'
  },
  {
    id: 'objection_4',
    text: 'quickReplies.items.objection_4',
    category: 'objections',
    emoji: '🏥'
  },

  // Follow-up (4)
  {
    id: 'followup_1',
    text: 'quickReplies.items.followup_1',
    category: 'follow_up',
    emoji: '📞'
  },
  {
    id: 'followup_2',
    text: 'quickReplies.items.followup_2',
    category: 'follow_up',
    emoji: '⏰'
  },
  {
    id: 'followup_3',
    text: 'quickReplies.items.followup_3',
    category: 'follow_up',
    emoji: '🎁'
  },
  {
    id: 'followup_4',
    text: 'quickReplies.items.followup_4',
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
