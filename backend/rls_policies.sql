-- LearnLynk Tech Test - Task 2: RLS Policies on leads

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT
-- Admins: access all leads of their tenant
-- Counselors: access leads they own OR leads belonging to teams they are part of
CREATE POLICY leads_select_policy
ON public.leads
FOR SELECT
USING (
  (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'
    AND
    tenant_id = ((current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid)
  )
  OR
  (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'counselor'
    AND
    tenant_id = ((current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid)
    AND
    (
      owner_id = ((current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid)
      OR
      EXISTS (
        SELECT 1
        FROM user_teams ut
        JOIN teams t ON t.id = ut.team_id
        WHERE ut.user_id = ((current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid)
          AND t.tenant_id = public.leads.tenant_id
      )
    )
  )
);

-- Policy: INSERT
-- Only counselors/admins, and only into their own tenant
CREATE POLICY leads_insert_policy
ON public.leads
FOR INSERT
WITH CHECK (
  (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('admin', 'counselor')
  )
  AND
  (
    tenant_id = ((current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid)
  )
);
