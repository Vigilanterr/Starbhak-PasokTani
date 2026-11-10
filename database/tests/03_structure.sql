-- T3: structure matches schema v2.2
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace s ON s.oid = c.relnamespace
  WHERE s.nspname = 'public' AND c.relkind IN ('r','p') AND NOT c.relispartition
    AND c.relname NOT IN ('schema_migrations','spatial_ref_sys');
  ASSERT n = 61, format('expected 61 app tables, got %s', n);

  SELECT count(*) INTO n FROM pg_type t JOIN pg_namespace s ON s.oid = t.typnamespace
  WHERE s.nspname = 'public' AND t.typtype = 'e';
  ASSERT n = 32, format('expected 32 enums, got %s', n);

  SELECT count(*) INTO n FROM pg_extension WHERE extname IN ('pg_trgm','unaccent','postgis','btree_gist');
  ASSERT n = 4, format('expected 4 extensions, got %s', n);

  SELECT count(*) INTO n FROM pg_tables WHERE schemaname = 'public' AND tablename IN
    ('commodities','chat_rooms','chat_messages','negotiation_offers','wishlist_items','admin_activity_logs',
     'contact_messages','farmer_achievements','farmer_notes','sales_targets','preorders','support_tickets');
  ASSERT n = 0, format('%s legacy tables remain', n);

  SELECT count(*) INTO n FROM pg_type t JOIN pg_namespace s ON s.oid = t.typnamespace
  WHERE s.nspname = 'public' AND t.typname IN
    ('commodity_status','chat_message_type','negotiation_status','chat_room_status',
     'wishlist_transaction_type','contact_message_status','business_type','demand_scale');
  ASSERT n = 0, format('%s legacy enums remain', n);

  SELECT count(*) INTO n FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'consumer';
  ASSERT n = 1, 'user_role is not the v2 enum';

  SELECT count(*) INTO n FROM pg_constraint
  WHERE contype = 'f' AND conrelid = 'users'::regclass AND confrelid = 'neon_auth."user"'::regclass;
  ASSERT n = 1, 'FK users.id -> neon_auth."user"(id) is missing';

  SELECT count(*) INTO n FROM pg_class WHERE oid = 'audit_logs'::regclass AND relkind = 'p';
  ASSERT n = 1, 'audit_logs is not partitioned';

  SELECT count(*) INTO n FROM regencies;
  ASSERT n = 27, format('expected 27 regencies, got %s', n);
  SELECT count(*) INTO n FROM districts;
  ASSERT n = 627, format('expected 627 districts, got %s', n);
  SELECT count(*) INTO n FROM badges;
  ASSERT n = 7, format('expected 7 badges, got %s', n);
END $$;
