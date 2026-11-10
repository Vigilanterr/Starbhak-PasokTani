-- T7: users.id must exist in neon_auth."user". Everything rolls back.
BEGIN;

DO $$
DECLARE existing uuid;
BEGIN
  SELECT id INTO existing FROM neon_auth."user" ORDER BY id LIMIT 1;
  IF existing IS NULL THEN
    RAISE NOTICE 'skipped the positive case: neon_auth."user" is empty';
  ELSE
    INSERT INTO users (id, full_name, role) VALUES (existing, 'T User', 'consumer');
  END IF;

  BEGIN
    INSERT INTO users (id, full_name, role) VALUES (gen_random_uuid(), 'T Ghost', 'consumer');
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'ok: random uuid rejected by the FK';
    RETURN;
  END;
  RAISE EXCEPTION 'insert with a random uuid was accepted';
END $$;

ROLLBACK;
