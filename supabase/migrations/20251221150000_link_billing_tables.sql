-- Ensure Foreign Keys exist between billing tables

-- 1. Link subscriptions -> plans
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscriptions_plan_id_fkey' 
    AND table_name = 'subscriptions'
  ) THEN 
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES public.plans(id);
  END IF; 
END $$;

-- 2. Link payments -> subscriptions
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_subscription_id_fkey' 
    AND table_name = 'payments'
  ) THEN 
    ALTER TABLE public.payments 
    ADD CONSTRAINT payments_subscription_id_fkey 
    FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);
  END IF; 
END $$;

-- 3. Link payments -> auth.users (if not already)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_user_id_fkey' 
    AND table_name = 'payments'
  ) THEN 
    ALTER TABLE public.payments 
    ADD CONSTRAINT payments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF; 
END $$;
