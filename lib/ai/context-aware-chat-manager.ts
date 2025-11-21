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
    previousTreatments?: string[]
  }
  currentTopic?: string
  followUpSuggestions?: string[]
}

/**
 * Thai medical term dictionary
 */
const THAI_MEDICAL_TERMS: Record<string, string[]> = {
  // Skin concerns
  'ฝ้า': ['melasma', 'hyperpigmentation', 'dark spots', 'pigmentation'],
  'กระ': ['freckles', 'age spots', 'sun spots'],
  'สิว': ['acne', 'pimples', 'breakout', 'blemish'],
  'รอยสิว': ['acne scar', 'post-acne marks', 'PIH', 'PIE'],
  'รูขุมขน': ['pores', 'enlarged pores', 'open pores'],
  'ริ้วรอย': ['wrinkles', 'fine lines', 'aging lines'],
  'หย่อนคล้อย': ['sagging', 'drooping', 'loss of elasticity'],
  'ผิวแห้ง': ['dry skin', 'dehydration', 'flaky skin'],
  'ผิวมัน': ['oily skin', 'sebum', 'greasy skin'],
  'ผิวแดง': ['redness', 'inflammation', 'erythema'],
  'ผิวหมองคล้ำ': ['dull skin', 'uneven tone', 'lackluster'],
  
  // Treatments
  'โบท็อกซ์': ['botox', 'botulinum toxin', 'neurotoxin'],
  'ฟิลเลอร์': ['filler', 'dermal filler', 'HA filler', 'hyaluronic acid'],
  'เลเซอร์': ['laser', 'laser treatment', 'laser therapy'],
  'พีโค': ['pico', 'picosecond', 'pico laser'],
  'คาร์บอน': ['carbon', 'carbon peel', 'carbon laser'],
  'ปอกหน้า': ['peel', 'chemical peel', 'facial peel'],
  'ไนโตรเจน': ['nitrogen', 'liquid nitrogen', 'cryotherapy'],
  'ไฮฟู': ['hifu', 'high-intensity focused ultrasound'],
  'อัลเทอร์ร่า': ['ultherapy', 'ulthera'],
  'เธอร์มาจ': ['thermage', 'radiofrequency'],
  'ไมโครนีดดลิ้ง': ['microneedling', 'derma roller', 'needling'],
  'เมโสแฟต': ['mesotherapy', 'meso', 'injection'],
  'ไฮโดรเฟเชียล': ['hydrafacial', 'hydrodermabrasion'],
  
  // Ingredients
  'วิตามินซี': ['vitamin c', 'ascorbic acid', 'L-ascorbic acid'],
  'เรตินอล': ['retinol', 'vitamin a', 'retinoid'],
  'ไนอะซินาไมด์': ['niacinamide', 'vitamin b3'],
  'ไฮยาลูรอน': ['hyaluronic acid', 'HA', 'sodium hyaluronate'],
  'เซรามายด์': ['ceramide', 'ceramides'],
  'เพปไทด์': ['peptide', 'peptides'],
  'อาร์บูติน': ['arbutin', 'alpha-arbutin'],
  
  // Body parts
  'หน้าผาก': ['forehead'],
  'ขมับ': ['temple', 'temporal area'],
  'หางตา': ['crow\'s feet', 'eye wrinkles'],
  'ใต้ตา': ['under eye', 'tear trough'],
  'แก้ม': ['cheek', 'cheekbone'],
  'จมูก': ['nose', 'nasal'],
  'คาง': ['chin', 'jawline'],
  'ลำคอ': ['neck', 'neck area']
}

/**
 * Intent patterns
 */
const INTENT_PATTERNS = {
  'ask_treatment': [
    'ทำอะไร', 'รักษาอย่างไร', 'ทำยังไง', 'แนะนำ', 'ควรทำ', 'ช่วยแนะนำ',
    'treatment', 'cure', 'solve', 'fix'
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
  'compare_treatments': [
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
    message: ChatMessage
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
      context
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
    context: ConversationContext
  ): string[] {
    let suggestions: string[] = []
    const intent = message.metadata?.intent
    const concerns = message.metadata?.skinConcerns || []
    
    // Intent-based suggestions
    if (intent === 'ask_treatment') {
      suggestions = [
        ...suggestions,
        'ราคาประมาณเท่าไหร่?',
        'มีผลข้างเคียงไหม?',
        'พักฟื้นนานแค่ไหน?',
      ];
    } else if (intent === 'ask_price') {
      suggestions = [
        ...suggestions,
        'ทำกี่ครั้งถึงเห็นผล?',
        'มีโปรโมชั่นไหม?',
        'ควรทำร่วมกับอะไร?',
      ];
    } else if (intent === 'ask_safety') {
      suggestions = [
        ...suggestions,
        'ใครไม่ควรทำ?',
        'ต้องเตรียมตัวอย่างไร?',
        'หลังทำต้องดูแลอะไร?',
      ];
    }
    
    // Concern-based suggestions
    if (concerns.includes('ฝ้า') || concerns.includes('กระ')) {
      suggestions = [
        ...suggestions,
        'Pico Laser ช่วยได้ไหม?',
        'ครีมบำรุงที่ช่วยได้?',
      ];
    }
    if (concerns.includes('ริ้วรอย')) {
      suggestions = [
        ...suggestions,
        'โบท็อกซ์กับฟิลเลอร์ต่างกันอย่างไร?',
        'Hifu ช่วยได้ไหม?',
      ];
    }
    
    // Skin analysis based suggestions
    if (context.skinAnalysis) {
      const cv = context.skinAnalysis.cv
      const additionalSuggestions: string[] = [];
      if (cv.spots && cv.spots.severity > 70) {
        additionalSuggestions.push('มีฝ้ากระมาก แนะนำ treatment อะไร?');
      }
      if (cv.wrinkles && cv.wrinkles.severity > 70) {
        additionalSuggestions.push('ริ้วรอยเยอะ ควรเริ่มจากอะไร?');
      }
      suggestions = [...suggestions, ...additionalSuggestions];
    }
    
    // Remove duplicates and limit to 5
    return [...new Set(suggestions)].slice(0, 5)
  }
  
  /**
   * Build AI prompt with full context
   */
  buildContextPrompt(
    userMessage: string,
    context: ConversationContext
  ): {
    systemPrompt: string
    conversationHistory: string
    currentMessage: string
  } {
    // System prompt
    const systemPrompt = `คุณคือ "AI Beauty Advisor" ที่ปรึกษาด้านความงามผิวหน้าแบบมืออาชีพ

บทบาท:
- ให้คำแนะนำการรักษาผิวหน้าที่เชื่อถือได้
- ตอบเป็นภาษาไทยที่เป็นกันเอง เข้าใจง่าย
- จดจำบริบทการสนทนาก่อนหน้า
- เข้าใจคำศัพท์ทางการแพทย์ไทย
- ให้คำแนะนำที่เหมาะกับปัญหาผิวและงบประมาณ

ข้อจำกัด:
⚠️ ไม่วินิจฉัยโรค (ให้แพทย์ผิวหนังเท่านั้น)
⚠️ ไม่ระบุชื่อยี่ห้อยาหรือผลิตภัณฑ์เฉพาะ
✅ แนะนำให้ปรึกษาคลินิกถ้าปัญหารุนแรง
✅ ให้ข้อมูลทั่วไปเกี่ยวกับ Treatment ต่างๆ`

    // Conversation history (last N messages)
    const recentMessages = context.messages.slice(-this.contextWindowSize)
    const conversationHistory = recentMessages
      .map(msg => {
        const role = msg.role === 'user' ? 'ผู้ใช้' : 'AI'
        return `${role}: ${msg.content}`
      })
      .join('\n')
    
    // Current context
    const contextParts: string[] = []
    
    // User profile
    if (context.userProfile) {
      const profile = context.userProfile
      if (profile.name) contextParts.push(`ชื่อ: ${profile.name}`)
      if (profile.age) contextParts.push(`อายุ: ${profile.age} ปี`)
      if (profile.budget) {
        contextParts.push(`งบประมาณ: ${profile.budget.toLocaleString()} บาท`)
      }
      if (profile.previousTreatments && profile.previousTreatments.length > 0) {
        contextParts.push(
          `เคยทำ: ${profile.previousTreatments.join(', ')}`
        )
      }
    }
    
    // Skin analysis
    if (context.skinAnalysis) {
      const cv = context.skinAnalysis.cv
      contextParts.push('\nผลวิเคราะห์ผิว:')
      if (cv.spots) {
        contextParts.push(`- ฝ้า-กระ: ${cv.spots.severity}% (${cv.spots.count} จุด)`)
      }
      if (cv.pores) {
        contextParts.push(`- รูขุมขน: ${cv.pores.severity}%`)
      }
      if (cv.wrinkles) {
        contextParts.push(`- ริ้วรอย: ${cv.wrinkles.severity}%`)
      }
      if (cv.texture) {
        contextParts.push(`- เนื้อผิว: ${cv.texture.score}%`)
      }
      if (cv.redness) {
        contextParts.push(`- ความแดง: ${cv.redness.severity}%`)
      }
      contextParts.push(`- คะแนนรวม: ${context.skinAnalysis.overallScore}%`)
    }
    
    // Current topic
    if (context.currentTopic) {
      contextParts.push(`\nหัวข้อที่กำลังพูดถึง: ${context.currentTopic}`)
    }
    
    const currentMessage = `
${contextParts.join('\n')}

ประวัติการสนทนา:
${conversationHistory}

คำถามใหม่: ${userMessage}

คำตอบ (ภาษาไทย, เข้าใจง่าย, ประมาณ 150-300 คำ):`
    
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
  resetConversation(userId: string): ConversationContext {
    return {
      userId,
      messages: [],
      followUpSuggestions: [
        'ผิวฉันมีปัญหาอะไรบ้าง?',
        'แนะนำ treatment สำหรับฝ้า-กระ',
        'โบท็อกซ์กับฟิลเลอร์ต่างกันอย่างไร?'
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
