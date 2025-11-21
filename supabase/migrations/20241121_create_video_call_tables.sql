-- =====================================================
-- Create Video Call Tables for Sales
-- =====================================================
-- Tables: video_call_sessions, video_call_participants
-- Date: 2025-11-21
-- =====================================================

-- 1. Create ENUM for video call status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_call_status') THEN
    CREATE TYPE video_call_status AS ENUM (
      'scheduled',
      'active',
      'completed',
      'cancelled',
      'failed'
    );
    RAISE NOTICE '✅ Created ENUM type: video_call_status';
  END IF;
END $$;

-- 2. Create video_call_sessions table
CREATE TABLE IF NOT EXISTS public.video_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Session Details
  status video_call_status NOT NULL DEFAULT 'scheduled',
  
  -- Timing
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN started_at IS NOT NULL AND ended_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (ended_at - started_at))::INTEGER
      ELSE NULL
    END
  ) STORED,
  
  -- Recording
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  
  -- Quality Metrics
  connection_quality JSONB DEFAULT '{}'::jsonb, -- {avg_bitrate, packet_loss, latency}
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for video_call_sessions
CREATE INDEX IF NOT EXISTS video_call_sessions_lead_id_idx ON public.video_call_sessions(lead_id);
CREATE INDEX IF NOT EXISTS video_call_sessions_host_id_idx ON public.video_call_sessions(host_id);
CREATE INDEX IF NOT EXISTS video_call_sessions_status_idx ON public.video_call_sessions(status);
CREATE INDEX IF NOT EXISTS video_call_sessions_created_at_idx ON public.video_call_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS video_call_sessions_scheduled_at_idx ON public.video_call_sessions(scheduled_at) WHERE scheduled_at IS NOT NULL;

COMMENT ON TABLE public.video_call_sessions IS 'Video call sessions for sales leads';

-- 3. Create video_call_participants table
CREATE TABLE IF NOT EXISTS public.video_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  session_id UUID NOT NULL REFERENCES public.video_call_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Participant Details
  role VARCHAR(50) DEFAULT 'participant', -- host, participant, observer
  
  -- Timing
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN joined_at IS NOT NULL AND left_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (left_at - joined_at))::INTEGER
      ELSE NULL
    END
  ) STORED,
  
  -- Connection State
  is_muted BOOLEAN DEFAULT FALSE,
  is_video_off BOOLEAN DEFAULT FALSE,
  
  -- Quality Metrics
  connection_quality JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(session_id, user_id)
);

-- Indexes for video_call_participants
CREATE INDEX IF NOT EXISTS video_call_participants_session_id_idx ON public.video_call_participants(session_id);
CREATE INDEX IF NOT EXISTS video_call_participants_user_id_idx ON public.video_call_participants(user_id);
CREATE INDEX IF NOT EXISTS video_call_participants_joined_at_idx ON public.video_call_participants(joined_at);

COMMENT ON TABLE public.video_call_participants IS 'Participants in video call sessions';

-- 4. Enable RLS on all tables
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_participants ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for video_call_sessions

-- Users can view sessions they host or participate in
CREATE POLICY "video_call_sessions_select_own"
  ON public.video_call_sessions
  FOR SELECT
  USING (
    host_id = auth.uid()
    OR id IN (
      SELECT session_id FROM public.video_call_participants WHERE user_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Only hosts can insert sessions
CREATE POLICY "video_call_sessions_insert_own"
  ON public.video_call_sessions
  FOR INSERT
  WITH CHECK (
    host_id = auth.uid()
    AND (auth.jwt()->>'user_role')::text IN ('sales_staff', 'super_admin')
  );

-- Hosts can update their own sessions
CREATE POLICY "video_call_sessions_update_own"
  ON public.video_call_sessions
  FOR UPDATE
  USING (
    host_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Hosts can delete their own sessions
CREATE POLICY "video_call_sessions_delete_own"
  ON public.video_call_sessions
  FOR DELETE
  USING (
    host_id = auth.uid()
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 6. RLS Policies for video_call_participants

-- Users can view participants in sessions they're part of
CREATE POLICY "video_call_participants_select_own"
  ON public.video_call_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR session_id IN (
      SELECT id FROM public.video_call_sessions WHERE host_id = auth.uid()
    )
    OR session_id IN (
      SELECT session_id FROM public.video_call_participants WHERE user_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Hosts can insert participants
CREATE POLICY "video_call_participants_insert_own"
  ON public.video_call_participants
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.video_call_sessions WHERE host_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Users can update their own participant record
CREATE POLICY "video_call_participants_update_own"
  ON public.video_call_participants
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR session_id IN (
      SELECT id FROM public.video_call_sessions WHERE host_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- Hosts can delete participants
CREATE POLICY "video_call_participants_delete_own"
  ON public.video_call_participants
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM public.video_call_sessions WHERE host_id = auth.uid()
    )
    OR (auth.jwt()->>'user_role')::text = 'super_admin'
  );

-- 7. Create triggers for updated_at
CREATE TRIGGER update_video_call_sessions_updated_at
  BEFORE UPDATE ON public.video_call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 8. Create function to auto-calculate session duration on end
CREATE OR REPLACE FUNCTION public.calculate_video_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- When session ends, ensure duration is calculated
  IF NEW.status = 'completed' AND NEW.ended_at IS NOT NULL AND OLD.status != 'completed' THEN
    -- Duration is auto-calculated by GENERATED column
    RAISE NOTICE '[Video Call] Session % completed. Duration: % seconds', NEW.id, NEW.duration_seconds;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate duration
DROP TRIGGER IF EXISTS calculate_video_call_duration_trigger ON public.video_call_sessions;
CREATE TRIGGER calculate_video_call_duration_trigger
  BEFORE UPDATE ON public.video_call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_video_call_duration();

-- 9. Create function to log video call activity
CREATE OR REPLACE FUNCTION public.log_video_call_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log video call start as sales activity
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    INSERT INTO public.sales_activities (
      lead_id,
      sales_user_id,
      type,
      subject,
      description,
      metadata
    )
    SELECT
      NEW.lead_id,
      NEW.host_id,
      'call',
      'Video Call Started',
      'Video call session started with lead',
      jsonb_build_object('session_id', NEW.id, 'started_at', NEW.started_at)
    WHERE NEW.lead_id IS NOT NULL;
  END IF;
  
  -- Log video call completion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.sales_activities (
      lead_id,
      sales_user_id,
      type,
      subject,
      description,
      duration_minutes,
      metadata
    )
    SELECT
      NEW.lead_id,
      NEW.host_id,
      'call',
      'Video Call Completed',
      'Video call session completed',
      ROUND(NEW.duration_seconds / 60.0),
      jsonb_build_object(
        'session_id', NEW.id,
        'duration_seconds', NEW.duration_seconds,
        'ended_at', NEW.ended_at
      )
    WHERE NEW.lead_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log activities
DROP TRIGGER IF EXISTS log_video_call_activity_trigger ON public.video_call_sessions;
CREATE TRIGGER log_video_call_activity_trigger
  AFTER UPDATE ON public.video_call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_video_call_activity();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'video_call%' ORDER BY tablename;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename LIKE 'video_call%'
-- ORDER BY tablename, policyname;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
/*
DROP TRIGGER IF EXISTS log_video_call_activity_trigger ON public.video_call_sessions;
DROP TRIGGER IF EXISTS calculate_video_call_duration_trigger ON public.video_call_sessions;
DROP TRIGGER IF EXISTS update_video_call_sessions_updated_at ON public.video_call_sessions;

DROP FUNCTION IF EXISTS public.log_video_call_activity();
DROP FUNCTION IF EXISTS public.calculate_video_call_duration();

DROP TABLE IF EXISTS public.video_call_participants;
DROP TABLE IF EXISTS public.video_call_sessions;

DROP TYPE IF EXISTS video_call_status;
*/
