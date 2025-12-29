-- Migration: Remove paise mode, use rupees directly
-- This migration renames price columns and converts existing data

-- ============================================
-- PHONES TABLE - Rename and convert columns
-- ============================================

-- Rename paise columns to rupee columns
ALTER TABLE phones RENAME COLUMN cost_price_paise TO cost_price;
ALTER TABLE phones RENAME COLUMN selling_price_paise TO selling_price;
ALTER TABLE phones RENAME COLUMN original_mrp_paise TO original_mrp;
ALTER TABLE phones RENAME COLUMN minimum_price_paise TO minimum_price;

-- Convert existing paise values to rupees (divide by 100)
UPDATE phones SET 
  cost_price = cost_price / 100,
  selling_price = selling_price / 100,
  original_mrp = original_mrp / 100,
  minimum_price = minimum_price / 100
WHERE cost_price > 1000000; -- Only convert if looks like paise values

-- ============================================
-- ORDERS TABLE - Rename and convert columns
-- ============================================

ALTER TABLE orders RENAME COLUMN selling_price_paise TO selling_price;
ALTER TABLE orders RENAME COLUMN discount_paise TO discount;
ALTER TABLE orders RENAME COLUMN gst_amount_paise TO gst_amount;
ALTER TABLE orders RENAME COLUMN final_amount_paise TO final_amount;
ALTER TABLE orders RENAME COLUMN amount_paise TO amount;

-- Convert existing paise values to rupees
UPDATE orders SET 
  selling_price = COALESCE(selling_price, 0) / 100,
  discount = COALESCE(discount, 0) / 100,
  gst_amount = COALESCE(gst_amount, 0) / 100,
  final_amount = COALESCE(final_amount, 0) / 100,
  amount = COALESCE(amount, 0) / 100
WHERE final_amount > 100000; -- Only convert if looks like paise values

-- ============================================
-- CUSTOMERS TABLE - Rename and convert columns
-- ============================================

ALTER TABLE customers RENAME COLUMN total_spent_paise TO total_spent;

-- Convert existing paise values to rupees
UPDATE customers SET 
  total_spent = COALESCE(total_spent, 0) / 100
WHERE total_spent > 100000; -- Only convert if looks like paise values

-- ============================================
-- Update indexes
-- ============================================

DROP INDEX IF EXISTS idx_phones_selling_price;
CREATE INDEX idx_phones_selling_price ON phones(selling_price);

-- ============================================
-- Add comments for documentation
-- ============================================

COMMENT ON COLUMN phones.cost_price IS 'Cost price in INR (rupees)';
COMMENT ON COLUMN phones.selling_price IS 'Selling price in INR (rupees)';
COMMENT ON COLUMN phones.original_mrp IS 'Original MRP in INR (rupees)';
COMMENT ON COLUMN phones.minimum_price IS 'Minimum selling price in INR (rupees)';
COMMENT ON COLUMN orders.amount IS 'Order amount in INR (rupees)';
COMMENT ON COLUMN orders.final_amount IS 'Final amount after discount in INR (rupees)';
COMMENT ON COLUMN customers.total_spent IS 'Total amount spent in INR (rupees)';
