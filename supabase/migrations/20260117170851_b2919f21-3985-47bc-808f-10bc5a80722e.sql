-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications" 
ON public.notifications 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Allow admins to delete profiles (for member deletion)
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Allow admins to delete user_roles (but not founder)
CREATE POLICY "Admins can delete non-founder roles" 
ON public.user_roles 
FOR DELETE 
USING (
  is_admin(auth.uid()) AND 
  role != 'founder'
);