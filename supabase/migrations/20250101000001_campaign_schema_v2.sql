-- Upgrade Campaigns Table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Update campaign_status enum if needed (Supabase usually requires dropping and recreating or hacking pg_enum, 
-- but for simplicity/safety in this environment we will check if values exist or just accept strict typing in app layer if enum alteration is hard.
-- However, standard postgres approach:
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'scheduled';

-- Create campaign_platforms table
CREATE TABLE IF NOT EXISTS campaign_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL CHECK (platform_name IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok')),
    platform_account_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign_posts table (Assuming this links to master_posts via original_post_id)
CREATE TABLE IF NOT EXISTS campaign_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    original_post_id UUID REFERENCES master_posts(id) ON DELETE SET NULL,
    adapted_caption TEXT,
    adapted_hashtags TEXT[],
    media_url TEXT,
    platform_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost_per_result NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_platforms_campaign_id ON campaign_platforms(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign_id ON campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);

-- RLS Policies

-- campaign_platforms
ALTER TABLE campaign_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their campaign platforms"
    ON campaign_platforms
    USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_platforms.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- campaign_posts
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their campaign posts"
    ON campaign_posts
    USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_posts.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- campaign_analytics
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their campaign analytics"
    ON campaign_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_analytics.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );
