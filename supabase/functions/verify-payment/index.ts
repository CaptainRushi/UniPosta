import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import crypto from "node:crypto";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { order_id, payment_id, signature } = await req.json();

        if (!order_id || !payment_id || !signature) {
            throw new Error("Missing required fields");
        }

        const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!RAZORPAY_KEY_SECRET) {
            throw new Error("Server config missing: RAZORPAY_KEY_SECRET");
        }

        // 1. Verify Signature
        const generated_signature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET)
            .update(order_id + "|" + payment_id)
            .digest("hex");

        if (generated_signature !== signature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Init Supabase Admin
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 3. Find Payment Record
        const { data: paymentRow, error: findError } = await supabase
            .from("payments")
            .select("*")
            .eq("gateway_order_id", order_id)
            .single();

        if (findError || !paymentRow) {
            throw new Error("Payment record not found for order " + order_id);
        }

        // 4. Update Payment Status to 'paid'
        await supabase
            .from("payments")
            .update({
                status: "paid",
                gateway_payment_id: payment_id,
            })
            .eq("id", paymentRow.id);

        // 5. Activate Subscription
        // Calculate end date (30 days from now)
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await supabase
            .from("subscriptions")
            .update({
                status: "active",
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
            })
            .eq("id", paymentRow.subscription_id);

        return new Response(JSON.stringify({ success: true, message: "Activated" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
