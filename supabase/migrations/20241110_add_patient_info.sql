-- Add patient_info JSONB column to skin_analyses table
-- Migration: 20241110_add_patient_info
-- Author: Development Team
-- Date: November 10, 2025

-- Add patient_info JSONB column
ALTER TABLE skin_analyses 
ADD COLUMN IF NOT EXISTS patient_info JSONB DEFAULT '{}'::jsonb;

-- Index for faster queries on patient name
CREATE INDEX IF NOT EXISTS idx_skin_analyses_patient_name 
ON skin_analyses ((patient_info->>'name'));

-- Index for faster queries on patient age
CREATE INDEX IF NOT EXISTS idx_skin_analyses_patient_age
ON skin_analyses (((patient_info->>'age')::integer));

-- Update column comment
COMMENT ON COLUMN skin_analyses.patient_info IS 
'Patient information including: {name: string, age: number, gender: "male"|"female"|"other", skinType: string, medicalHistory: string[]}';

-- Add appointment and treatment plan linking columns
ALTER TABLE skin_analyses
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS treatment_plan_id UUID;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_skin_analyses_appointment 
ON skin_analyses(appointment_id);

CREATE INDEX IF NOT EXISTS idx_skin_analyses_treatment_plan
ON skin_analyses(treatment_plan_id);

-- Add comments
COMMENT ON COLUMN skin_analyses.appointment_id IS 'Link to appointment record';
COMMENT ON COLUMN skin_analyses.treatment_plan_id IS 'Link to treatment plan record';
