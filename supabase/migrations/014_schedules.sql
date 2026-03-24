-- =============================================================
-- MIGRATION 014: Schedules
-- =============================================================

CREATE TABLE IF NOT EXISTS shift_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  break_minutes INTEGER DEFAULT 30,
  days_of_week  INTEGER[] NOT NULL,  -- 0=Sun, 1=Mon … 6=Sat
  color         CHAR(7) DEFAULT '#3B82F6',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shift_templates_dept ON shift_templates(department_id);

CREATE TABLE IF NOT EXISTS schedules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID NOT NULL REFERENCES employees(id),
  shift_template_id UUID REFERENCES shift_templates(id),
  scheduled_date    DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  location_id       UUID REFERENCES locations(id),
  status            TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','swapped')),
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_employee ON schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date     ON schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_schedules_emp_date ON schedules(employee_id, scheduled_date);

CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
