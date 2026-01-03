-- Field Configuration Table
-- Allows users to show/hide and customize fields for each entity type

CREATE TABLE IF NOT EXISTS field_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(50) NOT NULL, -- 'phones', 'customers', 'orders', 'inquiries'
  field_name VARCHAR(100) NOT NULL, -- field identifier
  field_label VARCHAR(100) NOT NULL, -- display name
  field_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'number', 'date', 'select', 'textarea', 'boolean'
  is_system BOOLEAN DEFAULT false, -- true for built-in fields, false for custom
  is_visible BOOLEAN DEFAULT true, -- show/hide in forms
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0, -- order in form
  options JSONB, -- for select fields
  placeholder VARCHAR(255),
  default_value TEXT,
  section VARCHAR(50) DEFAULT 'general', -- group fields into sections
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_name, field_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_field_config_table ON field_config(table_name);
CREATE INDEX IF NOT EXISTS idx_field_config_visible ON field_config(is_visible);
CREATE INDEX IF NOT EXISTS idx_field_config_order ON field_config(display_order);

-- Insert default phone fields
INSERT INTO field_config (table_name, field_name, field_label, field_type, is_system, is_visible, is_required, display_order, section, placeholder) VALUES
  ('phones', 'name', 'Phone Name', 'text', true, true, true, 1, 'basic', 'e.g., iPhone 15 Pro Max'),
  ('phones', 'brand', 'Brand', 'select', true, true, true, 2, 'basic', NULL),
  ('phones', 'model', 'Model Number', 'text', true, true, false, 3, 'basic', 'e.g., A2849'),
  ('phones', 'storage', 'Storage', 'select', true, true, false, 4, 'basic', NULL),
  ('phones', 'color', 'Color', 'text', true, true, false, 5, 'basic', 'e.g., Natural Titanium'),
  ('phones', 'imei', 'IMEI Number', 'text', true, true, true, 6, 'basic', '15-digit IMEI'),
  ('phones', 'quantity', 'Quantity', 'number', true, true, false, 7, 'basic', '1'),
  ('phones', 'condition', 'Condition', 'select', true, true, false, 8, 'condition', NULL),
  ('phones', 'batteryHealth', 'Battery Health (%)', 'number', true, true, false, 9, 'condition', 'e.g., 95'),
  ('phones', 'price', 'Selling Price (₹)', 'number', true, true, true, 10, 'pricing', NULL),
  ('phones', 'originalPrice', 'Original Price (₹)', 'number', true, true, false, 11, 'pricing', NULL),
  ('phones', 'cost', 'Cost Price (₹)', 'number', true, true, false, 12, 'pricing', NULL),
  ('phones', 'description', 'Description', 'textarea', true, true, false, 13, 'details', 'Add a detailed description...')
ON CONFLICT (table_name, field_name) DO NOTHING;

-- Insert default customer fields
INSERT INTO field_config (table_name, field_name, field_label, field_type, is_system, is_visible, is_required, display_order, section, placeholder) VALUES
  ('customers', 'name', 'Name', 'text', true, true, true, 1, 'basic', 'Customer name'),
  ('customers', 'phone', 'Phone', 'text', true, true, true, 2, 'basic', '+91 98765 43210'),
  ('customers', 'email', 'Email', 'text', true, true, false, 3, 'basic', 'customer@example.com'),
  ('customers', 'status', 'Status', 'select', true, true, false, 4, 'basic', NULL),
  ('customers', 'address', 'Address', 'textarea', true, false, false, 5, 'details', 'Full address'),
  ('customers', 'city', 'City', 'text', true, false, false, 6, 'details', 'City'),
  ('customers', 'notes', 'Notes', 'textarea', true, false, false, 7, 'details', 'Additional notes')
ON CONFLICT (table_name, field_name) DO NOTHING;

-- Insert default order fields
INSERT INTO field_config (table_name, field_name, field_label, field_type, is_system, is_visible, is_required, display_order, section, placeholder) VALUES
  ('orders', 'customer_id', 'Customer', 'select', true, true, true, 1, 'basic', NULL),
  ('orders', 'phone_id', 'Phone', 'select', true, true, true, 2, 'basic', NULL),
  ('orders', 'amount', 'Amount (₹)', 'number', true, true, true, 3, 'pricing', NULL),
  ('orders', 'discount', 'Discount (₹)', 'number', true, true, false, 4, 'pricing', '0'),
  ('orders', 'payment_method', 'Payment Method', 'select', true, true, false, 5, 'payment', NULL),
  ('orders', 'payment_status', 'Payment Status', 'select', true, true, false, 6, 'payment', NULL),
  ('orders', 'notes', 'Notes', 'textarea', true, false, false, 7, 'details', 'Order notes')
ON CONFLICT (table_name, field_name) DO NOTHING;

-- Insert default inquiry fields
INSERT INTO field_config (table_name, field_name, field_label, field_type, is_system, is_visible, is_required, display_order, section, placeholder) VALUES
  ('inquiries', 'name', 'Name', 'text', true, true, true, 1, 'basic', 'Customer name'),
  ('inquiries', 'phone', 'Phone', 'text', true, true, true, 2, 'basic', '+91 98765 43210'),
  ('inquiries', 'email', 'Email', 'text', true, false, false, 3, 'basic', 'email@example.com'),
  ('inquiries', 'message', 'Message', 'textarea', true, true, true, 4, 'details', 'Inquiry message'),
  ('inquiries', 'source', 'Source', 'select', true, true, false, 5, 'details', NULL),
  ('inquiries', 'status', 'Status', 'select', true, true, false, 6, 'details', NULL),
  ('inquiries', 'phone_interest', 'Phone Interest', 'text', true, false, false, 7, 'details', 'Which phone interested in')
ON CONFLICT (table_name, field_name) DO NOTHING;
