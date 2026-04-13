
-- Add section column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section text;

-- Add section column to requests
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS section text;

-- Drop old coordinator policies on requests
DROP POLICY IF EXISTS "Coordinators can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Coordinators can update requests" ON public.requests;

-- Coordinator can only view requests matching their department AND section
CREATE POLICY "Coordinators can view matching requests"
ON public.requests
FOR SELECT
USING (
  has_role(auth.uid(), 'coordinator'::app_role)
  AND department = (SELECT department FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
  AND section = (SELECT section FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Coordinator can only update requests matching their department AND section
CREATE POLICY "Coordinators can update matching requests"
ON public.requests
FOR UPDATE
USING (
  has_role(auth.uid(), 'coordinator'::app_role)
  AND department = (SELECT department FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
  AND section = (SELECT section FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);
