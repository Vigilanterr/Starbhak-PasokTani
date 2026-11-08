-- T6: updated_at, audit and counter triggers. Everything rolls back.
BEGIN;

CREATE TEMP TABLE fx ON COMMIT DROP AS
  SELECT (SELECT id FROM neon_auth."user" ORDER BY id LIMIT 1) AS farmer,
         (SELECT id FROM neon_auth."user" ORDER BY id OFFSET 1 LIMIT 1) AS buyer;

INSERT INTO users (id, full_name, role) SELECT farmer, 'T Farmer', 'farmer' FROM fx;
INSERT INTO users (id, full_name, role) SELECT buyer, 'T Buyer', 'consumer' FROM fx;
INSERT INTO farmer_profiles (user_id, shop_name, slug, regency_code, district_code)
  SELECT farmer, 'T Shop', 't-shop', '32.04', (SELECT min(code) FROM districts WHERE regency_code = '32.04') FROM fx;
INSERT INTO products (farmer_id, category_id, slug, name, unit, price, created_at, updated_at)
  SELECT farmer, (SELECT id FROM categories WHERE slug = 'sayur'), 't-product', 'T Product', 'kg', 1000, '2020-01-01', '2020-01-01' FROM fx;

UPDATE products SET price = 900 WHERE slug = 't-product';

DO $$
DECLARE pid uuid; n int;
BEGIN
  SELECT id INTO pid FROM products WHERE slug = 't-product';
  ASSERT (SELECT updated_at FROM products WHERE id = pid) > '2020-01-02', 'updated_at did not change';

  SELECT count(*) INTO n FROM audit_logs
  WHERE entity_type = 'products' AND entity_id = pid AND action = 'update'
    AND old_values ->> 'price' = '1000' AND new_values ->> 'price' = '900';
  ASSERT n = 1, format('expected 1 price audit row, got %s', n);
END $$;

INSERT INTO platform_fee_settings (commission_pct, service_fee_pct, effective_from, created_by)
  SELECT 3, 1, '2020-01-01', farmer FROM fx;
INSERT INTO orders (code, buyer_id, farmer_id, goods_subtotal, buyer_total, farmer_net, commission_pct, service_fee_pct, fee_setting_id)
  SELECT 'T-1', buyer, farmer, 900, 900, 873, 3, 1, (SELECT id FROM platform_fee_settings WHERE effective_from = '2020-01-01') FROM fx;
INSERT INTO order_items (order_id, product_id, product_name, unit, quantity, tier_unit_price, line_subtotal)
  SELECT (SELECT id FROM orders WHERE code = 'T-1'), id, name, unit, 1, 900, 900 FROM products WHERE slug = 't-product';
INSERT INTO reviews (order_item_id, product_id, farmer_id, buyer_id, rating)
  SELECT i.id, i.product_id, fx.farmer, fx.buyer, 4 FROM order_items i, fx WHERE i.product_name = 'T Product';

INSERT INTO product_batches (product_id, batch_no, initial_qty, on_hand_qty, reserved_qty, harvested_on, expires_on, created_by)
  SELECT id, n, 10, 10, 2, '2026-11-01', e::date, farmer_id
  FROM products, (VALUES (1, '2026-11-20'), (2, '2026-11-10')) v(n, e) WHERE slug = 't-product';
INSERT INTO product_subscriptions (user_id, product_id) SELECT fx.buyer, p.id FROM fx, products p WHERE p.slug = 't-product';

UPDATE orders SET status = 'confirmed' WHERE code = 'T-1';

DO $$
DECLARE p products; f farmer_profiles; n int;
BEGIN
  SELECT * INTO p FROM products WHERE slug = 't-product';
  SELECT * INTO f FROM farmer_profiles WHERE slug = 't-shop';
  ASSERT p.rating_count = 1 AND p.rating_avg = 4, 'product rating was not updated';
  ASSERT f.rating_count = 1 AND f.rating_avg = 4, 'farmer rating was not updated';
  ASSERT p.available_qty = 16, format('available_qty is %s, expected 16', p.available_qty);
  ASSERT p.current_batch_id = (SELECT id FROM product_batches WHERE product_id = p.id AND batch_no = 2), 'current_batch_id is not the FEFO head';
  ASSERT p.subscriber_count = 1, 'subscriber_count was not updated';

  SELECT count(*) INTO n FROM audit_logs WHERE entity_type = 'orders' AND action = 'update' AND new_values ->> 'status' = 'confirmed';
  ASSERT n = 1, 'order status change was not audited';
END $$;

ROLLBACK;
