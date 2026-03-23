-- =============================================================
-- MIGRATION 003: Departments & Job Titles
-- =============================================================

CREATE TABLE IF NOT EXISTS departments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL UNIQUE,
  code                 TEXT NOT NULL UNIQUE,
  location_id          UUID REFERENCES locations(id),
  strike_policy_id     UUID,   -- FK added in migration 011
  pto_policy_id        UUID,   -- FK added in migration 013
  default_shift_hours  NUMERIC(4,2) DEFAULT 8,
  is_active            BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS department_managers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_primary    BOOLEAN DEFAULT false,
  assigned_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (department_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dept_managers_dept ON department_managers(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_managers_user ON department_managers(user_id);

CREATE TABLE IF NOT EXISTS job_titles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  pay_grade     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_titles_dept ON job_titles(department_id);
