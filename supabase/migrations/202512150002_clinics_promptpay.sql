-- PromptPay configuration for clinics (multi-tenant)
-- Date: 2025-12-15

BEGIN;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS promptpay_id TEXT;

ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS promptpay_type TEXT;

-- Keep values controlled (mobile or citizen_id). Null means not configured.
ALTER TABLE public.clinics
  DROP CONSTRAINT IF EXISTS clinics_promptpay_type_check;

ALTER TABLE public.clinics
  ADD CONSTRAINT clinics_promptpay_type_check
  CHECK (promptpay_type IN ('mobile', 'citizen_id'));

CREATE INDEX IF NOT EXISTS idx_clinics_promptpay_id
  ON public.clinics(promptpay_id)
  WHERE promptpay_id IS NOT NULL;

COMMIT;
