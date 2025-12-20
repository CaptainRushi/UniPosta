
-- Final Real Payment Schema Migration
-- Ensures schema matches the Master Prompt requirements strictly

-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  gateway TEXT NOT NULL, -- 'razorpay'
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('created', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Plans: Public Read
DROP POLICY IF EXISTS "Public read plans" ON public.plans;
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);

-- Subscriptions: Read Own, Insert Own (for purchase Init)
DROP POLICY IF EXISTS "Read own subscription" ON public.subscriptions;
CREATE POLICY "Read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Create subscription" ON public.subscriptions;
CREATE POLICY "Create subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: Read Own, Insert Own (for purchase Init)
DROP POLICY IF EXISTS "Read own payments" ON public.payments;
CREATE POLICY "Read own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Create payment" ON public.payments;
CREATE POLICY "Create payment" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Insert Default Plans if they don't exist
INSERT INTO public.plans (name, price, currency, billing_cycle, features)
SELECT 'Starter', 499, 'INR', 'monthly', '["3 Connected Platforms", "Basic Analytics", "10 Campaigns"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Starter');

INSERT INTO public.plans (name, price, currency, billing_cycle, features)
SELECT 'Pro', 1999, 'INR', 'monthly', '["Unlimited Platforms", "Advanced Analytics", "Unlimited Campaigns"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Pro');
