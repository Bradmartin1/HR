-- =============================================================
-- MIGRATION 005: Compensation & Benefits
-- =============================================================

CREATE TABLE IF NOT EXISTS compensation_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_type        TEXT NOT NULL CHECK (pay_type IN ('hourly','salary','salary_exempt')),
  amount          NUMERIC(12,4) NOT NULL,
  currency        CHAR(3) DEFAULT 'USD',
  effective_date  DATE NOT NULL,
  end_date        DATE,
  change_reason   TEXT,
  approved_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comp_employee ON compensation_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_comp_effective ON compensation_records(effective_date DESC);

CREATE TABLE IF NOT EXISTS benefits_records (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id            UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  benefit_type           TEXT NOT NULL CHECK (benefit_type IN ('health','dental','vision','401k','life','other')),
  plan_name              TEXT,
  enrollment_date        DATE,
  end_date               DATE,
  employee_contribution  NUMERIC(10,2),
  employer_contribution  NUMERIC(10,2),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_benefits_employee ON benefits_records(employee_id);

CREATE TRIGGER trg_benefits_updated_at
  BEFORE UPDATE ON benefits_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();
