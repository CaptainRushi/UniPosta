# SaaS Billing System Architecture (No Stripe)

## 1. Overview
This billing system is designed to be payment-provider agnostic, supporting a "Adapter" pattern to easily plug in Razorpay, PayPal, Cashfree, or others. It separates core billing logic (subscriptions, invoicing, plans) from the actual payment processing.

## 2. Core Components

### A. Billing Core (The Brain)
- Manages strict state of Subscriptions (Active, Past Due, Canceled).
- Generates generic Invoices with Tax (GST/VAT) logic.
- Handles Proration and Upgrades/Downgrades internally before syncing with the provider.

### B. Payment Adapter Layer (The Interface)
Each provider (Razorpay, PayPal, etc.) has an adapter implementing a standard interface:
- `createCustomer(user)`
- `createSubscription(planId, customerId)`
- `cancelSubscription(subId)`
- `verifyWebhookSignature(payload, headers)`

### C. Database Layer (The Source of Truth)
- Stores mapped IDs (e.g., `local_plan_id` -> `razorpay_plan_id`).
- Logs all payment events for audit trails.

## 3. Database Schema

### `billing_plans`
Defines the product catalog in a provider-agnostic way.
- `id`: UUID (Internal ID)
- `name`: Text
- `tier`: 'starter' | 'pro' | 'enterprise'
- `price`: Decimal
- `currency`: 'USD' | 'INR'
- `interval`: 'month' | 'year'
- `provider_config`: JSONB (Maps provider-specific Plan IDs: `{ "razorpay": "plan_HIh...", "paypal": "P-..." }`)

### `billing_customers`
Maps local users to external customers.
- `user_id`: UUID
- `provider`: 'razorpay' | 'paypal' | 'cashfree'
- `provider_customer_id`: Text
- `default_payment_method`: Text

### `billing_subscriptions`
The master record of access.
- `id`: UUID
- `user_id`: UUID
- `plan_id`: UUID
- `status`: 'active' | 'trialing' | 'canceled' | 'past_due'
- `current_period_end`: Timestamp
- `cancel_at_period_end`: Boolean
- `provider_subscription_id`: Text (The external ID)
- `provider`: Text

### `billing_invoices`
Generated PDF-ready invoices.
- `id`: UUID
- `invoice_number`: Text (Sequential, e.g., INV-2025-001)
- `user_id`: UUID
- `amount_total`: Decimal
- `tax_amount`: Decimal
- `tax_type`: 'GST' | 'VAT' | 'None'
- `tax_breakdown`: JSONB (`{ "cgst": 9.0, "sgst": 9.0 }`)
- `status`: 'paid' | 'open' | 'void'
- `billing_address`: JSONB

### `billing_payments`
Transaction log.
- `id`: UUID
- `invoice_id`: UUID
- `provider_transaction_id`: Text
- `amount`: Decimal
- `status`: 'success' | 'failed'
- `method`: 'upi' | 'card' | 'wallet'

## 4. API / Functions Flow

### Create Subscription
1. Frontend selects Plan.
2. Call API `create_subscription(planId, provider)`.
3. Backend:
   - Check if `billing_customer` exists for provider. If not, create one.
   - Look up `provider_plan_id` from `billing_plans`.
   - Call `ProviderAdapter.createSubscription()`.
   - Return subscription ID / checkout URL / payment link to frontend.
4. Frontend handles payment flow (e.g., Razorpay Modal).

### Webhook Handling
1. Provider sends webhook (Payment Success).
2. Edge Function `handle-webhook` verifies signature.
3. Normalizes payload to internal event: `PAYMENT_SUCCESS`.
4. Updates `billing_payments` and `billing_invoices`.
5. Updates `billing_subscriptions` status.
6. Updates `profiles.plan`.

## 5. Security
- Row Level Security (RLS) on all tables.
- Webhooks protected by signature verification.
- No raw card data stored (using Provider Tokens).
