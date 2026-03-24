-- =============================================================
-- MIGRATION 013: PTO
-- =============================================================

CREATE TABLE IF NOT EXISTS pto_policies (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  department_id        UUID REFERENCES departments(id),  -- NULL = global
  accrual_type         TEXT DEFAULT 'annual' CHECK (accrual_type IN ('annual','per_pay_period','tenure_based')),
  annual_hours         NUMERIC(6,2),
  carry_over_hours     NUMERIC(6,2) DEFAULT 0,
  max_accrual_hours    NUMERIC(6,2),
  waiting_period_days  INTEGER DEFAULT 90,
  requires_approval    BOOLEAN DEFAULT true,
  advance_request_days INTEGER DEFAULT 14,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_pto_policies_updated_at
  BEFORE UPDATE ON pto_policies FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add FK to departments.pto_policy_id
ALTER TABLE departments
  ADD CONSTRAINT fk_dept_pto_policy
    FOREIGN KEY (pto_policy_id) REFERENCES pto_policies(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS pto_balances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  policy_id     UUID REFERENCES pto_policies(id),
  pto_type      TEXT NOT NULL CHECK (pto_type IN ('vacation','sick','personal','bereavement','maternity','paternity')),
  balance_hours NUMERIC(8,2) DEFAULT 0,
  used_hours    NUMERIC(8,2) DEFAULT 0,
  accrued_hours NUMERIC(8,2) DEFAULT 0,
  year          INTEGER NOT NULL,
  last_accrual  DATE,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, pto_type, year)
);

CREATE INDEX IF NOT EXISTS idx_pto_balances_employee ON pto_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_balances_year     ON pto_balances(year);

CREATE TRIGGER trg_pto_balances_updated_at
  BEFORE UPDATE ON pto_balances FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS pto_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  pto_type        TEXT NOT NULL CHECK (pto_type IN ('vacation','sick','personal','bereavement','maternity','paternity')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  hours_requested NUMERIC(6,2) NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','cancelled')),
  notes           TEXT,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pto_requests_employee ON pto_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_requests_status   ON pto_requests(status);
CREATE INDEX IF NOT EXISTS idx_pto_requests_dates    ON pto_requests(start_date, end_date);

CREATE TRIGGER trg_pto_requests_updated_at
  BEFORE UPDATE ON pto_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
