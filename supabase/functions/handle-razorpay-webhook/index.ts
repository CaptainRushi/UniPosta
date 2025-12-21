import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Debugging logs
    console.log("Webhook Received");

    if (!signature || !webhookSecret || !supabaseUrl || !serviceKey) {
        console.error("Missing config or signature");
        return new Response("Missing configuration", { status: 500 });
    }

    // 🔐 Verify Razorpay webhook signature
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

    if (expectedSignature !== signature) {
        console.error("Invalid Signature");
        return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(body);

    // Only handle payment success
    if (payload.event !== "payment.captured") {
        return new Response("Event ignored", { status: 200 });
    }

    const payment = payload.payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;
    // const amountPaid = payment.amount / 100; // Unused variable

    const supabase = createClient(supabaseUrl, serviceKey);

    console.log(`Processing Order: ${razorpayOrderId}`);

    // Find payment record
    // NOTE: Schema uses gateway_order_id, mapped from razorpay_order_id concept
    const { data: paymentRow, error } = await supabase
        .from("payments")
        .select("*")
        .eq("gateway_order_id", razorpayOrderId)
        .single();

    if (error || !paymentRow) {
        console.error("Payment record not found for", razorpayOrderId);
        return new Response("Payment record not found", { status: 404 });
    }

    // Update payment status
    await supabase
        .from("payments")
        .update({
            status: "paid",
            gateway_payment_id: razorpayPaymentId,
            gateway: "razorpay"
        })
        .eq("id", paymentRow.id);

    // Activate subscription
    await supabase
        .from("subscriptions")
        .update({
            status: "active",
            start_date: new Date().toISOString(),
            end_date: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
        })
        .eq("id", paymentRow.subscription_id);

    console.log("Subscription activated for", paymentRow.subscription_id);

    return new Response("Payment verified & subscription activated", {
        status: 200,
    });
});
