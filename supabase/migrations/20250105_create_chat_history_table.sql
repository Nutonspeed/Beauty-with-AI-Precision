-- ============================================================================
-- Chat History Table for AI Treatment Advisor
-- ============================================================================
-- Migration: 20250105_create_chat_history_table
-- Purpose: Store AI chatbot conversation history
-- Author: AI367 Team
-- Date: 2025-01-05
-- ============================================================================

-- Drop existing table if exists (for clean re-creation)
DROP TABLE IF EXISTS public.chat_history CASCADE;

-- Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for user-specific queries (most common)
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);

-- Index for chronological queries
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- Composite index for user + date range queries
CREATE INDEX idx_chat_history_user_created ON public.chat_history(user_id, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat history
CREATE POLICY "chat_history_select_own"
  ON public.chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "chat_history_insert_own"
  ON public.chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own chat history
CREATE POLICY "chat_history_delete_own"
  ON public.chat_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.chat_history IS 'Stores AI chatbot conversation history for treatment advice';
COMMENT ON COLUMN public.chat_history.id IS 'Unique message ID';
COMMENT ON COLUMN public.chat_history.user_id IS 'User who sent/received the message';
COMMENT ON COLUMN public.chat_history.role IS 'Message sender: user, assistant, or system';
COMMENT ON COLUMN public.chat_history.content IS 'Message text content';
COMMENT ON COLUMN public.chat_history.metadata IS 'Additional context (skin_analysis_id, etc.)';
COMMENT ON COLUMN public.chat_history.created_at IS 'Timestamp when message was created';

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify table was created successfully:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'chat_history' 
-- ORDER BY ordinal_position;
