-- Partial unique indexes
CREATE UNIQUE INDEX addresses_one_default ON addresses (user_id) WHERE is_default;
CREATE UNIQUE INDEX bank_accounts_one_primary ON bank_accounts (farmer_id) WHERE is_primary;
CREATE UNIQUE INDEX carts_one_temporary ON carts (buyer_id) WHERE kind = 'temporary';
CREATE UNIQUE INDEX farmer_badges_one_active ON farmer_badges (farmer_id, badge_id) WHERE revoked_at IS NULL;

-- Job / queue partial indexes
CREATE INDEX stock_reservations_active_expiry ON stock_reservations (expires_at) WHERE status = 'active';
CREATE INDEX product_batches_active_expiry ON product_batches (expires_on) WHERE status = 'active';
CREATE INDEX orders_payment_due ON orders (payment_due_at) WHERE status = 'awaiting_payment';
CREATE INDEX orders_respond_by ON orders (respond_by) WHERE status = 'confirmed';
CREATE INDEX shipments_auto_release ON shipments (auto_release_at) WHERE received_confirmed_at IS NULL;
CREATE INDEX commitments_remainder_due ON commitments (remainder_due_at) WHERE status = 'awaiting_remainder';
CREATE INDEX outbox_events_unprocessed ON outbox_events (available_at) WHERE processed_at IS NULL;
CREATE INDEX notifications_unread ON notifications (user_id) WHERE read_at IS NULL;

-- Search and geo
CREATE INDEX products_search_vector ON products USING gin (search_vector);
CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX search_synonyms_term_trgm ON search_synonyms USING gin (term gin_trgm_ops);
CREATE INDEX farmer_profiles_location ON farmer_profiles USING gist (location);
CREATE INDEX addresses_location ON addresses USING gist (location);

-- PG18 temporal constraint
ALTER TABLE farmer_holidays ADD CONSTRAINT farmer_holidays_no_overlap
  UNIQUE (farmer_id, period WITHOUT OVERLAPS);

-- Replaces the plain unique index generated from DBML, so a reorder can swap priorities
ALTER TABLE cart_item_alternatives
  ADD CONSTRAINT cart_item_alternatives_priority_key UNIQUE (cart_item_id, priority)
  DEFERRABLE INITIALLY DEFERRED;

-- One system account (owner_id NULL) of each type
ALTER TABLE ledger_accounts
  ADD CONSTRAINT ledger_accounts_owner_id_type_key UNIQUE NULLS NOT DISTINCT (owner_id, type);
