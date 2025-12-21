# Uniposta - Unified Social Publishing Platform

Uniposta is a comprehensive SaaS application designed to streamline social media management. It allows users to create campaigns, manage posts across multiple platforms, and track performance from a single, unified dashboard.

## 🚀 Key Features

*   **Campaign Management**: 
    *   Create, track, and organize advertising campaigns.
    *   Set objectives, start/end dates, and manage campaign status.
*   **Multi-Platform Posting**: 
    *   Create content once and publish to Facebook, Instagram, LinkedIn, and X (Twitter).
    *   Platform-specific customizations and previews.
*   **Global Search**: 
    *   Instantly find campaigns, posts, and connected accounts.
    *   Keyboard shortcut support (`Cmd+K` / `Ctrl+K`).
*   **User Subscriptions & Billing**: 
    *   **Instant Activation**: Razorpay integration with real-time signature verification via Edge Functions (`verify-payment`).
    *   **Starter Plan**: Essential features for individuals (Limited campaigns/posts).
    *   **Pro Plan**: Advanced features for agencies (Unlimited access, Priority support).
    *   Dynamic plan enforcement and UI customization.
*   **Authentication**: 
    *   **Social Login**: Google, Facebook, etc.
    *   **Secure**: Supabase Auth with Row Level Security (RLS).
*   **Social Account Integration**: 
    *   Secure OAuth connections to social platforms.
    *   Visual management of connected accounts in usage settings.
*   **Modern UI/UX**: 
    *   Built with a "Glassmorphism" aesthetic.
    *   Dark mode optimized, responsive design.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Shadcn UI, Lucas Icons
*   **Backend**: Supabase
    *   **Database**: PostgreSQL with Row Level Security (RLS)
    *   **Auth**: Supabase Auth (Email/Password, Google OAuth)
    *   **Storage**: Supabase Storage buckets for media
    *   **Edge Functions**: Deno-based serverless functions for critical logic.
*   **State Management**: React Query (TanStack Query), Context API
*   **Billing Infrastructure**:
    *   **Razorpay**: Native support for subscriptions and INR invoicing.
    *   **Instant Verification**: Custom verification logic for immediate plan upgrades.

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18+)
*   NPM
*   Supabase project (for backend)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd AdSync-1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with your Supabase and Razorpay credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```

4.  **Database Setup**
    Run the migration files located in `supabase/migrations` to set up the database schema, including:
    *   Campaigns & Posts tables
    *   Social Accounts table
    *   Profiles table (for plan management)
    *   Storage buckets and policies

5.  **Run the application**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `src/pages`: Main application routes (Dashboard, Campaigns, Create Post, Billing, etc.)
*   `src/components`: Reusable UI components.
    *   `src/components/campaigns`: Campaign-specific logic (Create Dialog, Lists).
    *   `src/components/notifications`: Notification panel.
    *   `src/components/search`: Global search implementation.
    *   `src/components/social`: Social account management panels.
*   `supabase/functions`: Deno-based Edge Functions (`verify-payment`, `create-payment-order`, etc.).
*   `supabase/migrations`: SQL scripts for database schema management.

## ☁️ Backend Deployment

### Edge Functions
Deploy specific functions using the Supabase CLI:

```bash
# Payment & Billing
supabase functions deploy create-payment-order --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt

# AI & Media
supabase functions deploy ai-adaptation --no-verify-jwt
supabase functions deploy media-processing --no-verify-jwt
```

### Secrets
Set necessary secrets for the functions to work:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set RAZORPAY_KEY_ID=rzp_...
supabase secrets set RAZORPAY_KEY_SECRET=...
```

## 🛡️ License

This project is proprietary and confidential.
heelo

