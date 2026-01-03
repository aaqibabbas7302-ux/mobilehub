-- Custom Fields Table for Dynamic Field Management
-- This allows users to add custom fields to phones, customers, orders, and inquiries

CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(50) NOT NULL, -- 'phones', 'customers', 'orders', 'inquiries'
  field_name VARCHAR(100) NOT NULL, -- Internal field name (snake_case)
  field_label VARCHAR(100) NOT NULL, -- Display label
  field_type VARCHAR(30) NOT NULL, -- 'text', 'number', 'date', 'select', 'checkbox', 'textarea'
  options JSONB, -- For select fields: ["Option 1", "Option 2"]
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_name, field_name)
);

-- Custom Field Values Table - stores actual values for each record
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  record_id UUID NOT NULL, -- ID of the phone, customer, order, or inquiry
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(custom_field_id, record_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_fields_table ON custom_fields(table_name);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_record ON custom_field_values(record_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(custom_field_id);

-- Add custom_data JSONB column to existing tables for storing custom field values
-- This is an alternative approach that stores all custom data in a single column

ALTER TABLE phones ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';

-- Create indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_phones_custom_data ON phones USING GIN (custom_data);
CREATE INDEX IF NOT EXISTS idx_customers_custom_data ON customers USING GIN (custom_data);
CREATE INDEX IF NOT EXISTS idx_orders_custom_data ON orders USING GIN (custom_data);
CREATE INDEX IF NOT EXISTS idx_inquiries_custom_data ON inquiries USING GIN (custom_data);
