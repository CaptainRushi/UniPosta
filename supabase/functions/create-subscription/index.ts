// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- ADAPTER INTERFACE ---
interface PaymentAdapter {
    createSubscription(customerId: string, planId: string, returnUrl?: string): Promise<any>;
    searchOrCreateCustomer(user: any): Promise<string>;
}

// --- RAZORPAY ADAPTER ---
class RazorpayAdapter implements PaymentAdapter {
    private keyId = Deno.env.get('RAZORPAY_KEY_ID') || '';
    private keySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    private getAuthHeader() {
        return 'Basic ' + btoa(this.keyId + ':' + this.keySecret);
    }

    async searchOrCreateCustomer(user: any): Promise<string> {
        // 1. Check local mapping
        const { data: mapping } = await supabase
            .from('billing_customers')
            .select('provider_customer_id')
            .eq('user_id', user.id)
            .eq('provider_id', 'razorpay')
            .single();

        if (mapping) return mapping.provider_customer_id;

        // 2. Create in Razorpay
        const response = await fetch('https://api.razorpay.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.email, // or user metadata name
                email: user.email,
                notes: { supabase_uid: user.id }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.description);

        // 3. Save mapping
        await supabase.from('billing_customers').insert({
            user_id: user.id,
            provider_id: 'razorpay',
            provider_customer_id: data.id,
            user_email: user.email
        });

        return data.id;
    }

    async createSubscription(customerId: string, planId: string, returnUrl?: string): Promise<any> {
        // Razorpay Subscription Create
        // Note: planId here is the RAZORPAY plan ID (e.g. plan_Ljk...)

        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plan_id: planId,
                total_count: 120, // 10 years (indefinite-ish)
                customer_id: customerId,
                customer_notify: 1,
                notes: { source: 'adsync_billing' }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.description);

        return {
            subscriptionId: data.id,
            checkoutUrl: data.short_url, // Razorpay might return a short_url or we use checkout.js on frontend with this ID
            providerMetadata: data
        };
    }
}

// --- DUMMY ADAPTER (For Testing without Keys) ---
class DummyAdapter implements PaymentAdapter {
    async searchOrCreateCustomer(user: any): Promise<string> {
        return "cus_dummy_" + user.id;
    }
    async createSubscription(customerId: string, planId: string, returnUrl?: string): Promise<any> {
        return {
            subscriptionId: "sub_dummy_" + Date.now(),
            checkoutUrl: returnUrl + "?success=true&sub_id=sub_dummy_" + Date.now(),
            providerMetadata: {}
        };
    }
}

// --- FACTORY ---
function getAdapter(provider: string): PaymentAdapter {
    switch (provider) {
        case 'razorpay': return new RazorpayAdapter();
        case 'dummy': return new DummyAdapter();
        // case 'paypal': return new PayPalAdapter();
        default: throw new Error(`Provider ${provider} not supported`);
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization')!;
        if (!authHeader) throw new Error('No authorization header');

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) throw new Error('Invalid user token');

        const { planId, provider = 'razorpay', returnUrl } = await req.json();

        // 1. Get Plan Details (Internal -> External Mapping)
        const { data: plan } = await supabase
            .from('billing_plans')
            .select('provider_config')
            .eq('id', planId)
            .single();

        if (!plan) throw new Error('Plan not found ' + planId);

        const externalPlanId = plan.provider_config[provider]?.plan_id;
        if (!externalPlanId && provider !== 'dummy') {
            throw new Error(`Plan not configured for provider ${provider}`);
        }

        // 2. Get Adapter
        const adapter = getAdapter(provider);

        // 3. Get/Create Customer
        const customerId = await adapter.searchOrCreateCustomer(user);

        // 4. Create Subscription
        const result = await adapter.createSubscription(customerId, externalPlanId || 'plan_dummy', returnUrl);

        // 5. Store tentative subscription in DB (status: incomplete/created)
        await supabase.from('billing_subscriptions').insert({
            user_id: user.id,
            plan_id: planId,
            provider_id: provider,
            provider_subscription_id: result.subscriptionId,
            status: 'incomplete', // Will be updated by webhook
            metadata: result.providerMetadata
        });

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
