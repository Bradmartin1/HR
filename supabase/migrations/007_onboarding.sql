-- =============================================================
-- MIGRATION 007: Onboarding
-- =============================================================

CREATE TABLE IF NOT EXISTS onboarding_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),  -- NULL = global
  job_title_id  UUID REFERENCES job_titles(id),    -- NULL = any title
  is_active     BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_onboarding_tmpl_updated_at
  BEFORE UPDATE ON onboarding_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id       UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  task_type         TEXT DEFAULT 'checkbox' CHECK (task_type IN ('checkbox','document_upload','form_fill','acknowledgement')),
  document_type_id  UUID REFERENCES document_types(id),
  assigned_to_role  TEXT CHECK (assigned_to_role IN ('employee','hr_manager','department_manager')),
  due_days_from_hire INTEGER DEFAULT 0,
  order_index       INTEGER DEFAULT 0,
  is_required       BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_tmpl ON onboarding_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_order ON onboarding_tasks(template_id, order_index);

CREATE TABLE IF NOT EXISTS employee_onboarding_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','waived')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_emp  ON employee_onboarding_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_task ON employee_onboarding_progress(task_id);

CREATE TRIGGER trg_onboarding_progress_updated_at
  BEFORE UPDATE ON employee_onboarding_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
