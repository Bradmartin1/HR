-- =============================================================
-- SEED 001: Roles
-- =============================================================

INSERT INTO roles (name, description) VALUES
  ('owner',              'Full system access including compensation, audit logs, and user management'),
  ('hr_manager',         'Full HR admin access, bulk upload, department configuration'),
  ('department_manager', 'Scoped to own department(s), can enter incidents and reviews'),
  ('employee',           'View own profile, onboarding tasks, PTO, schedule'),
  ('executive',          'Read-only access to selected dashboards')
ON CONFLICT (name) DO NOTHING;
