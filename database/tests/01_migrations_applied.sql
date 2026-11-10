-- T1: every migration is recorded
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM schema_migrations;
  ASSERT n = 9, format('expected 9 rows in schema_migrations, got %s', n);
END $$;
