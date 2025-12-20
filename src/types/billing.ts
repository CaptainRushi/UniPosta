export interface BillingPlan {
    id: string;
    name: string;
    description: string | null;
    tier: 'starter' | 'pro' | 'enterprise';
    price: number;
    currency: string;
    interval: 'month' | 'year' | 'one_time';
    features: string[];
    is_active: boolean;
    provider_config: Record<string, any>; // { razorpay: { plan_id: "..." } }
}

export interface BillingSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    // Expanded status options
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused' | 'pending' | 'expired';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    provider_id: string;
    provider_subscription_id?: string;
    created_at: string;
}

export interface BillingInvoice {
    id: string;
    invoice_number: string | null;
    user_id: string;
    subscription_id: string | null;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    invoice_pdf_url: string | null;
    created_at: string;
}

export interface BillingPayment {
    id: string;
    invoice_id: string | null;
    amount: number;
    status: 'succeeded' | 'failed' | 'pending';
    provider_id: string;
    created_at: string;
}
