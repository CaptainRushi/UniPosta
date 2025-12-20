
-- Fix Payments Table Schema Mismatch
-- The 'payments' table might have been created by an older migration with different columns/constraints.
-- This script aligns it with the Real Payment System requirements.

-- 1. Drop the old status check constraint to avoid conflicts
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Add missing columns (if they don't exist)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS gateway TEXT,
ADD COLUMN IF NOT EXISTS gateway_order_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT;

-- 3. Add the new status check constraint containing 'created'
ALTER TABLE public.payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('created', 'pending', 'paid', 'verified', 'failed'));

-- 4. Reset RLS Policy for Payments to ensure Insert is allowed
DROP POLICY IF EXISTS "Create payment" ON public.payments;
CREATE POLICY "Create payment" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Grant permissions if needed (usually auto-handled by RLS, but just in case)
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
