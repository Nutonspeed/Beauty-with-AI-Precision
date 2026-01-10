-- Security Hardening based on Supabase MCP Audit (Jan 10, 2026)

-- 1. Fix Mutable Search Path for functions
-- This prevents search path hijacking attacks.

ALTER FUNCTION public.record_sla_metric(uuid, text, text, text, text, text, boolean, text, text, integer, text, boolean) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_sla_summary(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_dns_record(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_ssl_certificate(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_domain_status_summary(uuid) SET search_path = public, pg_temp;

-- 2. Harden RLS Policies for sensitive tables

-- Table: public.error_logs
-- Current: "Anyone insert logs" WITH CHECK (true)
-- Fix: Only allow insertion if user_id matches authenticated user (or allow anonymous if intended, but with restrictions)
DROP POLICY IF EXISTS "Anyone insert logs" ON public.error_logs;
CREATE POLICY "Anyone insert logs" ON public.error_logs
  FOR INSERT 
  TO public
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR 
    (auth.uid() = user_id)
  );

-- Table: public.active_sessions
-- Current: "System can manage sessions" FOR ALL TO authenticated USING (true)
-- Fix: Restrict to service_role or owner
DROP POLICY IF EXISTS "System can manage sessions" ON public.active_sessions;
CREATE POLICY "System can manage sessions" ON public.active_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Table: public.analytics_events
-- Current: "Allow anonymous analytics insert" WITH CHECK (true)
-- Fix: Ensure payload doesn't allow user_id spoofing
DROP POLICY IF EXISTS "Allow anonymous analytics insert" ON public.analytics_events;
CREATE POLICY "Allow anonymous analytics insert" ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL) OR 
    (auth.uid() = user_id)
  );

-- Table: public.sla_metrics
-- Current: "Service role can delete SLA metrics" USING (true)
-- Fix: Restrict to service_role only
DROP POLICY IF EXISTS "Service role can delete SLA metrics" ON public.sla_metrics;
DROP POLICY IF EXISTS "Service role can insert SLA metrics" ON public.sla_metrics;
DROP POLICY IF EXISTS "Service role can update SLA metrics" ON public.sla_metrics;

CREATE POLICY "Service role can manage SLA metrics" ON public.sla_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Security Recommendations (Informational)
-- - Enable "Leaked Password Protection" in Supabase Dashboard -> Auth -> Providers -> Email
-- - Configure MFA in Supabase Dashboard -> Auth -> Policies
