-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('campaign', 'post', 'audience', 'schedule')),
  visibility TEXT NOT NULL CHECK (visibility IN ('private', 'team')) DEFAULT 'private',
  platform_supported TEXT[],
  configuration JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create presets table
CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preset_type TEXT NOT NULL CHECK (preset_type IN ('audience', 'budget', 'caption_tone', 'hashtag', 'schedule')),
  configuration JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create template_usage_logs table
CREATE TABLE IF NOT EXISTS template_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE SET NULL,
  used_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  campaign_id UUID, -- Can be nullable if used for something else
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create preset_usage_logs table
CREATE TABLE IF NOT EXISTS preset_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id UUID NOT NULL REFERENCES presets(id) ON DELETE SET NULL,
  used_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  applied_to TEXT CHECK (applied_to IN ('campaign', 'post')),
  applied_to_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for templates
CREATE POLICY "Users can view their own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for presets
CREATE POLICY "Users can view their own presets"
  ON presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presets"
  ON presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets"
  ON presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets"
  ON presets FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for logs (View only for owner of usage or admin, usually just insert and read own)
CREATE POLICY "Users can view their own template usage"
  ON template_usage_logs FOR SELECT
  USING (auth.uid() = used_by_user_id);

CREATE POLICY "Users can insert their own template usage"
  ON template_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = used_by_user_id);

CREATE POLICY "Users can view their own preset usage"
  ON preset_usage_logs FOR SELECT
  USING (auth.uid() = used_by_user_id);

CREATE POLICY "Users can insert their own preset usage"
  ON preset_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = used_by_user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(template_type);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_type ON presets(preset_type);
