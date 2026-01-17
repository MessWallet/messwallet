-- Update RLS policy for notifications to allow admins to insert for any user
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications for all users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Keep existing policy for users to insert their own notifications
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update SELECT policy to allow admins to view all notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR SELECT 
USING (is_admin(auth.uid()));