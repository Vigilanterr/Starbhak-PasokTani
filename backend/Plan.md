# Plan: backend repo layer (database queries)

Written 2026-11-09. "Repo" here means the database query folder of the backend: `backend/src/repo/`. It holds every SQL query for schema v2.2 and nothing else. Working rules are in `backend/CLAUDE.md`.

## Where things stand

- The schema is finished and tested on Neon branch `chore-schema-v2`: 61 tables, 32 enums, triggers and seed data (`database/migrations/`).
- **Production is still empty.** The v2 migrations have not been applied there, so the repo is built against the work branch.
- `backend/.neon` pins the CLI to `production`, so any Neon command without an explicit branch targets production.
- The existing controllers in `backend/src/controllers` and `backend/src/modules` query the legacy tables (`commodities`, old `users`, and so on). Those tables are not in v2, so these endpoints will fail on the new schema. Rewiring them is out of scope here.
- The git branch with the migrations (`chore/neon-schema-v2`) is not merged, so `main` does not have `database/` yet.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Language and runtime | TypeScript (strict) on Bun, as `backend/` already is | No new toolchain |
| Query layer | Kysely on a `pg` Pool | Typed queries over 61 tables. `documentation.md` section 7 allows it and requires a real connection for `FOR UPDATE` |
| Row types | Generated from the live branch with `kysely-codegen` into `src/repo/db.generated.ts` | Types cannot drift from the schema. Never edit by hand |
| Framework coupling | The repo imports no Hono and no HTTP code | `documentation.md` A10 says the backend moves to Next.js route handlers, so the repo must be able to move with it |
| Connections | Pooled `DATABASE_URL` at runtime, `DATABASE_URL_UNPOOLED` for codegen | Pooled is PgBouncer transaction mode. No named prepared statements, no session state |
| `bigint` and `numeric` | Keep the `pg` default of strings, convert with helpers in `src/repo/money.ts` | Rupiah and quantities never lose precision through a global parser |
| Geography | Helpers in `src/repo/geo.ts`: write with `ST_MakePoint`, read with `ST_X` and `ST_Y` | Codegen cannot type `geography` usefully |

## Target layout

```text
backend/src/repo/
  db.ts              Pool and Kysely instance
  db.generated.ts    Generated, never edited
  executor.ts        Executor type, withTransaction, withActor
  errors.ts          Maps SQLSTATE to typed errors
  money.ts  geo.ts   Column conversion helpers
  test-utils.ts      withRollback, production guard, fixtures
  identity/  farmers/  catalog/  waitlist/  carts/
  orders/  payments/  feedback/  comms/  admin/
    <group>.repo.ts  <group>.repo.test.ts
```

Every function takes the executor first, so a service can compose several calls in one transaction:

```ts
export function findProductBySlug(db: Executor, slug: string) {
  return db.selectFrom('products').selectAll().where('slug', '=', slug).executeTakeFirst();
}
```

## Phases

Each phase ends with passing tests and one commit. Do them in order, because later phases need fixtures from earlier ones.

### Phase 0: Prepare and pull the env

- [x] Ask the user whether to commit their pending `backend/` changes first. `package.json` and `bun.lock` have uncommitted `@neon/*` additions, and the new dependencies touch the same files. `bun.lock` cannot be split cleanly.
- [x] Create git branch `feature/backend-repo` from `chore/neon-schema-v2`.
- [x] Choose the dev database. Use `chore-schema-v2` until production is migrated. Once it is, create `dev-backend-repo` from `production`, re-pull, and delete `chore-schema-v2` (the user has agreed to that).
- [x] Pull the env, always naming the branch. Without `--branch` this writes production URLs:

  ```sh
  cd backend && neon env pull --branch chore-schema-v2 -s postgres -e NEON_BRANCH
  ```

  This updates only those Neon variables in the existing `.env` and keeps the other lines. `-s postgres` leaves the Neon Auth variables alone.
- [x] Verify without printing values: `NEON_BRANCH` names the dev branch, both database URLs are present, and the file has no `\r` line endings left on those lines.

Done when: `.env` targets the dev branch and `select count(*) from regencies` returns 27 through it.

### Phase 1: Foundation

- [x] Add `kysely` and `kysely-codegen` with `bun add` (0.29.8 and 0.20.0 were current; confirm they are compatible).
- [x] Add scripts: `db:types` (codegen from `DATABASE_URL_UNPOOLED`, schema `public`, excluding `schema_migrations`, `spatial_ref_sys` and `audit_logs_*` partitions), `test:repo`, and `typecheck:repo`. Scope the typecheck to `src/repo`, because the legacy code may not pass.
- [x] Write `db.ts`, `executor.ts`, `errors.ts`, `money.ts`, `geo.ts`, `test-utils.ts`.
- [x] Add a small hand-written type for the read-only `neon_auth."user"` table.
- [x] `withActor(userId, fn)` opens a transaction and runs `set_config('app.user_id', $1, true)`. The audit triggers read that setting, and it must be transaction-local because of the pooler.
- [x] `errors.ts` maps 23505, 23503, 23514 and 23P01 and wraps the commit, because the ledger and price tier triggers are deferred and fail at `COMMIT`.
- [x] The test guard refuses to run unless `NEON_BRANCH` is set and is not `production`.

Done when: codegen output compiles, a smoke test reads a seeded regency, and a test proves the guard refuses `production`.
Commit: `feat(repo): add database foundation and generated types`

### Phase 2: Identity and reference

Tables: `regencies`, `districts`, `users`, `media_assets`, `addresses`, `notification_preferences`, `push_subscriptions`, plus read-only `neon_auth."user"` for email.

Key queries:
- [x] Create the `users` row at onboarding.
- [x] Set the default address (clear the old default in the same transaction).
- [x] List pending media older than 24 hours for the cleanup job.

- [x] Commit: `feat(repo): add identity and reference queries`

### Phase 3: Farmers

Tables: `farmer_profiles`, `farmer_verifications`, `bank_accounts`, `farmer_operating_hours`, `farmer_holidays`, `badges`, `farmer_badges`.

Key queries:
- [x] Near-me search with `ST_DWithin` and `<->`.
- [x] The admin verification queue.
- [x] Active badges per farmer.
- [x] Award and revoke for the monthly job.

- [x] Commit: `feat(repo): add farmer queries`

### Phase 4: Catalog and stock

Tables: `categories`, `tags`, `search_synonyms`, `products`, `product_tags`, `price_tiers`, `surplus_rules`, `product_batches`, `product_photos`, `stock_movements`, `stock_reservations`, `product_subscriptions`.

Key queries:
- [x] Catalog list with filters, sort and pagination.
- [x] Search: rewrite through synonyms, match `search_vector`, then fall back to trigram.
- [x] FEFO batch locking with `FOR UPDATE`, ordered by `expires_on`, so lock order is always the same.
- [x] Create and release reservations; claim expired ones with `FOR UPDATE SKIP LOCKED`.
- [x] Surplus and expiry updates for the nightly job.

- [x] Done also requires a test that two batches return the nearest expiry first, and that `reserved_qty` cannot pass `on_hand_qty`.
- [x] Commit: `feat(repo): add catalog and stock queries`

### Phase 5: Wait List and Commit

Tables: `waitlists`, `waitlist_events`, `waitlist_media`, `waitlist_followers`, `commitments`.

Key queries: the timeline, follow and unfollow, and Commit as one atomic `UPDATE waitlists SET committed_min_qty = committed_min_qty + $qty`, so the quota `CHECK` decides. Also commitments past `remainder_due_at`, and allocation order by `remainder_paid_at`.

Checklist (file: `src/repo/waitlist/waitlist.repo.ts`, test: `waitlist.repo.test.ts`):
- [x] Read: `findWaitlistById` (public) and `findWaitlistForFarmer` (owner-scoped). Date columns as `::text`.
- [x] Write: `insertWaitlist` (fixtures and the farmer create flow).
- [x] Timeline: `listWaitlistTimeline`, keyset on `(created_at, id)` desc, cursor is the last row id (a JS Date would drop rows at microsecond ties), fetches `limit + 1`. Test: newest first and the cursor pages.
- [x] Append-only: `insertWaitlistEvent` (no update or delete). Test: `harvest_failed` without a reason fails with `chk_reason_required`.
- [x] Event media: `insertEventMedia` (multi-row, empty list returns early) and `listMediaForEvents`. Test: one media row per event.
- [x] Status change: `changeWaitlistStatus` guards `status = from`, sets `failure_reason`, and writes the event in one transaction. Test: stale `from` returns undefined. Test: `harvest_failed` without `failureReason` fails with `chk_failed_reason`.
- [x] Follow and unfollow: `followWaitlist` (`ON CONFLICT DO NOTHING`) and `unfollowWaitlist`. Test: the trigger moves `follower_count` once, and a replay changes nothing.
- [x] Commit: `commitToWaitlist` (requires a transaction) does the quota `UPDATE` first, then inserts the commitment. Test: within quota, `commitment_count` moves by the trigger. Test: over quota fails with `chk_quota_not_exceeded`. Test: unknown wait list returns undefined.
- [x] Owner read: `findCommitmentForBuyer`. Test: another buyer gets nothing.
- [x] Remainder job: `lockOverdueRemainders` uses `FOR UPDATE SKIP LOCKED` with the partial index predicate repeated literally, and requires a transaction. Test: only `awaiting_remainder` past due rows return. Test: the guard throws outside a transaction.
- [x] Allocation order: `listCommitmentsInAllocationOrder` by `remainder_paid_at` nulls last, then `id`. Test: the order is correct.
- [x] `EXPLAIN` on the dev branch: the overdue, timeline and allocation queries use `commitments_remainder_due`, `waitlist_events_waitlist_id_created_at_idx` and `commitments_waitlist_id_status_remainder_paid_at_idx`.
- [x] `bun run test:repo` and `bun run typecheck:repo` pass.

Done also requires a test that a Commit over quota is rejected as a typed error.
Commit: `feat(repo): add wait list and commitment queries`

### Phase 6: Carts

Tables: `carts`, `cart_items`, `cart_item_alternatives`.

Key queries: get or create the temporary cart, recipe cart CRUD, and reordering alternatives in one transaction (the priority constraint is deferred for this).

Checklist (file: `src/repo/carts/carts.repo.ts`, test: `carts.repo.test.ts`):
- [x] Temporary cart: `getOrCreateTemporaryCart`. Test: the same cart on every call. Test: a second temporary cart fails with `carts_one_temporary`.
- [x] Recipe carts: `createRecipeCart`, `listRecipeCarts` (keyset, limit + 1), `updateRecipeCart`, `deleteRecipeCart`, `findCartForBuyer`. Test: keyset pages, and the temporary cart is left out. Test: a nameless recipe cart fails with `chk_recipe_name`. Test: the temporary cart cannot be renamed, and another buyer cannot rename. Test: delete cascades to items and alternatives.
- [x] Items: `addCartItem` (one `INSERT … SELECT` with the owner filter, so ownership is checked in the same statement as the write; adding the same product again adds to its quantity), `setCartItemQuantity`, `removeCartItem`, `listCartItems`. Test: quantities merge. Test: a wait list line sits next to a product. Test: `chk_item_target` and `chk_item_qty` fail as typed errors. Test: another buyer gets nothing.
- [x] Alternatives: `addAlternative` (locks the item, priority = max + 1), `reorderAlternatives` (one statement, relies on the deferred priority key), `listCartAlternatives`. Test: priorities 1 and 2, and a repeated product fails with `UniqueViolationError`. Test: a swap commits. Test: a wrong id set writes nothing. Test: outside a transaction it throws.
- [x] `EXPLAIN` on the dev branch: the recipe list uses `carts_buyer_id_kind_idx`, the item list uses the `cart_id` prefix of `cart_items_cart_id_waitlist_id_idx`.
- [x] `bun run test:repo` (113 pass) and `bun run typecheck:repo` pass.

Commit: `feat(repo): add cart queries`

### Phase 7: Checkout and orders

Tables: `platform_fee_settings`, `checkouts`, `orders`, `order_items`, `order_item_allocations`, `order_status_history`, `shipments`.

Key queries: the fee setting in effect now, creating a checkout with one order per farmer, status changes that also write history, and the job queries for auto-cancel and unpaid orders. `sold_qty` and `completed_order_count` have no trigger, so the repo updates them on completion.

Note: production needs `database/seeds/platform_fee_settings.sql` run after the first admin signs up, or orders cannot be created. Tests create their own fee row.

Checklist (file: `src/repo/orders/orders.repo.ts`, test: `orders.repo.test.ts`):
- [x] Fee: `insertFeeSetting` and `findFeeSettingInEffect` (latest `effective_from` at or before `now()`). Test: a future version is ignored. Test: commission above 5% fails with `chk_commission_max`. Test: a repeated `effective_from` fails with `UniqueViolationError`.
- [x] Checkout: `insertCheckout` (address snapshot as jsonb), `findCheckoutForBuyer` (owner-scoped). Orders: `insertOrder` (fee snapshot), `insertOrderItems` (one statement, empty list returns early). Test: one checkout with one order per farmer, and each party sees only its own. Test: `chk_buyer_total` and `chk_order_item_qty` fail as typed errors.
- [x] Lists: `listOrdersForBuyer` and `listOrdersForFarmer`, newest first, keyset on `(created_at, id)`, limit + 1. Test: newest first, and pages do not overlap.
- [x] Status: `setOrderStatus` (requires a transaction): guarded `UPDATE` and the history row in one transaction, timestamps by target state. Test: a stale `from` writes nothing. Test: cancel records the reason and actor. Test: outside a transaction it throws.
- [x] Completion: `completeOrder` moves `products.sold_qty` (per product, sorted) and `farmer_profiles.completed_order_count`, only when the status change happened. Test: a replay changes nothing.
- [x] Sale: `convertReservation` turns an active hold into a sale: batch on_hand and reserved drop, a `sale` movement and an allocation are written. Test: converts once. Test: a released hold cannot be converted. Test: outside a transaction it throws.
- [x] Shipments: `insertShipment`, `findShipmentForParty`, `markShipmentArrived` (auto-release = `now()` + 3 days, once). Test: a second shipment fails with `shipments_order_id_key`. Test: a stranger gets nothing.
- [x] Jobs: `lockUnpaidOrders` and `lockOverdueConfirmedOrders` with `FOR UPDATE SKIP LOCKED` and the partial index predicate repeated. Test: only due rows are claimed. Test: outside a transaction they throw.
- [x] Cursor: the keyset takes the last row's id, not a JS `Date`, because a `Date` keeps milliseconds and drops rows at microsecond ties (found by a failing test).
- [x] `EXPLAIN` on the dev branch: the buyer and farmer lists use `orders_buyer_id_created_at_idx` and `orders_farmer_id_status_created_at_idx`. The unpaid and overdue jobs use `orders_payment_due` and `orders_respond_by`. The tables are tiny, so the planner scans them unless seq scan is disabled.
- [x] `bun run test:repo` (134 pass) and `bun run typecheck:repo` pass.

Commit: `feat(repo): add checkout and order queries`

### Phase 8: Payments and ledger

Tables: `payments`, `payment_webhook_events`, `ledger_accounts`, `ledger_transactions`, `ledger_entries`, `refunds`, `payouts`.

Key queries: payment creation by `idempotency_key`, webhook inbox insert where a replay is a no-op, one `postLedgerTransaction` function that writes the transaction and all entries, wallet history, escrow release candidates, refunds and payouts.

Checklist (file: `src/repo/payments/payments.repo.ts`, test: `payments.repo.test.ts`):
- [x] Payments: `createPayment` (replay of `idempotency_key` returns the stored row with `created: false`; another payer's key returns undefined). Test: same key, same row. Test: another payer's key gives undefined. Test: no target fails with `chk_payment_target`. `findPaymentForPayer` (owner-scoped) and `setPaymentStatus` (guarded, `paid_at` set by `now()`). Test: pending to paid once, and a late repeat changes nothing.
- [x] Webhook inbox: `recordWebhookEvent` (`ON CONFLICT DO NOTHING`), `markWebhookProcessed` (first call only), `markWebhookFailed` (keeps the row for a retry). Test: a replay writes one row and processes once. Test: a failed run records the error and leaves `processed_at` empty.
- [x] Ledger accounts: `getOrCreateLedgerAccount` and `findLedgerAccount`, with a null owner for system accounts (NULLS NOT DISTINCT). Test: the same system account on every call.
- [x] Postings: `postLedgerTransaction` (requires a transaction; one multi-row entry insert; replay returns undefined and writes nothing; empty entries throw). Test: a balanced posting moves both balances at commit and not before. Test: an unbalanced posting fails at commit with `CheckViolationError` matching `/unbalanced/`. Test: a replayed idempotency key moves the balance once. Test: outside a transaction throws.
- [x] Wallet history: `listWalletHistory` (owner-scoped, keyset on `(created_at, id)` desc, limit + 1). Test: pages do not overlap, and another owner sees nothing.
- [x] Escrow: `lockEscrowReleaseCandidates` (held, past `auto_release_at`, unconfirmed, `FOR UPDATE SKIP LOCKED`, partial index predicate repeated) and `setEscrowStatus` (guarded). Test: disputed, not-yet-due and confirmed orders are left out. Test: held to released once.
- [x] Refunds: `insertRefund` and `setRefundStatus` (guarded, `completed_at` on completion). Test: no target fails with `chk_refund_target`. Test: completes once.
- [x] Payouts: `insertPayout` and `setPayoutStatus` (guarded, `provider_ref` and `failure_reason` optional, `completed_at` on completion). Test: zero amount fails with `chk_payout_amount`. Test: requested, processing, completed, and a stale step writes nothing.
- [x] `EXPLAIN` on the dev branch: wallet history uses `ledger_entries_account_id_created_at_idx`, escrow candidates use `shipments_auto_release`, and the webhook dedupe uses `payment_webhook_events_provider_provider_event_id_idx`.
- [x] `bun run test:repo` (153 pass) and `bun run typecheck:repo` pass.

Done also requires tests that an unbalanced transaction fails at commit with a typed error, that balances move, and that replaying a webhook changes nothing.
Commit: `feat(repo): add payment and ledger queries`

### Phase 9: Reviews, complaints, reports

Tables: `reviews`, `review_photos`, `complaints`, `complaint_evidence`, `complaint_messages`, `reports`.

Checklist (file: `src/repo/feedback/feedback.repo.ts`, test: `feedback.repo.test.ts`):
- [x] Review: `insertReview` copies product and farmer from the order item, with the buyer filter in the same `INSERT … SELECT`, and `DO NOTHING` on a replay. Test: fields are copied and the product rating moves. Test: another buyer writes nothing. Test: a second review of the same item changes nothing. Test: rating 6 fails with `chk_rating`.
- [x] Lists: `listPublishedReviewsForProduct` and `listPublishedReviewsForFarmer` (keyset, hidden reviews left out). Test: newest first, pages do not overlap, a hidden review drops out.
- [x] Moderation: `setReviewModeration` (guarded). Test: the rating follows the published reviews through the trigger. Test: a stale `from` returns undefined.
- [x] Reply: `replyToReview` (farmer only, once). Test: another farmer gets nothing, and a second reply changes nothing.
- [x] Photos: `insertReviewPhotos` (one statement, keeps the given order, drops assets the buyer does not own, empty list returns early) and `listPhotosForReviews`. Test: positions follow the list, and a foreign asset is dropped.
- [x] Complaints: `openComplaint` (owner filter in the insert), `findComplaintForParty` (buyer, farmer of the order, or assigned mediator). Test: another buyer gets nothing. Test: a stranger sees nothing, and each party sees it.
- [x] Complaint lists: `listComplaintsForBuyer`, `listComplaintsForFarmer` (newest first), `listComplaintQueue` (admin, oldest first, status filter). Test: lists and queue order.
- [x] Status: `setComplaintStatus` (guarded, sets mediator and resolution, `resolved_at` on a terminal state). Test: a stale `from` returns undefined.
- [x] Thread: `insertComplaintMessage` (only a party can post, checked in the insert) and `listComplaintMessages` (only a party reads, oldest first, keyset). Test: a stranger's post writes nothing and a stranger reads an empty list.
- [x] Reports: `insertReport` (exclusive arc; zero and two targets fail with `chk_report_target`), `setReportStatus` (guarded, `handled_at` only when closed), `listReportQueue` (oldest first). Test: each case.
- [x] `EXPLAIN` on the dev branch with seq scan off: the review list uses `reviews_product_id_created_at_idx`, buyer complaints use `complaints_buyer_id_idx`, the admin queue uses `complaints_status_opened_at_idx`, the thread uses `complaint_messages_complaint_id_created_at_idx`, and the report queue uses `reports_status_created_at_idx`.
- [x] `bun run test:repo` (171 pass) and `bun run typecheck:repo` pass.

Open gaps (need a decision, not fixed here):
- Nothing stops two active complaints on one order. The schema has no index for it. A partial unique index on `complaints (order_id)` for the active statuses would close it, but that is a migration.
- `insertReview` does not check that the order is completed. The spec puts that in the service, as the schema comment says.

Commit: `feat(repo): add review and complaint queries`

### Phase 10: Chat and notifications

Tables: `conversations`, `messages`, `notifications`, `outbox_events`.

Key queries: keyset pagination on `messages (conversation_id, id)`, idempotent send through `client_message_id`, unread counts, and outbox claims with `FOR UPDATE SKIP LOCKED`.

Checklist (file: `src/repo/comms/comms.repo.ts`, test: `comms.repo.test.ts`):
- [x] Conversations: `getOrCreateConversation` (unique pair, conflict then follow-up select) and `findConversationForParty`. Test: one conversation per pair. Test: only a party sees it.
- [x] Conversation list: `listConversationsForUser`, keyset on `(coalesce(last_message_at, created_at), id)`, limit + 1. Test: newest activity first, pages do not overlap, a stranger gets none.
- [x] Read marker: `markConversationRead` moves only the caller's side, in one statement. Test: the other side is kept. Test: a stranger gets undefined.
- [x] Send: `insertMessage` (requires a transaction; party check in the `INSERT ... SELECT`; `ON CONFLICT (sender_id, client_message_id)` replay returns the stored row with `created: false`; moves `last_message_at`). Test: `last_message_at` matches the message time. Test: a stranger writes nothing. Test: a replay returns the stored row. Test: `chk_message_content` fails as a typed error. Test: outside a transaction throws.
- [x] Catch-up: `listMessagesAfter` (`id > cursor`, ascending, for the SSE `Last-Event-ID` path). Test: only what is after the cursor, oldest first. Test: a stranger reads nothing.
- [x] History: `listMessagesBefore` (newest first, limit + 1). Test: pages do not overlap. Test: a stranger gets an empty page.
- [x] Unread: `countUnreadMessages` (other party's messages after that side's marker). Test: own messages are skipped, and a read marker clears the count. Messages are backdated in the test, because rows written in one transaction share `now()`.
- [x] Notifications: `insertNotifications` (one statement, empty list returns early), `listNotificationsForUser` (keyset on `(created_at, id)`), `countUnreadNotifications` (partial index). Test: newest first with non-overlapping pages, and only the owner's rows. Test: the badge count.
- [x] Mark read: `markNotificationsRead` (owner and unread only) and `markAllNotificationsRead`. Test: another user's id is skipped. Test: badge goes to zero.
- [x] Web push: `markNotificationsPushed` (only unpushed rows). Test: recorded once.
- [x] Outbox write: `insertOutboxEvent` (requires a transaction, so an event cannot commit alone). Test: outside a transaction throws.
- [x] Outbox claim: `claimOutboxEvents`, one statement with `FOR UPDATE SKIP LOCKED` on `processed_at IS NULL` and `available_at <= now()`. The claim pushes `available_at` forward as a lease and counts the attempt, so no transaction is held during Redis or push calls. Test: a claimed event is hidden by the lease, and a processed one never returns.
- [x] Outbox outcome: `markOutboxProcessed` (once) and `markOutboxFailed` (stores `last_error`, retries later). Test: the error stays on the row, and the event is not claimed again before its retry time.
- [x] `EXPLAIN` on the dev branch with seq scan off: catch-up and history use `messages_conversation_id_id_idx`, the notification list uses `notifications_user_id_created_at_idx`, the badge uses `notifications_unread`, the outbox claim uses `outbox_events_unprocessed`, and the conversation list uses the buyer and farmer indexes.
- [x] `bun run test:repo` (19 new tests, all pass) and `bun run typecheck:repo` pass.

Commit: `feat(repo): add chat and notification queries`

### Phase 11: Analytics, audit, settings

Tables: `product_daily_stats`, `audit_logs`, `platform_settings`.

Key queries: the daily stats upsert, admin statistics, audit lookup by entity, and counter reconciliation for the nightly job.

Checklist (file: `src/repo/admin/admin.repo.ts`, test: `admin.repo.test.ts`):
- [x] Redis flush: `flushProductDayCounters` writes `views` and `add_to_carts` as absolute day totals (upsert on `(product_id, day)`). Test: a second flush replaces the value, and an empty list writes nothing.
- [x] Sales rollup: `rollupSalesForDay` (requires a transaction) recomputes `purchases`, `units_sold` and `revenue` for one Jakarta day from paid order items only. Test: awaiting payment is left out. Test: a cancelled order drops out on rerun. Test: outside a transaction it throws. Views are untouched.
- [x] Subscriptions rollup: `rollupSubscriptionsForDay` (requires a transaction). Test: counts the day's new subscriptions.
- [x] Farmer funnel: `listProductDailyStatsForFarmer` (owner-scoped) and `rankProductsBySales` (best or slow sellers, products with no sales included). Test: another farmer gets nothing. Test: ranking order.
- [x] Admin overview: `findAdminOverview` returns GMV, paid order count, active users, escrow balance, and harvest status changes with delayed ones. Test: the figures move by exactly the new order and the new delay (before and after compared, so other data does not matter).
- [x] Counter reconciliation: `findCounterDrift` is read only, with `limit`, and checks every cached counter against its source. Test: fresh data shows no drift. Test: completing an order without `completeOrder` shows drift on `sold_qty` and `completed_order_count`.
- [x] Audit: `listAuditLogsForEntity` (newest first, keyset on `(created_at, id)`, limit + 1). Test: a price change is audited with the actor and old and new values. Test: pages do not overlap when two rows share a timestamp. Test: a fee version insert is audited.
- [x] Settings: `findPlatformSetting`, `listPlatformSettings` and `upsertPlatformSetting` (JSON value, one row per key). Test: an upsert replaces the value. Test: an unknown key returns undefined.
- [x] `EXPLAIN` on the dev branch with seq scan off: the audit lookup uses each partition's `(entity_type, entity_id, created_at)` index, merged in order, and the farmer funnel uses `product_daily_stats_pkey`.
- [x] `bun run test:repo` and `bun run typecheck:repo` pass.

Commit: `feat(repo): add analytics and admin queries`

### Phase 12: Coverage and handoff

Checklist (test: `src/repo/coverage.repo.test.ts`):
- [x] Script check: all 61 tables appear in at least one `.repo.ts` file. It found `complaint_evidence` unqueried, so `insertComplaintEvidence` and `listComplaintEvidence` were added (party and owner checks in the statement, replay is a no-op).
- [x] Check each job in `documentation.md` section 7 has its claim query. The test maps every documented job to its functions and fails if a job is added or renamed in the doc. It found two missing queries, both added: `markUsersSeen` (presence flush) and `lockBatchesForSurplusPass` (returns only batches whose cached discount differs from their rule).
- [x] Admin overview: active users and escrow balance are now asserted, as before and after differences. Active users move through `markUsersSeen`, the first write path for `last_seen_at`.
- [x] `EXPLAIN` on the dev branch with seq scan off: the surplus claim uses `product_batches_active_expiry` and `surplus_rules_product_id_days_remaining_idx`, and the evidence list uses `complaint_evidence_complaint_id_idx`.
- [x] Run the full suite and the scoped typecheck: `bun run test:repo` (212 pass) and `bun run typecheck:repo` pass.
- [x] Update this file and report what is left.

Commit: `test(repo): verify table and job coverage`

What is left (each needs a decision, so none is fixed here):
- Media cleanup covers pending uploads only. The docs have `deleted` mean "parent gone, destroy on Cloudinary", while `markMediaDeleted` sets it after the destroy, and `media_assets` has no column to tell the two apart. The second half of the job needs a new status or a `destroyed_at` column (a migration).
- Badge evaluation has `awardBadge` and `revokeBadge`, but no query that picks the farmers to award or revoke, because `badges.criteria` is `{}` until admins set the thresholds.
- `users.updated_at` moves on every presence flush, through the `set_updated_at` trigger. Harmless today, but do not read it as "profile last edited".
- Still open from earlier phases: two active complaints on one order (Phase 9), production migrations, and the two open questions below.

## Out of scope

- Services, HTTP routes, and business rules such as fee calculation and penalties.
- Rewiring or deleting the legacy Express/Hono code.
- Translating English column names to the frontend's Indonesian types (`documentation.md` A8 puts that in the API layer).
- Applying migrations to production. That needs the user.

## Open questions

1. Does the backend stay in `backend/` on Hono, or move to Next.js route handlers as the docs say? The repo works with either, but this decides how the code gets imported.
2. Should the app log in as `app_rw`? The role exists but cannot log in yet. Until it can, the repo runs as the owner and the no-`DELETE` grants are not enforced.
