-- Add missing columns to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Link master_posts to campaigns
ALTER TABLE master_posts
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
