-- Funnel Integration: Instagram & Facebook Leads
-- Allows connecting social accounts, capturing leads, and messaging followers

-- Social Media Connections Table
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(20) NOT NULL, -- 'instagram', 'facebook'
  account_id VARCHAR(100), -- Platform account ID
  account_name VARCHAR(100), -- Username or page name
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  page_id VARCHAR(100), -- For Facebook pages
  instagram_business_id VARCHAR(100), -- For Instagram business accounts
  is_connected BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads Table (from funnels, forms, social media)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  source VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'whatsapp', 'website', 'manual'
  source_campaign VARCHAR(100), -- Campaign or ad name
  source_post_id VARCHAR(100), -- Post/ad ID that generated the lead
  platform_user_id VARCHAR(100), -- Instagram/Facebook user ID
  platform_username VARCHAR(100), -- Instagram/Facebook username
  profile_picture_url TEXT,
  status VARCHAR(30) DEFAULT 'new', -- 'new', 'contacted', 'interested', 'converted', 'not_interested', 'spam'
  tags TEXT[], -- For categorization
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Followers Table (synced from Instagram/Facebook)
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(20) NOT NULL, -- 'instagram', 'facebook'
  platform_user_id VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  full_name VARCHAR(100),
  profile_picture_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_business BOOLEAN DEFAULT false,
  can_message BOOLEAN DEFAULT true, -- If we can send DM
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, platform_user_id)
);

-- Message Templates for bulk messaging
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  platform VARCHAR(20), -- 'instagram', 'facebook', 'whatsapp', 'all'
  content TEXT NOT NULL,
  variables TEXT[], -- e.g., ['name', 'phone_model']
  category VARCHAR(50), -- 'welcome', 'promotion', 'followup', 'custom'
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Campaigns for bulk sending
CREATE TABLE IF NOT EXISTS message_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  platform VARCHAR(20) NOT NULL, -- 'instagram', 'facebook', 'whatsapp'
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  message_content TEXT NOT NULL,
  target_audience VARCHAR(50), -- 'all_followers', 'new_leads', 'selected', 'tags'
  target_tags TEXT[], -- Filter by tags
  target_count INTEGER DEFAULT 0, -- Number of recipients
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'cancelled'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Logs for tracking individual messages
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES message_campaigns(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL,
  recipient_type VARCHAR(20), -- 'lead', 'follower', 'customer'
  recipient_id UUID, -- lead_id, follower_id, or customer_id
  recipient_platform_id VARCHAR(100), -- Platform user ID
  recipient_name VARCHAR(100),
  message_content TEXT,
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_followers_platform ON followers(platform);
CREATE INDEX IF NOT EXISTS idx_followers_username ON followers(username);
CREATE INDEX IF NOT EXISTS idx_message_campaigns_status ON message_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_campaign ON message_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON message_logs(status);

-- Insert default message templates
INSERT INTO message_templates (name, platform, content, variables, category) VALUES
  ('Welcome New Follower', 'instagram', 'Hi {{name}}! 👋 Thanks for following MobileHub Delhi! Looking for a smartphone? Check out our latest collection. DM us for exclusive deals!', ARRAY['name'], 'welcome'),
  ('New Arrival Alert', 'all', 'Hey {{name}}! 📱 We just got {{phone_model}} in stock! Limited pieces available. DM or visit our store for best prices!', ARRAY['name', 'phone_model'], 'promotion'),
  ('Lead Follow-up', 'all', 'Hi {{name}}, hope you''re doing well! Just checking if you''re still interested in {{phone_model}}. We have some great offers running this week! 🔥', ARRAY['name', 'phone_model'], 'followup'),
  ('Festival Offer', 'all', 'Hello {{name}}! 🎉 Festive season sale is LIVE! Get up to 20% off on all phones. Visit MobileHub Delhi or DM us now!', ARRAY['name'], 'promotion')
ON CONFLICT DO NOTHING;

-- Add field configs for leads
INSERT INTO field_config (table_name, field_name, field_label, field_type, is_system, is_visible, is_required, display_order, section, placeholder) VALUES
  ('leads', 'name', 'Name', 'text', true, true, false, 1, 'basic', 'Lead name'),
  ('leads', 'phone', 'Phone', 'text', true, true, false, 2, 'basic', '+91 98765 43210'),
  ('leads', 'email', 'Email', 'text', true, true, false, 3, 'basic', 'email@example.com'),
  ('leads', 'source', 'Source', 'select', true, true, true, 4, 'basic', NULL),
  ('leads', 'status', 'Status', 'select', true, true, false, 5, 'basic', NULL),
  ('leads', 'notes', 'Notes', 'textarea', true, false, false, 6, 'details', 'Additional notes')
ON CONFLICT (table_name, field_name) DO NOTHING;
