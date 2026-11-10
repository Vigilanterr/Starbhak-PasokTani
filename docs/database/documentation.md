# Pasok Tani Database Design

This document explains the database schema in [`schema_diagram.dbml`](./schema_diagram.dbml): what each part does, why it is built that way, the trade-offs, and the well-known patterns it uses. It is written for backend developers who will write the migrations and services, and for reviewers checking that the schema matches the MVP spec (`Features Context`, sections S1 to S15).

- **Target:** PostgreSQL 18 on **Neon**. Postgres has no "LTS" label. Every major version gets 5 years of support, so v18 (released September 2025) is supported until about November 2030.
- **Stack:** Neon (database), managed **Neon Auth** (Better Auth; email/password and Google OAuth), a **Next.js backend** on Vercel (route handlers and server actions), **Upstash Redis**, **Cloudinary**. Section 10 says what lives where; section 11 covers SSE chat.
- **Size:** 61 app tables in 11 domains, 32 enums, plus the Neon-managed `neon_auth.user` table (shown only for the foreign key).
- **View the diagram:** paste the `.dbml` file into <https://dbdiagram.io/d>, or run `dbml2sql schema_diagram.dbml --postgres` to get the base DDL. The DBML is the source; diagram links are just snapshots.

---

## 1. Summary

The schema is one relational Postgres database, built around four ideas:

1. **Stock is tracked per batch, not per product.** Harvest date, expiry, Surplus discount and photos all belong to a stock batch (S7, S11). Products keep their reviews, subscribers and stats across batches.
2. **Money moves through a double-entry ledger.** Escrow, the buyer wallet, farmer balances, commission, penalties, refunds and payouts are all ledger entries that sum to zero. Balances are never edited directly.
3. **History is append-only.** Stock movements, wait-list timelines, order status changes, ledger entries and audit logs are only ever inserted. Current values are cached on the parent row and can be rebuilt from history.
4. **Side effects go through an outbox.** Notifications, web push, live SSE updates and badge evaluation are written as events in the same transaction as the business change, then dispatched right after commit by route handlers, with a GitHub Actions sweep as safety net (section 7).
5. **Postgres keeps only what must be durable and transactional.** Sign-in and sessions belong to Neon Auth. Image files live on Cloudinary. Short-lived data (view counters, cache, rate limits, presence, pub/sub) lives in Redis.

---

## 2. Domain map

```
                        +-------------+
                        |   regions   |  regencies, districts (Kemendagri codes, West Java)
                        +------+------+
                               |
+-----------+   1:1   +--------v--------+        +------------------+
| identity  +-------->+     farmers     +------->+  catalog         |
| users,    |         | profiles, KYC,  |        | products, batches|
| media,    |         | bank, hours,    |        | tiers, surplus,  |
| addresses |         | holidays,badges |        | photos, stock log|
+-----+-----+         +--------+--------+        +----+--------+----+
      |                        |                      |        ^
      |                        v                      |        | harvest -> new batch
      |               +-----------------+             |        |
      +-------------->+ waitlist_commit +-------------+--------+
      |               | waitlists,      |  commitment -> order
      |               | events, follow, |
      |               | commitments     |
      |               +--------+--------+
      v                        |
+-----------+   checkout  +----v-----+   pays   +------------------------+
|  carts    +------------>+ ordering +--------->+ money                  |
| temporary,|             | checkout,|          | payments, webhooks,    |
| recipe,   |             | orders,  |          | ledger (accounts,      |
| alts      |             | items,   |          | txns, entries),        |
+-----------+             | shipments|          | refunds, payouts       |
                          +----+-----+          +------------------------+
                               |
             +-----------------+------------------+
             v                 v                  v
      +-------------+  +---------------+  +------------------+
      | trust       |  | communication |  | analytics_admin  |
      | reviews,    |  | chat, notifs, |  | events, rollups, |
      | complaints, |  | outbox        |  | audit, settings  |
      | reports     |  +---------------+  +------------------+
      +-------------+
```

| Group | Tables | Spec |
|---|---|---|
| regions | `regencies`, `districts` | S1, S14 |
| identity | `neon_auth.user` (managed), `users`, `media_assets`, `addresses`, `notification_preferences`, `push_subscriptions` | S8 |
| farmers | `farmer_profiles`, `farmer_verifications`, `bank_accounts`, `farmer_operating_hours`, `farmer_holidays`, `badges`, `farmer_badges` | S6, S8, S11 |
| catalog | `categories`, `tags`, `search_synonyms`, `products`, `product_tags`, `price_tiers`, `surplus_rules`, `product_batches`, `product_photos`, `stock_movements`, `stock_reservations`, `product_subscriptions` | S2, S3, S7, S11, S12 |
| waitlist_commit | `waitlists`, `waitlist_events`, `waitlist_media`, `waitlist_followers`, `commitments` | S4 |
| carts | `carts`, `cart_items`, `cart_item_alternatives` | S5 |
| ordering | `platform_fee_settings`, `checkouts`, `orders`, `order_items`, `order_item_allocations`, `order_status_history`, `shipments` | S9, S10 |
| money | `payments`, `payment_webhook_events`, `ledger_accounts`, `ledger_transactions`, `ledger_entries`, `refunds`, `payouts` | S4, S9 |
| trust | `reviews`, `review_photos`, `complaints`, `complaint_evidence`, `complaint_messages`, `reports` | S3, S10 |
| communication | `conversations`, `messages`, `notifications`, `outbox_events` | S2, S10 |
| analytics_admin | `product_daily_stats`, `audit_logs`, `platform_settings` | S3, S13, S14 |

---

## 3. Conventions

| Topic | Choice | Why |
|---|---|---|
| Identifiers | English `lower_snake_case` | Postgres folds unquoted names to lowercase, so camelCase would need quotes everywhere. English matches the docs; the API maps names to the Indonesian fields the frontend uses (`stock` to `stok`, `harvest_delayed` to `panen-tertunda`). |
| Primary keys | `uuid DEFAULT uuidv7()` | See pattern P1. The one exception is `users.id`, which copies `neon_auth.user.id` (section 4.1). |
| Region keys | Kemendagri codes as `text` (`32.04`, `32.04.01`) | Official, stable, and shared with courier and payment providers. No lookup needed to import data. |
| Money | `bigint`, whole Rupiah | Rupiah has no subunit in practice. Integers are exact, fast, and match the frontend ("integer Rupiah"). See P8. |
| Quantities | `numeric(12,3)` | Produce is sold in fractions (2.5 kg). `numeric` keeps sums exact. |
| Percentages | `numeric(5,2)` where `3.00` means 3% | Readable in admin screens; exact. |
| Time | `timestamptz` for instants, `date` for harvest and expiry days | Harvest and expiry are calendar days in WIB. A timestamp would add fake precision and timezone bugs. |
| Enums | Native Postgres `enum` types | Self-documenting and compact. Adding a value is cheap (`ALTER TYPE ... ADD VALUE`). See the cons in section 6. |
| Timestamps | `created_at` on every table, plus `updated_at` (set by a trigger) on mutable tables | Debugging, sorting, auditing. |
| FK indexes | Every FK column is indexed, or is the first column of a composite key | Postgres does not index FKs for you. Without them, joins and `ON DELETE` checks scan the whole child table. |
| Delete rules | `cascade` for owned children (photos, tiers, items), `restrict` for anything financial or historical, `set null` for optional links | Money and order history must never vanish because a parent was deleted. Users are soft-deleted instead (section 4.1). |

---

## 4. Design decisions by domain

### 4.1 Identity and accounts (S8)

Sign-in is handled by **managed Neon Auth** (Better Auth hosted by Neon), with **email/password and Google OAuth** enabled (decision 6 in `claude/decisions-log.md`).

```
neon_auth.user (managed by Neon)   1 --- 1   users (ours)
  id uuid, name, email, image,                id = neon_auth.user.id
  role (Better Auth admin role)               full_name, phone, role (marketplace), status, ...
neon_auth.session / account / verification  -> not read by the app
```

- **Neon Auth owns `neon_auth.*`.** It stores users, sessions and Google accounts in the same database. Our migrations never create or change that schema; `neon_auth.user` appears in the DBML only so the foreign key is visible.
- **`users` is our profile table, 1:1 with `neon_auth.user`.** The backend creates the row at onboarding, after the first sign-in, when the person picks consumer, UMKM or farmer. The FK uses `ON DELETE RESTRICT`. An account with orders or ledger history therefore cannot be hard-deleted from the Neon console by mistake. Account deletion goes through our soft-delete and data-scrub flow instead.
- **Two different "roles".** Better Auth has its own `role` column, which separates admins from regular users. Our marketplace role (`consumer`, `umkm`, `farmer`, `admin`) lives in `users.role`, because Neon Auth doesn't allow custom Better Auth plugins or extra fields. The backend authorizes using `users.role` only.
- **No passwords, sessions or token tables of our own.** Neon Auth stores password hashes and runs password reset and email verification, so `password_hash`, `user_sessions` and `auth_tokens` are not in our schema. Email and the verified flag come from `neon_auth.user`, so there is one source of truth.
- **How the backend knows who is calling.** Neon Auth sets an HttpOnly session cookie. Route handlers and server components read the session through the Neon Auth Next.js server SDK and map it to `users.id` (the same value as `neon_auth.user.id`). No JWT, no JWKS and no `jose`; the browser never holds a token. Because the frontend and the route handlers share one origin, no CORS setup is needed. The user's `users` row (role, status) is cached in Redis for a few minutes, and the cache entry is cleared when the role or status changes. Exact cookie settings: confirm in the Neon Auth Next.js server reference when wiring auth (still open, see section 8).
- **Branching bonus.** Each Neon branch gets its own copy of the auth data, so preview and test branches have real-looking users without touching production.
- **Neon Auth limits to accept:**
  - No custom Better Auth plugins or server hooks.
  - Neon's SDK is required on the frontend.
  - Sign-up is open to anyone. Restricted sign-up is listed as coming soon, so admin accounts are promoted by hand (`users.role = 'admin'`).
- **Staged data collection is unchanged.** Phone, address, KTP and bank account are nullable or in separate tables. The backend enforces the "required before first checkout / shipment / payout" rules.
- **Soft delete** (`deleted_at`, `status = deleted`) keeps orders and ledger history consistent. A job removes personal data to satisfy deletion requests under UU PDP: name, phone, addresses, and the Cloudinary images, via `media_assets`.
- **Notification preferences are sparse.** No row means the default (all on, instant). The table only holds changes, so new categories need no backfill.

### 4.2 Farmers, verification, badges (S6, S8, S11)

- **`farmer_profiles` is 1:1 with `users`** and uses `user_id` as its primary key. Other tables reference `farmer_profiles.user_id`, so an FK can only point at a real farmer, not just any user.
- **Verification is a history table** (`farmer_verifications`), with the current state copied to `farmer_profiles.verification_status`. Admins can see rejected attempts and their reasons. KTP numbers and bank account numbers are **encrypted in the application** (`bytea`). Only the last 4 digits are stored in plain text, for display. The KTP and land photos are Cloudinary assets with `authenticated` delivery: they can only be opened through short-lived signed URLs that the backend gives to admins.
- **Store holidays use a PG18 temporal constraint:** `UNIQUE (farmer_id, period WITHOUT OVERLAPS)` on a `daterange`. The database itself rejects overlapping holidays, with no custom trigger.
- **Badges are data, not code.** `badges.criteria` holds the thresholds as `jsonb`, so admins can tune them ("numbers are adjustable", S6). `farmer_badges` keeps the award and revoke history. A partial unique index allows only one *active* award per badge. The monthly job reads `criteria` keys on `farmer_profiles` data: `min_completed_orders`, `min_rating_count`, `min_rating_avg`, `max_avg_response_minutes`, `min_age_days`, `max_age_days`, `verified`. Empty or unknown criteria are refused, so a badge with `{}` is never evaluated.

### 4.3 Catalog, batches and stock (S2, S3, S7, S11)

This domain carries the most rules.

```
products 1---* product_batches 1---* stock_movements      (append-only log)
                          1---* stock_reservations   (1-hour checkout holds)
                          1---* order_item_allocations (FEFO split per order)
                          1---* product_photos       (freshness label)
```

- **Batch as the unit of stock.** Each "Add New Stock" creates a `product_batches` row with its own `harvested_on`, `expires_on`, quantity and photos (`product_photos.batch_id`). The image files are on Cloudinary (`media_assets`), and `media_assets.taken_on` drives the freshness label. The product row stays the same, which keeps reviews, subscribers and stats (S11). It also means a Surplus discount applies to the old batch while a fresh batch sells at full price.
- **`on_hand_qty` and `reserved_qty`** live on the batch, with a `CHECK (reserved_qty <= on_hand_qty)`. Sellable stock is `on_hand_qty - reserved_qty`. The check means overselling cannot happen even if the application has a bug.
- **Every change to `on_hand_qty` is a `stock_movements` row** with a type (sale, expiry reduction, manual adjustment, ...). Manual adjustments must have a reason (`CHECK`). This covers "reason required and logged" in S11, and the cached quantity can be rebuilt from the log.
- **Reservations** (`stock_reservations`) hold stock for 1 hour at checkout. A sweeper job releases expired holds (pattern P5). Adding to a cart does not reserve stock, as the spec requires.
- **FEFO (first expired, first out)** is done with an index on `(product_id, status, expires_on)`. At checkout the service locks the batches nearest to expiry (`FOR UPDATE`, in `expires_on` order so lock order is always the same) and writes one `order_item_allocations` row per batch used. Each allocation stores its own `unit_price` and `surplus_discount_pct`, because two batches of the same product can have different Surplus prices.
- **Wholesale tiers** (`price_tiers`) hold only tiers above the base price (`min_qty > 1`). The base price stays on `products.price`, so sorting and filtering by price needs no join. A constraint trigger checks that each higher tier has a lower price.
- **Surplus rules** belong to the product (`surplus_rules`). A nightly job works out each active batch's current tier into `product_batches.surplus_discount_pct`, respects `surplus_floor_price`, and writes an outbox event so subscribers are told when a product enters Surplus.
- **Expiry** does not hide the product. The nightly job sets the batch to `expired`, writes an `expiry_reduction` movement, and sets `expiry_undo_until` (1 to 2 days). Undoing writes an `expiry_undo` movement.
- **Denormalized read fields** on `products` (`available_qty`, `current_batch_id`, `rating_avg`, `sold_qty`, `subscriber_count`) let the catalog pages render without heavy aggregation (section 4.8).

### 4.4 Wait List and Commit (S4)

- **`waitlists` stores the current state, `waitlist_events` stores the timeline.** Every status or schedule change inserts an event with old and new values and a reason. The frontend's `linimasa` is just `SELECT ... ORDER BY created_at`. A `CHECK` makes a reason required for `harvest_delayed` and `harvest_failed`.
- **The harvest schedule** is `schedule_type` plus `harvest_start` and `harvest_end`. A `CHECK` enforces the right shape for each type: none, one date, or a range. This mirrors the frontend's `JadwalPanen` union.
- **Penalty windows are stored as timestamps** rather than worked out from the history each time:
  - `first_estimate_set_at`: before this, cancelling is free.
  - `penalty_free_until`: set to (latest delay notification + 48 hours) whenever the harvest is pushed back.

  The cancel service compares `now()` against these two columns and the commitment's `had_estimate_at_commit` to decide between 0% and 20%. This is quick to run and easy to explain in a dispute.
- **The quota is enforced in the database:** `CHECK (quota_qty IS NULL OR committed_min_qty <= quota_qty)`. Commit runs `UPDATE waitlists SET committed_min_qty = committed_min_qty + $qty ... WHERE id = $id`. If the quota is full, the check fails and the commit is rejected. There is no read-then-write race.
- **`commitments`** hold the min-max range, the estimated price snapshot, and `held_amount` (the minimum funds in escrow). After harvest:
  1. Every active commitment moves to `awaiting_remainder` with `remainder_due_at = now() + 48h`.
  2. If the harvest is short, stock goes to the earliest `remainder_paid_at` (index `(waitlist_id, status, remainder_paid_at)`).
  3. Commitments allocated stock get an `order_id`; those left out are refunded through `refunds`.
  4. If the remainder is not paid in time, the minimum funds go to the farmer (not a penalty, so no platform share) and the minimum quantity is processed.
- **Harvest Failed** refunds all commitments automatically. It is a state change plus one ledger transaction per commitment, all in one database transaction.
- **When harvest completes,** the actual quantity becomes a new `product_batches` row with `source_waitlist_id` set, and `waitlists.product_id` links to the product that opens for sale.

### 4.5 Carts (S5)

- **One `carts` table with `kind = temporary | recipe`.** Both have the same items. The only differences are that a recipe cart is kept after checkout and needs a name. A partial unique index allows one temporary cart per buyer.
- **`cart_items` can point at a product or a wait list** (exclusive arc, pattern P6). A recipe group can include a not-yet-harvested commodity, which checks out as a Commit.
- **Alternatives** (`cart_item_alternatives`) store a manual `priority`. The unique `(cart_item_id, priority)` constraint is `DEFERRABLE INITIALLY DEFERRED`, so a drag-and-drop reorder can swap priorities in one transaction without a temporary clash.
- **Substitutions apply to one transaction only.** When checkout uses an alternative, it is recorded on `order_items.substituted_for_product_id`. The group itself does not change, as the spec requires.
- `checkouts.source_cart_id`, `carts.checkout_count` and `carts.last_checkout_at` feed the admin "Recipe Cart" statistics.

### 4.6 Orders and fulfilment (S9, S10)

- **checkout, then orders, then order items.** One buyer action creates one `checkouts` row and one payment, split into **one order per farmer**. Each farmer ships, gets paid, and handles disputes separately, so this split is needed for escrow release. It is the same model large marketplaces such as Tokopedia and Shopee use.
- **Snapshots, not live joins.** `order_items` copies the product name, unit and tier price. `orders` copies the fee percentages and points to the `platform_fee_settings` row used. `checkouts` copies the address as `jsonb`. Later edits to products, fees or addresses never change past orders or invoices.
- **Totals are checked:** `CHECK (buyer_total = goods_subtotal + shipping_fee + service_fee)`. Fees are calculated on goods after discounts, excluding shipping (S9).
- **Status vs escrow.** `orders.status` follows the buyer-facing lifecycle (Awaiting Payment, Confirmed, Processing, Shipped, Completed or Cancelled). `orders.escrow_status` follows the money separately (`held`, `disputed`, `released`, ...). Keeping them apart avoids adding states like "shipped_but_disputed".
- **Shipments** are 1:1 with orders. `arrived_at` starts the 3-day window. `auto_release_at = arrived_at + 3 days` is what the release job checks. Opening a complaint sets `escrow_status = disputed`, which pauses the release.
- **Auto-cancel.** `orders.respond_by` is set from `farmer_profiles.auto_cancel_after_hours` when the order is confirmed. A partial index makes the job cheap.
- **Fee settings are versioned** (`effective_from`). `CHECK`s keep the rates within the spec's limits (5% commission, 2% service fee), so admins cannot set them higher.

### 4.7 Payments, escrow and wallet (S4, S9)

Example: a 100,000 IDR order with a 1% service fee (1,000, paid by the buyer) and 3% commission (3,000, charged to the farmer). The buyer pays 101,000 via QRIS.

| Transaction | Account | Amount |
|---|---|---|
| `payment_received` | payment_clearing | −101,000 |
| | escrow | +101,000 |
| `escrow_release` | escrow | −101,000 |
| | farmer_balance (farmer) | +97,000 |
| | platform_revenue | +4,000 |

Every transaction's entries add up to zero.

- **Double-entry ledger** (pattern P3). `ledger_accounts` has one row per wallet or system account. `ledger_transactions` groups entries, and `ledger_entries` holds signed amounts. A deferred constraint trigger checks that each transaction sums to zero at commit. `ledger_accounts.balance` is a cached total updated in the same transaction, and a `CHECK` stops buyer wallets and farmer balances going negative.
- **Every money event is a transaction kind:** escrow hold (Commit minimum funds), release, commission, service fee, penalty (80% farmer / 20% platform, rate taken from `platform_fee_settings`), refund (to the platform wallet in the MVP), and payout.
- **`payments`** link to either a checkout or a commitment (exclusive arc), and have a unique `idempotency_key` plus a unique `(provider, provider_ref)`. Retrying a create call cannot charge twice.
- **`payment_webhook_events`** is an inbox (pattern P4). Each gateway callback is stored once under a unique `(provider, provider_event_id)`, its signature is checked, and it is processed separately. Gateways retry callbacks often, and replays become no-ops.
- **Payouts** need an approved verification and a bank account. The payout service checks this in the same transaction that debits `farmer_balance`.

### 4.8 Denormalized counters and read models

`products`, `farmer_profiles` and `waitlists` hold cached counts (rating, sold quantity, followers, committed quantity). They are updated in the same transaction as the event that changes them (or by a trigger), and can always be rebuilt from the source tables. The public catalog is read far more than it is written, so paying a little on writes saves a lot of aggregation on every page view.

### 4.9 Search and location (S3, S12)

- **Fuzzy search in the database, without a separate search engine** (pattern P7):
  1. Normalize the query (`lower`, `unaccent`).
  2. Rewrite it using `search_synonyms` (`cabe` becomes `cabai`, `bawang beureum` becomes `bawang merah`).
  3. Match against `products.search_vector` (a GIN-indexed `tsvector` built from name, `alt_names` and description) using the `simple` configuration. Postgres has no Indonesian stemmer, and `simple` avoids wrong English stemming.
  4. Fall back to `pg_trgm` similarity on `name` for typos (`chabai` still finds `cabai`).
- **"Near me" uses PostGIS** `geography(Point, 4326)` on farmer profiles and addresses, with GiST indexes. `ST_DWithin` handles radius filters, and `<->` with `ORDER BY` handles nearest-first sorting. Shipping cost uses the same distance.

### 4.10 Reviews, complaints, reports (S3, S10)

- **`reviews.order_item_id` is unique and required,** so only buyers who received an item can review it, once per purchased item. The service also checks that the order is completed. The farmer's reply is stored on the review row, since there is exactly one reply.
- **Complaints** have their own evidence and a three-way message thread for admin mediation. A resolution creates a `refunds` row linked to the complaint.
- **`reports`** use an exclusive arc (`product_id`, `farmer_id`, `review_id`, exactly one set), so every report keeps a real foreign key.

### 4.11 Chat and notifications (S2, S10)

- **One conversation per buyer and farmer pair** (`UNIQUE (buyer_id, farmer_id)`). Read state is stored as two `*_last_read_at` timestamps instead of one flag per message, which saves a write per message.
- **Messages are delivered live over Server-Sent Events** (section 11). Every message is written to Postgres first and only then published to Redis for live delivery, so an accepted message is never lost.
  - `client_message_id` (unique per sender) makes a resend after a dropped connection a no-op.
  - `(conversation_id, id)` with time-ordered UUIDv7 ids lets a reconnecting client fetch exactly what it missed with `WHERE id > $last_id`. The SSE `id:` field carries `messages.id`, so `Last-Event-ID` gives the same catch-up.
- **The Fast Response badge** is worked out from reply gaps in `messages` and cached in `farmer_profiles.avg_response_minutes`.
- **Typing indicators and online status are not stored in Postgres.** They are Redis keys with a time-to-live (section 10).
- **Notifications go through the outbox** (pattern P2). The business transaction inserts an `outbox_events` row. A route handler dispatches it after commit (`after()`), and the scheduled sweep picks up anything missed. It then:
  1. turns it into `notifications` rows, respecting `notification_preferences` and `product_subscriptions` flags;
  2. sends web push to `push_subscriptions`;
  3. publishes it to Redis so an open SSE stream shows it at once;
  4. batches `daily_digest` items.

### 4.12 Analytics, audit, settings (S3, S13, S14)

- **Views and add-to-carts are counted in Redis, not Postgres.** The v1 `product_events` table was dropped: it would have been the busiest table, with one insert for every product page view. Instead the backend runs `HINCRBY stats:{day}:{product_id} views 1`, and counts unique viewers with `PFADD` (HyperLogLog, about 12 KB per key at most). Each night it writes the totals into `product_daily_stats`. Subscriptions, purchases, units sold and revenue are already in Postgres and are summed from there. This trade-off loses per-visitor event detail, which the spec's funnel doesn't need.
- **Admin dashboard figures** (GMV, active users, escrow balance, % delayed harvests, ...) come from ordinary queries on the operational tables plus `product_daily_stats`. If those queries become slow, add materialized views refreshed on a schedule (section 8).
- **`audit_logs`** is also partitioned by month, and the app role may only `INSERT`. Triggers on price, fee and status columns write old and new values. PG18's `RETURNING OLD.*, NEW.*` makes these triggers and audited updates simpler.
- **`platform_settings`** is a key/value `jsonb` table for tunable limits (payment timeout, 48-hour remainder window, 3-day complaint window), so policy changes need no deploy.

---

## 5. Public solutions used

Each row reads: *this database uses X to handle Y because Z.*

| # | Solution (public pattern) | Problem it handles | Why it fits Pasok Tani |
|---|---|---|---|
| P1 | **UUIDv7 primary keys** (RFC 9562, built into PG18 as `uuidv7()`) | IDs appear in URLs (`/pesanan/[id]`, `/daftar-tunggu/[id]`) and are created by several services | Time-ordered, so B-tree inserts stay at the end of the index, unlike random UUIDv4. Not guessable like serial IDs, so order counts don't leak. Needs no extension in PG18. |
| P2 | **Transactional outbox** (Chris Richardson, *Microservices Patterns*) | Notifications, push and badge updates must happen if and only if the business change commits | The event row commits or rolls back with the change. The dispatch path and the sweep claim rows with `FOR UPDATE SKIP LOCKED`, so no message broker is needed for the MVP. |
| P3 | **Double-entry ledger** (accounting standard; the model used by Stripe, Square and Modern Treasury) | Escrow, wallet, commission, 80/20 penalties, refunds, payouts | Every Rupiah has a source and a destination. Balances can be rebuilt and checked, and finance reports (S9, S13) become simple sums. A bad balance edit cannot quietly create or destroy money. |
| P4 | **Idempotency keys + webhook inbox** (Stripe-style `Idempotency-Key`; inbox pattern) | Gateways (Midtrans, Xendit) retry callbacks; clients retry payment creation | Unique constraints turn duplicates into no-ops, so a buyer is never charged twice and escrow is never credited twice. |
| P5 | **Reservation with TTL + `SKIP LOCKED` sweeper** (inventory pattern used in ticketing and e-commerce) | Hold stock for 1 hour during payment, then release it | Checkout and the sweeper never block each other. The `CHECK` on reserved stock prevents overselling even under heavy load. |
| P6 | **Exclusive arc** with `CHECK (num_nonnulls(...) = 1)` (Bill Karwin, *SQL Antipatterns*) | A row can point at one of several parents (payment to a checkout or a commitment; report on a product, farmer or review; cart item to a product or wait list) | Keeps real foreign keys and cascades. A generic `target_type + target_id` column would lose referential integrity. |
| P7 | **Postgres full-text + `pg_trgm` + synonym table** | Typo- and dialect-tolerant search ("cabe", "cabai", "chabai") | Good enough for West Java catalog sizes, transactional with the data (no sync lag), and no extra service to run. Can move to Meilisearch, Typesense or OpenSearch later without schema changes. |
| P8 | **Integer minor units for money** (ISO 4217; IDR has 0 practical decimals) | Exact money arithmetic | `bigint` cannot have rounding errors and is fast. Percentages are applied once, with an explicit rounding rule in the service. |
| P9 | **Snapshot pattern** (copy at the time of the event) | Prices, fees and addresses change after an order is placed | Invoices and disputes always show what the buyer actually agreed to. |
| P10 | **Event-sourced timeline / append-only history** | Wait-list timeline, stock log, order status history | A full audit trail for consumers ("every schedule change is recorded", S4) and for disputes. Current state is cached for fast reads. |
| P11 | **Range partitioning by month** | High-volume `audit_logs` | Small indexes, cheap retention (`DROP` an old partition), BRIN-friendly. |
| P12 | **PostGIS geography + GiST** | "Near me" radius search, distance-based shipping | Real-world distance on the earth's surface, indexed nearest-neighbour search. It is the standard tool for this. |
| P13 | **Temporal constraint `WITHOUT OVERLAPS`** (SQL:2011, new in PG18) | Store holidays must not overlap | Enforced by the database instead of application code. |
| P14 | **Versioned configuration rows** (`effective_from`) | Admin-adjustable commission and service fee | Historical orders point to the exact rate version. Rates can be scheduled ahead. |
| P15 | **Optimistic, constraint-backed counters** (`UPDATE ... SET x = x + n` + `CHECK`) | Commit quota closing automatically when full | One atomic statement. The quota cannot be overfilled by concurrent commits. |
| P16 | **Application-level envelope encryption** for KTP and bank numbers | Personal data protection under UU PDP | A database dump or backup leak does not expose identity numbers. Keys live in a KMS, not in the database. |
| P17 | **Managed identity provider + local profile table** (Neon Auth / Better Auth; the same shape as Auth0 or Clerk with a `users` mirror) | Google sign-in, sessions, tokens | Security-sensitive code (OAuth, cookies, token rotation) is someone else's job. Because the auth tables sit in the same Postgres, our tables keep a real FK to the user, which external IdPs can't give. |
| P18 | **Server-side session cookie read through the auth SDK** (HttpOnly, SameSite=Lax) | Next.js route handlers and server components must know who is calling | No token reaches the browser, so nothing is stored in JavaScript-readable storage. Frontend and backend share one origin, so no CORS or cross-domain cookie setup is needed. Mutations rely on Better Auth's origin check (CSRF). |
| P19 | **Signed direct upload + metadata row** (Cloudinary signed uploads; the same idea as S3 presigned URLs) | Photos from farmers on slow rural connections | The image goes straight from the phone to Cloudinary's CDN without passing through our server. Cloudinary's `f_auto,q_auto` serves small WebP/AVIF versions, which meets "auto photo compression" (S14). Postgres keeps only the id, so FKs, ordering and the freshness date still work. |
| P20 | **Redis counters + HyperLogLog, flushed in batches** (write-behind aggregation) | Product view and add-to-cart counts | Turns thousands of tiny inserts into one upsert per product per day. Unique-visitor counts take about 12 KB per key at most, at roughly 1% error. |
| P21 | **Cache-aside with explicit invalidation** | Hot reads: home page sections, product detail, the `users` role lookup, `platform_settings` | Postgres stays the source of truth. A missed invalidation only shows stale data until the time-to-live expires, never wrong money. |
| P22 | **Write-then-publish fan-out over Redis pub/sub** | Live chat, live notifications and order status across several Vercel function instances | The message is in Postgres before anyone sees it. Pub/sub only carries "something new" to whichever open SSE stream belongs to the recipient. |
| P23 | **Sliding-window rate limiting in Redis** | Abuse of search, chat, checkout and upload-signing endpoints | Shared across instances; costs one Redis call per request. |

---

## 6. Pros and cons

### Pros

- **Correct under concurrency.** Overselling, quota overfill, double payment, unbalanced money and overlapping holidays are all blocked by constraints, not just application checks.
- **Auditable.** Stock, money, wait-list timeline, order status and price changes all have append-only history, which supports disputes (S10), the audit log requirement (S14) and farmer financial reports (S9).
- **Matches the spec closely.** Batches give FEFO, per-batch Surplus and freshness photos. The ledger gives escrow, wallet and the 80/20 split. Commit penalty windows are explicit columns.
- **Few moving parts for the core.** Postgres handles relational data, search, geo, the outbox and job queues. Redis only holds data you could lose and rebuild, and Cloudinary only holds files. If Redis is wiped, the app gets slower for a while but no orders or money are lost.
- **Less security code to write.** Neon Auth handles Google OAuth and sessions, and Cloudinary handles image processing and private delivery for KTP photos.
- **Easy to grow.** UUIDv7 keys, the outbox and order-per-farmer make it straightforward to later split services, add a search engine or move analytics to a warehouse.
- **Fast reads on public pages.** Cached counters and FEFO head pointers keep catalog queries to indexed lookups.

### Cons and their mitigations

| Con | Impact | Mitigation |
|---|---|---|
| **Many tables (61)** for an MVP | More migrations and more joins to learn | Grouped into 11 domains. Analytics and audit tables can be added later without blocking the core. |
| **Cached values can drift** (`available_qty`, `balance`, `rating_avg`, `committed_min_qty`) | Wrong numbers on screen if an update path forgets to maintain them | Update them in the same transaction or by trigger. A nightly reconciliation job compares them to the source tables and alerts on drift. |
| **Double-entry is more work** than a single `balance` column | Every money flow needs well-designed entries | Write one ledger service with named operations (`hold`, `release`, `refund`, `penalty`) and test it. Don't write raw entries from many places. |
| **Native enums** are hard to rename or remove values from | Migration effort when the spec changes | Adding values is cheap. For lists likely to change (badge codes, report reasons), `text` or a lookup table is already used. |
| **UUIDs are 16 bytes** vs 8 for `bigint` | Slightly larger indexes | Negligible at MVP scale. UUIDv7 avoids the random-insert fragmentation that makes UUIDv4 costly. |
| **Postgres search has no Indonesian stemmer** | "membeli" and "beli" are not treated as the same word | The `simple` config plus trigram plus the synonym table covers commodity names, which are mostly nouns. Move to a search engine if relevance becomes a problem. |
| **Business rules partly in services** (staged required fields, 48-hour windows, "review only after receipt") | The database cannot enforce every rule alone | These depend on time and context. They live in clearly named service functions with tests, and the timestamps they rely on are stored as columns. |
| **DBML cannot show everything** | Partial, GIN and GiST indexes, partitioning, triggers and `WITHOUT OVERLAPS` are only in notes | The checklist in section 7 lists each item that must be hand-written in the migration. |
| **Partitioned tables cannot have FKs to them easily** (`audit_logs`) | No referential check on audit rows | Acceptable for an append-only log. |
| **Neon Auth limits** (no custom plugins or hooks, Neon SDK required, sign-up open to all) | Can't add fields to the auth user or run code on sign-up | Profile data lives in our `users` table. Onboarding creates the row; an API call made before onboarding gets `403 onboarding_required`. If plugins become necessary, moving to self-hosted Better Auth keeps the same table shapes. |
| **Three vendors outside Postgres** (Neon Auth, Upstash, Cloudinary) | More accounts, keys and free-tier limits to watch | Each one is used for one job only. Redis and Cloudinary are behind small TypeScript interfaces, so they can be swapped. |
| **Orphan images** (uploaded but never attached, or kept after the parent is deleted) | Cloudinary storage cost | `media_assets.status` + a cleanup job: `pending` rows older than 24 h, and `deleted` parents, are destroyed through the Cloudinary API. |
| **Redis counters lost before the nightly flush** | That day's view counts are missing or too low | Analytics only, never money. Flush hourly instead of nightly if it matters. |

---

## 7. Migration checklist (things not expressed in DBML)

This checklist is implemented in `database/migrations/0003`-`0005` (extensions in `0001`, partitioning and the search column in `0002`). See `database/README.md`.

`dbml2sql` produces the tables, enums, FKs, unique and B-tree indexes and checks. Add the following by hand in the first migrations:

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- WITHOUT OVERLAPS on (uuid, daterange)

-- Partial unique indexes
CREATE UNIQUE INDEX ON addresses (user_id) WHERE is_default;
CREATE UNIQUE INDEX ON bank_accounts (farmer_id) WHERE is_primary;
CREATE UNIQUE INDEX ON carts (buyer_id) WHERE kind = 'temporary';
CREATE UNIQUE INDEX ON farmer_badges (farmer_id, badge_id) WHERE revoked_at IS NULL;

-- Job / queue partial indexes
CREATE INDEX ON stock_reservations (expires_at) WHERE status = 'active';
CREATE INDEX ON product_batches (expires_on) WHERE status = 'active';
CREATE INDEX ON orders (payment_due_at) WHERE status = 'awaiting_payment';
CREATE INDEX ON orders (respond_by) WHERE status = 'confirmed';
CREATE INDEX ON shipments (auto_release_at) WHERE received_confirmed_at IS NULL;
CREATE INDEX ON commitments (remainder_due_at) WHERE status = 'awaiting_remainder';
CREATE INDEX ON outbox_events (available_at) WHERE processed_at IS NULL;
CREATE INDEX ON notifications (user_id) WHERE read_at IS NULL;

-- Search and geo
-- unaccent() is only STABLE; wrap it in an IMMUTABLE function (e.g. f_unaccent) for generated columns.
ALTER TABLE products ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', f_unaccent(name || ' ' || array_to_string(alt_names, ' ') || ' ' || coalesce(description, '')))
) STORED;
CREATE INDEX ON products USING gin (search_vector);
CREATE INDEX ON products USING gin (name gin_trgm_ops);
CREATE INDEX ON search_synonyms USING gin (term gin_trgm_ops);
CREATE INDEX ON farmer_profiles USING gist (location);
CREATE INDEX ON addresses USING gist (location);

-- PG18 temporal constraint
ALTER TABLE farmer_holidays ADD CONSTRAINT farmer_holidays_no_overlap
  UNIQUE (farmer_id, period WITHOUT OVERLAPS);

-- Deferrable priority swap
ALTER TABLE cart_item_alternatives
  ADD CONSTRAINT cart_item_alternatives_priority_key UNIQUE (cart_item_id, priority)
  DEFERRABLE INITIALLY DEFERRED;   -- replace the plain unique index generated from DBML

-- One system account of each type
-- replace the generated unique index with: UNIQUE NULLS NOT DISTINCT (owner_id, type)

-- Partitioning (create as partitioned; pg_partman is available on Neon PG18,
-- run its maintenance from the Node scheduler, not pg_cron)
-- audit_logs PARTITION BY RANGE (created_at)

-- Neon Auth: schema neon_auth is created by Neon. Only reference it:
ALTER TABLE users ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES neon_auth."user"(id) ON DELETE RESTRICT;
-- "user" must be quoted in SQL (reserved word).
```

Triggers to write:

- `set_updated_at` on every table with `updated_at`.
- Ledger balance check: a deferred constraint trigger on `ledger_entries` that requires `SUM(amount) = 0` per `transaction_id`, and updates `ledger_accounts.balance`.
- `price_tiers` order check: a higher `min_qty` must have a lower `unit_price` than the tier below it and than `products.price`.
- Audit triggers on `products.price`, `price_tiers`, `surplus_rules`, `platform_fee_settings`, `orders.status`.
- Counter maintenance: `rating_*`, `subscriber_count`, `follower_count`, `commitment_count`, `available_qty`, `current_batch_id`.

Security:

- Separate roles for the app (`app_rw`: no `DELETE` on ledger, movements, events, audit), migrations (owner), and analytics (`app_ro`). Grant `app_rw` only `SELECT` on `neon_auth."user"`.
- Connections from Node (`pg` Pool, or Drizzle/Kysely on top of it):
  - The API uses Neon's **pooled** connection string (PgBouncer in transaction mode).
  - Migrations, and anything that needs a session (`LISTEN`, advisory locks held across statements), use the **unpooled** string.
  - `pg` uses unnamed prepared statements unless you pass `name`, which suits the pooler. Don't use named statements on the pooled URL. Use a normal `pg` Pool, not Neon's HTTP serverless driver: interactive transactions with `SELECT ... FOR UPDATE` need a real connection.
- Encryption keys for `*_enc` columns stay in a KMS or secret manager, never in the database.
- Optional later: row-level security on `orders`, `messages` and `notifications`, keyed on `current_setting('app.user_id')`, as defence in depth.

Jobs run as **secret-guarded route handlers** (`/api/cron/<job>`, for example `/api/cron/auto-cancel`), triggered by a **GitHub Actions scheduled workflow** (`.github/workflows/scheduled-jobs.yml`). GitHub sends `Authorization: Bearer $CRON_SECRET`, and each handler rejects any other caller. Not `pg_cron`: Neon only runs it while the compute is awake, which conflicts with scale-to-zero. Not an in-process scheduler: the app has no long-lived process on Vercel. Not BullMQ: it polls Redis constantly, which is costly on pay-per-command Upstash.

GitHub Actions schedules use UTC and run at least 5 minutes apart. They can be delayed under load, so no job may depend on running at an exact time. WIB times below are converted to UTC in the workflow (00:05 WIB = 17:05 UTC the day before).

- Each job takes a Postgres advisory lock (`pg_try_advisory_xact_lock`), so only one backend instance runs it at a time.
- Each job claims its rows with `FOR UPDATE SKIP LOCKED`.
- Scheduled calls keep the Neon compute awake during the day, which effectively turns scale-to-zero off in production. Accept that cost (it also removes cold starts). Keep the schedule at 5 minutes or longer, and check expiry on the read and write path as well, so a late job never shows wrong state.

| Job | Frequency | Does |
|---|---|---|
| Reservation sweeper | every 5 minutes | Releases expired holds; cancels unpaid orders. Holds are also checked when a checkout starts. |
| Surplus and expiry | daily, 00:05 WIB | Sets the current discount per batch, expires batches, emits Surplus events |
| Remainder deadline | every 5 minutes | Handles commitments past `remainder_due_at` |
| Escrow auto-release | every 15 minutes | Releases orders past `auto_release_at` that have no complaint |
| Auto-cancel | every 15 minutes | Cancels orders past `respond_by` |
| Outbox sweep | every 5 minutes | Safety net for `outbox_events` not dispatched after commit: notifications, push, digests, Redis publish for live SSE updates |
| Badge evaluation | monthly | Awards and revokes badges |
| Analytics rollup + reconciliation | nightly | Flushes Redis view/cart counters into `product_daily_stats`; checks cached counters against source tables |
| Media cleanup | hourly | Marks `pending` assets older than 24 h as `deleted`, then destroys every `deleted` asset with no `destroyed_at` on Cloudinary and stamps `destroyed_at` |
| Presence flush | every 5 minutes | Copies Redis `presence:*` into `users.last_seen_at` |

The workflow also needs two settings in GitHub: the secret `CRON_SECRET` (shared with the Vercel project) and the variable `APP_URL` (the deployed origin).

---

## 8. Assumptions and open questions

| # | Assumption | Where |
|---|---|---|
| A1 | One role per account. A user who wants to both buy and sell uses two accounts. | `users.role` |
| A2 | Refunds go to the platform wallet in the MVP. Refunds back to the original QRIS or VA payment are post-MVP. | `refunds.to_wallet` |
| A3 | The Commit minimum is held at the estimated price, and the remainder is charged at `final_unit_price`. If the final price is *lower* than the estimate, the difference is refunded to the wallet. | `commitments`, `waitlists` |
| A4 | Self-delivery fees go fully to the farmer and are excluded from commission. | `orders.farmer_net` |
| A5 | Delivery scheduling: up to 3 days after harvest, one free reschedule, 10% fee only for cancelling inside the window, window shortened by an earlier batch expiry (decision 8). The rules live in the backend; `shipments.scheduled_for` stores the result. | `shipments` |
| A6 | The Surplus discount is recomputed once a day (tiers are day-based), not every minute. | Surplus job |
| A7 | Rounding: fee and penalty amounts are rounded half-up to whole Rupiah, and any remainder goes to the farmer. | Ledger service |
| A8 | Postgres identifiers are in English; the API translates them to the Indonesian names in `frontend/src/lib/api/tipe.ts`. | Whole schema |
| A9 | Sign-in is email/password and Google OAuth (decision 6). Adding another provider later is a Neon Auth console setting, with no schema change. | Neon Auth |
| A10 | The backend is Next.js on Vercel (route handlers and server actions). No long-lived service or worker process. Background jobs are GitHub Actions calls to secret-guarded route handlers. | Jobs, SSE |
| A11 | Upstash Redis holds cache, counters, presence and SSE fan-out. Subscriptions need the TCP protocol (`ioredis`), because the REST API cannot subscribe. | Section 10 |

Resolved on 6-7 Nov 2026 (details in `claude/decisions-log.md`):

1. Payment gateway: **Midtrans** (decision 1).
2. Courier aggregator: **Biteship**, with dummy data until wired up (decision 2).
3. Commission on forwarded minimum funds: **applies**, no 80/20 split (decision 3).
4. Auth transport: **HttpOnly session cookie through the Neon Auth SDK, no JWT** (decision 4).
5. Hosting: **Next.js on Vercel**, no Express service (decision 5).
6. Scheduler: **GitHub Actions** scheduled workflow calling secret-guarded route handlers (decision 10).

Still open: exact Neon Auth Next.js SDK helper and cookie settings, to confirm in the Neon Auth Next.js server reference when wiring auth. This has no schema impact.

---

## 9. What to revisit as the system grows

| Trigger | Change |
|---|---|
| Catalog over ~100k products, or search relevance complaints | Move search to Meilisearch, Typesense or OpenSearch, fed from `outbox_events`. Keep `search_synonyms` as the source. |
| Admin dashboard queries over ~1 s | Materialized views (refreshed hourly) or move analytics to a warehouse such as BigQuery or ClickHouse via change data capture. |
| More than one region or province | `regencies` already uses Kemendagri codes; drop the "province 32 only" rule and add a `provinces` table. |
| Outbox throughput limits | Replace the sweep and after-commit dispatch with logical replication or Debezium to a queue. The table stays the same. |
| Connection pressure | Already on Neon's pooler. Raise the compute size or `max_connections` before adding read replicas (Neon read replicas are a URL change). |
| Open SSE streams beyond the Vercel plan's concurrency or billing limits | Move live delivery to a hosted realtime service (Pusher, Ably or Supabase Realtime) fed by the same Redis publish. The table stays the same. |
| Upstash bill growing with command count | Move to a fixed-price Upstash plan or self-hosted Redis; nothing in Postgres changes. |
| Post-MVP features | Price negotiation: `price_offers` table linked to `order_items`. Vouchers: `vouchers` + `order_discounts`, shown as ledger lines. E-wallet and bank transfer: new `payment_method` enum values. |

---

## 10. Stack: what lives outside Postgres

The rule: **Postgres holds anything that must survive a crash, must commit together with an order or payment, or that someone will look up later.** Everything else goes to the service built for it.

| Data | Lives in | Why not Postgres / why Postgres |
|---|---|---|
| Google OAuth, sessions, verification | **Neon Auth** (`neon_auth.*`) | Managed and branch-aware. It still sits in the same database, so our FK to it works. |
| Marketplace profile and role | Postgres `users` | Neon Auth can't hold custom fields, and orders and the ledger need an FK to it. |
| Image files (products, batches, wait lists, reviews, complaints, chat, avatars, KTP) | **Cloudinary** | CDN delivery, automatic WebP/AVIF compression, resizing, and private delivery for KTP and land photos. |
| Image ids, owner, freshness date, order | Postgres `media_assets` + `*_photos` tables | Needed for FKs, ordering, moderation and data-deletion requests. |
| Product view and add-to-cart counts | **Redis** during the day, then `product_daily_stats` | Very many tiny writes; analytics only. |
| Cache (home sections, product detail, `users` role, fee settings, synonym list) | **Redis** with a time-to-live | Rebuilt from Postgres when missing. |
| Rate limits, upload-signature throttling | **Redis** | Short-lived, shared across instances. |
| Online status, typing indicator | **Redis** keys with a time-to-live (`presence:{user_id}` 60 s, `typing:{conv}:{user}` 5 s) | Changes every few seconds; nobody needs history. `users.last_seen_at` gets a copy every 5 minutes. |
| Live fan-out (chat, notifications, order status) | **Redis pub/sub** | Carries a "new item" signal between backend instances. The content is already in Postgres. |
| Unread counters (notifications, chat) | Redis cache over Postgres | Badge numbers on every page load; recomputed if missing. |
| Stock reservations | **Postgres** | Must commit with `product_batches.reserved_qty` in one transaction, or stock oversells. Redis has no transaction that spans both. |
| Ledger, payments, webhooks, refunds, payouts | **Postgres** | Money: needs ACID and an audit trail. |
| Outbox / job queue | **Postgres** | Must commit with the business change (P2). A Redis queue would need a second write that can fail on its own. |
| Carts (temporary and recipe) | **Postgres** | Recipe carts are kept for months and point at products. Temporary carts are small, and keeping both in one table keeps checkout code simple. |
| Chat messages, notifications history | **Postgres** | Users scroll back through them; complaints can cite chat. |

Suggested Redis key layout (prefix every key with the environment, e.g. `prod:`):

```
cache:product:{id}                 JSON, TTL 5 min, deleted on product/batch change
cache:home:{section}               JSON, TTL 2 min
cache:user:{id}                    {role,status}, TTL 10 min, deleted on change
stats:{yyyymmdd}:{product_id}      HASH views / add_to_carts, TTL 3 days
uv:{yyyymmdd}:{product_id}         HyperLogLog of viewer ids, TTL 3 days
rl:{route}:{user_or_ip}            sliding-window counter
presence:{user_id}                 "1", TTL 60 s, refreshed by the SSE stream heartbeat
typing:{conversation_id}:{user_id} "1", TTL 5 s
unread:notif:{user_id}             integer, TTL 1 day
channel  user:{user_id}            pub/sub: one channel per recipient
```

Cloudinary conventions:

- Folders: `pasok-tani/{env}/{kind}/{media_id}`.
  - `public_id` uses the `media_assets.id` UUID, so upload paths can't be guessed.
- Upload flow:
  1. The backend creates a `pending` row.
  2. It returns a signed upload with folder, size limit and allowed formats.
  3. The browser uploads straight to Cloudinary.
  4. The Cloudinary notification webhook (checked with its signature) marks the row `ready` and fills width, height and bytes.
- Delivery: `f_auto,q_auto,w_<size>` for public images.
  - `type=authenticated` plus a backend-generated signed URL with a short expiry for `ktp` and `land_photo`.
- Deletion: deleting a parent row marks the asset `deleted`, and the media cleanup job calls Cloudinary destroy. This also covers UU PDP deletion requests.

---

## 11. Real-time chat over Server-Sent Events: effect on the project

The schema is the same for SSE, WebSocket or polling. SSE needs two additions that are already in place: `messages.client_message_id` (safe resends) and the `(conversation_id, id)` index (catch-up after reconnecting). The effects are on hosting and the backend code, not on the tables.

### How it fits

- **Receive:** `GET /api/chat/stream` is a route handler returning `text/event-stream`. The browser uses `EventSource`. One stream per open tab carries new messages, typing indicators and notification pings.
- **Send:** `POST /api/chat/messages`. SSE is one-way, so sending never uses the stream.
- **Fan-out:** after a message commits, publish to Upstash Redis. Each open stream listens on the user's channel and writes the event. If one subscription per stream proves costly, fall back to a short poll inside the stream (`id > last_seen`).
- **Reconnect:** Vercel caps function duration, so streams end periodically. `EventSource` reconnects by itself and sends `Last-Event-ID`, which is the last `messages.id`. The handler replays missed rows from the `(conversation_id, id)` index.

### Trade-offs

| Topic | Effect |
|---|---|
| Hosting | Runs on Vercel functions. No separate server is needed, but streams are capped by the plan's maximum duration, so reconnects happen regularly. Check the plan limits and stream billing before launch. |
| Database load | Low. Clients see only real messages, and no polling queries run. |
| Typing and presence | Typing goes through `POST` with a short Redis TTL. Presence is a Redis key with a TTL, flushed to `users.last_seen_at` by the 5-minute job. |
| Auth | The stream route reads the same session cookie as every other route handler. It closes when the session ends. |
| Reliability code | Client-side message id plus idempotent `POST`, and replay from `Last-Event-ID`. No ack protocol is needed. |
| Testing | Simpler than WebSocket: curl or a browser shows the stream, and the replay can be tested by sending `Last-Event-ID` by hand. |

### Alternatives considered

| Option | Verdict |
|---|---|
| WebSocket with Socket.IO on a separate server | Dropped. It needs a long-running host that Vercel cannot provide, plus a second service to run. |
| Polling every few seconds | Rejected. It creates idle load on the database and delays messages. |
| **SSE for receive, `POST` for send (chosen)** | Fits Vercel, reconnects automatically, and needs no schema change. Decision 9 in `claude/decisions-log.md`. |
