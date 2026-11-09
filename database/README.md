# Database migrations

Schema v2.2 for Neon Postgres 18. The target design is `schema.sql` and `docs/database/documentation.md`.

## Running

Always use the **unpooled** connection string.

```sh
cd database && npm install
MIGRATE_URL=<unpooled url> npm run migrate   # applies anything not yet in schema_migrations
MIGRATE_URL=<unpooled url> npm test          # runs tests/*.sql, data tests roll back
```

Each file runs in its own transaction and is recorded in `schema_migrations`. Try changes on a Neon branch before production.

## Order

| File | Contents |
|---|---|
| `0000_drop_legacy.sql` | Removes the old Express schema, if present. Never touches `neon_auth`. |
| `0001_extensions.sql` | `pg_trgm`, `unaccent`, `postgis`, `btree_gist`, and the IMMUTABLE search wrappers. |
| `0002_schema.sql` | Enums, tables, FKs, indexes and comments from `schema.sql`. |
| `0003_constraints_indexes.sql` | Partial, GIN and GiST indexes, the temporal constraint, the deferrable and `NULLS NOT DISTINCT` uniques. |
| `0004_functions_triggers.sql` | `updated_at`, ledger balance, price tier order, audit and counter triggers. |
| `0005_roles_grants.sql` | `app_rw` and `app_ro`. |
| `0006_seed_reference.sql` | Reference data only. |
| `0007_media_destroyed_at.sql` | `media_assets.destroyed_at`, so the cleanup job can tell "destroy due" from "destroyed". |

## How `0002` differs from `schema.sql`

- The `neon_auth` stub is removed. Neon owns that schema; only the FK from `users.id` remains.
- PostGIS types are no longer quoted (`geography(Point,4326)`).
- `products.search_vector` is a generated column.
- `audit_logs` is partitioned by month, with a default partition. Partitions exist through February 2027; rows after that land in the default partition until more are added.
- The unique indexes on `cart_item_alternatives (cart_item_id, priority)` and `ledger_accounts (owner_id, type)` are replaced in `0003`.

## Seed data

Regencies and districts use Kepmendagri codes (No 300.2.2-2138 Tahun 2025), taken from [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (MIT). Province 32 has 27 regencies and 627 districts. Centroids are not seeded.

## After the first admin signs up

Orders need a `platform_fee_settings` row, and that row must name a real user, so it is not part of the migrations. Run this once:

```sh
psql "$MIGRATE_URL" -v ON_ERROR_STOP=1 -f database/seeds/platform_fee_settings.sql
```

## Application roles

`app_rw` and `app_ro` are `NOLOGIN` and not used by the app yet. To use them, create a login role and grant it one of these. Tables added by later migrations need their own grants.
