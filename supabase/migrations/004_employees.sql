-- =============================================================
-- MIGRATION 004: Employees
-- =============================================================

CREATE TABLE IF NOT EXISTS employees (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  employee_number          TEXT NOT NULL UNIQUE,
  -- Personal
  first_name               TEXT NOT NULL,
  last_name                TEXT NOT NULL,
  preferred_name           TEXT,
  date_of_birth            DATE,
  ssn_last4                CHAR(4),
  gender                   TEXT,
  ethnicity                TEXT,
  -- Contact
  personal_email           TEXT,
  personal_phone           TEXT,
  work_email               TEXT,
  work_phone               TEXT,
  emergency_contact_name   TEXT,
  emergency_contact_phone  TEXT,
  emergency_contact_rel    TEXT,
  -- Address
  address_line1            TEXT,
  address_line2            TEXT,
  city                     TEXT,
  state                    TEXT,
  zip                      TEXT,
  -- Employment
  department_id            UUID REFERENCES departments(id),
  job_title_id             UUID REFERENCES job_titles(id),
  location_id              UUID REFERENCES locations(id),
  manager_id               UUID REFERENCES employees(id),
  employment_type          TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time','part_time','contractor','seasonal')),
  status                   TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','terminated','on_leave')),
  hire_date                DATE NOT NULL,
  termination_date         DATE,
  termination_reason       TEXT,
  rehire_eligible          BOOLEAN,
  -- Driver
  is_driver                BOOLEAN DEFAULT false,
  cdl_expiry               DATE,
  -- Audit
  created_by               UUID REFERENCES users(id),
  deleted_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_dept     ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager  ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status   ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_user     ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_hire     ON employees(hire_date);

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Employee assignment history
CREATE TABLE IF NOT EXISTS employee_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  job_title_id  UUID REFERENCES job_titles(id),
  location_id   UUID REFERENCES locations(id),
  effective_date DATE NOT NULL,
  end_date      DATE,
  change_reason TEXT,
  changed_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_employee ON employee_assignments(employee_id);
