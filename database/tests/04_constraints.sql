-- T4: each violation must fail with the expected SQLSTATE. Everything rolls back.
BEGIN;

CREATE FUNCTION pg_temp.expect_fail(label text, state text, stmts text[]) RETURNS void LANGUAGE plpgsql AS $$
DECLARE s text;
BEGIN
  BEGIN
    FOREACH s IN ARRAY stmts LOOP EXECUTE s; END LOOP;
    EXECUTE 'SET CONSTRAINTS ALL IMMEDIATE';
  EXCEPTION WHEN OTHERS THEN
    IF SQLSTATE = state THEN
      RAISE NOTICE 'ok: % (%)', label, state;
      RETURN;
    END IF;
    RAISE EXCEPTION '%: wrong error % (%)', label, SQLSTATE, SQLERRM;
  END;
  RAISE EXCEPTION '%: expected failure did not happen', label;
END $$;

CREATE TEMP TABLE fx ON COMMIT DROP AS
  SELECT (SELECT id FROM neon_auth."user" ORDER BY id LIMIT 1) AS farmer,
         (SELECT id FROM neon_auth."user" ORDER BY id OFFSET 1 LIMIT 1) AS buyer;

INSERT INTO users (id, full_name, role) SELECT farmer, 'T Farmer', 'farmer' FROM fx;
INSERT INTO users (id, full_name, role) SELECT buyer, 'T Buyer', 'consumer' FROM fx;
INSERT INTO farmer_profiles (user_id, shop_name, slug, regency_code, district_code)
  SELECT farmer, 'T Shop', 't-shop', '32.04', (SELECT min(code) FROM districts WHERE regency_code = '32.04') FROM fx;
INSERT INTO products (farmer_id, category_id, slug, name, unit, price)
  SELECT farmer, (SELECT id FROM categories WHERE slug = 'sayur'), 't-product', 'T Product', 'kg', 1000 FROM fx;

-- Controls: valid data must be accepted, or the failures below prove nothing.
INSERT INTO ledger_transactions (kind, idempotency_key) VALUES ('adjustment', 't-ok');
INSERT INTO ledger_entries (transaction_id, account_id, amount)
  SELECT (SELECT id FROM ledger_transactions WHERE idempotency_key = 't-ok'), a.id, v.amount
  FROM (VALUES ('escrow'::ledger_account_type, 100::bigint), ('platform_revenue', -100)) v(type, amount)
  JOIN ledger_accounts a ON a.type = v.type AND a.owner_id IS NULL;
SET CONSTRAINTS ALL IMMEDIATE;
DO $$ BEGIN
  ASSERT (SELECT balance FROM ledger_accounts WHERE type = 'escrow' AND owner_id IS NULL) = 100, 'balance was not updated';
END $$;
SET CONSTRAINTS ALL DEFERRED;

INSERT INTO price_tiers (product_id, min_qty, unit_price) SELECT id, 5, 900 FROM products WHERE slug = 't-product';
INSERT INTO farmer_holidays (farmer_id, period) SELECT farmer, '[2027-01-01,2027-01-10)' FROM fx;
INSERT INTO carts (buyer_id, kind) SELECT buyer, 'temporary' FROM fx;
INSERT INTO addresses (user_id, label, recipient_name, phone, regency_code, district_code, street, is_default)
  SELECT buyer, 'A', 'B', '08', '32.04', (SELECT min(code) FROM districts WHERE regency_code = '32.04'), 'Jl', true FROM fx;
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;

SELECT pg_temp.expect_fail('unbalanced ledger', '23514', ARRAY[
  $s$INSERT INTO ledger_transactions (kind, idempotency_key) VALUES ('adjustment', 't-bad')$s$,
  $s$INSERT INTO ledger_entries (transaction_id, account_id, amount)
     SELECT (SELECT id FROM ledger_transactions WHERE idempotency_key = 't-bad'), id, 50
     FROM ledger_accounts WHERE type = 'escrow' AND owner_id IS NULL$s$]);

SELECT pg_temp.expect_fail('tier dearer than the tier below', '23514', ARRAY[
  $s$INSERT INTO price_tiers (product_id, min_qty, unit_price) SELECT id, 10, 950 FROM products WHERE slug = 't-product'$s$]);

SELECT pg_temp.expect_fail('overlapping holidays', '23P01', ARRAY[
  $s$INSERT INTO farmer_holidays (farmer_id, period) SELECT farmer, '[2027-01-05,2027-01-20)' FROM fx$s$]);

SELECT pg_temp.expect_fail('second temporary cart', '23505', ARRAY[
  $s$INSERT INTO carts (buyer_id, kind) SELECT buyer, 'temporary' FROM fx$s$]);

SELECT pg_temp.expect_fail('second default address', '23505', ARRAY[
  $s$INSERT INTO addresses (user_id, label, recipient_name, phone, regency_code, district_code, street, is_default)
     SELECT buyer, 'A2', 'B', '08', '32.04', (SELECT min(code) FROM districts WHERE regency_code = '32.04'), 'Jl', true FROM fx$s$]);

SELECT pg_temp.expect_fail('second platform account of a type', '23505', ARRAY[
  $s$INSERT INTO ledger_accounts (owner_id, type) VALUES (NULL, 'escrow')$s$]);

ROLLBACK;
