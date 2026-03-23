-- =============================================================
-- MIGRATION 009: Performance Reviews
-- =============================================================

CREATE TABLE IF NOT EXISTS performance_review_cycles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  cycle_type    TEXT NOT NULL CHECK (cycle_type IN ('annual','semi_annual','quarterly','90_day','probationary')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','completed','archived')),
  department_id UUID REFERENCES departments(id),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_cycles_status ON performance_review_cycles(status);
CREATE INDEX IF NOT EXISTS idx_review_cycles_dept   ON performance_review_cycles(department_id);

CREATE TRIGGER trg_review_cycles_updated_at
  BEFORE UPDATE ON performance_review_cycles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS performance_review_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  questions     JSONB NOT NULL DEFAULT '[]',  -- [{id, text, type, weight}]
  scale_min     INTEGER DEFAULT 1,
  scale_max     INTEGER DEFAULT 5,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID NOT NULL REFERENCES performance_review_cycles(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  reviewer_id     UUID NOT NULL REFERENCES employees(id),
  template_id     UUID REFERENCES performance_review_templates(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','acknowledged','finalized')),
  overall_rating  NUMERIC(3,2),
  responses       JSONB DEFAULT '{}',
  manager_notes   TEXT,
  employee_notes  TEXT,
  acknowledged_at TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cycle_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_cycle    ON performance_reviews(cycle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status   ON performance_reviews(status);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS performance_ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  score      NUMERIC(3,2) NOT NULL,
  weight     NUMERIC(4,2) DEFAULT 1.0,
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_review ON performance_ratings(review_id);

CREATE TABLE IF NOT EXISTS goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id),
  review_id    UUID REFERENCES performance_reviews(id),
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     DATE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_employee ON goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_goals_review   ON goals(review_id);

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
