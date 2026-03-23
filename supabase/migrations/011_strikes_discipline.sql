-- =============================================================
-- MIGRATION 011: Strikes & Discipline
-- =============================================================

CREATE TABLE IF NOT EXISTS strike_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strike_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id    UUID REFERENCES departments(id),  -- NULL = global rule
  category_id      UUID REFERENCES strike_categories(id),
  level            INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  trigger_count    INTEGER NOT NULL,
  window_days      INTEGER,  -- NULL = lifetime
  action_required  TEXT CHECK (action_required IN ('verbal_warning','written_warning','suspension','termination')),
  notify_roles     TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strike_rules_dept ON strike_rules(department_id);
CREATE INDEX IF NOT EXISTS idx_strike_rules_cat  ON strike_rules(category_id);

CREATE TABLE IF NOT EXISTS strike_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id),
  category_id   UUID NOT NULL REFERENCES strike_categories(id),
  incident_date DATE NOT NULL,
  description   TEXT NOT NULL,
  level         INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  issued_by     UUID NOT NULL REFERENCES users(id),
  approved_by   UUID REFERENCES users(id),
  approved_at   TIMESTAMPTZ,
  voided        BOOLEAN DEFAULT false,
  voided_reason TEXT,
  voided_by     UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strikes_employee ON strike_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_strikes_incident ON strike_events(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_strikes_active   ON strike_events(employee_id, voided) WHERE voided = false;

CREATE TABLE IF NOT EXISTS disciplinary_actions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strike_event_id          UUID REFERENCES strike_events(id),
  employee_id              UUID NOT NULL REFERENCES employees(id),
  action_type              TEXT NOT NULL CHECK (action_type IN ('verbal_warning','written_warning','pip','suspension','termination')),
  effective_date           DATE NOT NULL,
  end_date                 DATE,
  details                  TEXT,
  document_path            TEXT,
  issued_by                UUID NOT NULL REFERENCES users(id),
  employee_acknowledged_at TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disc_actions_employee ON disciplinary_actions(employee_id);

-- Add FK to departments.strike_policy_id
ALTER TABLE departments
  ADD CONSTRAINT fk_dept_strike_policy
    FOREIGN KEY (strike_policy_id) REFERENCES strike_rules(id) ON DELETE SET NULL;
