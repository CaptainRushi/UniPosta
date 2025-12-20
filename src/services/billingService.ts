import { supabase } from "@/integrations/supabase/client";
import { BillingPlan, BillingSubscription, BillingInvoice } from "@/types/billing";

export const billingService = {
    async getPlans() {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .eq('is_active', true)
            .order('price');

        if (error) throw error;
        return data as any[];
    },

    async getCurrentSubscription() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('subscriptions')
            .select('*, plans(*)')
            .eq('user_id', user.id)
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Step 1 of Real Payment Flow:
     * Create Pending Subscription & Payment Order intended for Razorpay
     */
    async purchasePlan(planId: string, price: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 1. Create Pending Subscription
        const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_id: planId,
                status: 'pending' // STRICT: Pending until webhook verification
            })
            .select()
            .single();

        if (subError) throw subError;

        // 2. Create Payment Record (Created status)
        const { error: payError } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                subscription_id: sub.id,
                gateway: 'razorpay',
                amount: price,
                currency: 'INR',
                status: 'created'
            });

        if (payError) throw payError;

        // 3. START CHECKOUT FLOW
        // Call Edge Function to get Real Order ID
        const { data: orderData, error: fnError } = await supabase.functions.invoke('create-payment-order', {
            body: {
                amount: price,
                currency: 'INR',
                receipt: sub.id
            }
        });

        if (fnError) {
            console.error("Edge Function Error:", fnError);
            throw new Error("Failed to create payment order. Please try again.");
        }

        if (orderData.error) {
            throw new Error(orderData.error);
        }

        // Update payment record with the real Order ID
        await supabase
            .from('payments')
            .update({
                gateway_order_id: orderData.order_id,
                status: 'pending'
            })
            .eq('subscription_id', sub.id);

        return {
            subscription: sub,
            orderData: orderData // Contains order_id, key_id, amount
        };
    },

    subscribeToSubscriptionChanges(userId: string, callback: (payload: any) => void) {
        return supabase
            .channel('subscription-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE', // Listen for UPDATE (when webhook changes pending -> active)
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();
    }
};
