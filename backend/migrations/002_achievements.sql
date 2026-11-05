-- Farmer achievements: status + indexes + realistic seed data

ALTER TABLE farmer_achievements
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACHIEVED';

DO $$
BEGIN
  ALTER TABLE farmer_achievements
    ADD CONSTRAINT farmer_achievements_status_check
    CHECK (status IN ('ACHIEVED', 'FEATURED', 'REVOKED'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_farmer_achievements_farmer
  ON farmer_achievements(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_achievements_attained
  ON farmer_achievements(attained_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_achievements_status
  ON farmer_achievements(status);

-- Seed data for existing farmers
INSERT INTO farmer_achievements (farmer_id, title, description, badge_icon, attained_at, status)
SELECT f.id, seed.title, seed.description, seed.badge_icon,
       CURRENT_TIMESTAMP - (seed.days_ago || ' days')::INTERVAL,
       seed.status
FROM (SELECT id FROM users WHERE role = 'FARMER') f
CROSS JOIN (VALUES
  ('Petani Teladan Kecamatan', 'Terpilih sebagai petani teladan karena konsistensi kualitas panen dan kepatuhan pada standar budidaya.', '🏆', 120, 'FEATURED'),
  ('Panen Raya Tiga Musim', 'Menyelesaikan tiga musim tanam berturut-turut dengan hasil panen di atas rata-rata daerah.', '🌾', 240, 'ACHIEVED'),
  ('Penerapan Pertanian Organik', 'Berhasil beralih ke pupuk organik dan pestisida nabati pada seluruh lahan produktif.', '🌱', 320, 'ACHIEVED'),
  ('Mitra Distributor Terverifikasi', 'Lolos verifikasi sebagai pemasok tetap untuk distributor regional PasokTani.', '🤝', 410, 'ACHIEVED'),
  ('Penjualan 10 Ton Komoditas', 'Mencatat total penjualan lebih dari 10 ton komoditas melalui platform PasokTani.', '📈', 90, 'ACHIEVED'),
  ('Pengelolaan Air Hemat', 'Menerapkan sistem irigasi tetes yang menghemat penggunaan air hingga 40 persen.', '💧', 180, 'ACHIEVED')
) AS seed(title, description, badge_icon, days_ago, status)
WHERE NOT EXISTS (
  SELECT 1 FROM farmer_achievements fa
  WHERE fa.farmer_id = f.id AND fa.title = seed.title
);