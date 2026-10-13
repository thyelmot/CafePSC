-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- 1. BẢNG PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Only service role can modify products" ON products;
CREATE POLICY "Only service role can modify products"
ON products FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 2. BẢNG ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
CREATE POLICY "Allow public read access to orders"
ON orders FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
CREATE POLICY "Allow public insert orders"
ON orders FOR INSERT TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can modify orders" ON orders;
CREATE POLICY "Only service role can modify orders"
ON orders FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can delete orders" ON orders;
CREATE POLICY "Only service role can delete orders"
ON orders FOR DELETE TO service_role
USING (true);

-- 3. BẢNG ORDER_ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
CREATE POLICY "Allow public read access to order_items"
ON order_items FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Allow public insert order_items" ON order_items;
CREATE POLICY "Allow public insert order_items"
ON order_items FOR INSERT TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can modify order_items" ON order_items;
CREATE POLICY "Only service role can modify order_items"
ON order_items FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can delete order_items" ON order_items;
CREATE POLICY "Only service role can delete order_items"
ON order_items FOR DELETE TO service_role
USING (true);
