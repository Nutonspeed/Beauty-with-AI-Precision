/**
 * Context-Aware Chat Manager (Task 5/7)
 * Intelligent conversation management with memory, Thai medical terms, and personalized responses
 */

import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis'

/**
 * Chat message with metadata
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    intent?: string
    confidence?: number
    relatedTopics?: string[]
    skinConcerns?: string[]
  }
}

/**
 * Conversation context
 */
export interface ConversationContext {
  userId: string
  messages: ChatMessage[]
  skinAnalysis?: HybridSkinAnalysis
  userProfile?: {
    name?: string
    age?: number
    budget?: number
    preferences?: string[]
    previousPrograms?: string[]
  }
  currentTopic?: string
  followUpSuggestions?: string[]
}

/**
 * Thai medical term dictionary
 */
const THAI_MEDICAL_TERMS: Record<string, string[]> = {
  // Skin concerns
  'melasma': ['ฝ้า', 'melasma', 'hyperpigmentation', 'dark spots', 'pigmentation'],
  'freckles': ['กระ', 'freckles', 'age spots', 'sun spots'],
  'acne': ['สิว', 'acne', 'pimples', 'breakout', 'blemish'],
  'acne_scar': ['รอยสิว', 'acne scar', 'post-acne marks', 'PIH', 'PIE'],
  'pores': ['รูขุมขน', 'pores', 'enlarged pores', 'open pores'],
  'wrinkles': ['ริ้วรอย', 'wrinkles', 'fine lines', 'aging lines'],
  'sagging': ['หย่อนคล้อย', 'sagging', 'drooping', 'loss of elasticity'],
  'dry_skin': ['ผิวแห้ง', 'dry skin', 'dehydration', 'flaky skin'],
  'oily_skin': ['ผิวมัน', 'oily skin', 'sebum', 'greasy skin'],
  'redness': ['ผิวแดง', 'redness', 'inflammation', 'erythema'],
  'dull_skin': ['ผิวหมองคล้ำ', 'dull skin', 'uneven tone', 'lackluster'],
  
  // Programs
  'botox': ['โบท็อกซ์', 'botox', 'botulinum toxin', 'neurotoxin'],
  'filler': ['ฟิลเลอร์', 'filler', 'dermal filler', 'HA filler', 'hyaluronic acid'],
  'laser': ['เลเซอร์', 'laser', 'laser program', 'laser therapy'],
  'pico': ['พีโค', 'pico', 'picosecond', 'pico laser'],
  'carbon': ['คาร์บอน', 'carbon', 'carbon peel', 'carbon laser'],
  'peel': ['ปอกหน้า', 'peel', 'chemical peel', 'facial peel'],
  'nitrogen': ['ไนโตรเจน', 'nitrogen', 'liquid nitrogen', 'cryotherapy'],
  'hifu': ['ไฮฟู', 'hifu', 'high-intensity focused ultrasound'],
  'ultherapy': ['อัลเทอร์ร่า', 'ultherapy', 'ulthera'],
  'thermage': ['เธอร์มาจ', 'thermage', 'radiofrequency'],
  'microneedling': ['ไมโครนีดดลิ้ง', 'microneedling', 'derma roller', 'needling'],
  'mesofat': ['เมโสแฟต', 'mesotherapy', 'meso', 'injection'],
  'hydrafacial': ['ไฮโดรเฟเชียล', 'hydrafacial', 'hydrodermabrasion'],
  
  // Ingredients
  'vitamin_c': ['วิตามินซี', 'vitamin c', 'ascorbic acid', 'L-ascorbic acid'],
  'retinol': ['เรตินอล', 'retinol', 'vitamin a', 'retinoid'],
  'niacinamide': ['ไนอะซินาไมด์', 'niacinamide', 'vitamin b3'],
  'hyaluronic': ['ไฮยาลูรอน', 'hyaluronic acid', 'HA', 'sodium hyaluronate'],
  'ceramide': ['เซรามายด์', 'ceramide', 'ceramides'],
  'peptide': ['เพปไทด์', 'peptide', 'peptides'],
  'arbutin': ['อาร์บูติน', 'arbutin', 'alpha-arbutin'],
  
  // Body parts
  'forehead': ['หน้าผาก', 'forehead'],
  'temple': ['ขมับ', 'temple', 'temporal area'],
  'crows_feet': ['หางตา', 'crow\'s feet', 'eye wrinkles'],
  'undereye': ['ใต้ตา', 'under eye', 'tear trough'],
  'cheek': ['แก้ม', 'cheek', 'cheekbone'],
  'nose': ['จมูก', 'nose', 'nasal'],
  'chin': ['คาง', 'chin', 'jawline'],
  'neck': ['ลำคอ', 'neck', 'neck area']
}

/**
 * Intent patterns
 */
const INTENT_PATTERNS = {
  'ask_program': [
    'ทำอะไร', 'รักษาอย่างไร', 'ทำยังไง', 'แนะนำ', 'ควรทำ', 'ช่วยแนะนำ',
    'program', 'cure', 'solve', 'fix'
  ],
  'ask_price': [
    'ราคา', 'ค่าใช้จ่าย', 'งบประมาณ', 'เท่าไหร่', 'ค่ารักษา',
    'price', 'cost', 'budget'
  ],
  'ask_safety': [
    'ปลอดภัย', 'อันตราย', 'ผลข้างเคียง', 'เสี่ยง', 'ภัยแทรกซ้อน',
    'safe', 'risk', 'side effect', 'complication'
  ],
  'ask_effectiveness': [
    'ได้ผล', 'ผลลัพธ์', 'ประสิทธิภาพ', 'ผลดี', 'ช่วยได้',
    'effective', 'result', 'outcome', 'work'
  ],
  'ask_downtime': [
    'พักฟื้น', 'ดาวน์ไทม์', 'หยุดงาน', 'ฟื้นตัว',
    'downtime', 'recovery', 'healing time'
  ],
  'compare_programs': [
    'เปรียบเทียบ', 'ต่างกัน', 'ดีกว่า', 'เลือก',
    'compare', 'difference', 'better', 'versus', 'vs'
  ],
  'greeting': [
    'สวัสดี', 'หวัดดี', 'ดีจ้า', 'ดีค่ะ', 'ดีครับ',
    'hello', 'hi', 'hey'
  ],
  'thanks': [
    'ขอบคุณ', 'ขอบใจ', 'แซงกิ้ว',
    'thank', 'thanks', 'appreciate'
  ]
}

/**
 * Context-Aware Chat Manager
 */
export class ContextAwareChatManager {
  private maxHistorySize = 50 // Keep last 50 messages
  private contextWindowSize = 10 // Use last 10 for AI context
  
  /**
   * Add message to conversation and update context
   */
  addMessage(
    context: ConversationContext,
    message: ChatMessage,
    locale: 'th' | 'en' = 'th'
  ): ConversationContext {
    // Add metadata
    const enrichedMessage = this.enrichMessage(message, context)
    
    // Add to history
    const updatedMessages = [...context.messages, enrichedMessage]
    
    // Keep only recent messages
    if (updatedMessages.length > this.maxHistorySize) {
      updatedMessages.splice(0, updatedMessages.length - this.maxHistorySize)
    }
    
    // Update topic
    const currentTopic = this.extractTopic(enrichedMessage, context)
    
    // Generate follow-up suggestions
    const followUpSuggestions = this.generateFollowUpSuggestions(
      enrichedMessage,
      context,
      locale
    )
    
    return {
      ...context,
      messages: updatedMessages,
      currentTopic,
      followUpSuggestions
    }
  }
  
  /**
   * Enrich message with metadata
   */
  private enrichMessage(
    message: ChatMessage,
    _context: ConversationContext
  ): ChatMessage {
    if (message.role !== 'user') {
      return message // Only enrich user messages
    }
    
    const content = message.content.toLowerCase()
    
    // Detect intent
    const intent = this.detectIntent(content)
    
    // Extract skin concerns mentioned
    const skinConcerns = this.extractSkinConcerns(content)
    
    // Find related topics from Thai medical terms
    const relatedTopics = this.findRelatedTopics(content)
    
    return {
      ...message,
      metadata: {
        intent,
        confidence: 0.8, // Basic confidence
        relatedTopics,
        skinConcerns
      }
    }
  }
  
  /**
   * Detect user intent from message
   */
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        return intent
      }
    }
    
    return 'general_question'
  }
  
  /**
   * Extract skin concerns from message
   */
  private extractSkinConcerns(message: string): string[] {
    const concerns: string[] = []
    
    for (const [thaiTerm, englishTerms] of Object.entries(THAI_MEDICAL_TERMS)) {
      if (message.includes(thaiTerm)) {
        concerns.push(thaiTerm)
      }
      // Also check English terms
      if (englishTerms.some(term => message.includes(term))) {
        concerns.push(thaiTerm)
      }
    }
    
    return [...new Set(concerns)] // Remove duplicates
  }
  
  /**
   * Find related topics from medical dictionary
   */
  private findRelatedTopics(message: string): string[] {
    const topics: string[] = []
    
    for (const [thaiTerm, englishTerms] of Object.entries(THAI_MEDICAL_TERMS)) {
      if (message.includes(thaiTerm) || 
          englishTerms.some(term => message.includes(term))) {
        topics.push(...englishTerms)
      }
    }
    
    return [...new Set(topics)].slice(0, 5) // Top 5 unique topics
  }
  
  /**
   * Extract current topic from conversation
   */
  private extractTopic(
    message: ChatMessage,
    context: ConversationContext
  ): string | undefined {
    // Use metadata if available
    if (message.metadata?.skinConcerns && message.metadata.skinConcerns.length > 0) {
      return message.metadata.skinConcerns[0]
    }
    
    // Fall back to previous topic
    return context.currentTopic
  }
  
  /**
   * Generate intelligent follow-up suggestions
   */
  private generateFollowUpSuggestions(
    message: ChatMessage,
    context: ConversationContext,
    locale: 'th' | 'en' = 'th'
  ): string[] {
    let suggestions: string[] = []
    const intent = message.metadata?.intent
    const concerns = message.metadata?.skinConcerns || []
    const isThai = locale === 'th'
    
    // Intent-based suggestions
    if (intent === 'ask_program') {
      suggestions = isThai ? [
        'ราคาประมาณเท่าไหร่?',
        'มีผลข้างเคียงไหม?',
        'พักฟื้นนานแค่ไหน?',
      ] : [
        'How much does it cost?',
        'Are there any side effects?',
        'How long is the recovery?',
      ];
    } else if (intent === 'ask_price') {
      suggestions = isThai ? [
        'ทำกี่ครั้งถึงเห็นผล?',
        'มีโปรโมชั่นไหม?',
        'ควรทำร่วมกับอะไร?',
      ] : [
        'How many sessions to see results?',
        'Are there any promotions?',
        'What should I combine this with?',
      ];
    } else if (intent === 'ask_safety') {
      suggestions = isThai ? [
        'ใครไม่ควรทำ?',
        'ต้องเตรียมตัวอย่างไร?',
        'หลังทำต้องดูแลอะไร?',
      ] : [
        'Who should avoid this?',
        'How should I prepare?',
        'What is the post-treatment care?',
      ];
    }
    
    // Concern-based suggestions
    if (concerns.includes('melasma') || concerns.includes('freckles')) {
      suggestions = [
        ...suggestions,
        isThai ? 'Pico Laser ช่วยได้ไหม?' : 'Can Pico Laser help?',
        isThai ? 'ครีมบำรุงที่ช่วยได้?' : 'Which skincare helps?',
      ];
    }
    if (concerns.includes('wrinkles')) {
      suggestions = [
        ...suggestions,
        isThai ? 'โบท็อกซ์กับฟิลเลอร์ต่างกันอย่างไร?' : 'What is the difference between Botox and Filler?',
        isThai ? 'Hifu ช่วยได้ไหม?' : 'Can Hifu help?',
      ];
    }
    
    // Skin analysis based suggestions
    if (context.skinAnalysis) {
      const cv = context.skinAnalysis.cv
      const additionalSuggestions: string[] = [];
      if (cv.spots && cv.spots.severity > 70) {
        additionalSuggestions.push(isThai ? 'มีฝ้ากระมาก แนะนำ program อะไร?' : 'I have many spots, what program do you recommend?');
      }
      if (cv.wrinkles && cv.wrinkles.severity > 70) {
        additionalSuggestions.push(isThai ? 'ริ้วรอยเยอะ ควรเริ่มจากอะไร?' : 'Many wrinkles, where should I start?');
      }
      suggestions = [...suggestions, ...additionalSuggestions];
    }
    
    // Default suggestions if none
    if (suggestions.length === 0) {
      suggestions = isThai ? [
        'ผิวฉันมีปัญหาอะไรบ้าง?',
        'แนะนำ program สำหรับฝ้า-กระ',
        'โบท็อกซ์กับฟิลเลอร์ต่างกันอย่างไร?'
      ] : [
        'What are my skin concerns?',
        'Recommend programs for melasma/freckles',
        'What is the difference between Botox and Filler?'
      ];
    }
    
    // Remove duplicates and limit to 5
    return [...new Set(suggestions)].slice(0, 5)
  }
  
  /**
   * Build AI prompt with full context
   */
  buildContextPrompt(
    userMessage: string,
    context: ConversationContext,
    locale: 'th' | 'en' = 'th'
  ): {
    systemPrompt: string
    conversationHistory: string
    currentMessage: string
  } {
    const isThai = locale === 'th'
    // System prompt
    const systemPrompt = isThai ? `คุณคือ "AI Beauty Advisor" ที่ปรึกษาด้านความงามผิวหน้าแบบมืออาชีพ

บทบาท:
- ให้คำแนะนำการรักษาผิวหน้าที่เชื่อถือได้
- ตอบเป็นภาษาไทยที่เป็นกันเอง เข้าใจง่าย
- จดจำบริบทการสนทนาก่อนหน้า
- เข้าใจคำศัพท์ทางการแพทย์ไทย
- ให้คำแนะนำที่เหมาะกับปัญหาผิวและงบประมาณ

ข้อจำกัด:
⚠️ ไม่วินิจฉัยโรค (ให้แพทย์ผิวหนังเท่านั้น)
⚠️ ไม่ระบุชื่อยี่ห้อยาหรือผลิตภัณฑ์เฉพาะ
✅ แนะนำให้ปรึกษาคลินิกถ้าปัญุหารุนแรง
✅ ให้ข้อมูลทั่วไปเกี่ยวกับ Program ต่างๆ` : `You are "AI Beauty Advisor", a professional facial beauty consultant.

Roles:
- Provide reliable skin treatment advice
- Respond in a friendly, easy-to-understand English
- Remember previous conversation context
- Understand medical terms
- Provide recommendations suitable for skin concerns and budget

Limitations:
⚠️ Do not diagnose diseases (Dermatologists only)
⚠️ Do not specify medication brands or specific products
✅ Recommend consulting a clinic for severe issues
✅ Provide general information about various programs`

    // Conversation history (last N messages)
    const recentMessages = context.messages.slice(-this.contextWindowSize)
    const conversationHistory = recentMessages
      .map(msg => {
        const role = msg.role === 'user' ? (isThai ? 'ผู้ใช้' : 'User') : (isThai ? 'AI' : 'AI')
        return `${role}: ${msg.content}`
      })
      .join('\n')
    
    // Current context
    const contextParts: string[] = []
    
    // User profile
    if (context.userProfile) {
      const profile = context.userProfile
      if (profile.name) contextParts.push(`${isThai ? 'ชื่อ' : 'Name'}: ${profile.name}`)
      if (profile.age) contextParts.push(`${isThai ? 'อายุ' : 'Age'}: ${profile.age} ${isThai ? 'ปี' : 'years'}`)
      if (profile.budget) {
        contextParts.push(`${isThai ? 'งบประมาณ' : 'Budget'}: ${profile.budget.toLocaleString()} ${isThai ? 'บาท' : 'THB'}`)
      }
      if (profile.previousPrograms && profile.previousPrograms.length > 0) {
        contextParts.push(
          `${isThai ? 'เคยทำ' : 'Previous treatments'}: ${profile.previousPrograms.join(', ')}`
        )
      }
    }
    
    // Skin analysis
    if (context.skinAnalysis) {
      const cv = context.skinAnalysis.cv
      contextParts.push(isThai ? '\nผลวิเคราะห์ผิว:' : '\nSkin Analysis Results:')
      if (cv.spots) {
        contextParts.push(`- ${isThai ? 'ฝ้า-กระ' : 'Spots/Freckles'}: ${cv.spots.severity}% (${cv.spots.count} ${isThai ? 'จุด' : 'spots'})`)
      }
      if (cv.pores) {
        contextParts.push(`- ${isThai ? 'รูขุมขน' : 'Pores'}: ${cv.pores.severity}%`)
      }
      if (cv.wrinkles) {
        contextParts.push(`- ${isThai ? 'ริ้วรอย' : 'Wrinkles'}: ${cv.wrinkles.severity}%`)
      }
      if (cv.texture) {
        contextParts.push(`- ${isThai ? 'เนื้อผิว' : 'Texture'}: ${cv.texture.score}%`)
      }
      if (cv.redness) {
        contextParts.push(`- ${isThai ? 'ความแดง' : 'Redness'}: ${cv.redness.severity}%`)
      }
      contextParts.push(`- ${isThai ? 'คะแนนรวม' : 'Overall Score'}: ${context.skinAnalysis.overallScore}%`)
    }
    
    // Current topic
    if (context.currentTopic) {
      contextParts.push(`\n${isThai ? 'หัวข้อที่กำลังพูดถึง' : 'Current Topic'}: ${context.currentTopic}`)
    }
    
    const currentMessage = `
${contextParts.join('\n')}

${isThai ? 'ประวัติการสนทนา' : 'Conversation History'}:
${conversationHistory}

${isThai ? 'คำถามใหม่' : 'New Question'}: ${userMessage}

${isThai ? 'คำตอบ (ภาษาไทย, เข้าใจง่าย, ประมาณ 150-300 คำ)' : 'Answer (English, easy to understand, approx 150-300 words)'}:`
    
    return {
      systemPrompt,
      conversationHistory,
      currentMessage
    }
  }
  
  /**
   * Translate Thai to English medical terms
   */
  translateMedicalTerm(thaiTerm: string): string[] {
    return THAI_MEDICAL_TERMS[thaiTerm] || []
  }
  
  /**
   * Get conversation summary
   */
  getSummary(context: ConversationContext): {
    totalMessages: number
    userMessages: number
    topTopics: string[]
    mainIntent: string
  } {
    const totalMessages = context.messages.length
    const userMessages = context.messages.filter(m => m.role === 'user').length
    
    // Count topic frequency
    const topicCounts: Record<string, number> = {}
    for (const msg of context.messages) {
      const concerns = msg.metadata?.skinConcerns || [];
      for (const concern of concerns) {
        topicCounts[concern] = (topicCounts[concern] || 0) + 1
      }
    }
    
    // Sort topics by frequency
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic)
    
    // Find most common intent
    const intentCounts: Record<string, number> = {}
    for (const msg of context.messages) {
      const intent = msg.metadata?.intent
      if (intent) {
        intentCounts[intent] = (intentCounts[intent] || 0) + 1
      }
    }
    
    const mainIntent = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general_question'
    
    return {
      totalMessages,
      userMessages,
      topTopics,
      mainIntent
    }
  }
  
  /**
   * Reset conversation
   */
  resetConversation(userId: string, locale: 'th' | 'en' = 'th'): ConversationContext {
    const isThai = locale === 'th'
    return {
      userId,
      messages: [],
      followUpSuggestions: isThai ? [
        'ผิวฉันมีปัญหาอะไรบ้าง?',
        'แนะนำ program สำหรับฝ้า-กระ',
        'โบท็อกซ์กับฟิลเลอร์ต่างกันอย่างไร?'
      ] : [
        'What are my skin concerns?',
        'Recommend programs for melasma/freckles',
        'What is the difference between Botox and Filler?'
      ]
    }
  }
}

/**
 * Singleton instance
 */
let chatManagerInstance: ContextAwareChatManager | null = null

/**
 * Get or create chat manager instance
 */
export function getChatManager(): ContextAwareChatManager {
  if (!chatManagerInstance) {
    chatManagerInstance = new ContextAwareChatManager()
  }
  return chatManagerInstance
}
