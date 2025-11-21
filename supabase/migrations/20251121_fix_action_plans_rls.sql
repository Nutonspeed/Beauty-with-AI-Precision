-- ============================================================================
-- FIX: Add RLS Policies for action_plans and related tables
-- Critical security fix from Phase 5 audit
-- Date: 2025-11-21
-- ============================================================================

-- ============================================================================
-- ACTION PLANS RLS POLICIES
-- ============================================================================

-- Drop existing policies if any (cleanup)
DROP POLICY IF EXISTS "Users can view own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can create own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can update own action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can delete own action plans" ON action_plans;
DROP POLICY IF EXISTS "Clinic staff can view clinic action plans" ON action_plans;
DROP POLICY IF EXISTS "Admin can view all action plans" ON action_plans;

-- Enable RLS (should already be enabled, but ensure it)
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own action plans
CREATE POLICY "Users can view own action plans"
ON action_plans
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  -- Clinic staff can view plans for their clinic
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = action_plans.clinic_id
    AND u.role IN ('clinic_admin', 'clinic_staff', 'sales_staff')
  )
);

-- Policy 2: Users can create their own action plans
CREATE POLICY "Users can create own action plans"
ON action_plans
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR
  -- Clinic staff can create plans for customers
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('clinic_admin', 'clinic_staff', 'sales_staff')
  )
);

-- Policy 3: Users can update their own action plans
CREATE POLICY "Users can update own action plans"
ON action_plans
FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  -- Clinic staff can update plans for their clinic
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = action_plans.clinic_id
    AND u.role IN ('clinic_admin', 'clinic_staff')
  )
);

-- Policy 4: Users can delete their own action plans
CREATE POLICY "Users can delete own action plans"
ON action_plans
FOR DELETE
USING (
  auth.uid() = user_id
  OR
  -- Clinic admins can delete plans for their clinic
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.clinic_id = action_plans.clinic_id
    AND u.role = 'clinic_admin'
  )
);

-- Policy 5: Super admins can view all action plans
CREATE POLICY "Admin can view all action plans"
ON action_plans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

-- ============================================================================
-- ACTION ITEMS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own action items" ON action_items;
DROP POLICY IF EXISTS "Users can manage own action items" ON action_items;
DROP POLICY IF EXISTS "Clinic staff can view clinic action items" ON action_items;

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view action items from their plans
CREATE POLICY "Users can view own action items"
ON action_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM action_plans ap
    WHERE ap.id = action_items.action_plan_id
    AND (
      ap.user_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = ap.clinic_id
        AND u.role IN ('clinic_admin', 'clinic_staff', 'sales_staff')
      )
    )
  )
);

-- Policy: Users can manage action items from their plans
CREATE POLICY "Users can manage own action items"
ON action_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM action_plans ap
    WHERE ap.id = action_items.action_plan_id
    AND (
      ap.user_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.clinic_id = ap.clinic_id
        AND u.role IN ('clinic_admin', 'clinic_staff')
      )
      OR
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'super_admin'
      )
    )
  )
);

-- ============================================================================
-- SMART GOALS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own smart goals" ON smart_goals;
DROP POLICY IF EXISTS "Users can manage own smart goals" ON smart_goals;

ALTER TABLE smart_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own goals
CREATE POLICY "Users can view own smart goals"
ON smart_goals
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('clinic_admin', 'clinic_staff', 'super_admin')
  )
);

-- Policy: Users can manage their own goals
CREATE POLICY "Users can manage own smart goals"
ON smart_goals
FOR ALL
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('clinic_admin', 'super_admin')
  )
);

-- ============================================================================
-- GOAL MILESTONES RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own goal milestones" ON goal_milestones;
DROP POLICY IF EXISTS "Users can manage own goal milestones" ON goal_milestones;

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal milestones"
ON goal_milestones
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM smart_goals sg
    WHERE sg.id = goal_milestones.goal_id
    AND (sg.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('clinic_admin', 'super_admin')
    ))
  )
);

CREATE POLICY "Users can manage own goal milestones"
ON goal_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM smart_goals sg
    WHERE sg.id = goal_milestones.goal_id
    AND (sg.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('clinic_admin', 'super_admin')
    ))
  )
);

-- ============================================================================
-- GOAL CHECK-INS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own goal check-ins" ON goal_check_ins;
DROP POLICY IF EXISTS "Users can manage own goal check-ins" ON goal_check_ins;

ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal check-ins"
ON goal_check_ins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM smart_goals sg
    WHERE sg.id = goal_check_ins.goal_id
    AND (sg.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('clinic_admin', 'super_admin')
    ))
  )
);

CREATE POLICY "Users can manage own goal check-ins"
ON goal_check_ins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM smart_goals sg
    WHERE sg.id = goal_check_ins.goal_id
    AND (sg.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('clinic_admin', 'super_admin')
    ))
  )
);

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_clinic_id ON action_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_action_items_action_plan_id ON action_items(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_smart_goals_user_id ON smart_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_check_ins_goal_id ON goal_check_ins(goal_id);

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('action_plans', 'action_items', 'smart_goals', 'goal_milestones', 'goal_check_ins');

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('action_plans', 'action_items', 'smart_goals', 'goal_milestones', 'goal_check_ins')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ✅ Expected result:
-- action_plans: 5 policies
-- action_items: 2 policies
-- smart_goals: 2 policies
-- goal_milestones: 2 policies
-- goal_check_ins: 2 policies
-- TOTAL: 13 new policies
