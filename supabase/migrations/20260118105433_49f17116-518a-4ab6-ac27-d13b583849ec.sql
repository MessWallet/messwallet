-- Add serial_position to profiles for member ordering
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS serial_position INTEGER DEFAULT 999;

-- Add welcome_shown flag to track first-time welcome message
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_shown BOOLEAN DEFAULT false;

-- Create index for faster ordering by serial_position
CREATE INDEX IF NOT EXISTS idx_profiles_serial_position ON public.profiles(serial_position);

-- Set default serial positions based on existing order (founder first)
WITH numbered_profiles AS (
  SELECT 
    p.id,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN ur.role = 'founder' THEN 0
             WHEN ur.role = 'secondary_admin' THEN 1
             WHEN ur.role = 'tertiary_admin' THEN 2
             ELSE 3
        END,
        p.created_at
    ) as position
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
)
UPDATE public.profiles
SET serial_position = numbered_profiles.position
FROM numbered_profiles
WHERE public.profiles.id = numbered_profiles.id;