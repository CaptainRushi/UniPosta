import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { amount, currency, receipt } = await req.json();

        const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
        const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay keys not configured in Edge Function");
        }

        // Create Order via Razorpay API
        // Using fetch because native SDK might have Deno compat issues
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

        const razorpayResp = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert to paisa/cents
                currency: currency || "INR",
                receipt: receipt, // Subscription ID
                payment_capture: 1
            })
        });

        if (!razorpayResp.ok) {
            const errorData = await razorpayResp.json();
            console.error("Razorpay API Error:", errorData);
            throw new Error(`Razorpay Error: ${errorData.error?.description || 'Unknown error'}`);
        }

        const orderData = await razorpayResp.json();

        return new Response(JSON.stringify({
            order_id: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency,
            key_id: RAZORPAY_KEY_ID // Return public key so frontend can open modal
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
