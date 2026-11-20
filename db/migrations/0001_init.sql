CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  respin_active INTEGER NOT NULL DEFAULT 0,
  respin_replicas INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS preset_entries (
  id TEXT PRIMARY KEY,
  preset_id TEXT NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  replicas INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_preset_entries_preset_order
  ON preset_entries (preset_id, sort_order);
