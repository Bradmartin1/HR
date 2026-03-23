-- =============================================================
-- MIGRATION 008: Training
-- =============================================================

CREATE TABLE IF NOT EXISTS trainings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  department_id   UUID REFERENCES departments(id),
  is_required     BOOLEAN DEFAULT false,
  renewal_months  INTEGER,  -- NULL = no renewal required
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID NOT NULL REFERENCES trainings(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  due_date    DATE,
  assigned_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (training_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_training_assign_emp ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_assign_trn ON training_assignments(training_id);

CREATE TABLE IF NOT EXISTS training_completions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id    UUID NOT NULL REFERENCES training_assignments(id),
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ,
  score            NUMERIC(5,2),
  certificate_path TEXT,
  verified_by      UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_training_completions_assign ON training_completions(assignment_id);
