-- ============================================================================
-- Reports & Analytics System Migration
-- Beauty Clinic Management System
-- 
-- Context: This is for a BEAUTY/AESTHETICS CLINIC (คลินิกเสริมความงาม)
-- IMPORTANT: Use "customer" (ลูกค้า) NOT "patient" (ผู้ป่วย)
-- Customers seek beauty enhancement services, NOT medical treatment
-- ============================================================================

-- Table: report_templates
-- Purpose: Store customizable report templates for different types of analytics
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- revenue, customer_analytics, staff_performance, inventory, treatment_effectiveness, queue_analytics, appointment_analytics
    report_category VARCHAR(50), -- financial, operational, marketing, customer_insights
    
    -- Template configuration
    parameters JSONB DEFAULT '{}', -- Filter parameters, date ranges, grouping options
    metrics JSONB DEFAULT '[]', -- Array of metrics to include: ["total_revenue", "customer_count", "avg_transaction"]
    dimensions JSONB DEFAULT '[]', -- Grouping dimensions: ["service", "doctor", "period", "branch"]
    filters JSONB DEFAULT '{}', -- Default filter values
    
    -- Visualization settings
    chart_type VARCHAR(50), -- line, bar, pie, table, mixed
    chart_config JSONB DEFAULT '{}', -- Chart-specific configuration
    
    -- Schedule settings
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly
    schedule_time TIME, -- Time to run scheduled report
    schedule_day_of_week INTEGER, -- 0-6 for weekly reports
    schedule_day_of_month INTEGER, -- 1-31 for monthly reports
    next_run_at TIMESTAMPTZ,
    
    -- Email delivery
    auto_email BOOLEAN DEFAULT false,
    email_recipients JSONB DEFAULT '[]', -- Array of email addresses
    email_subject VARCHAR(255),
    email_message TEXT,
    
    -- Access control
    is_public BOOLEAN DEFAULT false, -- Available to all staff
    allowed_roles JSONB DEFAULT '["admin", "manager"]', -- Roles that can view this report
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_templates_clinic ON report_templates(clinic_id);
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
CREATE INDEX idx_report_templates_category ON report_templates(report_category);
CREATE INDEX idx_report_templates_scheduled ON report_templates(is_scheduled, next_run_at) WHERE is_scheduled = true;

COMMENT ON TABLE report_templates IS 'Customizable report templates for beauty clinic analytics';
COMMENT ON COLUMN report_templates.report_type IS 'Type of report: revenue, customer_analytics, staff_performance, etc.';
COMMENT ON COLUMN report_templates.metrics IS 'Array of metrics to calculate and display';
COMMENT ON COLUMN report_templates.dimensions IS 'Dimensions for grouping data (service, doctor, time period, etc.)';

-- Table: generated_reports
-- Purpose: Store generated report results and metadata
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    
    -- Report metadata
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_category VARCHAR(50),
    
    -- Generation details
    generated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    generation_type VARCHAR(50) DEFAULT 'manual', -- manual, scheduled, api
    
    -- Time period covered by report
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Parameters used for generation
    parameters JSONB DEFAULT '{}',
    filters JSONB DEFAULT '{}',
    
    -- Report data
    summary_data JSONB DEFAULT '{}', -- High-level summary metrics
    detailed_data JSONB DEFAULT '{}', -- Detailed breakdown data
    chart_data JSONB DEFAULT '{}', -- Data formatted for charts
    
    -- File exports
    export_formats JSONB DEFAULT '[]', -- Array of: ["pdf", "excel", "csv"]
    file_paths JSONB DEFAULT '{}', -- {pdf: "path/to/file.pdf", excel: "path/to/file.xlsx"}
    file_urls JSONB DEFAULT '{}', -- {pdf: "https://...", excel: "https://..."}
    
    -- Statistics
    total_rows INTEGER,
    data_size_bytes INTEGER,
    generation_time_ms INTEGER, -- Time taken to generate report
    
    -- Status
    status VARCHAR(50) DEFAULT 'generating', -- generating, completed, failed, archived
    error_message TEXT,
    
    -- Access tracking
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    last_viewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Auto-delete old reports
);

CREATE INDEX idx_generated_reports_clinic ON generated_reports(clinic_id);
CREATE INDEX idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX idx_generated_reports_period ON generated_reports(period_start, period_end);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_created ON generated_reports(created_at DESC);
CREATE INDEX idx_generated_reports_expires ON generated_reports(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE generated_reports IS 'Generated report instances with cached data and export files';
COMMENT ON COLUMN generated_reports.summary_data IS 'Summary metrics for quick overview';
COMMENT ON COLUMN generated_reports.detailed_data IS 'Full detailed data for drill-down analysis';

-- Table: dashboard_widgets
-- Purpose: Customizable dashboard widgets for real-time analytics
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Widget metadata
    name VARCHAR(200) NOT NULL,
    description TEXT,
    widget_type VARCHAR(50) NOT NULL, -- metric_card, chart, table, gauge, progress, timeline
    
    -- Data source
    data_source VARCHAR(100) NOT NULL, -- revenue, bookings, queue, inventory, customers, staff
    data_query JSONB DEFAULT '{}', -- Query parameters for fetching data
    
    -- Display configuration
    metric_type VARCHAR(100), -- total_revenue, avg_rating, customer_count, etc.
    aggregation VARCHAR(50), -- sum, avg, count, min, max
    time_period VARCHAR(50) DEFAULT 'today', -- today, week, month, quarter, year, custom
    comparison_enabled BOOLEAN DEFAULT false, -- Compare with previous period
    
    -- Visualization
    chart_type VARCHAR(50), -- line, bar, pie, donut, area, scatter
    chart_config JSONB DEFAULT '{}',
    color_scheme VARCHAR(50), -- primary, success, warning, danger, info
    
    -- Layout
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1, -- Grid units
    height INTEGER DEFAULT 1, -- Grid units
    
    -- Refresh settings
    auto_refresh BOOLEAN DEFAULT true,
    refresh_interval_seconds INTEGER DEFAULT 300, -- 5 minutes default
    last_refreshed_at TIMESTAMPTZ,
    
    -- Access control
    visibility VARCHAR(50) DEFAULT 'all', -- all, role_based, user_specific
    allowed_roles JSONB DEFAULT '["admin", "manager", "staff"]',
    allowed_user_ids JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_clinic ON dashboard_widgets(clinic_id);
CREATE INDEX idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX idx_dashboard_widgets_position ON dashboard_widgets(position_y, position_x);
CREATE INDEX idx_dashboard_widgets_active ON dashboard_widgets(is_active) WHERE is_active = true;

COMMENT ON TABLE dashboard_widgets IS 'Customizable dashboard widgets for real-time beauty clinic analytics';
COMMENT ON COLUMN dashboard_widgets.data_source IS 'Source of data: revenue, bookings, customer metrics, etc.';

-- Table: report_schedules
-- Purpose: Track scheduled report execution history
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    
    -- Execution details
    scheduled_run_at TIMESTAMPTZ NOT NULL,
    actual_run_at TIMESTAMPTZ,
    
    -- Results
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed, skipped
    generated_report_id UUID REFERENCES generated_reports(id) ON DELETE SET NULL,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Email delivery status
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    email_recipients JSONB DEFAULT '[]',
    email_error TEXT,
    
    -- Performance
    execution_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_report_schedules_clinic ON report_schedules(clinic_id);
CREATE INDEX idx_report_schedules_template ON report_schedules(template_id);
CREATE INDEX idx_report_schedules_scheduled ON report_schedules(scheduled_run_at);
CREATE INDEX idx_report_schedules_status ON report_schedules(status);

COMMENT ON TABLE report_schedules IS 'Execution history for scheduled reports';

-- Table: analytics_snapshots
-- Purpose: Store periodic snapshots of key metrics for trend analysis
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Snapshot metadata
    snapshot_date DATE NOT NULL,
    snapshot_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    
    -- Revenue metrics
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    avg_transaction_value DECIMAL(12, 2) DEFAULT 0,
    revenue_by_service JSONB DEFAULT '{}', -- {service_id: revenue}
    revenue_by_doctor JSONB DEFAULT '{}', -- {doctor_id: revenue}
    
    -- Customer metrics (Beauty clinic customers, NOT patients)
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    customer_retention_rate DECIMAL(5, 2), -- Percentage
    avg_customer_lifetime_value DECIMAL(12, 2),
    
    -- Appointment metrics
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    appointment_completion_rate DECIMAL(5, 2), -- Percentage
    
    -- Service metrics
    total_services_performed INTEGER DEFAULT 0,
    popular_services JSONB DEFAULT '[]', -- Array of {service_id, service_name, count}
    avg_service_rating DECIMAL(3, 2),
    
    -- Staff performance
    staff_utilization_rate DECIMAL(5, 2), -- Percentage
    avg_staff_rating DECIMAL(3, 2),
    total_staff_hours DECIMAL(10, 2),
    
    -- Queue metrics
    avg_wait_time_minutes INTEGER,
    total_queue_entries INTEGER,
    peak_queue_time TIME,
    
    -- Inventory metrics
    low_stock_items INTEGER,
    out_of_stock_items INTEGER,
    inventory_value DECIMAL(12, 2),
    
    -- Customer satisfaction
    avg_satisfaction_rating DECIMAL(3, 2),
    total_reviews INTEGER,
    nps_score INTEGER, -- Net Promoter Score
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one snapshot per date per type per clinic
    CONSTRAINT unique_snapshot_per_date_type UNIQUE (clinic_id, snapshot_date, snapshot_type)
);

CREATE INDEX idx_analytics_snapshots_clinic ON analytics_snapshots(clinic_id);
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX idx_analytics_snapshots_type ON analytics_snapshots(snapshot_type);

COMMENT ON TABLE analytics_snapshots IS 'Daily/weekly/monthly snapshots of key beauty clinic metrics for trend analysis';
COMMENT ON COLUMN analytics_snapshots.total_customers IS 'Total unique customers (ลูกค้า) - beauty clinic clients, NOT patients';
COMMENT ON COLUMN analytics_snapshots.new_customers IS 'New beauty clinic customers in this period';

-- Table: export_jobs
-- Purpose: Track report export tasks (PDF, Excel, CSV)
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    report_id UUID REFERENCES generated_reports(id) ON DELETE CASCADE,
    
    -- Export details
    export_format VARCHAR(20) NOT NULL, -- pdf, excel, csv, json
    file_name VARCHAR(255),
    file_path TEXT,
    file_url TEXT,
    file_size_bytes INTEGER,
    
    -- Job status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    progress_percentage INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Processing details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    
    -- Requested by
    requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Download tracking
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ, -- Auto-delete after 30 days
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_export_jobs_clinic ON export_jobs(clinic_id);
CREATE INDEX idx_export_jobs_report ON export_jobs(report_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);
CREATE INDEX idx_export_jobs_created ON export_jobs(created_at DESC);
CREATE INDEX idx_export_jobs_expires ON export_jobs(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE export_jobs IS 'Track export tasks for reports (PDF, Excel, CSV)';

-- ============================================================================
-- Functions for Analytics Calculations
-- ============================================================================

-- Function: calculate_revenue_metrics
-- Purpose: Calculate revenue metrics for a given period and clinic
CREATE OR REPLACE FUNCTION calculate_revenue_metrics(
    p_clinic_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_revenue', COALESCE(SUM(total_amount), 0),
        'total_transactions', COUNT(*),
        'avg_transaction_value', COALESCE(AVG(total_amount), 0),
        'revenue_by_payment_method', (
            SELECT jsonb_object_agg(payment_method, revenue)
            FROM (
                SELECT payment_method, SUM(total_amount) as revenue
                FROM bookings
                WHERE clinic_id = p_clinic_id
                AND created_at >= p_start_date
                AND created_at <= p_end_date
                AND payment_status = 'paid'
                GROUP BY payment_method
            ) payment_breakdown
        ),
        'revenue_by_date', (
            SELECT jsonb_object_agg(booking_date::TEXT, daily_revenue)
            FROM (
                SELECT DATE(created_at) as booking_date, SUM(total_amount) as daily_revenue
                FROM bookings
                WHERE clinic_id = p_clinic_id
                AND created_at >= p_start_date
                AND created_at <= p_end_date
                AND payment_status = 'paid'
                GROUP BY DATE(created_at)
                ORDER BY booking_date
            ) daily_breakdown
        )
    ) INTO v_result
    FROM bookings
    WHERE clinic_id = p_clinic_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date
    AND payment_status = 'paid';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_revenue_metrics IS 'Calculate comprehensive revenue metrics for beauty clinic analytics';

-- Function: calculate_customer_analytics
-- Purpose: Calculate customer-related metrics (NOT patient - this is beauty clinic)
CREATE OR REPLACE FUNCTION calculate_customer_analytics(
    p_clinic_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_customers', COUNT(DISTINCT user_id),
        'new_customers', COUNT(DISTINCT CASE 
            WHEN first_booking_date >= p_start_date THEN user_id 
        END),
        'returning_customers', COUNT(DISTINCT CASE 
            WHEN booking_count > 1 THEN user_id 
        END),
        'customer_demographics', (
            SELECT jsonb_build_object(
                'age_groups', jsonb_object_agg(age_group, customer_count),
                'gender_distribution', (
                    SELECT jsonb_object_agg(gender, gender_count)
                    FROM (
                        SELECT 
                            COALESCE(u.gender, 'not_specified') as gender,
                            COUNT(DISTINCT u.id) as gender_count
                        FROM users u
                        INNER JOIN bookings b ON u.id = b.user_id
                        WHERE b.clinic_id = p_clinic_id
                        AND b.created_at >= p_start_date
                        AND b.created_at <= p_end_date
                        GROUP BY COALESCE(u.gender, 'not_specified')
                    ) gender_stats
                )
            )
            FROM (
                SELECT 
                    CASE 
                        WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) < 20 THEN 'under_20'
                        WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 20 AND 29 THEN '20-29'
                        WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 30 AND 39 THEN '30-39'
                        WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 40 AND 49 THEN '40-49'
                        WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) >= 50 THEN '50_plus'
                        ELSE 'unknown'
                    END as age_group,
                    COUNT(DISTINCT u.id) as customer_count
                FROM users u
                INNER JOIN bookings b ON u.id = b.user_id
                WHERE b.clinic_id = p_clinic_id
                AND b.created_at >= p_start_date
                AND b.created_at <= p_end_date
                GROUP BY age_group
            ) age_stats
        ),
        'avg_bookings_per_customer', COALESCE(AVG(booking_count), 0)
    ) INTO v_result
    FROM (
        SELECT 
            b.user_id,
            COUNT(*) as booking_count,
            MIN(b.created_at) as first_booking_date
        FROM bookings b
        WHERE b.clinic_id = p_clinic_id
        AND b.created_at >= p_start_date
        AND b.created_at <= p_end_date
        GROUP BY b.user_id
    ) customer_stats;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_customer_analytics IS 'Calculate customer analytics for beauty clinic (ลูกค้า - customers seeking beauty services, NOT patients)';

-- Function: calculate_staff_performance
-- Purpose: Calculate staff performance metrics
CREATE OR REPLACE FUNCTION calculate_staff_performance(
    p_clinic_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_staff', COUNT(DISTINCT cs.user_id),
        'staff_performance', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'staff_id', staff_id,
                    'staff_name', staff_name,
                    'role', role,
                    'total_appointments', total_appointments,
                    'completed_appointments', completed_appointments,
                    'total_revenue', total_revenue,
                    'avg_rating', avg_rating,
                    'completion_rate', completion_rate
                )
            )
            FROM (
                SELECT 
                    cs.user_id as staff_id,
                    u.full_name as staff_name,
                    cs.role,
                    COUNT(a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COALESCE(SUM(CASE WHEN a.status = 'completed' AND a.payment_status = 'paid' THEN a.service_price ELSE 0 END), 0) as total_revenue,
                    AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE NULL END) as avg_rating,
                    ROUND(
                        (COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::DECIMAL / NULLIF(COUNT(a.id), 0) * 100),
                        2
                    ) as completion_rate
                FROM clinic_staff cs
                INNER JOIN users u ON cs.user_id = u.id
                LEFT JOIN appointment_slots a ON a.doctor_id = cs.user_id 
                    AND a.clinic_id = p_clinic_id
                    AND a.appointment_date >= p_start_date::DATE
                    AND a.appointment_date <= p_end_date::DATE
                LEFT JOIN reviews r ON r.staff_id = cs.user_id
                    AND r.created_at >= p_start_date
                    AND r.created_at <= p_end_date
                WHERE cs.clinic_id = p_clinic_id
                AND cs.is_active = true
                GROUP BY cs.user_id, u.full_name, cs.role
                ORDER BY total_revenue DESC
            ) staff_stats
        )
    ) INTO v_result
    FROM clinic_staff cs
    WHERE cs.clinic_id = p_clinic_id
    AND cs.is_active = true;
    
    RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_staff_performance IS 'Calculate staff performance metrics including appointments and revenue';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_templates_updated_at
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

CREATE TRIGGER update_generated_reports_updated_at
    BEFORE UPDATE ON generated_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

CREATE TRIGGER update_dashboard_widgets_updated_at
    BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

CREATE TRIGGER update_report_schedules_updated_at
    BEFORE UPDATE ON report_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

CREATE TRIGGER update_analytics_snapshots_updated_at
    BEFORE UPDATE ON analytics_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

CREATE TRIGGER update_export_jobs_updated_at
    BEFORE UPDATE ON export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_reports_analytics_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Policies for report_templates
CREATE POLICY "Clinic staff can view report templates"
    ON report_templates FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins and managers can manage report templates"
    ON report_templates FOR ALL
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager') 
            AND is_active = true
        )
    );

-- Policies for generated_reports
CREATE POLICY "Clinic staff can view generated reports"
    ON generated_reports FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Authorized staff can generate reports"
    ON generated_reports FOR INSERT
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager', 'staff') 
            AND is_active = true
        )
    );

-- Policies for dashboard_widgets
CREATE POLICY "Clinic staff can view dashboard widgets"
    ON dashboard_widgets FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage dashboard widgets"
    ON dashboard_widgets FOR ALL
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager') 
            AND is_active = true
        )
    );

-- Policies for analytics_snapshots
CREATE POLICY "Clinic staff can view analytics snapshots"
    ON analytics_snapshots FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policies for export_jobs
CREATE POLICY "Users can view their export jobs"
    ON export_jobs FOR SELECT
    USING (
        requested_by_user_id = auth.uid()
        OR clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager') 
            AND is_active = true
        )
    );

-- ============================================================================
-- Sample Data (Optional - for development/testing)
-- ============================================================================

-- Sample report templates
INSERT INTO report_templates (clinic_id, name, description, report_type, report_category, metrics, dimensions, chart_type)
SELECT 
    c.id,
    'Monthly Revenue Report',
    'Comprehensive monthly revenue analysis by service, doctor, and payment method',
    'revenue',
    'financial',
    '["total_revenue", "total_transactions", "avg_transaction_value", "revenue_by_service", "revenue_by_doctor"]'::JSONB,
    '["period", "service", "doctor", "payment_method"]'::JSONB,
    'mixed'
FROM clinics c
LIMIT 1;

INSERT INTO report_templates (clinic_id, name, description, report_type, report_category, metrics, dimensions, chart_type)
SELECT 
    c.id,
    'Customer Analytics Dashboard',
    'Customer demographics, behavior patterns, and retention metrics',
    'customer_analytics',
    'customer_insights',
    '["total_customers", "new_customers", "returning_customers", "customer_retention_rate", "avg_lifetime_value"]'::JSONB,
    '["age_group", "gender", "period"]'::JSONB,
    'mixed'
FROM clinics c
LIMIT 1;

-- Sample dashboard widgets
INSERT INTO dashboard_widgets (clinic_id, name, widget_type, data_source, metric_type, chart_type, position_x, position_y, width, height)
SELECT 
    c.id,
    'Today Revenue',
    'metric_card',
    'revenue',
    'total_revenue',
    'line',
    0, 0, 1, 1
FROM clinics c
LIMIT 1;

INSERT INTO dashboard_widgets (clinic_id, name, widget_type, data_source, metric_type, chart_type, position_x, position_y, width, height)
SELECT 
    c.id,
    'Customer Growth',
    'chart',
    'customers',
    'customer_count',
    'line',
    1, 0, 2, 1
FROM clinics c
LIMIT 1;
