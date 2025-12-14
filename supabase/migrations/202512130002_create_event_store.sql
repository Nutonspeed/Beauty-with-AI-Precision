-- Create event store table for event sourcing and replay
CREATE TABLE IF NOT EXISTS public.event_store (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  source text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  correlation_id uuid,
  user_id uuid REFERENCES auth.users(id),
  clinic_id uuid REFERENCES public.clinics(id),
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT event_store_pkey PRIMARY KEY (id),
  CONSTRAINT event_store_type_check CHECK (type IS NOT NULL AND length(type) > 0),
  CONSTRAINT event_store_source_check CHECK (source IS NOT NULL AND length(source) > 0)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_event_store_timestamp ON public.event_store (timestamp);
CREATE INDEX IF NOT EXISTS idx_event_store_type ON public.event_store (type);
CREATE INDEX IF NOT EXISTS idx_event_store_clinic_id ON public.event_store (clinic_id);
CREATE INDEX IF NOT EXISTS idx_event_store_user_id ON public.event_store (user_id);
CREATE INDEX IF NOT EXISTS idx_event_store_correlation_id ON public.event_store (correlation_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_event_store_clinic_timestamp ON public.event_store (clinic_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_event_store_user_timestamp ON public.event_store (user_id, timestamp);

-- GIN index for JSON data queries
CREATE INDEX IF NOT EXISTS idx_event_store_data_gin ON public.event_store USING gin (data);

-- Enable RLS
ALTER TABLE public.event_store ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view events from their clinic
CREATE POLICY "Users can view clinic events" ON public.event_store
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.users 
      WHERE id = auth.uid() AND clinic_id IS NOT NULL
    )
  );

-- RLS Policy: Service role can manage all events
CREATE POLICY "Service role can manage all events" ON public.event_store
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policy: Users can insert events for their clinic
CREATE POLICY "Users can insert clinic events" ON public.event_store
  FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.users 
      WHERE id = auth.uid() AND clinic_id IS NOT NULL
    )
  );
