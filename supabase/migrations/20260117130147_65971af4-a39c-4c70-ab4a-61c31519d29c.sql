-- Allow admins to delete meals
CREATE POLICY "Admins can delete meals"
ON public.meals
FOR DELETE
USING (is_admin(auth.uid()));