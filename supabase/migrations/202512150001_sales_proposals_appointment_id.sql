-- Add explicit appointment linkage on sales_proposals for production-grade booking workflow
-- Date: 2025-12-15

BEGIN;

ALTER TABLE public.sales_proposals
  ADD COLUMN IF NOT EXISTS appointment_id UUID;

ALTER TABLE public.sales_proposals
  ADD CONSTRAINT IF NOT EXISTS sales_proposals_appointment_id_fkey
  FOREIGN KEY (appointment_id)
  REFERENCES public.appointments(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_proposals_appointment_id
  ON public.sales_proposals(appointment_id);

COMMIT;
