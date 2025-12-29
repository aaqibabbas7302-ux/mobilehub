-- MobileHub Delhi - Complete Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Delhi',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'vip', 'new', 'inactive')),
    total_orders INTEGER DEFAULT 0,
    total_spent_paise BIGINT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for search
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Phone details
    phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
    phone_name VARCHAR(255) NOT NULL,
    phone_brand VARCHAR(100),
    phone_variant VARCHAR(100),
    phone_imei VARCHAR(20),
    
    -- Pricing
    amount_paise BIGINT NOT NULL,
    discount_paise BIGINT DEFAULT 0,
    final_amount_paise BIGINT NOT NULL,
    
    -- Order status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
    payment_method VARCHAR(50),
    
    -- Shipping
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_pincode VARCHAR(10),
    tracking_number VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'phone', 'walk-in', 'referral', 'other')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'replied', 'in_progress', 'converted', 'closed')),
    interested_in VARCHAR(255),
    phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
    assigned_to VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_source ON inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order number
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_order_number();

-- Function to update customer stats when order is completed
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        UPDATE customers
        SET 
            total_orders = total_orders + 1,
            total_spent_paise = total_spent_paise + NEW.final_amount_paise,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating customer stats
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_inquiries_updated_at ON inquiries;
CREATE TRIGGER trigger_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ADD DESCRIPTION COLUMN TO PHONES IF NOT EXISTS
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phones' AND column_name = 'description') THEN
        ALTER TABLE phones ADD COLUMN description TEXT;
    END IF;
END $$;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample customers
INSERT INTO customers (name, email, phone, status, total_orders, total_spent_paise) VALUES
    ('Rahul Sharma', 'rahul@email.com', '+91 98765 43210', 'vip', 5, 23499900),
    ('Priya Patel', 'priya@email.com', '+91 98765 43211', 'active', 3, 14999700),
    ('Amit Kumar', 'amit@email.com', '+91 98765 43212', 'new', 1, 4499900),
    ('Neha Singh', 'neha@email.com', '+91 98765 43213', 'vip', 8, 38999200),
    ('Vikash Gupta', 'vikash@email.com', '+91 98765 43214', 'active', 2, 8999800)
ON CONFLICT DO NOTHING;

-- Insert sample inquiries
INSERT INTO inquiries (name, phone, message, source, status, interested_in) VALUES
    ('Arjun Mehta', '+91 98765 43210', 'Hi, I''m looking for iPhone 15 Pro Max 256GB. Is it available?', 'whatsapp', 'new', 'iPhone 15 Pro Max'),
    ('Deepika Sharma', '+91 87654 32109', 'Do you have Samsung S24 Ultra in stock? Looking for 512GB variant.', 'whatsapp', 'replied', 'Samsung S24 Ultra'),
    ('Rohit Verma', '+91 76543 21098', 'I want to buy OnePlus 12. What warranty do you provide?', 'website', 'new', 'OnePlus 12'),
    ('Ananya Gupta', '+91 65432 10987', 'Looking for a good phone under 30K with good camera.', 'whatsapp', 'converted', 'Budget Phones'),
    ('Karan Singh', '+91 54321 09876', 'Is Google Pixel 8 Pro available?', 'website', 'closed', 'Google Pixel 8 Pro')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON inquiries FOR ALL USING (true);

-- Allow anonymous read for public API
CREATE POLICY "Allow anon read" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON inquiries FOR SELECT USING (true);
