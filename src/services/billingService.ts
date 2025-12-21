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

    async getInvoices() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [] };

        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map payments to BillingInvoice interface
        const invoices: BillingInvoice[] = data.map((payment: any) => ({
            id: payment.id,
            invoice_number: payment.gateway_order_id || payment.id.slice(0, 8),
            user_id: payment.user_id,
            subscription_id: payment.subscription_id,
            amount_paid: payment.amount,
            amount_due: 0,
            currency: payment.currency || 'INR',
            status: payment.status === 'paid' ? 'paid' : 'open',
            invoice_pdf_url: null,
            created_at: payment.created_at
        }));

        return { data: invoices };
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
            console.error("Edge Function Invocation Error:", fnError);
            // Try to extract a meaningful message if possible, otherwise fallback
            const msg = fnError.message || JSON.stringify(fnError) || "Failed to create payment order. Please try again.";
            throw new Error(`Payment Initialization Failed: ${msg}`);
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
    },

    async verifyPayment(response: any) {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
            }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        return data;
    }
};
