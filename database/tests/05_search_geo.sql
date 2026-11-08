-- T5: synonym + trigram search and "near me". Everything rolls back.
BEGIN;

CREATE TEMP TABLE fx ON COMMIT DROP AS SELECT (SELECT id FROM neon_auth."user" ORDER BY id LIMIT 1) AS farmer;

INSERT INTO users (id, full_name, role) SELECT farmer, 'T Farmer', 'farmer' FROM fx;
INSERT INTO farmer_profiles (user_id, shop_name, slug, regency_code, district_code, location)
  SELECT farmer, 'T Shop', 't-shop', '32.04', (SELECT min(code) FROM districts WHERE regency_code = '32.04'),
         ST_SetSRID(ST_MakePoint(107.60, -6.90), 4326)::geography FROM fx;
INSERT INTO products (farmer_id, category_id, slug, name, unit, price)
  SELECT farmer, (SELECT id FROM categories WHERE slug = 'sayur'), 't-cabai', 'Cabai Rawit', 'kg', 1000 FROM fx;

DO $$
DECLARE q text; canonical text; n int;
BEGIN
  FOREACH q IN ARRAY ARRAY['cabe','cabai','chabai'] LOOP
    SELECT canonical_term INTO canonical FROM search_synonyms WHERE term = q;
    SELECT count(*) INTO n FROM products
    WHERE slug = 't-cabai' AND search_vector @@ to_tsquery('simple', f_unaccent(coalesce(canonical, q)) || ':*');
    ASSERT n = 1, format('search for %s did not find the product', q);
  END LOOP;

  SELECT count(*) INTO n FROM products WHERE slug = 't-cabai' AND word_similarity('chabai', name) > 0.3;
  ASSERT n = 1, 'trigram fallback did not match chabai';

  SELECT count(*) INTO n FROM farmer_profiles
  WHERE slug = 't-shop' AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(107.61, -6.91), 4326)::geography, 5000);
  ASSERT n = 1, 'near-me query did not return the farmer';

  SELECT count(*) INTO n FROM farmer_profiles
  WHERE slug = 't-shop' AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(106.80, -6.20), 4326)::geography, 5000);
  ASSERT n = 0, 'near-me query returned a farmer outside the radius';
END $$;

ROLLBACK;
