-- Initial platform fees: commission 3% (max 5%), service fee 1% (max 2%).
-- Run once, after the first admin has signed up and has a users row.
-- created_by is NOT NULL and references users, so this cannot be a migration.
-- Safe to run again: the fixed effective_from makes a repeat a no-op.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    RAISE EXCEPTION 'no admin in users yet; sign up the first admin, then run this again';
  END IF;

  INSERT INTO platform_fee_settings (commission_pct, service_fee_pct, effective_from, created_by)
  SELECT 3, 1, '2026-11-01 00:00:00+07', id
  FROM users WHERE role = 'admin' ORDER BY created_at, id LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;
