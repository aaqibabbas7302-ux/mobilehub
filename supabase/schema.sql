-- MobileHub Delhi - Complete Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE condition_grade AS ENUM ('A+', 'A', 'B+', 'B', 'C', 'D');
CREATE TYPE phone_status AS ENUM ('Available', 'Reserved', 'Sold', 'Under Repair', 'Quality Check', 'Listed Online');
CREATE TYPE blacklist_status AS ENUM ('Clear', 'Blacklisted', 'Unknown');
CREATE TYPE warranty_type AS ENUM ('No Warranty', '30 Days', '60 Days', '90 Days', 'Brand Warranty');
CREATE TYPE payment_method AS ENUM ('Cash', 'UPI', 'Card', 'EMI', 'Bank Transfer');
CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Refunded', 'Partial');
CREATE TYPE order_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Returned');
CREATE TYPE inquiry_source AS ENUM ('WhatsApp', 'Website', 'Walk-in', 'OLX', 'Phone Call');

-- ============================================
-- SELLERS TABLE
-- ============================================

CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  alternate_phone VARCHAR(15),
  email VARCHAR(100),
  id_proof_type VARCHAR(30), -- Aadhaar, PAN, Driving License
  id_proof_number VARCHAR(50),
  address TEXT,
  city VARCHAR(50) DEFAULT 'Delhi',
  pincode VARCHAR(10),
  notes TEXT,
  total_phones_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  whatsapp_number VARCHAR(15),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(50) DEFAULT 'Delhi',
  pincode VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active', -- active, vip, inactive
  total_purchases INTEGER DEFAULT 0,
  total_spent_paise BIGINT DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PHONES (INVENTORY) TABLE
-- ============================================

CREATE TABLE phones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  brand VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  model_number VARCHAR(50),
  variant VARCHAR(30), -- "8GB/128GB"
  color VARCHAR(30),
  
  -- Identification
  imei_1 VARCHAR(15) UNIQUE NOT NULL,
  imei_2 VARCHAR(15),
  serial_number VARCHAR(50),
  imei_verified BOOLEAN DEFAULT false,
  blacklist_status blacklist_status DEFAULT 'Unknown',
  
  -- Condition Assessment
  condition_grade condition_grade NOT NULL,
  screen_condition VARCHAR(50),
  body_condition VARCHAR(50),
  battery_health_percent INTEGER CHECK (battery_health_percent BETWEEN 0 AND 100),
  
  -- Functional Tests
  face_id_working BOOLEAN DEFAULT true,
  fingerprint_working BOOLEAN DEFAULT true,
  buttons_working BOOLEAN DEFAULT true,
  speakers_working BOOLEAN DEFAULT true,
  microphone_working BOOLEAN DEFAULT true,
  cameras_working VARCHAR(20) DEFAULT 'Both', -- Front, Back, Both, None
  wifi_working BOOLEAN DEFAULT true,
  bluetooth_working BOOLEAN DEFAULT true,
  charging_port_condition VARCHAR(30) DEFAULT 'Good',
  
  -- Pricing (stored in paise for precision, 1 INR = 100 paise)
  cost_price_paise BIGINT NOT NULL,
  selling_price_paise BIGINT NOT NULL,
  original_mrp_paise BIGINT,
  minimum_price_paise BIGINT,
  
  -- Refurbishment
  is_refurbished BOOLEAN DEFAULT false,
  refurbishment_details TEXT,
  accessories_included TEXT[], -- ['Charger', 'Box', 'Earphones']
  
  -- Warranty
  warranty_type warranty_type DEFAULT 'No Warranty',
  warranty_end_date DATE,
  
  -- Tax & Legal
  gst_applicable BOOLEAN DEFAULT true,
  original_invoice_available BOOLEAN DEFAULT false,
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
  
  -- Inventory Status
  status phone_status DEFAULT 'Available',
  location VARCHAR(50) DEFAULT 'Store',
  listed_on TEXT[], -- ['Website', 'OLX']
  
  -- Media
  images TEXT[], -- Array of image URLs
  video_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  
  -- Search optimization
  search_text TEXT GENERATED ALWAYS AS (
    LOWER(brand || ' ' || model_name || ' ' || COALESCE(variant, '') || ' ' || COALESCE(color, ''))
  ) STORED
);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  
  -- References
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
  
  -- Customer details (denormalized for invoice)
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,
  customer_address TEXT,
  
  -- Pricing (in paise)
  selling_price_paise BIGINT NOT NULL,
  discount_paise BIGINT DEFAULT 0,
  gst_amount_paise BIGINT DEFAULT 0,
  final_amount_paise BIGINT NOT NULL,
  
  -- Payment
  payment_method payment_method,
  payment_status payment_status DEFAULT 'Pending',
  emi_provider VARCHAR(50),
  emi_tenure_months INTEGER,
  transaction_id VARCHAR(100),
  
  -- Order Status
  status order_status DEFAULT 'Pending',
  
  -- Invoice
  gst_invoice_number VARCHAR(50),
  invoice_url TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- WHATSAPP CONVERSATIONS TABLE
-- ============================================

CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone VARCHAR(15) NOT NULL,
  customer_name VARCHAR(100),
  message_type VARCHAR(20), -- incoming, outgoing
  message_content TEXT,
  message_id VARCHAR(100), -- WhatsApp message ID
  
  -- AI Context
  intent VARCHAR(50), -- search, inquiry, support, complaint
  extracted_brand VARCHAR(50),
  extracted_model VARCHAR(100),
  extracted_budget_min BIGINT,
  extracted_budget_max BIGINT,
  
  -- Response tracking
  response_sent BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INQUIRIES TABLE
-- ============================================

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
  
  source inquiry_source NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,
  customer_name VARCHAR(100),
  
  inquiry_text TEXT,
  status VARCHAR(30) DEFAULT 'New', -- New, Contacted, Interested, Converted, Lost
  
  -- Conversation tracking for WhatsApp chats
  metadata JSONB DEFAULT '{}', -- Stores intent, brand, budget, bot_reply, etc.
  
  assigned_to VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  followed_up_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Phones indexes
CREATE INDEX idx_phones_brand ON phones(brand);
CREATE INDEX idx_phones_status ON phones(status);
CREATE INDEX idx_phones_selling_price ON phones(selling_price_paise);
CREATE INDEX idx_phones_condition ON phones(condition_grade);
CREATE INDEX idx_phones_search ON phones USING gin(to_tsvector('english', search_text));
CREATE INDEX idx_phones_created ON phones(created_at DESC);

-- Customers indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_whatsapp ON customers(whatsapp_number);

-- Orders indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_phone ON orders(phone_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Conversations indexes
CREATE INDEX idx_conversations_phone ON whatsapp_conversations(customer_phone);
CREATE INDEX idx_conversations_created ON whatsapp_conversations(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phones_updated_at
  BEFORE UPDATE ON phones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample sellers
INSERT INTO sellers (name, phone, city, address) VALUES
('Rahul Sharma', '9876543210', 'Delhi', 'Nehru Place, New Delhi'),
('Amit Kumar', '9876543211', 'Delhi', 'Lajpat Nagar, New Delhi');

-- Insert sample phones
INSERT INTO phones (
  brand, model_name, variant, color, imei_1, condition_grade, 
  battery_health_percent, cost_price_paise, selling_price_paise, 
  original_mrp_paise, warranty_type, status, images
) VALUES
('Apple', 'iPhone 13', '128GB', 'Midnight', '123456789012345', 'A+', 92, 4500000, 5299900, 7990000, '60 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=iPhone+13']),
('Samsung', 'Galaxy S23', '8GB/256GB', 'Phantom Black', '123456789012346', 'A', 88, 4000000, 4899900, 7499900, '30 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=Galaxy+S23']),
('OnePlus', '11R 5G', '8GB/128GB', 'Sonic Black', '123456789012347', 'A+', 95, 2500000, 3199900, 3999900, '60 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=OnePlus+11R']),
('Apple', 'iPhone 12', '64GB', 'Blue', '123456789012348', 'B+', 84, 2800000, 3499900, 6590000, '30 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=iPhone+12']),
('Xiaomi', 'Redmi Note 12 Pro', '8GB/128GB', 'Glacier Blue', '123456789012349', 'A', 96, 1500000, 1899900, 2799900, '30 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=Redmi+Note+12']),
('Samsung', 'Galaxy A54 5G', '8GB/256GB', 'Awesome Graphite', '123456789012350', 'A+', 98, 2200000, 2799900, 3899900, '60 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=Galaxy+A54']),
('Apple', 'iPhone 14 Pro', '256GB', 'Deep Purple', '123456789012351', 'A', 90, 7500000, 8999900, 12990000, '90 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=iPhone+14+Pro']),
('OnePlus', 'Nord CE 3', '8GB/128GB', 'Aqua Surge', '123456789012352', 'B+', 91, 1800000, 2299900, 2699900, '30 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=OnePlus+Nord']),
('Vivo', 'V29 Pro', '8GB/256GB', 'Starry Purple', '123456789012353', 'A+', 99, 3000000, 3699900, 4699900, '60 Days', 'Available', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=Vivo+V29+Pro']),
('Realme', 'GT Neo 5', '8GB/128GB', 'Black', '123456789012354', 'A', 94, 2000000, 2599900, 3499900, '30 Days', 'Reserved', ARRAY['https://placehold.co/400x400/1a1a1a/white?text=Realme+GT']);

-- Insert sample customers
INSERT INTO customers (name, phone, whatsapp_number, city) VALUES
('Priya Singh', '9988776655', '9988776655', 'Delhi'),
('Vikram Mehta', '9988776656', '9988776656', 'Noida');
