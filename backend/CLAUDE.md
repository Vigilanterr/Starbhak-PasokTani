# Backend instructions

The plan for the database query layer is in `Plan.md`. Work through its phases in order and tick the boxes as you go.

The plan for the API on top of the repo layer is in `ApiPlan.md`. It covers services, routes, jobs and integrations, and it replaces the schema v1 API.

## Git

- No Co-Author on any git commit. No `Co-Authored-By` trailer and no Claude attribution.
- Use Conventional Commits and Conventional Branch (`docs/git-convention/`).
- The working tree often has unrelated changes. Stage named paths only, never `git add .`.

## Neon and secrets

- `.neon` pins the CLI to `production`. Always pass `--branch` to `neon env pull` and similar commands, and never run `neon checkout production`.
- Never run writes or tests against `production` without an explicit yes from the user in the same session.
- Never print connection strings, passwords or keys. `.env` stays out of git.
- Schema changes go through a new file in `database/migrations/`, then `bun run db:types`. Never edit `src/repo/db.generated.ts` by hand.

## Repo layer (`src/repo/`)

- SQL lives here and only here. No HTTP, Hono, or business rules.
- Every function takes `Executor` as its first argument. Services own the transactions.
- Use the pooled `DATABASE_URL` at runtime. No named prepared statements or session state. Use `set_config(..., true)` inside a transaction instead.
- Writes that should be audited run inside `withActor`.

### Never write these columns or tables

- Maintained by triggers: `updated_at`, `ledger_accounts.balance`, `rating_avg`, `rating_count`, `subscriber_count`, `follower_count`, `commitment_count`, `available_qty`, `current_batch_id`.
- Generated: `products.search_vector`.
- Owned by Neon: everything in `neon_auth`. Read `neon_auth."user"` only.

`committed_min_qty`, `sold_qty` and `completed_order_count` have no trigger, so the repo does update them.

### Append-only tables

No update or delete functions for `ledger_transactions`, `ledger_entries`, `stock_movements`, `waitlist_events`, `order_status_history` or `audit_logs`.

## Tests

- `bun run test:repo` runs against a Neon dev branch. Each test runs in a transaction that rolls back, through `withRollback`.
- Assert the typed error for each failure, so a test cannot pass for the wrong reason.
- Deferred triggers fire at commit. Use `SET CONSTRAINTS ALL IMMEDIATE` to trigger them inside a rolled-back test.
- Commit after each phase's tests pass.
