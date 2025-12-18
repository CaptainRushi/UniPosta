# AdSync Backend Setup

This project uses Supabase as the backend infrastructure.

## Prerequisites

1.  Create a Supabase project at [database.new](https://database.new).
2.  Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Setup Steps

### 1. Environment Variables

Create a `.env` file in the root directory (copy from `.env.example` if available) and add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema

Go to the SQL Editor in your Supabase Dashboard and run the contents of `supabase/migrations/20240101000000_initial_schema.sql`.

This will create:
-   `master_posts`: Stores original content.
-   `platform_variants`: Stores AI-adapted content.
-   `campaigns`: Manages ad campaigns.
-   `analytics_events`: Stores performance metrics.
-   **RLS Policies**: Ensures users can only access their own data.

### 3. Edge Functions

You need to deploy the Edge Functions.

1.  Install Supabase CLI.
2.  Login: `supabase login`
3.  Link project: `supabase link --project-ref your-project-ref`
4.  Deploy functions:
    ```bash
    supabase functions deploy ai-adaptation --no-verify-jwt
    supabase functions deploy media-processing --no-verify-jwt
    ```
5.  Set Secrets for Edge Functions:
    ```bash
    supabase secrets set OPENAI_API_KEY=sk-...
    ```

### 4. Storage

Create a public storage bucket named `media` in your Supabase Storage dashboard.

## API Usage

Use the helper in `src/lib/api.ts` to interact with the backend services.

```typescript
import { api } from "@/lib/api";

// Adapt content
const result = await api.ai.adaptContent({
  master_post_content: "Hello world",
  target_platform: "twitter",
  tone: "professional"
});
```
