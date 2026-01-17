
-- Fix the overly permissive audit_log insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Create proper audit log insert policy (authenticated users can log their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
