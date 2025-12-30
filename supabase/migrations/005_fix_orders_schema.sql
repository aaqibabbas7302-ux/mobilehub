-- Fix missing columns in orders table
-- Run this in Supabase SQL Editor to ensure all columns required by the API exist

-- Customer details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- Phone details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_brand VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_variant VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_imei VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_id UUID REFERENCES phones(id);

-- Financials
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_amount BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS selling_price BIGINT DEFAULT 0;

-- Shipping & Payment
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(20);

-- Meta
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sale_channel VARCHAR(30) DEFAULT 'Store';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP;

-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';
