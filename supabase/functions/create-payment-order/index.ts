import { serve } from "http/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("create-payment-order function loaded");

serve(async (req: Request) => {
    // 1. Handle CORS Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 2. Body Parsing (Robust)
        let body;
        try {
            const text = await req.text();
            if (!text) {
                throw new Error("Empty request body");
            }
            body = JSON.parse(text);
        } catch (e: any) {
            return new Response(JSON.stringify({ error: "Invalid JSON body", details: e.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const { amount, currency, receipt } = body;

        // 3. Environment Check
        const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
        const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error("Missing Razorpay Keys in Environment");
            throw new Error("Server misconfiguration: Razorpay keys not found.");
        }

        console.log(`Creating order for: ${amount} ${currency || "INR"} (Receipt: ${receipt})`);

        // 4. Razorpay Request
        const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

        const razorpayResp = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency: currency || "INR",
                receipt: receipt,
                payment_capture: 1
            })
        });

        const respText = await razorpayResp.text();

        if (!razorpayResp.ok) {
            console.error("Razorpay API Error Response:", respText);
            let errorDesc = "Unknown upstream error";
            try {
                const errJson = JSON.parse(respText);
                errorDesc = errJson.error?.description || errJson.message || errorDesc;
            } catch (e) { /* ignore */ }

            throw new Error(`Razorpay Provider Error: ${errorDesc}`);
        }

        const orderData = JSON.parse(respText);
        console.log("Order created successfully:", orderData.id);

        return new Response(JSON.stringify({
            order_id: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency,
            key_id: RAZORPAY_KEY_ID
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Function Handler Error:", error);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
