-- Create scan results table
CREATE TABLE IF NOT EXISTS public.skin_scan_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    sales_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Photo data
    photo_front TEXT NOT NULL,
    photo_left TEXT,
    photo_right TEXT,
    
    -- Analysis results
    skin_age INTEGER,
    actual_age INTEGER,
    
    -- Concerns (JSON array)
    concerns JSONB DEFAULT '[]'::jsonb,
    
    -- Treatment recommendations (JSON array)
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- AI Analysis metadata
    confidence_score DECIMAL(5,2),
    analysis_model VARCHAR(100),
    analysis_duration_ms INTEGER,
    
    -- Face detection data
    face_detected BOOLEAN DEFAULT false,
    face_landmarks JSONB,
    face_mesh_data JSONB,
    
    -- Heatmap data
    heatmap_data JSONB,
    problem_areas JSONB DEFAULT '[]'::jsonb,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'completed', -- completed, sent_to_customer, converted_to_lead
    notes TEXT,
    
    -- Email/Chat integration
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    chat_sent BOOLEAN DEFAULT false,
    chat_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_scan_results_sales_user ON public.skin_scan_results(sales_user_id);
CREATE INDEX idx_scan_results_lead ON public.skin_scan_results(lead_id);
CREATE INDEX idx_scan_results_customer_phone ON public.skin_scan_results(customer_phone);
CREATE INDEX idx_scan_results_created_at ON public.skin_scan_results(created_at DESC);
CREATE INDEX idx_scan_results_status ON public.skin_scan_results(status);

-- Enable Row Level Security
ALTER TABLE public.skin_scan_results ENABLE ROW LEVEL SECURITY;

-- Policy: Sales users can view their own scan results
CREATE POLICY "Sales users can view own scan results"
ON public.skin_scan_results
FOR SELECT
USING (
    auth.uid() = sales_user_id
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Policy: Sales users can insert their own scan results
CREATE POLICY "Sales users can create scan results"
ON public.skin_scan_results
FOR INSERT
WITH CHECK (
    auth.uid() = sales_user_id
    AND
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('sales', 'admin', 'manager')
    )
);

-- Policy: Sales users can update their own scan results
CREATE POLICY "Sales users can update own scan results"
ON public.skin_scan_results
FOR UPDATE
USING (
    auth.uid() = sales_user_id
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'manager')
    )
)
WITH CHECK (
    auth.uid() = sales_user_id
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Policy: Only admins and managers can delete scan results
CREATE POLICY "Admins and managers can delete scan results"
ON public.skin_scan_results
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'manager')
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_scan_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scan_results_updated_at
    BEFORE UPDATE ON public.skin_scan_results
    FOR EACH ROW
    EXECUTE FUNCTION update_scan_results_updated_at();

-- Create scan statistics view
CREATE OR REPLACE VIEW public.scan_results_statistics AS
SELECT 
    sales_user_id,
    COUNT(*) as total_scans,
    COUNT(CASE WHEN lead_id IS NOT NULL THEN 1 END) as converted_to_leads,
    COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
    COUNT(CASE WHEN chat_sent THEN 1 END) as chats_sent,
    AVG(skin_age) as avg_skin_age,
    AVG(confidence_score) as avg_confidence,
    MIN(created_at) as first_scan_date,
    MAX(created_at) as last_scan_date
FROM public.skin_scan_results
GROUP BY sales_user_id;

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.skin_scan_results TO authenticated;
GRANT SELECT ON public.scan_results_statistics TO authenticated;

COMMENT ON TABLE public.skin_scan_results IS 'Stores AI/AR skin scan results performed by sales staff';
COMMENT ON COLUMN public.skin_scan_results.concerns IS 'JSON array of skin concerns with severity, description, and affected areas';
COMMENT ON COLUMN public.skin_scan_results.recommendations IS 'JSON array of treatment recommendations with pricing and expected outcomes';
COMMENT ON COLUMN public.skin_scan_results.heatmap_data IS 'Visual heatmap data showing problem areas with intensity values';
COMMENT ON COLUMN public.skin_scan_results.problem_areas IS 'JSON array of specific facial regions with severity scores';
