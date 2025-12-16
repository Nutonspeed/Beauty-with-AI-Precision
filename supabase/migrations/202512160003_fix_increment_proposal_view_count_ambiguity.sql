BEGIN;

CREATE OR REPLACE FUNCTION public.increment_proposal_view_count(
  proposal_id UUID,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  view_count INTEGER,
  first_viewed_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  title TEXT,
  lead_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_view BOOLEAN;
  v_lead_id UUID;
  v_title TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '28000';
  END IF;

  IF auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT
    (p.first_viewed_at IS NULL),
    p.lead_id,
    p.title
  INTO v_first_view, v_lead_id, v_title
  FROM public.sales_proposals AS p
  WHERE p.id = proposal_id
    AND p.sales_user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  UPDATE public.sales_proposals AS p
  SET
    view_count = COALESCE(p.view_count, 0) + 1,
    viewed_at = NOW(),
    first_viewed_at = COALESCE(p.first_viewed_at, NOW()),
    updated_at = NOW()
  WHERE p.id = proposal_id
    AND p.sales_user_id = auth.uid()
  RETURNING
    p.id,
    p.view_count,
    p.first_viewed_at,
    p.viewed_at,
    p.title,
    p.lead_id;

  IF v_first_view THEN
    INSERT INTO public.sales_activities (
      lead_id,
      sales_user_id,
      proposal_id,
      type,
      subject,
      description
    ) VALUES (
      v_lead_id,
      auth.uid(),
      proposal_id,
      'note',
      'Proposal First Viewed',
      'Customer viewed proposal: ' || v_title || ' for the first time'
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_proposal_view_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_proposal_view_count(UUID, UUID) TO service_role;

COMMIT;
