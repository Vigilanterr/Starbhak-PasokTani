# Plan: rebuild the backend API on the repo layer

Written 2026-11-09, revised the same day. `Plan.md` covers the database query layer and is finished. This plan covers what sits on top of it: services, HTTP routes, jobs and integrations. Working rules are in `backend/CLAUDE.md`, and the query pattern is in the repo memory note `repo-query-pattern`.

Three constraints from the user shape it:

- **One Vercel project** holds both the frontend and the backend.
- **The deadline is tight.** Core phases come first. Extras are picked by what the demo shows.
- **Redis is local only.** A deployed Vercel app cannot reach it, so nothing in the core depends on it.
- **Claude also builds the minimal buy-flow screens**, in Phases 2, 4 and 5, so the demo can reach payment.

This is a rebuild, not a rewire. The reverted Phase 13 (commit `f1e3143`) aimed to make the same 47 endpoints pass, as a separate deployment. That target is wrong, for the reasons below.

## Where things stand

- **Nothing consumes the legacy API.** The frontend has no `fetch` to `/api/v1`. Public pages read mock JSON through `frontend/src/lib/api/katalog.ts`, and sign-up and sign-in already go straight to Neon Auth. There is nothing to stay compatible with.
- **The legacy API models the wrong product.** It has `commodities`, `achievements` and single-product `POST /orders`. It has no wait lists, carts, checkouts, payments, wallet, complaints or chat.
- **The repo is ready but incomplete for screens.** It passes its tests and covers all 61 tables, but it was built table by table. Phase checklists mark each missing query as NEW.
- **Only `(publik)` and `(auth)` pages exist in the frontend.** `frontend/src/lib/api/tipe.ts` is the real contract for those. Cart, checkout, order, farmer and admin screens are only described in `routes.md`. The product page already has a buy box and a cart dialog (`kotak-beli`, `dialog-keranjang`) to wire up. There is no `proxy.ts` yet, and `masuk()` in `auth-api.ts` is a stub that always fails.

### What `scripts/` gives us

| File | Finding | Use |
|---|---|---|
| `scripts/test-all-endpoints.ts` | Runs requests in process with `app.request`, and checks 401, 403 and the main case for each route. The cases are v1 (integer ids, uppercase roles, locally signed JWTs). Its classifier counts any 400 containing "Invalid" or "required" and any 404 containing "not found" as a pass. It has no production guard. | Keep the three-step idea in `tests/`. Drop the cases and the classifier, then delete the script. |
| `scripts/test-neon-signup.ts` | Proves the cookie flow from a server: sign up, sign in, read `Set-Cookie`, then `getSession` with `Cookie` and `Origin`. Each run creates a real account that cannot be removed from our side. | Basis for the one real-session test in Phase 2. **Do not run it until Phase 0 fixes the env**, because it would write to production auth. |
| `scripts/test-results.json`, `report.md` | 8 of 47 pass, but the passes prove little. Four are `/`, `/health` and the docs. `CAT-01` works by accident. `ADM-02` passes only because `users` is empty and no search was sent; a search would hit the missing `email` column. `UPL-02` is false: Cloudinary reports a missing id as a normal result, and the controller does not check it. `UPL-01` left a real test asset in Cloudinary on each run. The "47/47 auth" figure covers tokens the script minted itself. Login cannot issue one on v2. | Baseline only. No legacy endpoint is worth keeping. |

### Problems to fix first (Phase 0)

1. **Neon Auth points at production.** `backend/.env` and `frontend/.env.local` use `NEON_AUTH_BASE_URL` on `ep-damp-bird-az8zb4ht` (production), while the database is `ep-round-hat-aznwazqc` (`chore-schema-v2`). `Plan.md` pulled with `-s postgres`, which left auth alone. Sign-ups would land in production, and `users.id` would then fail its foreign key on the dev branch. The dev branch has its own auth URL.
2. **Live secrets are in public git history.** `.env.example` was committed in `45efc85` and `44cad9f`, and deleted later. `JWT_SECRET`, both Cloudinary keys and both Midtrans keys in that history match the current `.env`, and the GitHub repo is public. Deleting the file did not remove them.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Hosting | One Vercel project using Vercel Services: `frontend/` (Next.js) and `backend/` (Hono), with a root `vercel.json` | Both ship in one deployment, so frontend and API never drift, and previews and rollbacks cover both. Keeps Hono in `backend/`, as `Plan.md` decided. |
| Databases | Vercel Production uses the Neon `production` branch, with its own auth URL. Preview and local dev use `chore-schema-v2` | The user reports the v2 migrations succeeded on production. Phase 0 confirms it. |
| Routing | `/api/v1/*` and `/api/cron/*` go to the backend service; everything else, including `/api/auth/*`, goes to Next.js | One origin, so the Neon Auth cookie reaches Hono with no CORS. The backend receives the full path, so Hono mounts at `/api/v1` and `/api/cron`. |
| Server-side calls | Server Components call `BACKEND_INTERNAL_URL`, a Vercel service binding, and forward the cookie when signed in. The browser uses relative `/api/v1` | Bindings are the private path between services. `NEXT_PUBLIC_API_BASE` is removed. |
| Build-time data | No API call during `next build` | Bindings exist only at runtime, and the backend is not live during the build. The four `generateStaticParams` go away and those pages render on request. |
| Legacy code | Delete it in Phase 1 | No consumers, and two auth systems must not coexist. It also lets typecheck cover all of `src`. Git keeps the history. |
| Session | Hono forwards only the `__Secure-neon-auth.*` cookies to `${NEON_AUTH_BASE_URL}/get-session`, then loads `users` through the repo | Same check the SDK makes. No JWT, per decision 4 in `documentation.md`. Reuse `src/lib/session.ts` from `f1e3143`. |
| Sign-up and sign-in | Not API endpoints. The frontend keeps using Neon Auth directly, and the API only adds `POST /me/onboarding` | `documentation.md` 4.1: the `users` row is created at onboarding. The reverted commit proxied login through Hono. |
| Layers | `routes` (HTTP, validation, mapping) call `services` (rules, transactions), which call `repo` (SQL) | `CLAUDE.md`. A test enforces the import direction. |
| JSON contract | Field and enum names from `tipe.ts`; query params from `bacaFilterProduk`. Paths stay English under `/api/v1` | `documentation.md` A8. Mappers live in `src/mappers/`. Screens not yet in `tipe.ts` follow the same naming. |
| Envelope | `{ success: true, data, meta? }` and `{ success: false, error: { code, message, fields? } }` | A stable `code` for the UI and an Indonesian `message`. Never `err.message`: the legacy API returns raw SQL errors to clients. |
| Pagination | Catalog, farmers and wait lists use page and total, matching `HasilHalaman`. Feeds (orders, wallet) use the keyset cursor already in the repo | The catalog has numbered pages and several sort orders. Feeds grow without limit. |
| Validation | `@hono/zod-validator`. `/api-docs` is dropped for now | The deadline. The hand-written `swagger.ts` describes the old API. |
| Redis | `lib/redis.ts` with `ioredis` and an optional `REDIS_URL`. Local dev uses Valkey on `redis://localhost:6379`. Unset means the feature falls back or is off | Valkey is installed here and answered `PONG` when started unprivileged. It is unreachable from Vercel, so the deployed demo runs without Redis. A hosted Redis later is only a `REDIS_URL` change. |
| Chat delivery | Polling with `listMessagesAfter`, not SSE | SSE fan-out needs Redis across instances. |
| API tests | Real commits on a throwaway Neon branch, reset before each run. Only the shared route matrix and the money path | `withTransaction` cannot nest inside `withRollback`, so writes through a service cannot roll back. Real commits also exercise the deferred triggers. |

### Status codes

| Source | Result |
|---|---|
| Zod failure, bad uuid (validated before SQL, so 22P02 cannot occur) | 400 `validation_failed` |
| No session | 401 |
| Wrong role, suspended, no `users` row | 403 (`onboarding_required` for the last) |
| Repo returned `undefined`, including an owner-scoped miss | 404 |
| Guarded transition returned `undefined` | 409 `state_conflict` |
| `chk_quota_not_exceeded`, `chk_reserved_le_on_hand`, `chk_no_negative_wallet` | 409 `quota_full`, `out_of_stock`, `insufficient_balance` |
| Other `UniqueViolationError`, `ForeignKeyViolationError`, `CheckViolationError` | 409 or 400, from a per-constraint table. Unlisted ones are 500 and logged |
| 40P01 deadlock | One retry, then 503 |
| Anything else | 500, generic message, logged with a request id |

## Target layout

```text
vercel.json     services and public rewrites
backend/src/
  index.ts  app.ts  factory.ts
  routes/       index.ts, one file per domain, chained handlers
  middleware/   session.ts, role.ts, error-handler.ts, cron-secret.ts
  validators/   zod schemas per domain
  mappers/      English rows to tipe.ts shapes, enum tables
  services/     rules and transactions; imports no Hono
  jobs/         one function per job, plus a registry
  lib/          env.ts, midtrans.ts, session.ts, biteship.ts, redis.ts
  types/env.ts
  repo/         unchanged layout
backend/tests/  app.request tests
```

```json
{
  "services": {
    "frontend": {
      "root": "frontend/",
      "bindings": [{ "type": "service", "service": "backend", "format": "url", "env": "BACKEND_INTERNAL_URL" }]
    },
    "backend": { "root": "backend/", "entrypoint": "src/index.ts", "installCommand": "bun install --frozen-lockfile" }
  },
  "rewrites": [
    { "source": "/api/v1/(.*)", "destination": { "service": "backend" } },
    { "source": "/api/cron/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

`createApp({ db, session, midtrans })` takes its dependencies, so tests can fake the network and never call Midtrans.

### Service rules

- All writes go through one `withTransaction` or `withActor`, even single statements, because `mapDbError` only runs there. Reads use `getDb()`.
- Use `withActor` for changes to `products.price`, `price_tiers`, `surplus_rules`, `platform_fee_settings` and `orders.status`.
- Never hold a transaction across Midtrans, Cloudinary, Biteship or Redis. Write `outbox_events` in the transaction and do the side effect after commit.
- Money uses BigInt or SQL, never float arithmetic. Convert with `rupiahToNumber` only in mappers.
- "Today" is `Asia/Jakarta`, from Postgres.
- Every NEW query follows `repo-query-pattern` and has repo tests in the same phase.

## Core phases

Do them in order. Each ends with passing tests and a commit. Phases 0 to 3 give a deployed public site on real data. Phases 4 and 5 add buying and payment.

### Phase 0: Env, secrets, project

- [ ] Rotate the Cloudinary and Midtrans keys, and check whether the database password in the old `.env.example` is still live. **The user does this.** `JWT_SECRET` goes away in Phase 1.
- [x] Point `NEON_AUTH_BASE_URL` in `backend/.env` and `frontend/.env.local` at the dev branch auth URL (`get_auth` on `br-icy-sea-azw329fy`). Confirm the `neon env pull` flag for auth first, and always pass `--branch`.
- [x] Check the dev branch auth config: localhost allowed, and Google OAuth set up if the demo needs it.
- [x] Add a guard next to `assertSafeBranch` that refuses to run when the auth endpoint and database endpoint differ.
- [x] `vercel link` from the repo root. If a project already exists with Root Directory `frontend/`, change it to the repo root, or Services will not see `vercel.json`.
- [x] Confirm production has all 8 migrations with `database/status.mjs` (read-only). **The user runs it**, or gives an explicit yes for Claude to, because production access needs that.
- [x] Add `CRON_SECRET` to `.env`. Commit or drop the pending `src/index.ts` change. Create `feature/backend-api` from `feature/backend-repo`.
- [x] Add a pointer to this file in `backend/CLAUDE.md`.

Done when: the guard passes, and one sign-up through the frontend appears in `neon_auth."user"` on the dev branch and not on production.
Commit: `chore(api): point auth at the dev branch and guard the mismatch`

### Phase 1: Skeleton, legacy removal, first deployment

The one-project deployment is the largest unknown, so it is proven here, before any feature work.

- [ ] Delete `controllers/`, `modules/`, old `routes/`, `middlewares/`, `utils/jwt.ts`, `utils/response.ts`, `config/database.ts`, `config/swagger.ts`, and the `bcryptjs` and `jsonwebtoken` dependencies. Delete `scripts/test-all-endpoints.ts`, `scripts/test-results.json` and `report.md`. Check `lib/neon-auth.ts` is still needed before removing it.
- [ ] Delete `backend/vercel.json` and `backend/package-lock.json` (bun is the package manager). Add the root `vercel.json` and a `.vercelignore` for `.backup-frontend-*`.
- [ ] `lib/env.ts` validates env at start with zod and has no fallback secrets.
- [ ] `app.ts`, `factory.ts`, `types/env.ts`. `index.ts` is `export default app`. Lower the `createDb` pool size for Fluid Compute and add `attachDatabasePool` from `@vercel/functions` if it fits.
- [ ] `error-handler.ts` applies the status table. Add a request id and a `hono/csrf` check that the `Origin` host equals the request host, so previews work. Webhooks and cron are exempt.
- [ ] `GET /api/v1/health` also runs `select 1`.
- [ ] `POST /api/cron/:job` with a constant-time `CRON_SECRET` check and the job registry. Names come from `.github/workflows/scheduled-jobs.yml`. **Unbuilt jobs return 200 with `skipped: true`**, because the workflow uses `curl --fail` under `set -e`, and an error would stop the remaining jobs in that run.
- [ ] Test harness: branch `api-test` from `chore-schema-v2`, reset before each `bun run test:api`. Fake session by user id, and fixtures from existing `neon_auth."user"` ids.
- [ ] Shared test matrix: 401, 403, bad-uuid 400 and happy path for every route. Architecture test: `services/` imports no Hono, and nothing outside `repo/` imports `pg` or `sql`.
- [ ] Add `typecheck` for all of `src`.
- [ ] Deploy a preview. Confirm `/api/v1/health` reaches Hono and `/` reaches Next.js. Watch for the repo's extensionless imports failing under Node ESM. If they do, deploy the `bun build` bundle as the entrypoint.
- [ ] `vercel dev -L` from the repo root runs both services on one port with the binding set. If local env loading fails, fall back to a dev-only Next.js rewrite to `localhost:5000`.

Done when: typecheck, `test:repo` and `test:api` pass, and the preview URL serves both services.
Commit: `refactor(api)!: remove the schema v1 API and deploy the new skeleton`

### Phase 2: Session and onboarding

- [ ] `middleware/session.ts` and `requireRole(...)`, using lowercase `users.role`. Suspended and soft-deleted users get 403.
- [ ] `GET /me`: `findUserWithEmail`. A signed-in person with no `users` row gets `onboarding_required`.
- [ ] `POST /me/onboarding`: `ensureUser`, `ensureFarmerProfile` for farmers (shop name, regency, district), `markUserOnboarded`, all in one transaction. The `admin` role cannot be chosen (`OnboardingRole`). Replays change nothing.
- [ ] Frontend: wire `masuk()` to `authClient.signIn.email`, and send the role and shop fields that `daftar()` currently drops by calling `POST /me/onboarding` after sign-up.
- [ ] Frontend: a small onboarding page for Google sign-ins that have no `users` row (role, and shop details for farmers).
- [ ] Frontend: `src/proxy.ts` for early redirects, with the role check repeated in each group's layout, per `routes.md`. Read `node_modules/next/dist/docs/` first, as `frontend/AGENTS.md` requires.
- [ ] Add the Vercel preview and production domains to Neon Auth trusted domains, on both branches.
- [ ] One real-session test built from `test-neon-signup.ts`, on the dev branch only.

Done when: a browser sign-up on a preview deployment reaches `GET /api/v1/me` with the right role.
Commit: `feat(api): add Neon Auth session and onboarding`

### Phase 3: Public catalog

Replaces the mock in `katalog.ts`, function by function.

- [ ] NEW read models, as single queries with no per-row loops: `listCatalogCards` (farmer summary, category, active batch dates, surplus, effective price; filters for category, regency, organic, surplus, in stock, price range, radius; the sort orders in `UrutanProduk`; page and count) and `findProductDetail`.
- [ ] NEW `listFarmerDirectory`, `findFarmerPublic`, `listWaitlistsPublic`, and home sections.
- [ ] `GET /categories`, `/categories/:slug`, `/regions`, `/regions/:slug/districts`.
- [ ] `GET /products`, `/products/:slug`, `/products/:id/related`, `/products/:id/reviews`, and `GET /search` (`searchProducts`, returning `dimaknai` and `saran`).
- [ ] `GET /farmers`, `/farmers/:id`, `/farmers/:id/products`, `/farmers/:id/reviews`.
- [ ] `GET /waitlists`, `/waitlists/:id` (`listWaitlistTimeline`, `listMediaForEvents`). `GET /home`.
- [ ] Mappers and enum tables: status, unit, tag, badge. Test that every enum value maps.
- [ ] Surplus price: a pure function with unit tests for tiers, the price floor and `sisaHari` on the Jakarta date.
- [ ] Seed demo data with a script, on the dev branch by default. It refuses `production` unless given an explicit flag. Use the images already in `frontend/public/images`, so media uploads can wait.
- [ ] Replace each `katalog.ts` body with `fetch` through one helper (`BACKEND_INTERNAL_URL` on the server, relative in the browser).
- [ ] Remove `generateStaticParams` from `produk/[slug]`, `petani/[id]`, `kategori/[slug]` and `daftar-tunggu/[id]`. Because `cacheComponents` is on, add Suspense boundaries and keep every fetch behind a runtime boundary, with `'use cache'` for public reads.

Done when: every public page renders from the API on a preview deployment, with no import from `src/data/*.json`, and `next build` makes no API call.
Commit: `feat(api): serve the public catalog from the repo`

### Phase 4: Buyer account and carts

- [ ] Addresses: `insertAddress`, `listAddressesForUser`, `setDefaultAddress`.
- [ ] Temporary cart and items: `getOrCreateTemporaryCart`, `addCartItem`, `setCartItemQuantity`, `removeCartItem`, `listCartItems`.
- [ ] Recipe carts: `createRecipeCart`, `listRecipeCarts`, `updateRecipeCart`, `deleteRecipeCart`.
- [ ] Alternatives: `addAlternative`, `reorderAlternatives`.
- [ ] Follow: `followWaitlist`, `unfollowWaitlist`.
- [ ] Screens: wire `kotak-beli` and `dialog-keranjang` to the cart API. Add the `(pembeli)` layout, `/keranjang`, and `/akun/alamat`. The cart count in `header-situs` comes from the API.
- [ ] Recipe carts and alternatives stay API only unless the demo shows them.

Commit: `feat(api): add buyer addresses and carts`

### Phase 5: Checkout, payment, orders

The hardest phase, and the one the demo depends on. Three commits.

**5a. Checkout**
- [ ] Fee calculation as pure functions with unit tests. Half-up rounding with the remainder to the farmer (A7). Use the `documentation.md` 4.7 example: 100,000 at 1% and 3% gives 101,000, 97,000 and 4,000.
- [ ] `POST /checkouts/preview` writes nothing and returns totals and problem products, with cart alternatives.
- [ ] `POST /checkouts` takes an `Idempotency-Key`. One `withActor`: products in sorted id order, `lockFefoBatches`, `findEffectiveUnitPrice`, `reserveStock`, `findFeeSettingInEffect`, `insertCheckout`, `insertOrder` per farmer, `insertOrderItems`, `createPayment`. NEW `recordCartCheckout` and temporary cart clearing.
- [ ] Touch batches before products, or a price edit can deadlock with checkout.
- [ ] Rules: address required, 1-hour payment limit, substitutions on `order_items.substituted_for_product_id`.
- [ ] Job `reservation-sweeper`: `releaseExpiredReservations`, `lockUnpaidOrders`.
- [ ] The dev branch needs `database/seeds/platform_fee_settings.sql`.
- [ ] Screen: `/checkout` with address, delivery method, fee summary and problem-product notices from the preview.
- [ ] Test: two concurrent checkouts for the last stock give one success and one 409.

Commit: `feat(api): add checkout with stock reservation`

**5b. Payment**
- [ ] `lib/midtrans.ts`. Create the charge after commit, then store the provider reference, VA number and QR string with NEW `setPaymentProviderDetails`. QRIS and Virtual Account. Confirm the keys are sandbox before the first call.
- [ ] `POST /api/v1/webhooks/midtrans`: verify the signature and gross amount, then `recordWebhookEvent` (`undefined` means replay, return 200). Set the notification URL to the deployed origin in the Midtrans dashboard.
- [ ] Process in one transaction: `setPaymentStatus`, `setOrderStatus` to confirmed, `convertReservation`, `postLedgerTransaction`, `setEscrowStatus` to held, `insertOutboxEvent`, `markWebhookProcessed`. On failure, `markWebhookFailed` and return 500 so Midtrans retries.
- [ ] Screen: `/checkout/[idPesanan]/bayar` shows the QR or VA number and the 1-hour countdown, and polls the payment status.
- [ ] Test: a replay moves the balance once. Test: a bad signature changes nothing. Test: a wrong amount changes nothing.

Commit: `feat(api): add Midtrans payments and webhook inbox`

**5c. Orders**
- [ ] `GET /orders` and `/orders/:id` for buyer and farmer: `listOrdersForBuyer`, `listOrdersForFarmer`, `findOrderForBuyer`, `findOrderForFarmer`, `listOrderItemsForParty`. Snapshot columns only.
- [ ] Transitions, one route each, all through `setOrderStatus` in `withActor`: process, ship, cancel, confirm receipt. NEW `markShipmentShipped`, `confirmShipmentReceived`.
- [ ] Shipping: `insertShipment`, `markShipmentArrived`. Biteship stays dummy data behind `lib/biteship.ts`.
- [ ] Completion: `completeOrder`, then release escrow with the ledger entries.
- [ ] Jobs `auto-cancel` (`lockOverdueConfirmedOrders`) and `escrow-auto-release` (`lockEscrowReleaseCandidates`).
- [ ] Screens: `/pesanan`, `/pesanan/[id]` (confirm receipt), and the `(petani)` layout with `/toko/pesanan` and `/toko/pesanan/[id]` (process, enter tracking number, ship), so one demo run can go end to end.
- [ ] Test: full path from cart to released escrow, asserting ledger balances after real commits.

Done when: on a preview deployment with Midtrans sandbox, a seeded buyer goes from cart to payment in the browser, the farmer ships, and the farmer's balance moves after release.
Commit: `feat(api): add order fulfilment and escrow release`

## Extras, in the order to try them

Each is one commit and independent of the others. Pick by what the demo shows, and cut the rest.

### E1: Farmer store basics

- [ ] Products: `insertProduct`, `updateProductDetails`, `setProductPrice` (`withActor`), `setProductStatus`. NEW `listProductsForFarmer`.
- [ ] Stock: `receiveBatch`, `listBatchesForProduct`. Tiers: `replacePriceTiers`.
- [ ] Wait list status: `insertWaitlist`, `changeWaitlistStatus`, `insertWaitlistEvent`. NEW `listWaitlistsForFarmer`.

### E2: Media uploads

- [ ] `POST /media/sign` (`insertMediaAsset`) and `POST /webhooks/cloudinary` (`markMediaReady`). Browser uploads direct, because Vercel caps function bodies at 4.5 MB.
- [ ] Job `media-cleanup`. Check the destroy result, since a missing id is not an error.

### E3: Commit on wait lists

- [ ] NEW, because `commitments` has no update query: `listCommitmentsForBuyer`, guarded `setCommitmentStatus`.
- [ ] `POST /waitlists/:id/commitments`: `commitToWaitlist` plus the hold payment. Demo the quota check.
- [ ] Remainder, allocation and penalty rules (`documentation.md` 4.4) only if the demo reaches harvest.

### E4: Reviews and wallet

- [ ] `insertReview` (service checks the order is completed), `replyToReview`.
- [ ] `findLedgerAccount`, `listWalletHistory`.

### E5: Admin overview

- [ ] `findAdminOverview`, `listPendingVerifications`, `decideVerification`, `listComplaintQueue`, `setComplaintStatus`. NEW `listUsers`.

### E6: Chat, notifications, Redis

- [ ] Conversations and messages by polling: `getOrCreateConversation`, `listConversationsForUser`, `insertMessage`, `listMessagesAfter`, `listMessagesBefore`, `markConversationRead`.
- [ ] Notifications: `listNotificationsForUser`, `countUnreadNotifications`, `markNotificationsRead`. Job `outbox-sweep`.
- [ ] `lib/redis.ts` with `valkey-server --port 6379 --save '' --appendonly no` locally. Product view counters and the job `presence-flush` run only when `REDIS_URL` is set.

## Finish before the demo

- [ ] Set the Vercel env per environment: Production on the Neon `production` database and auth URL, Preview on `chore-schema-v2`. Share `CRON_SECRET` with GitHub, and set `APP_URL` as a GitHub variable.
- [ ] On production, each needing an explicit yes from the user: sign up the first admin and set `users.role = 'admin'`, run `database/seeds/platform_fee_settings.sql` (orders cannot be created without it), and seed the demo data.
- [ ] Update `documentation.md` A10 and 4.1: one Vercel project with Next.js and Hono as services.
- [ ] Update `README.md`, and add API rules to `backend/CLAUDE.md`.

## Cut for the deadline

- `/api-docs`, SSE, push notifications, rate limits, and Redis caches.
- Recipe cart extras beyond the routes in Phase 4, subscriptions, notification preferences.
- Complaints, refunds, payouts, reports, moderation, audit, badge evaluation, analytics rollup, surplus and remainder jobs. Their cron routes return `skipped`.
- KTP verification and encrypted fields.

## Out of scope

- Screens beyond the buy flow in Phases 2, 4 and 5 (the rest of `/akun` and `/toko`, recipe carts, admin), unless an extra needs one.
- Real Biteship integration (dummy data until then, per decision 2).
- Post-MVP items in `routes.md` section 9, including negotiation, which `backend/docs/FEATURE-MAPPING.md` still lists. That file describes the older design and is not a source for this plan.
