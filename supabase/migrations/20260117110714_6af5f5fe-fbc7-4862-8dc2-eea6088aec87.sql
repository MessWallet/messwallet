
-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('founder', 'secondary_admin', 'tertiary_admin', 'member');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Create expense_categories table
CREATE TABLE public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_bn TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.expense_categories(id),
    item_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2),
    unit TEXT,
    paid_by UUID REFERENCES auth.users(id) NOT NULL,
    added_by UUID REFERENCES auth.users(id) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_type TEXT NOT NULL DEFAULT 'market' CHECK (expense_type IN ('market', 'shared_bill', 'personal', 'emergency', 'utility')),
    is_emergency BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deposits table
CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    added_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    lunch BOOLEAN DEFAULT true,
    dinner BOOLEAN DEFAULT true,
    marked_by UUID REFERENCES auth.users(id),
    auto_marked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, meal_date)
);

-- Create monthly_budgets table
CREATE TABLE public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    budget_amount DECIMAL(10,2) NOT NULL,
    low_balance_threshold DECIMAL(10,2) DEFAULT 5000,
    is_locked BOOLEAN DEFAULT false,
    locked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (month, year)
);

-- Create shared_bills table
CREATE TABLE public.shared_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_type TEXT NOT NULL CHECK (bill_type IN ('rent', 'electricity', 'wifi', 'maid', 'gas', 'water', 'ancillary')),
    amount DECIMAL(10,2) NOT NULL,
    bill_month INTEGER NOT NULL,
    bill_year INTEGER NOT NULL,
    paid_by UUID REFERENCES auth.users(id),
    added_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (bill_type, bill_month, bill_year)
);

-- Create audit_log table
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Create function to check if user is admin (founder or any admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('founder', 'secondary_admin', 'tertiary_admin')
    )
$$;

-- Create function to check if user is founder
CREATE OR REPLACE FUNCTION public.is_founder(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = 'founder'
    )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by all authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Roles are viewable by all authenticated users"
ON public.user_roles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only founder can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id OR 
    public.is_founder(auth.uid())
);

CREATE POLICY "Only founder can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.is_founder(auth.uid()));

CREATE POLICY "Only founder can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.is_founder(auth.uid()));

-- RLS Policies for expense_categories
CREATE POLICY "Categories viewable by authenticated users"
ON public.expense_categories FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can manage categories"
ON public.expense_categories FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for expenses
CREATE POLICY "Expenses viewable by authenticated users"
ON public.expenses FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can add expenses"
ON public.expenses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Admins can update expenses"
ON public.expenses FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = added_by);

CREATE POLICY "Admins can delete expenses"
ON public.expenses FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for deposits (only admins can add)
CREATE POLICY "Deposits viewable by authenticated users"
ON public.deposits FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can add deposits"
ON public.deposits FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update deposits"
ON public.deposits FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete deposits"
ON public.deposits FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for meals
CREATE POLICY "Meals viewable by authenticated users"
ON public.meals FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can add their own meals"
ON public.meals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their meals (same day) or admins anytime"
ON public.meals FOR UPDATE TO authenticated
USING (
    (auth.uid() = user_id AND meal_date = CURRENT_DATE) 
    OR public.is_admin(auth.uid())
);

-- RLS Policies for monthly_budgets
CREATE POLICY "Budgets viewable by authenticated users"
ON public.monthly_budgets FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can manage budgets"
ON public.monthly_budgets FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for shared_bills
CREATE POLICY "Bills viewable by authenticated users"
ON public.shared_bills FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Only admins can add bills"
ON public.shared_bills FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update bills"
ON public.shared_bills FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete bills"
ON public.shared_bills FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for audit_log (only admins can view)
CREATE POLICY "Only admins can view audit log"
ON public.audit_log FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_budgets_updated_at
    BEFORE UPDATE ON public.monthly_budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default expense categories
INSERT INTO public.expense_categories (name, name_bn, icon) VALUES
    ('groceries', 'মুদি সামগ্রী', 'shopping-basket'),
    ('vegetables', 'শাকসবজি', 'carrot'),
    ('meat', 'মাংস', 'beef'),
    ('fish', 'মাছ', 'fish'),
    ('spices', 'মসলা', 'flame'),
    ('oil', 'তেল', 'droplet'),
    ('rice', 'চাল', 'wheat'),
    ('gas', 'গ্যাস', 'flame'),
    ('water', 'পানি', 'droplets'),
    ('electricity', 'বিদ্যুৎ', 'zap'),
    ('other', 'অন্যান্য', 'more-horizontal');

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
