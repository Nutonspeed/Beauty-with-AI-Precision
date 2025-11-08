-- Presentation Sessions table stores offline wizard sync payloads
CREATE TABLE public.presentation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  sales_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_identifier TEXT NOT NULL,
  customer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  proposal_summary JSONB DEFAULT '{}'::jsonb,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX presentation_sessions_user_idx ON public.presentation_sessions(sales_user_id);
CREATE INDEX presentation_sessions_customer_idx ON public.presentation_sessions(customer_identifier);
CREATE INDEX presentation_sessions_status_idx ON public.presentation_sessions(status);

-- Enable Row Level Security
ALTER TABLE public.presentation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: sales staff can manage their own presentation sessions
CREATE POLICY "presentation_sessions_select_own"
  ON public.presentation_sessions
  FOR SELECT
  USING (sales_user_id = auth.uid());

CREATE POLICY "presentation_sessions_insert_own"
  ON public.presentation_sessions
  FOR INSERT
  WITH CHECK (sales_user_id = auth.uid());

CREATE POLICY "presentation_sessions_update_own"
  ON public.presentation_sessions
  FOR UPDATE
  USING (sales_user_id = auth.uid());

CREATE POLICY "presentation_sessions_delete_own"
  ON public.presentation_sessions
  FOR DELETE
  USING (sales_user_id = auth.uid());

-- Maintain updated_at automatically
CREATE OR REPLACE FUNCTION public.update_presentation_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_presentation_sessions_updated_at ON public.presentation_sessions;
CREATE TRIGGER trg_presentation_sessions_updated_at
  BEFORE UPDATE ON public.presentation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_presentation_sessions_updated_at();

-- Add context comments
COMMENT ON TABLE public.presentation_sessions IS 'Queued presentation wizard sessions synchronized from offline devices.';
COMMENT ON COLUMN public.presentation_sessions.customer_snapshot IS 'Lightweight customer data captured during the presentation (name, phone, email).';
COMMENT ON COLUMN public.presentation_sessions.payload IS 'Full persisted presentation payload saved offline and replayed to the backend.';
