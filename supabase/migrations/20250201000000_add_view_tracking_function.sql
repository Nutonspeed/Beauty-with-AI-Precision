-- Create atomic increment function for proposal view counts
CREATE OR REPLACE FUNCTION increment_proposal_view_count(
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
AS $$
DECLARE
  v_first_view BOOLEAN;
  v_lead_id UUID;
  v_title TEXT;
BEGIN
  -- Check if this is the first view
  SELECT 
    (first_viewed_at IS NULL),
    lead_id,
    title
  INTO v_first_view, v_lead_id, v_title
  FROM sales_proposals
  WHERE sales_proposals.id = proposal_id
    AND sales_user_id = user_id;

  -- Atomic increment with RETURNING
  RETURN QUERY
  UPDATE sales_proposals
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    viewed_at = NOW(),
    first_viewed_at = COALESCE(first_viewed_at, NOW()),
    updated_at = NOW()
  WHERE sales_proposals.id = proposal_id
    AND sales_user_id = user_id
  RETURNING 
    sales_proposals.id,
    sales_proposals.view_count,
    sales_proposals.first_viewed_at,
    sales_proposals.viewed_at,
    sales_proposals.title,
    sales_proposals.lead_id;

  -- Log first view activity
  IF v_first_view THEN
    INSERT INTO sales_activities (
      lead_id,
      sales_user_id,
      proposal_id,
      type,
      subject,
      description
    ) VALUES (
      v_lead_id,
      user_id,
      proposal_id,
      'note',
      'Proposal First Viewed',
      'Customer viewed proposal: ' || v_title || ' for the first time'
    );
  END IF;
END;
$$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_proposals_view_tracking 
ON sales_proposals(sales_user_id, view_count, first_viewed_at);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_proposal_view_count TO authenticated;
