
-- Create type for notification priority
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform platform_type, -- Can be null for system notifications
  read BOOLEAN DEFAULT false,
  priority notification_priority DEFAULT 'normal',
  link TEXT, -- Optional link to navigate to
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" -- For testing/demo purposes or if client side triggering is needed
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);
