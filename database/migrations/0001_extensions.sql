CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- unaccent() is only STABLE; generated columns need IMMUTABLE.
CREATE FUNCTION public.f_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

-- array_to_string() is also only STABLE, so the search text is built behind one IMMUTABLE wrapper.
CREATE FUNCTION public.f_product_search_text(p_name text, p_alt_names text[], p_description text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT public.f_unaccent(p_name || ' ' || array_to_string(p_alt_names, ' ') || ' ' || coalesce(p_description, '')) $$;
