-- updated_at
CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','addresses','farmer_profiles','products','waitlists','commitments','carts','orders','reviews','platform_settings']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

-- Ledger: every transaction sums to zero at commit; the cached balance moves with each entry
CREATE FUNCTION ledger_entry_apply() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_sum numeric;
BEGIN
  SELECT sum(amount) INTO v_sum FROM ledger_entries WHERE transaction_id = NEW.transaction_id;
  IF v_sum <> 0 THEN
    RAISE EXCEPTION 'ledger transaction % is unbalanced (sum %)', NEW.transaction_id, v_sum
      USING ERRCODE = 'check_violation';
  END IF;
  UPDATE ledger_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER trg_ledger_entry_apply AFTER INSERT ON ledger_entries
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ledger_entry_apply();

-- price_tiers: a higher min_qty must be cheaper than the tier below it and than products.price
CREATE FUNCTION check_price_tier_order() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_product uuid := (to_jsonb(NEW) ->> CASE WHEN TG_TABLE_NAME = 'products' THEN 'id' ELSE 'product_id' END)::uuid;
  v_base bigint;
BEGIN
  SELECT price INTO v_base FROM products WHERE id = v_product;
  IF EXISTS (
    SELECT 1 FROM (
      SELECT unit_price, lag(unit_price) OVER (ORDER BY min_qty) AS below
      FROM price_tiers WHERE product_id = v_product
    ) t WHERE t.unit_price >= coalesce(t.below, v_base)
  ) THEN
    RAISE EXCEPTION 'price tiers of product % must get cheaper as min_qty rises', v_product
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER trg_price_tier_order AFTER INSERT OR UPDATE ON price_tiers
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_price_tier_order();
CREATE CONSTRAINT TRIGGER trg_price_tier_order AFTER UPDATE OF price ON products
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_price_tier_order();

-- Audit. TG_ARGV[0], when given, limits the logged values to that one column.
-- The actor comes from the session setting app.user_id.
CREATE FUNCTION audit_row() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_old jsonb := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
  v_new jsonb := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
BEGIN
  IF TG_NARGS > 0 THEN
    v_old := jsonb_build_object(TG_ARGV[0], v_old -> TG_ARGV[0]);
    v_new := jsonb_build_object(TG_ARGV[0], v_new -> TG_ARGV[0]);
  END IF;
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    nullif(current_setting('app.user_id', true), '')::uuid,
    lower(TG_OP),
    TG_TABLE_NAME,
    (CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END ->> 'id')::uuid,
    v_old,
    v_new
  );
  RETURN NULL;
END $$;

CREATE TRIGGER trg_audit_price AFTER UPDATE OF price ON products
  FOR EACH ROW WHEN (OLD.price IS DISTINCT FROM NEW.price) EXECUTE FUNCTION audit_row('price');
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON price_tiers
  FOR EACH ROW EXECUTE FUNCTION audit_row();
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON surplus_rules
  FOR EACH ROW EXECUTE FUNCTION audit_row();
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON platform_fee_settings
  FOR EACH ROW EXECUTE FUNCTION audit_row();
CREATE TRIGGER trg_audit_status AFTER UPDATE OF status ON orders
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION audit_row('status');

-- Counters. Recomputed values lock the parent row first, so concurrent writers cannot undercount.
CREATE FUNCTION refresh_rating(p_product uuid, p_farmer uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM products WHERE id = p_product FOR UPDATE;
  UPDATE products p SET (rating_avg, rating_count) = (
    SELECT coalesce(round(avg(r.rating), 2), 0), count(*)
    FROM reviews r WHERE r.product_id = p_product AND r.status = 'published'
  ) WHERE p.id = p_product;

  PERFORM 1 FROM farmer_profiles WHERE user_id = p_farmer FOR UPDATE;
  UPDATE farmer_profiles f SET (rating_avg, rating_count) = (
    SELECT coalesce(round(avg(r.rating), 2), 0), count(*)
    FROM reviews r WHERE r.farmer_id = p_farmer AND r.status = 'published'
  ) WHERE f.user_id = p_farmer;
END $$;

CREATE FUNCTION reviews_refresh_rating() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN PERFORM refresh_rating(OLD.product_id, OLD.farmer_id); END IF;
  IF TG_OP <> 'DELETE' THEN PERFORM refresh_rating(NEW.product_id, NEW.farmer_id); END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_refresh_rating AFTER INSERT OR DELETE OR UPDATE OF rating, status, product_id, farmer_id ON reviews
  FOR EACH ROW EXECUTE FUNCTION reviews_refresh_rating();

CREATE FUNCTION count_subscriber() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products SET subscriber_count = subscriber_count + CASE TG_OP WHEN 'INSERT' THEN 1 ELSE -1 END
  WHERE id = CASE TG_OP WHEN 'INSERT' THEN NEW.product_id ELSE OLD.product_id END;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_count_subscriber AFTER INSERT OR DELETE ON product_subscriptions
  FOR EACH ROW EXECUTE FUNCTION count_subscriber();

CREATE FUNCTION count_follower() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE waitlists SET follower_count = follower_count + CASE TG_OP WHEN 'INSERT' THEN 1 ELSE -1 END
  WHERE id = CASE TG_OP WHEN 'INSERT' THEN NEW.waitlist_id ELSE OLD.waitlist_id END;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_count_follower AFTER INSERT OR DELETE ON waitlist_followers
  FOR EACH ROW EXECUTE FUNCTION count_follower();

-- commitment_count covers commitments that are still live (not cancelled or refunded).
-- committed_min_qty is not handled here: the Commit service updates it so the quota CHECK decides.
CREATE FUNCTION commitment_is_live(s commitment_status) RETURNS boolean
  LANGUAGE sql IMMUTABLE
  AS $$ SELECT s NOT IN ('cancelled', 'unallocated_refunded', 'harvest_failed_refunded') $$;

CREATE FUNCTION count_commitment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' AND commitment_is_live(OLD.status) THEN
    UPDATE waitlists SET commitment_count = commitment_count - 1 WHERE id = OLD.waitlist_id;
  END IF;
  IF TG_OP <> 'DELETE' AND commitment_is_live(NEW.status) THEN
    UPDATE waitlists SET commitment_count = commitment_count + 1 WHERE id = NEW.waitlist_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_count_commitment AFTER INSERT OR DELETE OR UPDATE OF status, waitlist_id ON commitments
  FOR EACH ROW EXECUTE FUNCTION count_commitment();

-- available_qty and current_batch_id (FEFO head: nearest expiry with sellable stock)
CREATE FUNCTION refresh_product_stock(p_product uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM products WHERE id = p_product FOR UPDATE;
  UPDATE products p SET
    available_qty = coalesce((
      SELECT sum(b.on_hand_qty - b.reserved_qty) FROM product_batches b
      WHERE b.product_id = p_product AND b.status = 'active'
    ), 0),
    current_batch_id = (
      SELECT b.id FROM product_batches b
      WHERE b.product_id = p_product AND b.status = 'active' AND b.on_hand_qty > b.reserved_qty
      ORDER BY b.expires_on, b.batch_no LIMIT 1
    )
  WHERE p.id = p_product;
END $$;

CREATE FUNCTION batches_refresh_stock() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'DELETE' THEN PERFORM refresh_product_stock(NEW.product_id); END IF;
  IF TG_OP = 'DELETE' OR OLD.product_id <> NEW.product_id THEN PERFORM refresh_product_stock(OLD.product_id); END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_refresh_stock AFTER INSERT OR DELETE OR UPDATE OF on_hand_qty, reserved_qty, status, expires_on, batch_no, product_id ON product_batches
  FOR EACH ROW EXECUTE FUNCTION batches_refresh_stock();
