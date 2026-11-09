-- T1: every migration is recorded
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM schema_migrations;
  ASSERT n = 8, format('expected 8 rows in schema_migrations, got %s', n);
END $$;
