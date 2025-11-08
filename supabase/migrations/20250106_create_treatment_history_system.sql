-- =====================================================
-- Treatment History & Progress Tracking System
-- For Beauty Clinic Customer Journey
-- =====================================================
-- Purpose: Track treatment history, before/after photos, progress notes,
--          treatment outcomes, and customer progress timeline for beauty services
-- Tables: treatment_records, treatment_photos, treatment_progress_notes,
--         treatment_outcomes, treatment_comparisons

-- =====================================================
-- Table: treatment_records
-- Description: Core treatment records for beauty clinic customers
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    
    -- Treatment details
    treatment_name VARCHAR(255) NOT NULL,
    treatment_name_en VARCHAR(255),
    treatment_code VARCHAR(50),
    treatment_category VARCHAR(100), -- facial, body, laser, injection, etc.
    service_ids UUID[], -- Array of service IDs used
    
    -- Treatment session info
    session_number INTEGER DEFAULT 1,
    total_planned_sessions INTEGER,
    is_part_of_package BOOLEAN DEFAULT false,
    package_id UUID, -- Reference to treatment package if applicable
    
    -- Treatment execution
    treatment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Staff who performed treatment
    assisted_by_user_ids UUID[], -- Array of assisting staff
    
    -- Treatment areas and products used
    treatment_areas TEXT[], -- e.g., ['face', 'forehead', 'cheeks', 'neck']
    products_used JSONB, -- Products and equipment used: [{product_id, product_name, quantity, batch_number}]
    equipment_used TEXT[], -- Equipment/machines used
    
    -- Customer condition
    skin_type VARCHAR(50), -- dry, oily, combination, sensitive, normal
    skin_concerns TEXT[], -- e.g., ['acne', 'wrinkles', 'pigmentation']
    allergies TEXT[],
    contraindications TEXT[],
    
    -- Treatment parameters
    treatment_intensity VARCHAR(50), -- light, medium, strong
    treatment_settings JSONB, -- Machine settings, laser parameters, etc.
    anesthesia_used VARCHAR(100), -- Topical cream, injection, none
    
    -- Customer feedback
    pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10), -- 0-10 scale
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5), -- 1-5 stars
    customer_feedback TEXT,
    
    -- Observations and notes
    pre_treatment_condition TEXT,
    immediate_post_treatment_condition TEXT,
    side_effects_observed TEXT[],
    
    -- Follow-up
    next_session_recommended_date DATE,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Status and billing
    status VARCHAR(50) DEFAULT 'completed', -- scheduled, in_progress, completed, cancelled
    total_cost DECIMAL(10, 2),
    payment_status VARCHAR(50), -- paid, pending, partial
    
    -- Documentation
    consent_form_signed BOOLEAN DEFAULT false,
    consent_signed_at TIMESTAMPTZ,
    medical_clearance_required BOOLEAN DEFAULT false,
    medical_clearance_obtained BOOLEAN DEFAULT false,
    
    -- Metadata
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- Indexes for treatment_records
CREATE INDEX idx_treatment_records_clinic ON treatment_records(clinic_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_records_customer ON treatment_records(customer_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_records_booking ON treatment_records(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_treatment_records_date ON treatment_records(treatment_date DESC);
CREATE INDEX idx_treatment_records_staff ON treatment_records(performed_by_user_id);
CREATE INDEX idx_treatment_records_category ON treatment_records(treatment_category);
CREATE INDEX idx_treatment_records_status ON treatment_records(status);

-- =====================================================
-- Table: treatment_photos
-- Description: Before/after photos for visual progress tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment_record_id UUID REFERENCES treatment_records(id) ON DELETE CASCADE,
    
    -- Photo details
    photo_type VARCHAR(50) NOT NULL, -- before, after, during, progress
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    photo_taken_at TIMESTAMPTZ NOT NULL,
    
    -- Photo categorization
    body_area VARCHAR(100), -- face, neck, hands, body, etc.
    specific_area VARCHAR(100), -- forehead, cheeks, nose, etc.
    view_angle VARCHAR(50), -- front, side, top, close-up, etc.
    lighting_condition VARCHAR(50), -- natural, studio, clinical
    
    -- Photo metadata
    days_after_treatment INTEGER, -- Days after treatment (for progress tracking)
    session_number INTEGER, -- Which session this photo belongs to
    
    -- Photo analysis
    photo_tags TEXT[], -- Tags for searching: ['acne', 'before', 'facial']
    ai_analysis JSONB, -- AI analysis results if applicable
    
    -- Privacy and consent
    consent_for_marketing BOOLEAN DEFAULT false,
    consent_for_case_study BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    watermark_applied BOOLEAN DEFAULT false,
    
    -- Comparison groups
    comparison_group_id UUID, -- Group photos for before/after comparison
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    file_size_kb INTEGER,
    image_width INTEGER,
    image_height INTEGER,
    uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Indexes for treatment_photos
CREATE INDEX idx_treatment_photos_clinic ON treatment_photos(clinic_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_photos_customer ON treatment_photos(customer_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_photos_record ON treatment_photos(treatment_record_id);
CREATE INDEX idx_treatment_photos_type ON treatment_photos(photo_type);
CREATE INDEX idx_treatment_photos_date ON treatment_photos(photo_taken_at DESC);
CREATE INDEX idx_treatment_photos_comparison ON treatment_photos(comparison_group_id) WHERE comparison_group_id IS NOT NULL;

-- =====================================================
-- Table: treatment_progress_notes
-- Description: Detailed progress notes and observations over time
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_progress_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment_record_id UUID REFERENCES treatment_records(id) ON DELETE CASCADE,
    
    -- Note details
    note_type VARCHAR(50) NOT NULL, -- progress, observation, complication, follow_up
    note_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    days_after_treatment INTEGER, -- Days since treatment
    
    -- Observations
    title VARCHAR(255),
    description TEXT NOT NULL,
    observations TEXT[],
    measurements JSONB, -- Measurements: {area: 'forehead_wrinkle_depth', value: 2.5, unit: 'mm'}
    
    -- Clinical assessment
    improvement_level VARCHAR(50), -- excellent, good, moderate, minimal, none
    condition_status VARCHAR(50), -- improving, stable, worsening
    side_effects TEXT[],
    complications TEXT[],
    
    -- Actions taken
    action_required BOOLEAN DEFAULT false,
    actions_taken TEXT[],
    medications_prescribed TEXT[],
    
    -- Follow-up
    follow_up_scheduled BOOLEAN DEFAULT false,
    next_follow_up_date DATE,
    
    -- Attachments
    photo_ids UUID[], -- References to treatment_photos
    document_urls TEXT[],
    
    -- Metadata
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for treatment_progress_notes
CREATE INDEX idx_progress_notes_clinic ON treatment_progress_notes(clinic_id) WHERE NOT is_deleted;
CREATE INDEX idx_progress_notes_customer ON treatment_progress_notes(customer_id) WHERE NOT is_deleted;
CREATE INDEX idx_progress_notes_record ON treatment_progress_notes(treatment_record_id);
CREATE INDEX idx_progress_notes_date ON treatment_progress_notes(note_date DESC);
CREATE INDEX idx_progress_notes_type ON treatment_progress_notes(note_type);

-- =====================================================
-- Table: treatment_outcomes
-- Description: Final treatment outcomes and results assessment
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment_record_id UUID REFERENCES treatment_records(id) ON DELETE CASCADE,
    
    -- Outcome assessment
    assessment_date TIMESTAMPTZ NOT NULL,
    assessor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Overall results
    overall_result VARCHAR(50) NOT NULL, -- excellent, good, satisfactory, poor
    goals_achieved BOOLEAN DEFAULT false,
    customer_satisfaction INTEGER CHECK (customer_satisfaction BETWEEN 1 AND 5),
    
    -- Specific outcomes
    primary_goal TEXT,
    primary_goal_achieved BOOLEAN,
    secondary_goals TEXT[],
    secondary_goals_achieved BOOLEAN[],
    
    -- Measurements and improvements
    before_measurements JSONB, -- Initial measurements
    after_measurements JSONB, -- Final measurements
    improvement_percentage DECIMAL(5, 2), -- Overall improvement %
    
    -- Visual assessment
    before_photo_ids UUID[], -- References to before photos
    after_photo_ids UUID[], -- References to after photos
    visual_improvement_rating INTEGER CHECK (visual_improvement_rating BETWEEN 1 AND 10),
    
    -- Clinical evaluation
    skin_condition_improvement TEXT,
    side_effects_summary TEXT[],
    complications_summary TEXT[],
    
    -- Duration and sessions
    total_sessions_completed INTEGER,
    treatment_start_date DATE,
    treatment_end_date DATE,
    total_duration_days INTEGER,
    
    -- Recommendations
    maintenance_required BOOLEAN DEFAULT false,
    maintenance_schedule TEXT,
    recommended_products TEXT[],
    recommended_follow_up_treatments TEXT[],
    
    -- Customer feedback
    would_recommend BOOLEAN,
    testimonial TEXT,
    testimonial_approved_for_use BOOLEAN DEFAULT false,
    
    -- Financial summary
    total_cost_incurred DECIMAL(10, 2),
    
    -- Metadata
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Indexes for treatment_outcomes
CREATE INDEX idx_treatment_outcomes_clinic ON treatment_outcomes(clinic_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_outcomes_customer ON treatment_outcomes(customer_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_outcomes_record ON treatment_outcomes(treatment_record_id);
CREATE INDEX idx_treatment_outcomes_date ON treatment_outcomes(assessment_date DESC);
CREATE INDEX idx_treatment_outcomes_result ON treatment_outcomes(overall_result);

-- =====================================================
-- Table: treatment_comparisons
-- Description: Side-by-side comparison groups for before/after analysis
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Comparison details
    comparison_name VARCHAR(255) NOT NULL,
    comparison_type VARCHAR(50), -- before_after, progress_timeline, multi_session
    treatment_category VARCHAR(100),
    
    -- Photos in comparison
    before_photo_ids UUID[] NOT NULL, -- Array of before photo IDs
    after_photo_ids UUID[] NOT NULL, -- Array of after photo IDs
    
    -- Timeline
    before_date DATE,
    after_date DATE,
    days_between INTEGER,
    
    -- Analysis
    improvement_notes TEXT,
    visible_changes TEXT[],
    comparison_metrics JSONB, -- Quantified improvements
    
    -- Sharing and usage
    is_featured BOOLEAN DEFAULT false,
    approved_for_marketing BOOLEAN DEFAULT false,
    approved_for_case_study BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Indexes for treatment_comparisons
CREATE INDEX idx_treatment_comparisons_clinic ON treatment_comparisons(clinic_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_comparisons_customer ON treatment_comparisons(customer_id) WHERE NOT is_deleted;
CREATE INDEX idx_treatment_comparisons_featured ON treatment_comparisons(is_featured) WHERE is_featured = true;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE treatment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_comparisons ENABLE ROW LEVEL SECURITY;

-- Policies for treatment_records
CREATE POLICY treatment_records_select ON treatment_records FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_records.clinic_id)
);

CREATE POLICY treatment_records_insert ON treatment_records FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_records.clinic_id)
);

CREATE POLICY treatment_records_update ON treatment_records FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_records.clinic_id)
);

CREATE POLICY treatment_records_delete ON treatment_records FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_records.clinic_id)
);

-- Policies for treatment_photos
CREATE POLICY treatment_photos_select ON treatment_photos FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_photos.clinic_id)
);

CREATE POLICY treatment_photos_insert ON treatment_photos FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_photos.clinic_id)
);

CREATE POLICY treatment_photos_update ON treatment_photos FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_photos.clinic_id)
);

CREATE POLICY treatment_photos_delete ON treatment_photos FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_photos.clinic_id)
);

-- Policies for treatment_progress_notes
CREATE POLICY treatment_progress_notes_select ON treatment_progress_notes FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_progress_notes.clinic_id)
);

CREATE POLICY treatment_progress_notes_insert ON treatment_progress_notes FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_progress_notes.clinic_id)
);

CREATE POLICY treatment_progress_notes_update ON treatment_progress_notes FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_progress_notes.clinic_id)
);

CREATE POLICY treatment_progress_notes_delete ON treatment_progress_notes FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_progress_notes.clinic_id)
);

-- Policies for treatment_outcomes
CREATE POLICY treatment_outcomes_select ON treatment_outcomes FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_outcomes.clinic_id)
);

CREATE POLICY treatment_outcomes_insert ON treatment_outcomes FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_outcomes.clinic_id)
);

CREATE POLICY treatment_outcomes_update ON treatment_outcomes FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_outcomes.clinic_id)
);

CREATE POLICY treatment_outcomes_delete ON treatment_outcomes FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_outcomes.clinic_id)
);

-- Policies for treatment_comparisons
CREATE POLICY treatment_comparisons_select ON treatment_comparisons FOR SELECT USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_comparisons.clinic_id)
);

CREATE POLICY treatment_comparisons_insert ON treatment_comparisons FOR INSERT WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_comparisons.clinic_id)
);

CREATE POLICY treatment_comparisons_update ON treatment_comparisons FOR UPDATE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_comparisons.clinic_id)
);

CREATE POLICY treatment_comparisons_delete ON treatment_comparisons FOR DELETE USING (
    clinic_id IN (SELECT id FROM clinics WHERE id = treatment_comparisons.clinic_id)
);

-- =====================================================
-- Functions
-- =====================================================

-- Function: get_customer_treatment_timeline
-- Description: Get chronological treatment timeline for a customer
CREATE OR REPLACE FUNCTION get_customer_treatment_timeline(
    p_clinic_id UUID,
    p_customer_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    event_date TIMESTAMPTZ,
    event_type VARCHAR(50),
    event_id UUID,
    event_title VARCHAR(255),
    event_description TEXT,
    session_number INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.treatment_date as event_date,
        'treatment'::VARCHAR(50) as event_type,
        tr.id as event_id,
        tr.treatment_name as event_title,
        tr.pre_treatment_condition as event_description,
        tr.session_number
    FROM treatment_records tr
    WHERE tr.clinic_id = p_clinic_id
        AND tr.customer_id = p_customer_id
        AND tr.is_deleted = false
    ORDER BY tr.treatment_date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: calculate_treatment_progress
-- Description: Calculate progress metrics for a treatment series
CREATE OR REPLACE FUNCTION calculate_treatment_progress(
    p_treatment_record_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_record treatment_records;
    v_progress JSONB;
    v_sessions_completed INTEGER;
    v_completion_percentage DECIMAL;
BEGIN
    -- Get treatment record
    SELECT * INTO v_record
    FROM treatment_records
    WHERE id = p_treatment_record_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Calculate completion
    v_sessions_completed := v_record.session_number;
    
    IF v_record.total_planned_sessions IS NOT NULL AND v_record.total_planned_sessions > 0 THEN
        v_completion_percentage := (v_sessions_completed::DECIMAL / v_record.total_planned_sessions) * 100;
    ELSE
        v_completion_percentage := 0;
    END IF;
    
    -- Build progress JSON
    v_progress := jsonb_build_object(
        'treatment_id', p_treatment_record_id,
        'session_number', v_sessions_completed,
        'total_planned_sessions', v_record.total_planned_sessions,
        'completion_percentage', v_completion_percentage,
        'status', v_record.status,
        'next_session_date', v_record.next_session_recommended_date
    );
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_treatment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER treatment_records_updated_at
    BEFORE UPDATE ON treatment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_treatment_updated_at();

CREATE TRIGGER treatment_progress_notes_updated_at
    BEFORE UPDATE ON treatment_progress_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_treatment_updated_at();

CREATE TRIGGER treatment_outcomes_updated_at
    BEFORE UPDATE ON treatment_outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_treatment_updated_at();

CREATE TRIGGER treatment_comparisons_updated_at
    BEFORE UPDATE ON treatment_comparisons
    FOR EACH ROW
    EXECUTE FUNCTION update_treatment_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE treatment_records IS 'Core treatment records for beauty clinic customer services';
COMMENT ON TABLE treatment_photos IS 'Before/after photos for visual progress tracking of beauty treatments';
COMMENT ON TABLE treatment_progress_notes IS 'Detailed progress notes and observations for customer treatment journey';
COMMENT ON TABLE treatment_outcomes IS 'Final treatment outcomes and results assessment for beauty services';
COMMENT ON TABLE treatment_comparisons IS 'Side-by-side comparison groups for before/after visual analysis';
