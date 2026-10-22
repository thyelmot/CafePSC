-- ============================================
-- CaféPSC - Supabase Database Schema
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) DEFAULT 'drink',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sizes JSONB DEFAULT '[{"name": "M", "label": "Vừa (M)", "priceAdd": 0}, {"name": "L", "label": "Lớn (L)", "priceAdd": 5000}]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure sizes column exists if table was already created earlier (Non-destructive)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[{"name": "M", "label": "Vừa (M)", "priceAdd": 0}, {"name": "L", "label": "Lớn (L)", "priceAdd": 5000}]'::jsonb;

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  delivery_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'making', 'done', 'cancelled')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  options_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Enable Realtime for tables (Idempotent check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

-- 6. Initial Menu Data
INSERT INTO products (name, price, category, is_available)
SELECT v.name, v.price, v.category, v.is_available
FROM (VALUES
  ('Cà phê đen (đá)', 20000, 'coffee', true),
  ('Cà phê sữa', 20000, 'coffee', true),
  ('Bạc xỉu', 25000, 'coffee', true),
  ('Cafe latte', 35000, 'coffee', true),
  ('Cafe nước dừa', 35000, 'coffee', true),
  ('Cafe cốt dừa', 35000, 'coffee', true),
  ('Matcha latte', 35000, 'tea', true),
  ('Dây thẻ', 30000, 'merch', true)
) AS v(name, price, category, is_available)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE products.name = v.name
);
