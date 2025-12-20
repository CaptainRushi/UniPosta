
-- Master Migration for Subscription System (Provider Agnostic / Manual Payment)

-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
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
  user_id UUID,
  subscription_id UUID,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  reference_id TEXT,
  status TEXT CHECK (status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Plans: Public read access
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);

-- Subscriptions: Users view their own
CREATE POLICY "Read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Subscriptions: Users can create (for purchase flow)
CREATE POLICY "Create subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: Users view their own
CREATE POLICY "Read own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
-- Payments: Users can create (for purchase flow)
CREATE POLICY "Create payment" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to sync Profile Plan (Optional but useful for frontend simplification)
-- This assumes public.profiles exists and has a 'plan' column.
CREATE OR REPLACE FUNCTION public.sync_profile_from_subscription()
RETURNS TRIGGER AS $$
DECLARE
  plan_name TEXT;
BEGIN
  -- If active, set profile plan name
  IF NEW.status = 'active' THEN
    SELECT name INTO plan_name FROM public.plans WHERE id = NEW.plan_id;
    UPDATE public.profiles SET plan = plan_name WHERE id = NEW.user_id;
  -- If not active, revert to 'free' or 'starter' if no other active sub exists
  ELSIF (NEW.status = 'expired' OR NEW.status = 'canceled') THEN
     -- Check if another active sub exists
     IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.user_id AND status = 'active' AND id != NEW.id) THEN
        UPDATE public.profiles SET plan = 'free' WHERE id = NEW.user_id;
     END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_from_subscription();

-- 7. Seed Data
INSERT INTO public.plans (name, price, billing_cycle, features) VALUES
('Starter', 29, 'monthly', '["3 connected platforms", "10 campaigns", "Basic Analytics"]'::jsonb),
('Pro', 99, 'monthly', '["10 connected platforms", "Unlimited campaigns", "Advanced Analytics"]'::jsonb)
ON CONFLICT DO NOTHING; -- No unqiue constraint on name, but safeguard against errors if we re-run differently
