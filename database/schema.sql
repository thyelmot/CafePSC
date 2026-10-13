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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 6. Initial Menu Data (Chỉ thêm nếu chưa có món đó)
INSERT INTO products (name, price, category, is_available)
SELECT v.name, v.price, v.category, v.is_available
FROM (VALUES
  ('Cà Phê Sữa Đá', 25000, 'coffee', true),
  ('Cà Phê Đen Đá', 20000, 'coffee', true),
  ('Bạc Xỉu', 28000, 'coffee', true),
  ('Cà Phê Trứng', 35000, 'coffee', true),
  ('Latte', 40000, 'coffee', true),
  ('Cappuccino', 40000, 'coffee', true),
  ('Americano', 35000, 'coffee', true),
  ('Mocha', 45000, 'coffee', true),
  ('Trà Đào', 30000, 'tea', true),
  ('Trà Vải', 30000, 'tea', true),
  ('Trà Chanh', 25000, 'tea', true),
  ('Hồng Trà', 25000, 'tea', true),
  ('Matcha Latte', 45000, 'tea', true),
  ('Sinh Tố Bơ', 35000, 'smoothie', true),
  ('Sinh Tố Xoài', 30000, 'smoothie', true),
  ('Nước cam', 20000, 'juice', true),
  ('Nước chanh leo', 20000, 'juice', true)
) AS v(name, price, category, is_available)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE products.name = v.name
);
