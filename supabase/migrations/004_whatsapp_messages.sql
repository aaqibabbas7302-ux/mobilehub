-- Migration: Add WhatsApp messages table for conversation history
-- Each message is stored individually, grouped by customer phone number

-- ============================================
-- WHATSAPP MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer reference (auto-created if new)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  
  -- Message details
  message_id VARCHAR(100) UNIQUE, -- WhatsApp message ID for deduplication
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, document, audio, video
  message_text TEXT,
  media_url TEXT,
  
  -- AI/Bot processing
  is_bot_reply BOOLEAN DEFAULT FALSE,
  ai_context JSONB DEFAULT '{}', -- intent, brand, budget, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'delivered', -- sent, delivered, read, failed
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_whatsapp_messages_customer_phone ON whatsapp_messages(customer_phone);
CREATE INDEX idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);

-- ============================================
-- CONVERSATION THREADS VIEW
-- ============================================

-- View to get latest message per customer for conversation list
CREATE OR REPLACE VIEW conversation_threads AS
SELECT DISTINCT ON (customer_phone)
  customer_phone,
  customer_name,
  customer_id,
  message_text AS last_message,
  direction AS last_message_direction,
  created_at AS last_message_at,
  (SELECT COUNT(*) FROM whatsapp_messages wm2 
   WHERE wm2.customer_phone = whatsapp_messages.customer_phone 
   AND wm2.direction = 'inbound' 
   AND wm2.read_at IS NULL) AS unread_count
FROM whatsapp_messages
ORDER BY customer_phone, created_at DESC;

-- ============================================
-- UPDATE ORDERS TABLE - Add sale channel
-- ============================================

-- Add sale channel column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'sale_channel'
  ) THEN
    ALTER TABLE orders ADD COLUMN sale_channel VARCHAR(30) DEFAULT 'Store';
  END IF;
END $$;

-- Add invoice_url column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_url TEXT;
  END IF;
END $$;

-- Add invoice_sent_at column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'invoice_sent_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN invoice_sent_at TIMESTAMP;
  END IF;
END $$;

-- ============================================
-- UPDATE PHONES TABLE - Add sold_via column
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phones' AND column_name = 'sold_via'
  ) THEN
    ALTER TABLE phones ADD COLUMN sold_via VARCHAR(30);
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE whatsapp_messages IS 'Stores all WhatsApp conversation messages';
COMMENT ON COLUMN whatsapp_messages.direction IS 'inbound = from customer, outbound = from business';
COMMENT ON COLUMN whatsapp_messages.ai_context IS 'AI extracted context: intent, brand, model, budget';
COMMENT ON COLUMN orders.sale_channel IS 'Store, WhatsApp, Website, OLX';
COMMENT ON COLUMN phones.sold_via IS 'Store, WhatsApp, Website - set when status becomes Sold';
