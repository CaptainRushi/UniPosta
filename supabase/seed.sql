
-- Seed Billing Plans
-- This file ensures that the default billing plans exist in the database.

-- Starter Plan
INSERT INTO public.billing_plans (name, tier, price, currency, interval, features, provider_config)
SELECT 'Starter', 'starter', 499.00, 'INR', 'month', '["3 platforms", "10 campaigns", "50 posts/mo"]'::jsonb, '{"razorpay": {"plan_id": "plan_starter_inr"}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE tier = 'starter');

-- Pro Plan
INSERT INTO public.billing_plans (name, tier, price, currency, interval, features, provider_config)
SELECT 'Pro', 'pro', 1999.00, 'INR', 'month', '["Unlimited platforms", "Unlimited campaigns", "Unlimited posts"]'::jsonb, '{"razorpay": {"plan_id": "plan_pro_inr"}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE tier = 'pro');
