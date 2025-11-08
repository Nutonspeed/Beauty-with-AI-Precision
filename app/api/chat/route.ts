import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getChatAdvice } from '@/lib/ai/gemini-advisor';
import { getChatManager, type ChatMessage, type ConversationContext } from '@/lib/ai/context-aware-chat-manager';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { message, skinAnalysisId } = await req.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use service client for database operations (bypasses RLS)
    const serviceSupabase = createServiceClient();

    // 3. Get skin analysis context (if provided)
    let skinAnalysis = null;
    if (skinAnalysisId) {
      const { data } = await serviceSupabase
        .from('skin_analyses')
        .select('*')
        .eq('id', skinAnalysisId)
        .single();
      
      skinAnalysis = data;
    }

    // 4. Get chat history with context manager
    const { data: historyData } = await serviceSupabase
      .from('chat_history')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50); // Last 50 messages

    // Build conversation context
    const chatManager = getChatManager()
    const conversationContext: ConversationContext = {
      userId: user.id,
      messages: (historyData || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      })),
      skinAnalysis: skinAnalysis || undefined,
      userProfile: {
        name: user.user_metadata?.full_name,
        age: user.user_metadata?.age,
        budget: user.user_metadata?.budget
      }
    }

    // Add user message to context
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    const updatedContext = chatManager.addMessage(conversationContext, userMessage)

    // Build AI prompt with full context
    const { currentMessage } = chatManager.buildContextPrompt(
      message,
      updatedContext
    )

    // 5. Call Gemini AI with enhanced context
    const aiResponse = await getChatAdvice(currentMessage, {
      skinAnalysis,
      previousMessages: updatedContext.messages
        .filter(m => m.role !== 'system') // Exclude system messages
        .slice(-6) // Last 3 exchanges
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      userName: user.user_metadata?.full_name || undefined,
    });

    // Add AI response to context
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }
    const finalContext = chatManager.addMessage(updatedContext, assistantMessage)

    // 6. Save chat history
    await serviceSupabase.from('chat_history').insert([
      {
        user_id: user.id,
        role: 'user',
        content: message,
        metadata: userMessage.metadata || {}
      },
      {
        user_id: user.id,
        role: 'assistant',
        content: aiResponse,
        metadata: assistantMessage.metadata || {}
      }
    ]);

    // 7. Return response with follow-up suggestions
    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      followUpSuggestions: finalContext.followUpSuggestions || [],
      currentTopic: finalContext.currentTopic,
      conversationSummary: chatManager.getSummary(finalContext)
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get chat history
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = createServiceClient();
    const { data, error } = await serviceSupabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
