-- =============================================================
-- MIGRATION 017: Row Level Security Policies
-- CRITICAL: This is the security foundation of the entire app.
-- =============================================================

-- Helper: get calling user's role name
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT r.name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$;

-- Helper: get calling user's employee_id
CREATE OR REPLACE FUNCTION auth_employee_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1
$$;

-- Helper: get department_ids managed by calling user
CREATE OR REPLACE FUNCTION auth_managed_dept_ids()
RETURNS UUID[] LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(array_agg(department_id), '{}')
  FROM department_managers
  WHERE user_id = auth.uid()
$$;

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_records           ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_cycles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_ratings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_requests               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances               ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- users
-- ============================================================
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_select_hr"  ON users FOR SELECT USING (auth_role() IN ('owner','hr_manager'));
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_update_hr"  ON users FOR UPDATE USING (auth_role() IN ('owner','hr_manager'));

-- ============================================================
-- employees
-- ============================================================
CREATE POLICY "employees_select" ON employees FOR SELECT USING (
  deleted_at IS NULL
  AND (
    auth_role() IN ('owner', 'hr_manager', 'executive')
    OR (auth_role() = 'department_manager' AND department_id = ANY(auth_managed_dept_ids()))
    OR id = auth_employee_id()
  )
);

CREATE POLICY "employees_insert" ON employees FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "employees_update" ON employees FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR (auth_role() = 'department_manager' AND department_id = ANY(auth_managed_dept_ids()))
);

CREATE POLICY "employees_delete" ON employees FOR DELETE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- compensation_records (highly restricted)
-- ============================================================
CREATE POLICY "comp_select" ON compensation_records FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
);

CREATE POLICY "comp_insert" ON compensation_records FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "comp_update" ON compensation_records FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "comp_delete" ON compensation_records FOR DELETE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- employee_documents (two-tier: RLS + is_sensitive flag)
-- ============================================================
CREATE POLICY "docs_select" ON employee_documents FOR SELECT USING (
  deleted_at IS NULL
  AND (
    auth_role() IN ('owner', 'hr_manager')
    OR (
      auth_role() = 'department_manager'
      AND is_sensitive = false
      AND employee_id IN (
        SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
      )
    )
    OR (
      employee_id = auth_employee_id()
      AND is_sensitive = false
    )
  )
);

CREATE POLICY "docs_insert" ON employee_documents FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "docs_update" ON employee_documents FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- performance_reviews
-- ============================================================
CREATE POLICY "reviews_select" ON performance_reviews FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR reviewer_id = (SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1)
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "reviews_insert" ON performance_reviews FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "reviews_update" ON performance_reviews FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR reviewer_id = (SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1)
  OR (employee_id = auth_employee_id() AND status = 'submitted')  -- employee can acknowledge
);

-- ============================================================
-- recognition_events
-- ============================================================
CREATE POLICY "recognition_select" ON recognition_events FOR SELECT USING (
  is_public = true
  OR recipient_id = auth_employee_id()
  OR auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND recipient_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "recognition_insert" ON recognition_events FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager', 'department_manager')
);

-- ============================================================
-- strike_events
-- ============================================================
CREATE POLICY "strikes_select" ON strike_events FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "strikes_insert" ON strike_events FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND (SELECT department_id FROM employees WHERE id = employee_id) = ANY(auth_managed_dept_ids())
  )
);

CREATE POLICY "strikes_update" ON strike_events FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- disciplinary_actions
-- ============================================================
CREATE POLICY "disc_select" ON disciplinary_actions FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "disc_insert" ON disciplinary_actions FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- attendance_events
-- ============================================================
CREATE POLICY "attendance_select" ON attendance_events FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "attendance_insert" ON attendance_events FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND (SELECT department_id FROM employees WHERE id = employee_id) = ANY(auth_managed_dept_ids())
  )
);

-- ============================================================
-- pto_requests
-- ============================================================
CREATE POLICY "pto_requests_select" ON pto_requests FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "pto_requests_insert" ON pto_requests FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager', 'department_manager')
  OR employee_id = auth_employee_id()
);

CREATE POLICY "pto_requests_update" ON pto_requests FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
  OR (employee_id = auth_employee_id() AND status = 'pending')  -- employee can cancel own
);

-- ============================================================
-- pto_balances
-- ============================================================
CREATE POLICY "pto_balances_select" ON pto_balances FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "pto_balances_insert" ON pto_balances FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "pto_balances_update" ON pto_balances FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- schedules
-- ============================================================
CREATE POLICY "schedules_select" ON schedules FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "schedules_insert" ON schedules FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND (SELECT department_id FROM employees WHERE id = employee_id) = ANY(auth_managed_dept_ids())
  )
);

CREATE POLICY "schedules_update" ON schedules FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

-- ============================================================
-- employee_onboarding_progress
-- ============================================================
CREATE POLICY "onboarding_progress_select" ON employee_onboarding_progress FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "onboarding_progress_insert" ON employee_onboarding_progress FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND (SELECT department_id FROM employees WHERE id = employee_id) = ANY(auth_managed_dept_ids())
  )
);

CREATE POLICY "onboarding_progress_update" ON employee_onboarding_progress FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

-- ============================================================
-- goals
-- ============================================================
CREATE POLICY "goals_select" ON goals FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND (SELECT department_id FROM employees WHERE id = employee_id) = ANY(auth_managed_dept_ids())
  )
);

CREATE POLICY "goals_update" ON goals FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (
      SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids())
    )
  )
);

-- ============================================================
-- notifications (recipient-only)
-- ============================================================
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
  recipient_id = auth.uid()
);

CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (
  recipient_id = auth.uid()
);

CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager', 'department_manager')
  OR recipient_id = auth.uid()
);

-- ============================================================
-- notes (private flag check)
-- ============================================================
CREATE POLICY "notes_select" ON notes FOR SELECT USING (
  (is_private = false AND (
    auth_role() IN ('owner', 'hr_manager', 'department_manager')
    OR created_by = auth.uid()
  ))
  OR (is_private = true AND auth_role() IN ('owner', 'hr_manager'))
);

CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager', 'department_manager')
);

CREATE POLICY "notes_update" ON notes FOR UPDATE USING (
  created_by = auth.uid()
  OR auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- surveys
-- ============================================================
CREATE POLICY "surveys_select" ON surveys FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR (status = 'active' AND (
    target_audience = 'all'
    OR (target_audience = 'department' AND target_dept_id IN (
      SELECT department_id FROM employees WHERE user_id = auth.uid()
    ))
  ))
);

CREATE POLICY "surveys_insert" ON surveys FOR INSERT WITH CHECK (
  auth_role() IN ('owner', 'hr_manager')
);

CREATE POLICY "surveys_update" ON surveys FOR UPDATE USING (
  auth_role() IN ('owner', 'hr_manager')
);

-- ============================================================
-- survey_responses
-- ============================================================
CREATE POLICY "survey_responses_select" ON survey_responses FOR SELECT USING (
  auth_role() IN ('owner', 'hr_manager')
  OR (
    respondent_id = auth.uid()
    AND NOT (SELECT is_anonymous FROM surveys WHERE id = survey_id)
  )
);

CREATE POLICY "survey_responses_insert" ON survey_responses FOR INSERT WITH CHECK (
  -- anyone can respond to a survey they have access to
  survey_id IN (
    SELECT id FROM surveys WHERE status = 'active'
  )
);

-- ============================================================
-- Read-only tables (no RLS needed for public lookup data)
-- ============================================================
-- departments, locations, job_titles, roles, permissions,
-- strike_categories, strike_rules, recognition_categories,
-- pto_policies, shift_templates, onboarding_templates, onboarding_tasks,
-- performance_review_cycles, performance_review_templates,
-- trainings, training_assignments, training_completions,
-- document_types, employee_assignments, benefits_records
-- are readable by all authenticated users via Supabase service role
-- or via authenticated RLS SELECT policies below

CREATE POLICY "departments_select_auth"         ON departments             FOR SELECT TO authenticated USING (true);
CREATE POLICY "locations_select_auth"           ON locations               FOR SELECT TO authenticated USING (true);
CREATE POLICY "job_titles_select_auth"          ON job_titles              FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_select_auth"               ON roles                   FOR SELECT TO authenticated USING (true);
CREATE POLICY "strike_categories_select_auth"   ON strike_categories       FOR SELECT TO authenticated USING (true);
CREATE POLICY "strike_rules_select_auth"        ON strike_rules            FOR SELECT TO authenticated USING (true);
CREATE POLICY "recognition_cats_select_auth"    ON recognition_categories  FOR SELECT TO authenticated USING (true);
CREATE POLICY "pto_policies_select_auth"        ON pto_policies            FOR SELECT TO authenticated USING (true);
CREATE POLICY "shift_templates_select_auth"     ON shift_templates         FOR SELECT TO authenticated USING (true);
CREATE POLICY "onboarding_tmpls_select_auth"    ON onboarding_templates    FOR SELECT TO authenticated USING (true);
CREATE POLICY "onboarding_tasks_select_auth"    ON onboarding_tasks        FOR SELECT TO authenticated USING (true);
CREATE POLICY "review_cycles_select_auth"       ON performance_review_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "review_tmpls_select_auth"        ON performance_review_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_types_select_auth"      ON document_types          FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainings_select_auth"           ON trainings               FOR SELECT TO authenticated USING (true);
CREATE POLICY "training_assign_select_auth"     ON training_assignments    FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager', 'department_manager')
  OR employee_id = auth_employee_id()
);
CREATE POLICY "employee_assign_select_auth"     ON employee_assignments    FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
  OR (
    auth_role() = 'department_manager'
    AND employee_id IN (SELECT id FROM employees WHERE department_id = ANY(auth_managed_dept_ids()))
  )
);
CREATE POLICY "benefits_select_auth"            ON benefits_records        FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
);
CREATE POLICY "ack_select_auth"                 ON acknowledgements        FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager')
  OR employee_id = auth_employee_id()
);
CREATE POLICY "perf_ratings_select_auth"        ON performance_ratings     FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager')
  OR review_id IN (SELECT id FROM performance_reviews WHERE employee_id = auth_employee_id())
  OR review_id IN (SELECT id FROM performance_reviews WHERE reviewer_id = auth_employee_id())
);
CREATE POLICY "training_completions_select_auth" ON training_completions   FOR SELECT TO authenticated USING (
  auth_role() IN ('owner', 'hr_manager')
  OR assignment_id IN (SELECT id FROM training_assignments WHERE employee_id = auth_employee_id())
);

-- Enable RLS on lookup tables to apply the above policies
ALTER TABLE departments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_titles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_rules             ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_policies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_ratings      ENABLE ROW LEVEL SECURITY;
