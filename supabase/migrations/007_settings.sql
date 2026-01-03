-- Settings Table for Store Configuration
-- Run this migration in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Store Info
  store_name VARCHAR(255) DEFAULT 'MobileHub Delhi',
  tagline VARCHAR(255) DEFAULT 'Premium Second-Hand Phones in Delhi',
  description TEXT,
  logo_url VARCHAR(500),
  
  -- Contact Details
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  open_time VARCHAR(20) DEFAULT '10:00 AM',
  close_time VARCHAR(20) DEFAULT '9:00 PM',
  
  -- Social Media
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  twitter VARCHAR(100),
  youtube VARCHAR(100),
  
  -- WhatsApp Settings
  whatsapp_number VARCHAR(50),
  welcome_message TEXT,
  ai_auto_reply BOOLEAN DEFAULT true,
  agent_name VARCHAR(100) DEFAULT 'MobileHub Assistant',
  response_language VARCHAR(100) DEFAULT 'Hindi + English (Hinglish)',
  suggest_alternatives BOOLEAN DEFAULT true,
  
  -- Notification Settings
  notify_new_order BOOLEAN DEFAULT true,
  notify_inquiry BOOLEAN DEFAULT true,
  notify_low_stock BOOLEAN DEFAULT true,
  notify_daily_summary BOOLEAN DEFAULT false,
  notify_marketing BOOLEAN DEFAULT false,
  
  -- Security Settings
  two_factor_auth BOOLEAN DEFAULT false,
  login_alerts BOOLEAN DEFAULT true,
  session_timeout BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 30,
  
  -- Admin Credentials (hashed in production)
  admin_username VARCHAR(100) DEFAULT 'admin',
  admin_password_hash VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_updated ON settings(updated_at);

-- Insert default settings if table is empty
INSERT INTO settings (
  store_name,
  tagline,
  description,
  phone,
  email,
  website,
  address,
  whatsapp_number,
  welcome_message
) 
SELECT 
  'MobileHub Delhi',
  'Premium Second-Hand Phones in Delhi',
  'Delhi''s most trusted destination for certified pre-owned smartphones. Quality guaranteed with warranty.',
  '+91 99107 24940',
  'contact@mobilehubdelhi.com',
  'https://mobilehubdelhi.com',
  '123 Mobile Market, Karol Bagh, New Delhi - 110005',
  '+91 99107 24940',
  '🙏 Namaste! Welcome to MobileHub Delhi. How can I help you find your perfect phone today?'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);
