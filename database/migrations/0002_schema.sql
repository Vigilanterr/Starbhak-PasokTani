-- Generated from schema.sql (DBML) with the fixes listed in database/README.md.

CREATE TYPE "user_role" AS ENUM (
  'consumer',
  'umkm',
  'farmer',
  'admin'
);

CREATE TYPE "user_status" AS ENUM (
  'active',
  'suspended',
  'deleted'
);

CREATE TYPE "verification_status" AS ENUM (
  'unverified',
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE "product_unit" AS ENUM (
  'kg',
  'bunch',
  'piece',
  'pack',
  'liter'
);

CREATE TYPE "product_status" AS ENUM (
  'draft',
  'active',
  'inactive',
  'banned'
);

CREATE TYPE "batch_status" AS ENUM (
  'active',
  'depleted',
  'expired',
  'voided'
);

CREATE TYPE "stock_movement_type" AS ENUM (
  'stock_in',
  'sale',
  'cancel_restore',
  'return_restock',
  'expiry_reduction',
  'expiry_undo',
  'manual_adjustment'
);

CREATE TYPE "reservation_status" AS ENUM (
  'active',
  'converted',
  'released'
);

CREATE TYPE "waitlist_status" AS ENUM (
  'planting_scheduled',
  'planted',
  'harvest_delayed',
  'harvest_early',
  'harvest_failed',
  'ready_to_harvest'
);

CREATE TYPE "harvest_schedule_type" AS ENUM (
  'exact_date',
  'date_range',
  'not_set'
);

CREATE TYPE "waitlist_event_type" AS ENUM (
  'status_change',
  'schedule_change',
  'field_photo',
  'note'
);

CREATE TYPE "commitment_status" AS ENUM (
  'active',
  'awaiting_remainder',
  'allocated',
  'partially_allocated',
  'unallocated_refunded',
  'cancelled',
  'harvest_failed_refunded'
);

CREATE TYPE "cart_kind" AS ENUM (
  'temporary',
  'recipe'
);

CREATE TYPE "order_status" AS ENUM (
  'awaiting_payment',
  'confirmed',
  'processing',
  'shipped',
  'completed',
  'cancelled'
);

CREATE TYPE "order_item_source" AS ENUM (
  'direct',
  'commitment',
  'recipe_cart'
);

CREATE TYPE "escrow_status" AS ENUM (
  'not_funded',
  'held',
  'disputed',
  'released',
  'refunded',
  'partially_refunded'
);

CREATE TYPE "delivery_method" AS ENUM (
  'courier_regular',
  'courier_instant',
  'self_delivery',
  'pickup'
);

CREATE TYPE "payment_method" AS ENUM (
  'qris',
  'virtual_account',
  'wallet'
);

CREATE TYPE "payment_purpose" AS ENUM (
  'checkout',
  'commitment_hold',
  'commitment_remainder'
);

CREATE TYPE "payment_status" AS ENUM (
  'pending',
  'paid',
  'expired',
  'failed',
  'refunded'
);

CREATE TYPE "ledger_account_type" AS ENUM (
  'buyer_wallet',
  'farmer_balance',
  'escrow',
  'platform_revenue',
  'payment_clearing',
  'payout_clearing'
);

CREATE TYPE "ledger_txn_kind" AS ENUM (
  'payment_received',
  'escrow_hold',
  'escrow_release',
  'commission',
  'service_fee',
  'penalty',
  'refund',
  'payout',
  'adjustment'
);

CREATE TYPE "refund_status" AS ENUM (
  'pending',
  'completed',
  'failed'
);

CREATE TYPE "payout_status" AS ENUM (
  'requested',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE "complaint_reason" AS ENUM (
  'damaged',
  'not_as_described',
  'rotten',
  'missing_items',
  'other'
);

CREATE TYPE "complaint_status" AS ENUM (
  'open',
  'farmer_responded',
  'under_mediation',
  'resolved_full_refund',
  'resolved_partial_refund',
  'rejected'
);

CREATE TYPE "report_status" AS ENUM (
  'open',
  'reviewing',
  'actioned',
  'dismissed'
);

CREATE TYPE "moderation_status" AS ENUM (
  'published',
  'hidden'
);

CREATE TYPE "media_kind" AS ENUM (
  'product_photo',
  'waitlist_photo',
  'review_photo',
  'complaint_evidence',
  'chat_attachment',
  'avatar',
  'ktp',
  'land_photo'
);

CREATE TYPE "media_status" AS ENUM (
  'pending',
  'ready',
  'rejected',
  'deleted'
);

CREATE TYPE "notification_frequency" AS ENUM (
  'instant',
  'daily_digest'
);

CREATE TYPE "notification_category" AS ENUM (
  'order',
  'payment',
  'waitlist',
  'product_subscription',
  'chat',
  'review',
  'system'
);

CREATE TABLE "regencies" (
  "code" text PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "is_city" boolean NOT NULL DEFAULT false,
  "centroid" geography(Point,4326)
);

CREATE TABLE "districts" (
  "code" text PRIMARY KEY,
  "regency_code" text NOT NULL,
  "name" text NOT NULL,
  "centroid" geography(Point,4326)
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "full_name" text NOT NULL,
  "phone" text,
  "role" user_role NOT NULL,
  "status" user_status NOT NULL DEFAULT 'active',
  "avatar_media_id" uuid,
  "onboarded_at" timestamptz,
  "last_seen_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "owner_id" uuid NOT NULL,
  "kind" media_kind NOT NULL,
  "status" media_status NOT NULL DEFAULT 'pending',
  "cloudinary_public_id" text UNIQUE NOT NULL,
  "cloudinary_version" bigint,
  "delivery_type" text NOT NULL DEFAULT 'upload',
  "format" text,
  "width" integer,
  "height" integer,
  "bytes" integer,
  "taken_on" date,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "ready_at" timestamptz
);

CREATE TABLE "addresses" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "user_id" uuid NOT NULL,
  "label" text NOT NULL,
  "recipient_name" text NOT NULL,
  "phone" text NOT NULL,
  "regency_code" text NOT NULL,
  "district_code" text NOT NULL,
  "street" text NOT NULL,
  "postal_code" text,
  "location" geography(Point,4326),
  "notes" text,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "notification_preferences" (
  "user_id" uuid NOT NULL,
  "category" notification_category NOT NULL,
  "web_enabled" boolean NOT NULL DEFAULT true,
  "frequency" notification_frequency NOT NULL DEFAULT 'instant',
  PRIMARY KEY ("user_id", "category")
);

CREATE TABLE "push_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "user_id" uuid NOT NULL,
  "endpoint" text UNIQUE NOT NULL,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "user_agent" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "last_success_at" timestamptz
);

CREATE TABLE "farmer_profiles" (
  "user_id" uuid PRIMARY KEY,
  "shop_name" text NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "description" text,
  "regency_code" text NOT NULL,
  "district_code" text NOT NULL,
  "address_line" text,
  "location" geography(Point,4326),
  "land_area_ha" numeric(8,2),
  "verification_status" verification_status NOT NULL DEFAULT 'unverified',
  "verified_at" timestamptz,
  "auto_cancel_after_hours" smallint,
  "self_delivery_enabled" boolean NOT NULL DEFAULT false,
  "self_delivery_fee" bigint,
  "pickup_enabled" boolean NOT NULL DEFAULT false,
  "rating_avg" numeric(3,2) NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "completed_order_count" integer NOT NULL DEFAULT 0,
  "avg_response_minutes" integer,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_auto_cancel_hours" CHECK (auto_cancel_after_hours IS NULL OR auto_cancel_after_hours IN (12, 24, 48))
);

CREATE TABLE "farmer_verifications" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "ktp_number_enc" bytea NOT NULL,
  "ktp_media_id" uuid NOT NULL,
  "land_media_id" uuid NOT NULL,
  "status" verification_status NOT NULL DEFAULT 'pending',
  "reviewed_by" uuid,
  "reviewed_at" timestamptz,
  "rejection_reason" text,
  "submitted_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "bank_accounts" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "bank_code" text NOT NULL,
  "account_number_enc" bytea NOT NULL,
  "account_number_last4" text NOT NULL,
  "account_holder_name" text NOT NULL,
  "is_primary" boolean NOT NULL DEFAULT false,
  "verified_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "farmer_operating_hours" (
  "farmer_id" uuid NOT NULL,
  "weekday" smallint NOT NULL,
  "opens_at" time NOT NULL,
  "closes_at" time NOT NULL,
  CONSTRAINT "chk_weekday" CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT "chk_hours_order" CHECK (closes_at > opens_at),
  PRIMARY KEY ("farmer_id", "weekday")
);

CREATE TABLE "farmer_holidays" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "period" daterange NOT NULL,
  "note" text,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "badges" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "code" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "criteria" jsonb NOT NULL DEFAULT '{}',
  "is_automatic" boolean NOT NULL DEFAULT true,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" smallint NOT NULL DEFAULT 0
);

CREATE TABLE "farmer_badges" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "badge_id" uuid NOT NULL,
  "awarded_at" timestamptz NOT NULL DEFAULT (now()),
  "revoked_at" timestamptz,
  "revoke_reason" text,
  "evaluation_period" date
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "parent_id" uuid,
  "slug" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "icon" text,
  "sort_order" smallint NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true
);

CREATE TABLE "tags" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "slug" text UNIQUE NOT NULL,
  "name" text NOT NULL
);

CREATE TABLE "search_synonyms" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "term" text UNIQUE NOT NULL,
  "canonical_term" text NOT NULL,
  "source" text NOT NULL DEFAULT 'admin'
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "alt_names" text[] NOT NULL DEFAULT ('{}'),
  "description" text,
  "unit" product_unit NOT NULL,
  "price" bigint NOT NULL,
  "min_order_qty" numeric(12,3) NOT NULL DEFAULT 1,
  "status" product_status NOT NULL DEFAULT 'active',
  "low_stock_threshold" numeric(12,3),
  "surplus_enabled" boolean NOT NULL DEFAULT false,
  "surplus_floor_price" bigint,
  "source_waitlist_id" uuid,
  "search_vector" tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, public.f_product_search_text(name, alt_names, description))) STORED,
  "available_qty" numeric(12,3) NOT NULL DEFAULT 0,
  "current_batch_id" uuid,
  "rating_avg" numeric(3,2) NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "sold_qty" numeric(14,3) NOT NULL DEFAULT 0,
  "subscriber_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_price_positive" CHECK (price > 0),
  CONSTRAINT "chk_min_order_qty" CHECK (min_order_qty > 0),
  CONSTRAINT "chk_surplus_floor" CHECK (surplus_floor_price IS NULL OR surplus_floor_price <= price)
);

CREATE TABLE "product_tags" (
  "product_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  PRIMARY KEY ("product_id", "tag_id")
);

CREATE TABLE "price_tiers" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "product_id" uuid NOT NULL,
  "min_qty" numeric(12,3) NOT NULL,
  "unit_price" bigint NOT NULL,
  CONSTRAINT "chk_tier_above_base" CHECK (min_qty > 1),
  CONSTRAINT "chk_tier_price" CHECK (unit_price > 0)
);

CREATE TABLE "surplus_rules" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "product_id" uuid NOT NULL,
  "days_remaining" smallint NOT NULL,
  "discount_pct" numeric(5,2) NOT NULL,
  CONSTRAINT "chk_days_remaining" CHECK (days_remaining >= 0),
  CONSTRAINT "chk_discount_pct" CHECK (discount_pct > 0 AND discount_pct < 100)
);

CREATE TABLE "product_batches" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "product_id" uuid NOT NULL,
  "batch_no" integer NOT NULL,
  "initial_qty" numeric(12,3) NOT NULL,
  "on_hand_qty" numeric(12,3) NOT NULL,
  "reserved_qty" numeric(12,3) NOT NULL DEFAULT 0,
  "harvested_on" date NOT NULL,
  "expires_on" date NOT NULL,
  "status" batch_status NOT NULL DEFAULT 'active',
  "surplus_discount_pct" numeric(5,2),
  "expired_at" timestamptz,
  "expiry_undo_until" timestamptz,
  "source_waitlist_id" uuid,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_on_hand_nonneg" CHECK (on_hand_qty >= 0),
  CONSTRAINT "chk_reserved_le_on_hand" CHECK (reserved_qty >= 0 AND reserved_qty <= on_hand_qty),
  CONSTRAINT "chk_expiry_after_harvest" CHECK (expires_on >= harvested_on)
);

CREATE TABLE "product_photos" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "product_id" uuid NOT NULL,
  "batch_id" uuid,
  "media_id" uuid UNIQUE NOT NULL,
  "caption" text,
  "position" smallint NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "stock_movements" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "batch_id" uuid NOT NULL,
  "type" stock_movement_type NOT NULL,
  "qty_delta" numeric(12,3) NOT NULL,
  "reason" text,
  "order_item_id" uuid,
  "actor_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_nonzero_delta" CHECK (qty_delta <> 0),
  CONSTRAINT "chk_manual_reason" CHECK (type <> 'manual_adjustment' OR reason IS NOT NULL)
);

CREATE TABLE "stock_reservations" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "batch_id" uuid NOT NULL,
  "order_item_id" uuid NOT NULL,
  "qty" numeric(12,3) NOT NULL,
  "status" reservation_status NOT NULL DEFAULT 'active',
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "resolved_at" timestamptz,
  CONSTRAINT "chk_reservation_qty" CHECK (qty > 0)
);

CREATE TABLE "product_subscriptions" (
  "user_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "on_new_stock" boolean NOT NULL DEFAULT true,
  "on_price_drop" boolean NOT NULL DEFAULT true,
  "on_back_in_stock" boolean NOT NULL DEFAULT true,
  "frequency" notification_frequency NOT NULL DEFAULT 'instant',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  PRIMARY KEY ("user_id", "product_id")
);

CREATE TABLE "waitlists" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "commodity_name" text NOT NULL,
  "description" text,
  "unit" product_unit NOT NULL,
  "status" waitlist_status NOT NULL DEFAULT 'planting_scheduled',
  "planted_on" date,
  "schedule_type" harvest_schedule_type NOT NULL DEFAULT 'not_set',
  "harvest_start" date,
  "harvest_end" date,
  "first_estimate_set_at" timestamptz,
  "penalty_free_until" timestamptz,
  "estimated_yield_qty" numeric(12,3),
  "estimated_unit_price" bigint NOT NULL,
  "final_unit_price" bigint,
  "quota_qty" numeric(12,3),
  "min_commit_qty" numeric(12,3) NOT NULL DEFAULT 1,
  "committed_min_qty" numeric(12,3) NOT NULL DEFAULT 0,
  "commitment_count" integer NOT NULL DEFAULT 0,
  "follower_count" integer NOT NULL DEFAULT 0,
  "actual_harvest_qty" numeric(12,3),
  "product_id" uuid,
  "failure_reason" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_schedule_shape" CHECK ((schedule_type = 'not_set' AND harvest_start IS NULL AND harvest_end IS NULL) OR (schedule_type = 'exact_date' AND harvest_start IS NOT NULL AND harvest_end IS NULL) OR (schedule_type = 'date_range' AND harvest_start IS NOT NULL AND harvest_end > harvest_start)),
  CONSTRAINT "chk_quota_not_exceeded" CHECK (quota_qty IS NULL OR committed_min_qty <= quota_qty),
  CONSTRAINT "chk_failed_reason" CHECK (status <> 'harvest_failed' OR failure_reason IS NOT NULL)
);

CREATE TABLE "waitlist_events" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "waitlist_id" uuid NOT NULL,
  "type" waitlist_event_type NOT NULL,
  "from_status" waitlist_status,
  "to_status" waitlist_status,
  "old_schedule" jsonb,
  "new_schedule" jsonb,
  "title" text NOT NULL,
  "body" text,
  "reason" text,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_reason_required" CHECK (to_status IS NULL OR to_status NOT IN ('harvest_delayed', 'harvest_failed') OR reason IS NOT NULL)
);

CREATE TABLE "waitlist_media" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "event_id" uuid NOT NULL,
  "media_id" uuid UNIQUE NOT NULL,
  "caption" text,
  "position" smallint NOT NULL DEFAULT 0
);

CREATE TABLE "waitlist_followers" (
  "user_id" uuid NOT NULL,
  "waitlist_id" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  PRIMARY KEY ("user_id", "waitlist_id")
);

CREATE TABLE "commitments" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "waitlist_id" uuid NOT NULL,
  "buyer_id" uuid NOT NULL,
  "qty_min" numeric(12,3) NOT NULL,
  "qty_max" numeric(12,3) NOT NULL,
  "unit_price_estimate" bigint NOT NULL,
  "held_amount" bigint NOT NULL,
  "had_estimate_at_commit" boolean NOT NULL,
  "status" commitment_status NOT NULL DEFAULT 'active',
  "allocated_qty" numeric(12,3),
  "remainder_amount" bigint,
  "remainder_due_at" timestamptz,
  "remainder_paid_at" timestamptz,
  "penalty_amount" bigint NOT NULL DEFAULT 0,
  "cancelled_at" timestamptz,
  "cancel_reason" text,
  "order_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_commit_range" CHECK (qty_min > 0 AND qty_max >= qty_min),
  CONSTRAINT "chk_allocated_le_max" CHECK (allocated_qty IS NULL OR allocated_qty <= qty_max),
  CONSTRAINT "chk_penalty_bounds" CHECK (penalty_amount >= 0 AND penalty_amount <= held_amount)
);

CREATE TABLE "carts" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "buyer_id" uuid NOT NULL,
  "kind" cart_kind NOT NULL,
  "name" text,
  "note" text,
  "last_checkout_at" timestamptz,
  "checkout_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_recipe_name" CHECK (kind = 'temporary' OR name IS NOT NULL)
);

CREATE TABLE "cart_items" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "cart_id" uuid NOT NULL,
  "product_id" uuid,
  "waitlist_id" uuid,
  "quantity" numeric(12,3) NOT NULL,
  "position" smallint NOT NULL DEFAULT 0,
  "added_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_item_target" CHECK (num_nonnulls(product_id, waitlist_id) = 1),
  CONSTRAINT "chk_item_qty" CHECK (quantity > 0)
);

CREATE TABLE "cart_item_alternatives" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "cart_item_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "priority" smallint NOT NULL,
  CONSTRAINT "chk_priority" CHECK (priority >= 1)
);

CREATE TABLE "platform_fee_settings" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "commission_pct" numeric(5,2) NOT NULL,
  "service_fee_pct" numeric(5,2) NOT NULL,
  "penalty_platform_share_pct" numeric(5,2) NOT NULL DEFAULT 20,
  "effective_from" timestamptz NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_commission_max" CHECK (commission_pct BETWEEN 0 AND 5),
  CONSTRAINT "chk_service_fee_max" CHECK (service_fee_pct BETWEEN 0 AND 2),
  CONSTRAINT "chk_penalty_share" CHECK (penalty_platform_share_pct BETWEEN 0 AND 100)
);

CREATE TABLE "checkouts" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "buyer_id" uuid NOT NULL,
  "source_cart_id" uuid,
  "address_id" uuid,
  "address_snapshot" jsonb,
  "goods_total" bigint NOT NULL,
  "shipping_total" bigint NOT NULL DEFAULT 0,
  "service_fee_total" bigint NOT NULL DEFAULT 0,
  "grand_total" bigint NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "code" text UNIQUE NOT NULL,
  "checkout_id" uuid,
  "buyer_id" uuid NOT NULL,
  "farmer_id" uuid NOT NULL,
  "status" order_status NOT NULL DEFAULT 'awaiting_payment',
  "escrow_status" escrow_status NOT NULL DEFAULT 'not_funded',
  "goods_subtotal" bigint NOT NULL,
  "shipping_fee" bigint NOT NULL DEFAULT 0,
  "service_fee" bigint NOT NULL DEFAULT 0,
  "commission_fee" bigint NOT NULL DEFAULT 0,
  "buyer_total" bigint NOT NULL,
  "farmer_net" bigint NOT NULL,
  "commission_pct" numeric(5,2) NOT NULL,
  "service_fee_pct" numeric(5,2) NOT NULL,
  "fee_setting_id" uuid NOT NULL,
  "payment_due_at" timestamptz,
  "respond_by" timestamptz,
  "confirmed_at" timestamptz,
  "completed_at" timestamptz,
  "cancelled_at" timestamptz,
  "cancel_reason" text,
  "cancelled_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_buyer_total" CHECK (buyer_total = goods_subtotal + shipping_fee + service_fee)
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "source" order_item_source NOT NULL DEFAULT 'direct',
  "commitment_id" uuid,
  "substituted_for_product_id" uuid,
  "product_name" text NOT NULL,
  "unit" product_unit NOT NULL,
  "quantity" numeric(12,3) NOT NULL,
  "tier_unit_price" bigint NOT NULL,
  "line_subtotal" bigint NOT NULL,
  CONSTRAINT "chk_order_item_qty" CHECK (quantity > 0)
);

CREATE TABLE "order_item_allocations" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_item_id" uuid NOT NULL,
  "batch_id" uuid NOT NULL,
  "qty" numeric(12,3) NOT NULL,
  "unit_price" bigint NOT NULL,
  "surplus_discount_pct" numeric(5,2),
  "line_amount" bigint NOT NULL
);

CREATE TABLE "order_status_history" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_id" uuid NOT NULL,
  "from_status" order_status,
  "to_status" order_status NOT NULL,
  "actor_id" uuid,
  "note" text,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "shipments" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_id" uuid UNIQUE NOT NULL,
  "method" delivery_method NOT NULL,
  "courier_code" text,
  "courier_service" text,
  "tracking_number" text,
  "weight_grams" integer,
  "distance_km" numeric(7,2),
  "shipping_fee" bigint NOT NULL DEFAULT 0,
  "scheduled_for" timestamptz,
  "shipped_at" timestamptz,
  "arrived_at" timestamptz,
  "received_confirmed_at" timestamptz,
  "auto_release_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "payer_id" uuid NOT NULL,
  "purpose" payment_purpose NOT NULL,
  "checkout_id" uuid,
  "commitment_id" uuid,
  "method" payment_method NOT NULL,
  "provider" text NOT NULL,
  "provider_ref" text,
  "idempotency_key" text UNIQUE NOT NULL,
  "amount" bigint NOT NULL,
  "status" payment_status NOT NULL DEFAULT 'pending',
  "va_bank" text,
  "va_number" text,
  "qr_string" text,
  "expires_at" timestamptz NOT NULL,
  "paid_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_payment_target" CHECK (num_nonnulls(checkout_id, commitment_id) = 1),
  CONSTRAINT "chk_payment_amount" CHECK (amount > 0)
);

CREATE TABLE "payment_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "provider" text NOT NULL,
  "provider_event_id" text NOT NULL,
  "event_type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "signature_valid" boolean NOT NULL,
  "received_at" timestamptz NOT NULL DEFAULT (now()),
  "processed_at" timestamptz,
  "error" text
);

CREATE TABLE "ledger_accounts" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "owner_id" uuid,
  "type" ledger_account_type NOT NULL,
  "balance" bigint NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_no_negative_wallet" CHECK (type NOT IN ('buyer_wallet', 'farmer_balance') OR balance >= 0)
);

CREATE TABLE "ledger_transactions" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "kind" ledger_txn_kind NOT NULL,
  "description" text,
  "order_id" uuid,
  "commitment_id" uuid,
  "payment_id" uuid,
  "refund_id" uuid,
  "payout_id" uuid,
  "idempotency_key" text UNIQUE NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "ledger_entries" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "transaction_id" uuid NOT NULL,
  "account_id" uuid NOT NULL,
  "amount" bigint NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_entry_nonzero" CHECK (amount <> 0)
);

CREATE TABLE "refunds" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_id" uuid,
  "commitment_id" uuid,
  "complaint_id" uuid,
  "amount" bigint NOT NULL,
  "reason" text NOT NULL,
  "to_wallet" boolean NOT NULL DEFAULT true,
  "status" refund_status NOT NULL DEFAULT 'pending',
  "approved_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "completed_at" timestamptz,
  CONSTRAINT "chk_refund_target" CHECK (num_nonnulls(order_id, commitment_id) = 1),
  CONSTRAINT "chk_refund_amount" CHECK (amount > 0)
);

CREATE TABLE "payouts" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "farmer_id" uuid NOT NULL,
  "bank_account_id" uuid NOT NULL,
  "amount" bigint NOT NULL,
  "status" payout_status NOT NULL DEFAULT 'requested',
  "provider_ref" text,
  "failure_reason" text,
  "requested_at" timestamptz NOT NULL DEFAULT (now()),
  "completed_at" timestamptz,
  CONSTRAINT "chk_payout_amount" CHECK (amount > 0)
);

CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_item_id" uuid UNIQUE NOT NULL,
  "product_id" uuid NOT NULL,
  "farmer_id" uuid NOT NULL,
  "buyer_id" uuid NOT NULL,
  "rating" smallint NOT NULL,
  "comment" text,
  "status" moderation_status NOT NULL DEFAULT 'published',
  "reply_body" text,
  "replied_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_rating" CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE "review_photos" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "review_id" uuid NOT NULL,
  "media_id" uuid UNIQUE NOT NULL,
  "position" smallint NOT NULL DEFAULT 0
);

CREATE TABLE "complaints" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "order_id" uuid NOT NULL,
  "buyer_id" uuid NOT NULL,
  "reason" complaint_reason NOT NULL,
  "description" text NOT NULL,
  "status" complaint_status NOT NULL DEFAULT 'open',
  "requested_amount" bigint,
  "resolved_amount" bigint,
  "mediator_id" uuid,
  "resolution_note" text,
  "opened_at" timestamptz NOT NULL DEFAULT (now()),
  "resolved_at" timestamptz
);

CREATE TABLE "complaint_evidence" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "complaint_id" uuid NOT NULL,
  "media_id" uuid UNIQUE NOT NULL
);

CREATE TABLE "complaint_messages" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "complaint_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "reporter_id" uuid NOT NULL,
  "product_id" uuid,
  "farmer_id" uuid,
  "review_id" uuid,
  "reason" text NOT NULL,
  "details" text,
  "status" report_status NOT NULL DEFAULT 'open',
  "handled_by" uuid,
  "handled_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_report_target" CHECK (num_nonnulls(product_id, farmer_id, review_id) = 1)
);

CREATE TABLE "conversations" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "buyer_id" uuid NOT NULL,
  "farmer_id" uuid NOT NULL,
  "last_message_at" timestamptz,
  "buyer_last_read_at" timestamptz,
  "farmer_last_read_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "conversation_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "client_message_id" uuid NOT NULL,
  "body" text,
  "attachment_media_id" uuid,
  "product_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "chk_message_content" CHECK (body IS NOT NULL OR attachment_media_id IS NOT NULL)
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "user_id" uuid NOT NULL,
  "category" notification_category NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "body" text,
  "link" text,
  "data" jsonb NOT NULL DEFAULT '{}',
  "read_at" timestamptz,
  "pushed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "outbox_events" (
  "id" uuid PRIMARY KEY DEFAULT (uuidv7()),
  "aggregate_type" text NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "available_at" timestamptz NOT NULL DEFAULT (now()),
  "processed_at" timestamptz,
  "attempts" smallint NOT NULL DEFAULT 0,
  "last_error" text
);

CREATE TABLE "product_daily_stats" (
  "product_id" uuid NOT NULL,
  "day" date NOT NULL,
  "views" integer NOT NULL DEFAULT 0,
  "add_to_carts" integer NOT NULL DEFAULT 0,
  "subscriptions" integer NOT NULL DEFAULT 0,
  "purchases" integer NOT NULL DEFAULT 0,
  "units_sold" numeric(14,3) NOT NULL DEFAULT 0,
  "revenue" bigint NOT NULL DEFAULT 0,
  PRIMARY KEY ("product_id", "day")
);

CREATE TABLE "audit_logs" (
  "id" uuid NOT NULL DEFAULT (uuidv7()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "actor_id" uuid,
  "action" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "old_values" jsonb,
  "new_values" jsonb,
  "ip_address" inet,
  PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE ("created_at");

CREATE TABLE "audit_logs_default" PARTITION OF "audit_logs" DEFAULT;

CREATE TABLE "audit_logs_2026_11" PARTITION OF "audit_logs" FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE "audit_logs_2026_12" PARTITION OF "audit_logs" FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE "audit_logs_2027_01" PARTITION OF "audit_logs" FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-02-01 00:00:00+00');

CREATE TABLE "audit_logs_2027_02" PARTITION OF "audit_logs" FOR VALUES FROM ('2027-02-01 00:00:00+00') TO ('2027-03-01 00:00:00+00');

CREATE TABLE "platform_settings" (
  "key" text PRIMARY KEY,
  "value" jsonb NOT NULL,
  "updated_by" uuid,
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "districts" ("regency_code");

CREATE INDEX ON "users" ("role", "created_at");

CREATE INDEX ON "users" ("avatar_media_id");

CREATE INDEX ON "media_assets" ("owner_id", "created_at");

CREATE INDEX ON "media_assets" ("status", "created_at");

CREATE INDEX ON "addresses" ("user_id");

CREATE INDEX ON "addresses" ("regency_code");

CREATE INDEX ON "addresses" ("district_code");

CREATE INDEX ON "push_subscriptions" ("user_id");

CREATE INDEX ON "farmer_profiles" ("regency_code");

CREATE INDEX ON "farmer_profiles" ("district_code");

CREATE INDEX ON "farmer_profiles" ("verification_status");

CREATE INDEX ON "farmer_verifications" ("farmer_id");

CREATE INDEX ON "farmer_verifications" ("reviewed_by");

CREATE INDEX ON "farmer_verifications" ("ktp_media_id");

CREATE INDEX ON "farmer_verifications" ("land_media_id");

CREATE INDEX ON "farmer_verifications" ("status", "submitted_at");

CREATE INDEX ON "bank_accounts" ("farmer_id");

CREATE INDEX ON "farmer_holidays" ("farmer_id");

CREATE INDEX ON "farmer_badges" ("farmer_id");

CREATE INDEX ON "farmer_badges" ("badge_id");

CREATE INDEX ON "categories" ("parent_id");

CREATE INDEX ON "search_synonyms" ("canonical_term");

CREATE INDEX ON "products" ("farmer_id");

CREATE INDEX ON "products" ("category_id");

CREATE INDEX ON "products" ("source_waitlist_id");

CREATE INDEX ON "products" ("current_batch_id");

CREATE INDEX ON "products" ("status", "category_id", "created_at");

CREATE INDEX ON "product_tags" ("tag_id");

CREATE UNIQUE INDEX ON "price_tiers" ("product_id", "min_qty");

CREATE UNIQUE INDEX ON "surplus_rules" ("product_id", "days_remaining");

CREATE UNIQUE INDEX ON "product_batches" ("product_id", "batch_no");

CREATE INDEX ON "product_batches" ("product_id", "status", "expires_on");

CREATE INDEX ON "product_batches" ("source_waitlist_id");

CREATE INDEX ON "product_batches" ("created_by");

CREATE INDEX ON "product_photos" ("product_id", "position");

CREATE INDEX ON "product_photos" ("batch_id");

CREATE INDEX ON "stock_movements" ("batch_id", "created_at");

CREATE INDEX ON "stock_movements" ("order_item_id");

CREATE INDEX ON "stock_movements" ("actor_id");

CREATE INDEX ON "stock_reservations" ("batch_id");

CREATE INDEX ON "stock_reservations" ("order_item_id");

CREATE INDEX ON "product_subscriptions" ("product_id");

CREATE INDEX ON "waitlists" ("farmer_id");

CREATE INDEX ON "waitlists" ("category_id");

CREATE INDEX ON "waitlists" ("product_id");

CREATE INDEX ON "waitlists" ("status", "harvest_start");

CREATE INDEX ON "waitlist_events" ("waitlist_id", "created_at");

CREATE INDEX ON "waitlist_events" ("created_by");

CREATE INDEX ON "waitlist_media" ("event_id");

CREATE INDEX ON "waitlist_followers" ("waitlist_id");

CREATE INDEX ON "commitments" ("waitlist_id");

CREATE INDEX ON "commitments" ("buyer_id");

CREATE INDEX ON "commitments" ("order_id");

CREATE INDEX ON "commitments" ("waitlist_id", "status", "remainder_paid_at");

CREATE INDEX ON "carts" ("buyer_id", "kind");

CREATE INDEX ON "cart_items" ("cart_id");

CREATE INDEX ON "cart_items" ("product_id");

CREATE INDEX ON "cart_items" ("waitlist_id");

CREATE UNIQUE INDEX ON "cart_items" ("cart_id", "product_id");

CREATE UNIQUE INDEX ON "cart_items" ("cart_id", "waitlist_id");

CREATE UNIQUE INDEX ON "cart_item_alternatives" ("cart_item_id", "product_id");

CREATE INDEX ON "cart_item_alternatives" ("product_id");

CREATE UNIQUE INDEX ON "platform_fee_settings" ("effective_from");

CREATE INDEX ON "platform_fee_settings" ("created_by");

CREATE INDEX ON "checkouts" ("buyer_id");

CREATE INDEX ON "checkouts" ("source_cart_id");

CREATE INDEX ON "checkouts" ("address_id");

CREATE INDEX ON "orders" ("checkout_id");

CREATE INDEX ON "orders" ("buyer_id", "created_at");

CREATE INDEX ON "orders" ("farmer_id", "status", "created_at");

CREATE INDEX ON "orders" ("fee_setting_id");

CREATE INDEX ON "orders" ("cancelled_by");

CREATE INDEX ON "order_items" ("order_id");

CREATE INDEX ON "order_items" ("product_id");

CREATE INDEX ON "order_items" ("commitment_id");

CREATE INDEX ON "order_items" ("substituted_for_product_id");

CREATE INDEX ON "order_item_allocations" ("order_item_id");

CREATE INDEX ON "order_item_allocations" ("batch_id");

CREATE INDEX ON "order_status_history" ("order_id", "created_at");

CREATE INDEX ON "order_status_history" ("actor_id");

CREATE INDEX ON "shipments" ("tracking_number");

CREATE UNIQUE INDEX ON "payments" ("provider", "provider_ref");

CREATE INDEX ON "payments" ("payer_id");

CREATE INDEX ON "payments" ("checkout_id");

CREATE INDEX ON "payments" ("commitment_id");

CREATE UNIQUE INDEX ON "payment_webhook_events" ("provider", "provider_event_id");

CREATE INDEX ON "ledger_transactions" ("order_id");

CREATE INDEX ON "ledger_transactions" ("commitment_id");

CREATE INDEX ON "ledger_transactions" ("payment_id");

CREATE INDEX ON "ledger_transactions" ("refund_id");

CREATE INDEX ON "ledger_transactions" ("payout_id");

CREATE INDEX ON "ledger_entries" ("transaction_id");

CREATE INDEX ON "ledger_entries" ("account_id", "created_at");

CREATE INDEX ON "refunds" ("order_id");

CREATE INDEX ON "refunds" ("commitment_id");

CREATE INDEX ON "refunds" ("complaint_id");

CREATE INDEX ON "refunds" ("approved_by");

CREATE INDEX ON "payouts" ("farmer_id", "requested_at");

CREATE INDEX ON "payouts" ("bank_account_id");

CREATE INDEX ON "reviews" ("product_id", "created_at");

CREATE INDEX ON "reviews" ("farmer_id", "created_at");

CREATE INDEX ON "reviews" ("buyer_id");

CREATE INDEX ON "review_photos" ("review_id");

CREATE INDEX ON "complaints" ("order_id");

CREATE INDEX ON "complaints" ("buyer_id");

CREATE INDEX ON "complaints" ("mediator_id");

CREATE INDEX ON "complaints" ("status", "opened_at");

CREATE INDEX ON "complaint_evidence" ("complaint_id");

CREATE INDEX ON "complaint_messages" ("complaint_id", "created_at");

CREATE INDEX ON "complaint_messages" ("sender_id");

CREATE INDEX ON "reports" ("reporter_id");

CREATE INDEX ON "reports" ("product_id");

CREATE INDEX ON "reports" ("farmer_id");

CREATE INDEX ON "reports" ("review_id");

CREATE INDEX ON "reports" ("handled_by");

CREATE INDEX ON "reports" ("status", "created_at");

CREATE UNIQUE INDEX ON "conversations" ("buyer_id", "farmer_id");

CREATE INDEX ON "conversations" ("farmer_id", "last_message_at");

CREATE INDEX ON "conversations" ("buyer_id", "last_message_at");

CREATE INDEX ON "messages" ("conversation_id", "id");

CREATE UNIQUE INDEX ON "messages" ("sender_id", "client_message_id");

CREATE INDEX ON "messages" ("attachment_media_id");

CREATE INDEX ON "messages" ("product_id");

CREATE INDEX ON "notifications" ("user_id", "created_at");

CREATE INDEX ON "outbox_events" ("aggregate_type", "aggregate_id");

CREATE INDEX ON "product_daily_stats" ("day");

CREATE INDEX ON "audit_logs" ("entity_type", "entity_id", "created_at");

CREATE INDEX ON "audit_logs" ("actor_id");

CREATE INDEX ON "platform_settings" ("updated_by");

COMMENT ON TABLE "regencies" IS 'Seeded reference data. MVP covers province 32 only.';

COMMENT ON COLUMN "regencies"."code" IS 'Kemendagri code, e.g. 32.04 (Kab. Bandung). Province 32 = Jawa Barat';

COMMENT ON COLUMN "regencies"."slug" IS 'URL filter value, e.g. kabupaten-bandung';

COMMENT ON COLUMN "districts"."code" IS 'Kemendagri code, e.g. 32.04.01';

COMMENT ON TABLE "users" IS 'Email is read from neon_auth.user (single source of truth). Sessions are handled by Neon Auth.';

COMMENT ON COLUMN "users"."id" IS 'Same value as neon_auth.user.id; row created on first sign-in (onboarding)';

COMMENT ON COLUMN "users"."full_name" IS 'Prefilled from Google name, editable';

COMMENT ON COLUMN "users"."phone" IS 'E.164; required before first checkout / shipment';

COMMENT ON COLUMN "users"."role" IS 'Chosen at onboarding: consumer, umkm or farmer. Admins seeded.';

COMMENT ON COLUMN "users"."avatar_media_id" IS 'Custom avatar; NULL = use neon_auth.user.image';

COMMENT ON COLUMN "users"."onboarded_at" IS 'Role and required profile fields completed';

COMMENT ON COLUMN "users"."last_seen_at" IS 'Flushed from Redis presence, not written per request';

COMMENT ON COLUMN "users"."deleted_at" IS 'Soft delete; PII scrubbed by a job (UU PDP)';

COMMENT ON TABLE "media_assets" IS 'Images live on Cloudinary; only ids and metadata are stored here.
Browser uploads directly with a backend-signed upload; the Cloudinary webhook marks
the row ready. Compression and resizing are Cloudinary transformations, not stored files.
';

COMMENT ON COLUMN "media_assets"."owner_id" IS 'Uploader';

COMMENT ON COLUMN "media_assets"."cloudinary_public_id" IS 'e.g. pasok-tani/products/<uuid>';

COMMENT ON COLUMN "media_assets"."cloudinary_version" IS 'Cache-busting version from the upload response';

COMMENT ON COLUMN "media_assets"."delivery_type" IS 'upload (public) | authenticated (KTP, land photo)';

COMMENT ON COLUMN "media_assets"."format" IS 'Original format; delivered with f_auto,q_auto';

COMMENT ON COLUMN "media_assets"."taken_on" IS 'Photo/harvest date shown as the freshness label';

COMMENT ON TABLE "addresses" IS 'Partial unique index: (user_id) WHERE is_default (at most one default address).';

COMMENT ON COLUMN "addresses"."label" IS 'e.g. Rumah, Warung';

COMMENT ON COLUMN "addresses"."location" IS 'Pin from the map; used for distance and shipping cost';

COMMENT ON TABLE "notification_preferences" IS 'Missing row = default (all on, instant). Rows exist only once a user changes something.';

COMMENT ON COLUMN "push_subscriptions"."endpoint" IS 'Web Push endpoint URL';

COMMENT ON TABLE "farmer_profiles" IS 'GiST index on location (migration).';

COMMENT ON COLUMN "farmer_profiles"."user_id" IS '1:1 with users where role = farmer';

COMMENT ON COLUMN "farmer_profiles"."address_line" IS 'Required before the first order ships';

COMMENT ON COLUMN "farmer_profiles"."location" IS 'Farm location; GiST index for "near me"';

COMMENT ON COLUMN "farmer_profiles"."auto_cancel_after_hours" IS 'NULL = off; else 12, 24 or 48';

COMMENT ON COLUMN "farmer_profiles"."self_delivery_fee" IS 'IDR, set by the farmer';

COMMENT ON COLUMN "farmer_profiles"."avg_response_minutes" IS 'Computed from messages; used by Fast Response badge';

COMMENT ON TABLE "farmer_verifications" IS 'History of submissions; farmer_profiles.verification_status holds the current value. Required before first payout.';

COMMENT ON COLUMN "farmer_verifications"."ktp_number_enc" IS 'Encrypted at the application layer (envelope encryption)';

COMMENT ON TABLE "bank_accounts" IS 'Partial unique index: (farmer_id) WHERE is_primary.';

COMMENT ON COLUMN "bank_accounts"."bank_code" IS 'Gateway bank code, e.g. BCA, BRI, BJB';

COMMENT ON COLUMN "bank_accounts"."verified_at" IS 'Name check via the payout provider';

COMMENT ON COLUMN "farmer_operating_hours"."weekday" IS '0 = Sunday ... 6 = Saturday (ISO would be 1-7; pick one and keep it)';

COMMENT ON TABLE "farmer_holidays" IS 'PG18 temporal constraint: UNIQUE (farmer_id, period WITHOUT OVERLAPS) (needs btree_gist). Prevents overlapping holidays.';

COMMENT ON COLUMN "farmer_holidays"."period" IS 'Inclusive day range of the store holiday';

COMMENT ON COLUMN "badges"."code" IS 'new_farmer, verified, power_farmer, fast_response, fresh_stock, on_time_harvest, surplus_hero';

COMMENT ON COLUMN "badges"."criteria" IS 'Thresholds editable by admin, e.g. {"min_tx_month":20,"min_rating":4.7}';

COMMENT ON TABLE "farmer_badges" IS 'Partial unique index: (farmer_id, badge_id) WHERE revoked_at IS NULL. Keeps award history.';

COMMENT ON COLUMN "farmer_badges"."evaluation_period" IS 'First day of the month that was evaluated';

COMMENT ON COLUMN "categories"."icon" IS 'sayuran, buah, rempah, padi, umbi, jamur';

COMMENT ON COLUMN "tags"."slug" IS 'organik, hidroponik, bebas-pestisida';

COMMENT ON TABLE "search_synonyms" IS 'Query rewrite dictionary for fuzzy search. GIN trigram index on term (migration).';

COMMENT ON COLUMN "search_synonyms"."term" IS 'Normalized (lower + unaccent), e.g. cabe, lombok, bawang beureum';

COMMENT ON COLUMN "search_synonyms"."canonical_term" IS 'e.g. cabai, bawang merah';

COMMENT ON COLUMN "search_synonyms"."source" IS 'admin | regional | typo';

COMMENT ON TABLE "products" IS 'Migration-only indexes:
- GIN (search_vector) for full-text
- GIN (name gin_trgm_ops) for typo-tolerant similarity
- partial (created_at) WHERE status = ''active''
Audit trigger writes price changes to audit_logs.
';

COMMENT ON COLUMN "products"."alt_names" IS 'Local / regional names fed into search';

COMMENT ON COLUMN "products"."price" IS 'Base price per unit (IDR), tier for qty >= 1';

COMMENT ON COLUMN "products"."surplus_floor_price" IS 'Minimum price after Surplus discount';

COMMENT ON COLUMN "products"."source_waitlist_id" IS 'Wait list that created this product, if any';

COMMENT ON COLUMN "products"."search_vector" IS 'GENERATED ALWAYS AS (to_tsvector(simple, unaccent(name || alt_names || description))) STORED';

COMMENT ON COLUMN "products"."available_qty" IS 'Sum of sellable qty across active batches';

COMMENT ON COLUMN "products"."current_batch_id" IS 'FEFO head batch: nearest expiry with stock';

COMMENT ON TABLE "price_tiers" IS 'Wholesale tiers above the base price. Rule "higher tier = lower price" is checked by a constraint trigger.';

COMMENT ON COLUMN "price_tiers"."min_qty" IS 'Tier applies when qty >= min_qty';

COMMENT ON COLUMN "surplus_rules"."days_remaining" IS 'Applies when days to expiry <= this value';

COMMENT ON TABLE "product_batches" IS 'Partial index (expires_on) WHERE status = active, for the nightly expiry/surplus job.';

COMMENT ON COLUMN "product_batches"."batch_no" IS 'Per-product sequence: 1, 2, 3 ...';

COMMENT ON COLUMN "product_batches"."on_hand_qty" IS 'Physical stock for sale';

COMMENT ON COLUMN "product_batches"."reserved_qty" IS 'Held by unpaid checkouts / commitments';

COMMENT ON COLUMN "product_batches"."surplus_discount_pct" IS 'Cached current tier, refreshed by the daily surplus job';

COMMENT ON COLUMN "product_batches"."expiry_undo_until" IS 'Farmer may undo expiry reduction until this time (1-2 days)';

COMMENT ON COLUMN "product_batches"."source_waitlist_id" IS 'Set when the batch comes from a wait-list harvest';

COMMENT ON COLUMN "product_photos"."batch_id" IS 'Photo of this specific stock batch (freshness label)';

COMMENT ON TABLE "stock_movements" IS 'Append-only. on_hand_qty = sum(qty_delta) per batch, so the cached column can be rebuilt.';

COMMENT ON COLUMN "stock_movements"."qty_delta" IS 'Signed change to on_hand_qty';

COMMENT ON COLUMN "stock_movements"."reason" IS 'Required for manual_adjustment';

COMMENT ON COLUMN "stock_movements"."actor_id" IS 'NULL = system job';

COMMENT ON TABLE "stock_reservations" IS 'Partial index (expires_at) WHERE status = active. Sweeper runs in the Node backend every minute with FOR UPDATE SKIP LOCKED. Must stay in Postgres: it commits together with product_batches.reserved_qty.';

COMMENT ON COLUMN "stock_reservations"."expires_at" IS 'created_at + 1 hour (payment time limit)';

COMMENT ON COLUMN "product_subscriptions"."on_price_drop" IS 'Includes entering Surplus';

COMMENT ON COLUMN "waitlists"."harvest_start" IS 'exact_date: the date. date_range: first day';

COMMENT ON COLUMN "waitlists"."harvest_end" IS 'date_range: last day';

COMMENT ON COLUMN "waitlists"."first_estimate_set_at" IS 'Ends penalty-free cancellation for estimate-less wait lists';

COMMENT ON COLUMN "waitlists"."penalty_free_until" IS 'Latest delay notification + 48 hours';

COMMENT ON COLUMN "waitlists"."estimated_unit_price" IS 'Used to compute held minimum funds';

COMMENT ON COLUMN "waitlists"."final_unit_price" IS 'Set at harvest; used for the remainder';

COMMENT ON COLUMN "waitlists"."quota_qty" IS 'NULL = unlimited commit';

COMMENT ON COLUMN "waitlists"."committed_min_qty" IS 'Cached sum of active commitments.qty_min';

COMMENT ON COLUMN "waitlists"."product_id" IS 'Product opened for sale after harvest';

COMMENT ON TABLE "waitlist_events" IS 'Append-only public timeline shown to buyers.';

COMMENT ON COLUMN "waitlist_events"."old_schedule" IS '{type, start, end} before the change';

COMMENT ON COLUMN "waitlist_events"."reason" IS 'Required for harvest_delayed and harvest_failed';

COMMENT ON TABLE "commitments" IS 'Partial index (remainder_due_at) WHERE status = awaiting_remainder for the 48-hour job.';

COMMENT ON COLUMN "commitments"."unit_price_estimate" IS 'Snapshot of waitlists.estimated_unit_price';

COMMENT ON COLUMN "commitments"."held_amount" IS 'qty_min * unit_price_estimate, held in escrow';

COMMENT ON COLUMN "commitments"."had_estimate_at_commit" IS 'Shown the "no schedule certainty" warning if false';

COMMENT ON COLUMN "commitments"."remainder_due_at" IS 'Harvest available + 48 hours';

COMMENT ON COLUMN "commitments"."remainder_paid_at" IS 'Allocation priority when harvest is short: earliest payer first';

COMMENT ON COLUMN "commitments"."penalty_amount" IS '20% of held_amount when applicable';

COMMENT ON COLUMN "commitments"."order_id" IS 'Order created at allocation';

COMMENT ON TABLE "carts" IS 'Partial unique index: (buyer_id) WHERE kind = temporary (one temporary cart per buyer).';

COMMENT ON COLUMN "carts"."name" IS 'Required for recipe carts, e.g. Nasi Goreng';

COMMENT ON TABLE "cart_items" IS 'Adding to cart does not reserve stock.';

COMMENT ON COLUMN "cart_items"."waitlist_id" IS 'Recipe item that checks out as a Commit';

COMMENT ON TABLE "cart_item_alternatives" IS 'Uses the primary item quantity. Substitutions apply per checkout only.';

COMMENT ON COLUMN "cart_item_alternatives"."priority" IS '1 = first alternative; reordered by drag and drop';

COMMENT ON TABLE "platform_fee_settings" IS 'Versioned: the active row is the latest effective_from <= now(). Orders snapshot the rates.';

COMMENT ON COLUMN "platform_fee_settings"."commission_pct" IS 'Charged to the farmer';

COMMENT ON COLUMN "platform_fee_settings"."service_fee_pct" IS 'Charged to the buyer';

COMMENT ON TABLE "checkouts" IS 'One buyer action -> one payment -> one order per farmer.';

COMMENT ON COLUMN "checkouts"."source_cart_id" IS 'Recipe Cart analytics';

COMMENT ON COLUMN "checkouts"."address_snapshot" IS 'Frozen copy of the address at checkout';

COMMENT ON TABLE "orders" IS 'Partial indexes for jobs: (payment_due_at) WHERE status = awaiting_payment; (respond_by) WHERE status = confirmed.';

COMMENT ON COLUMN "orders"."code" IS 'Human-readable, e.g. PT-20261104-8F3K';

COMMENT ON COLUMN "orders"."checkout_id" IS 'NULL for orders created from a commitment';

COMMENT ON COLUMN "orders"."goods_subtotal" IS 'After tier and Surplus discounts, before fees';

COMMENT ON COLUMN "orders"."buyer_total" IS 'goods_subtotal + shipping_fee + service_fee';

COMMENT ON COLUMN "orders"."farmer_net" IS 'goods_subtotal + shipping (self delivery) - commission_fee';

COMMENT ON COLUMN "orders"."commission_pct" IS 'Snapshot';

COMMENT ON COLUMN "orders"."service_fee_pct" IS 'Snapshot';

COMMENT ON COLUMN "orders"."payment_due_at" IS 'Created + 1 hour';

COMMENT ON COLUMN "orders"."respond_by" IS 'Auto-cancel deadline when the farmer enabled it';

COMMENT ON COLUMN "order_items"."substituted_for_product_id" IS 'Recipe Cart alternative used at checkout';

COMMENT ON COLUMN "order_items"."product_name" IS 'Snapshot';

COMMENT ON COLUMN "order_items"."unit" IS 'Snapshot';

COMMENT ON COLUMN "order_items"."tier_unit_price" IS 'Price after wholesale tier, before Surplus';

COMMENT ON COLUMN "order_items"."line_subtotal" IS 'Sum of allocations.line_amount';

COMMENT ON TABLE "order_item_allocations" IS 'FEFO split: one item can be served by several batches.';

COMMENT ON COLUMN "order_item_allocations"."unit_price" IS 'May differ per batch because Surplus is per batch';

COMMENT ON COLUMN "order_status_history"."actor_id" IS 'NULL = system';

COMMENT ON TABLE "shipments" IS 'Partial index (auto_release_at) WHERE received_confirmed_at IS NULL.';

COMMENT ON COLUMN "shipments"."courier_code" IS 'Aggregator courier/service code';

COMMENT ON COLUMN "shipments"."scheduled_for" IS 'Delivery scheduling (needs evaluation)';

COMMENT ON COLUMN "shipments"."arrived_at" IS 'Starts the 3-day complaint / auto-release window';

COMMENT ON COLUMN "shipments"."auto_release_at" IS 'arrived_at + 3 days; paused while a complaint is open';

COMMENT ON COLUMN "payments"."provider" IS 'Gateway name, e.g. midtrans or xendit';

COMMENT ON COLUMN "payments"."provider_ref" IS 'Gateway transaction id';

COMMENT ON COLUMN "ledger_accounts"."owner_id" IS 'NULL for platform system accounts';

COMMENT ON COLUMN "ledger_accounts"."balance" IS 'Cached; equals the sum of entries';

COMMENT ON COLUMN "ledger_transactions"."idempotency_key" IS 'e.g. release:order:<id>';

COMMENT ON TABLE "ledger_entries" IS 'Append-only. Deferred constraint trigger: SUM(amount) per transaction_id = 0 (double entry).';

COMMENT ON COLUMN "ledger_entries"."amount" IS 'Signed: + credit to the account, - debit';

COMMENT ON COLUMN "refunds"."to_wallet" IS 'MVP refunds go to the platform wallet';

COMMENT ON TABLE "payouts" IS 'Service layer blocks payouts until farmer verification is approved.';

COMMENT ON COLUMN "reviews"."order_item_id" IS 'One review per purchased item; only after receipt';

COMMENT ON COLUMN "reviews"."reply_body" IS 'Farmer reply';

COMMENT ON TABLE "complaints" IS 'Allowed only within 3 days of shipments.arrived_at (service rule). Opening sets orders.escrow_status = disputed.';

COMMENT ON COLUMN "complaints"."mediator_id" IS 'Admin handling the dispute';

COMMENT ON COLUMN "complaint_evidence"."media_id" IS 'Uploader and time are on media_assets';

COMMENT ON TABLE "complaint_messages" IS 'Three-way mediation thread (buyer, farmer, admin).';

COMMENT ON TABLE "messages" IS 'Written to Postgres first, then published to Redis pub/sub for WebSocket fan-out.';

COMMENT ON COLUMN "messages"."client_message_id" IS 'Generated by the client; makes WebSocket resends idempotent';

COMMENT ON COLUMN "messages"."product_id" IS 'Optional product card in the message';

COMMENT ON TABLE "notifications" IS 'Partial index (user_id) WHERE read_at IS NULL for the unread badge.';

COMMENT ON COLUMN "notifications"."type" IS 'e.g. waitlist.schedule_changed, product.back_in_stock';

COMMENT ON COLUMN "notifications"."link" IS 'Frontend path, e.g. /pesanan/<id>';

COMMENT ON TABLE "outbox_events" IS 'Transactional outbox. Partial index (available_at) WHERE processed_at IS NULL; Node workers claim rows with FOR UPDATE SKIP LOCKED, then write notifications, send web push and publish to Redis for live WebSocket delivery.';

COMMENT ON COLUMN "outbox_events"."aggregate_type" IS 'order, waitlist, product, ...';

COMMENT ON COLUMN "outbox_events"."available_at" IS 'For retries with backoff';

COMMENT ON TABLE "product_daily_stats" IS 'views and add_to_carts: counted in Redis during the day
(HINCRBY stats:{yyyymmdd}:{product_id}, PFADD for unique viewers) and flushed here nightly.
subscriptions, purchases, units_sold, revenue: aggregated from Postgres tables.
Feeds the farmer funnel and best/slow sellers.
';

COMMENT ON TABLE "audit_logs" IS 'PARTITION BY RANGE (created_at), monthly. Append-only (app role has INSERT only). Written by triggers on price and status columns.';

COMMENT ON COLUMN "audit_logs"."actor_id" IS 'NULL = system';

COMMENT ON COLUMN "audit_logs"."action" IS 'e.g. product.price_changed, order.status_changed, fee.updated';

COMMENT ON COLUMN "platform_settings"."key" IS 'e.g. payment_timeout_minutes, remainder_window_hours, complaint_window_days';

ALTER TABLE "districts" ADD FOREIGN KEY ("regency_code") REFERENCES "regencies" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "media_assets" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "addresses" ADD FOREIGN KEY ("regency_code") REFERENCES "regencies" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "addresses" ADD FOREIGN KEY ("district_code") REFERENCES "districts" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_profiles" ADD FOREIGN KEY ("regency_code") REFERENCES "regencies" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_profiles" ADD FOREIGN KEY ("district_code") REFERENCES "districts" ("code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_verifications" ADD FOREIGN KEY ("ktp_media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_verifications" ADD FOREIGN KEY ("land_media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_verifications" ADD FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_badges" ADD FOREIGN KEY ("badge_id") REFERENCES "badges" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_batches" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_photos" ADD FOREIGN KEY ("media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_movements" ADD FOREIGN KEY ("actor_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlists" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlists" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_events" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_media" ADD FOREIGN KEY ("media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("waitlist_id") REFERENCES "waitlists" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_item_alternatives" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "platform_fee_settings" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "checkouts" ADD FOREIGN KEY ("source_cart_id") REFERENCES "carts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "checkouts" ADD FOREIGN KEY ("address_id") REFERENCES "addresses" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("checkout_id") REFERENCES "checkouts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("fee_setting_id") REFERENCES "platform_fee_settings" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("cancelled_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("commitment_id") REFERENCES "commitments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("substituted_for_product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_item_allocations" ADD FOREIGN KEY ("batch_id") REFERENCES "product_batches" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_status_history" ADD FOREIGN KEY ("actor_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("payer_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("checkout_id") REFERENCES "checkouts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("commitment_id") REFERENCES "commitments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_accounts" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_transactions" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_transactions" ADD FOREIGN KEY ("commitment_id") REFERENCES "commitments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_transactions" ADD FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_transactions" ADD FOREIGN KEY ("refund_id") REFERENCES "refunds" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_transactions" ADD FOREIGN KEY ("payout_id") REFERENCES "payouts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_entries" ADD FOREIGN KEY ("account_id") REFERENCES "ledger_accounts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refunds" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refunds" ADD FOREIGN KEY ("commitment_id") REFERENCES "commitments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refunds" ADD FOREIGN KEY ("complaint_id") REFERENCES "complaints" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refunds" ADD FOREIGN KEY ("approved_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payouts" ADD FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "review_photos" ADD FOREIGN KEY ("media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaints" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaints" ADD FOREIGN KEY ("mediator_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaint_evidence" ADD FOREIGN KEY ("media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaint_messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("handled_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversations" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversations" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("attachment_media_id") REFERENCES "media_assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "platform_settings" ADD FOREIGN KEY ("updated_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "neon_auth"."user" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("avatar_media_id") REFERENCES "media_assets" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "addresses" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_preferences" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "push_subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_verifications" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bank_accounts" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_operating_hours" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_holidays" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "farmer_badges" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("source_waitlist_id") REFERENCES "waitlists" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "products" ADD FOREIGN KEY ("current_batch_id") REFERENCES "product_batches" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_tags" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "price_tiers" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "surplus_rules" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_batches" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_batches" ADD FOREIGN KEY ("source_waitlist_id") REFERENCES "waitlists" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_photos" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_photos" ADD FOREIGN KEY ("batch_id") REFERENCES "product_batches" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_movements" ADD FOREIGN KEY ("batch_id") REFERENCES "product_batches" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_movements" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_reservations" ADD FOREIGN KEY ("batch_id") REFERENCES "product_batches" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "stock_reservations" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_subscriptions" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlists" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_events" ADD FOREIGN KEY ("waitlist_id") REFERENCES "waitlists" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_media" ADD FOREIGN KEY ("event_id") REFERENCES "waitlist_events" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_followers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waitlist_followers" ADD FOREIGN KEY ("waitlist_id") REFERENCES "waitlists" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "commitments" ADD FOREIGN KEY ("waitlist_id") REFERENCES "waitlists" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "commitments" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "commitments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "carts" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_items" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_item_alternatives" ADD FOREIGN KEY ("cart_item_id") REFERENCES "cart_items" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "checkouts" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_item_allocations" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_status_history" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "shipments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ledger_entries" ADD FOREIGN KEY ("transaction_id") REFERENCES "ledger_transactions" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payouts" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("farmer_id") REFERENCES "farmer_profiles" ("user_id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "review_photos" ADD FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaints" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaint_evidence" ADD FOREIGN KEY ("complaint_id") REFERENCES "complaints" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "complaint_messages" ADD FOREIGN KEY ("complaint_id") REFERENCES "complaints" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product_daily_stats" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
