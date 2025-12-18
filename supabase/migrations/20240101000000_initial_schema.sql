-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'live', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('twitter', 'linkedin', 'instagram', 'facebook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Master Posts Table
CREATE TABLE IF NOT EXISTS master_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  caption TEXT,
  media_url TEXT,
  cta_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Variants Table (AI Content Adaptation output)
CREATE TABLE IF NOT EXISTS platform_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_post_id UUID REFERENCES master_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform platform_type NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  media_url TEXT, -- Processed media URL
  posting_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  status campaign_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign Platform Details
CREATE TABLE IF NOT EXISTS campaign_platform_refs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform platform_type NOT NULL,
  platform_campaign_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  platform platform_type NOT NULL,
  metric_type TEXT NOT NULL, -- reach, impressions, clicks, conversions
  value NUMERIC NOT NULL,
  event_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE master_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_platform_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Master Posts
CREATE POLICY "Users can create their own master posts"
ON master_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own master posts"
ON master_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own master posts"
ON master_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own master posts"
ON master_posts FOR DELETE
USING (auth.uid() = user_id);

-- Platform Variants
CREATE POLICY "Users can access their own platform variants"
ON platform_variants FOR ALL
USING (auth.uid() = user_id);

-- Campaigns
CREATE POLICY "Users can access their own campaigns"
ON campaigns FOR ALL
USING (auth.uid() = user_id);

-- Campaign Refs
CREATE POLICY "Users can access their own campaign refs"
ON campaign_platform_refs FOR ALL
USING (auth.uid() = user_id);

-- Analytics
CREATE POLICY "Users can access their own analytics"
ON analytics_events FOR ALL
USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_master_posts_updated_at
BEFORE UPDATE ON master_posts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
