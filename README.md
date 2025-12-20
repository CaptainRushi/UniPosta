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
*   **User Subscriptions**: 
    *   **Starter Plan**: Essential features for individuals (Limited campaigns/posts).
    *   **Pro Plan**: Advanced features for agencies (Unlimited access, Priority support).
    *   Dynamic plan enforcement and UI customization (e.g., Pro badges, content limits).
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
    *   **Auth**: Supabase Auth (Email/Password, OAuth)
    *   **Storage**: Supabase Storage buckets for media
    *   **Edge Functions**: For handling secure OAuth exchanges (e.g., `oauth-connect`, `publish-post`)
*   **State Management**: React Query (TanStack Query), Context API
*   **Billing Infrastructure**:
    *   **Provider Agnostic**: "Adapter" pattern supporting Razorpay, PayPal, etc.
    *   **India-First**: Native support for Razorpay subscriptions and INR invoicing.
    *   **Compliance**: GST-ready invoice generation schema.

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
    Create a `.env` file in the root directory with your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

*   `src/pages`: Main application routes (Dashboard, Campaigns, Plans, Create Post, etc.)
*   `src/components`: Reusable UI components.
    *   `src/components/campaigns`: Campaign-specific logic (Create Dialog, Lists).
    *   `src/components/notifications`: Notification panel.
    *   `src/components/search`: Global search implementation.
    *   `src/components/social`: Social account management panels.
*   `supabase/functions`: Deno-based Edge Functions for server-side logic.
*   `supabase/migrations`: SQL scripts for database schema management.

## 🛡️ License

This project is proprietary and confidential.
