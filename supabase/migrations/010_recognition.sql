-- =============================================================
-- MIGRATION 010: Recognition
-- =============================================================

CREATE TABLE IF NOT EXISTS recognition_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  points     INTEGER DEFAULT 1,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recognition_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES employees(id),
  giver_id     UUID NOT NULL REFERENCES users(id),
  category_id  UUID NOT NULL REFERENCES recognition_categories(id),
  message      TEXT,
  points       INTEGER DEFAULT 1,
  is_public    BOOLEAN DEFAULT true,
  approved_by  UUID REFERENCES users(id),
  approved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recognition_recipient ON recognition_events(recipient_id);
CREATE INDEX IF NOT EXISTS idx_recognition_giver     ON recognition_events(giver_id);
CREATE INDEX IF NOT EXISTS idx_recognition_created   ON recognition_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recognition_public    ON recognition_events(is_public, created_at DESC);
