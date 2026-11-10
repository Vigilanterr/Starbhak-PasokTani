-- Media cleanup needs two states that status = 'deleted' alone cannot tell apart:
--   status = 'deleted' and destroyed_at IS NULL  -> the parent is gone, the Cloudinary asset still has to be destroyed
--   status = 'deleted' and destroyed_at IS NOT NULL -> the asset is destroyed, nothing left to do
-- The cleanup job claims the first kind, calls Cloudinary, then stamps destroyed_at.

ALTER TABLE media_assets ADD COLUMN destroyed_at timestamptz;

ALTER TABLE media_assets ADD CONSTRAINT chk_destroyed_needs_deleted
  CHECK (destroyed_at IS NULL OR status = 'deleted');

CREATE INDEX media_assets_awaiting_destroy ON media_assets (created_at, id)
  WHERE status = 'deleted' AND destroyed_at IS NULL;

COMMENT ON COLUMN media_assets.destroyed_at IS 'Set after the Cloudinary asset was destroyed. status = deleted with this empty means the destroy is still due';
