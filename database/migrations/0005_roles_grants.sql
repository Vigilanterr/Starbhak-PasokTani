DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['app_rw','app_ro'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', r);
    END IF;
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO app_rw, app_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;

-- Append-only money, stock, event and audit records
REVOKE DELETE ON
  ledger_accounts, ledger_transactions, ledger_entries, stock_movements,
  waitlist_events, order_status_history, payment_webhook_events, outbox_events, audit_logs
FROM app_rw;

-- Not application data
REVOKE ALL ON schema_migrations, spatial_ref_sys FROM app_rw, app_ro;
GRANT SELECT ON spatial_ref_sys TO app_rw, app_ro;

-- Partitions are reached through audit_logs only
DO $$
DECLARE p regclass;
BEGIN
  FOR p IN SELECT inhrelid::regclass FROM pg_inherits WHERE inhparent = 'audit_logs'::regclass LOOP
    EXECUTE format('REVOKE ALL ON %s FROM app_rw, app_ro', p);
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA neon_auth TO app_rw;
GRANT SELECT ON neon_auth."user" TO app_rw;
