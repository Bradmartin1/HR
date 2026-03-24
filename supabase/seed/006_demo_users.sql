-- =============================================================
-- SEED 006: Demo Users
-- NOTE: Auth users must be created via Supabase Auth Admin API
-- or Supabase Dashboard before running this seed.
-- This seed sets the correct roles for pre-created auth users.
--
-- Demo accounts (create in Supabase Auth first):
--   owner@rushtownpoultry.com      → owner role
--   hr@rushtownpoultry.com         → hr_manager role
--   prod.mgr@rushtownpoultry.com   → department_manager (Production)
--   proc.mgr@rushtownpoultry.com   → department_manager (Processing)
--   trans.mgr@rushtownpoultry.com  → department_manager (Transportation)
--   emp1@rushtownpoultry.com       → employee
--   executive@rushtownpoultry.com  → executive
-- =============================================================

-- Update roles for demo users (run after creating auth users)
-- Replace UUIDs with actual auth.users.id values from your Supabase project

-- Update full names for created demo users
UPDATE users SET full_name = 'Brad Martin',      is_active = true
  WHERE email = 'owner@rushtownpoultry.com';

UPDATE users SET full_name = 'Sarah Johnson',    role_id = (SELECT id FROM roles WHERE name = 'hr_manager'), is_active = true
  WHERE email = 'hr@rushtownpoultry.com';

UPDATE users SET full_name = 'Mike Davis',       role_id = (SELECT id FROM roles WHERE name = 'department_manager'), is_active = true
  WHERE email = 'prod.mgr@rushtownpoultry.com';

UPDATE users SET full_name = 'Lisa Chen',        role_id = (SELECT id FROM roles WHERE name = 'department_manager'), is_active = true
  WHERE email = 'proc.mgr@rushtownpoultry.com';

UPDATE users SET full_name = 'James Wilson',     role_id = (SELECT id FROM roles WHERE name = 'department_manager'), is_active = true
  WHERE email = 'trans.mgr@rushtownpoultry.com';

UPDATE users SET full_name = 'Test Employee',    role_id = (SELECT id FROM roles WHERE name = 'employee'), is_active = true
  WHERE email = 'emp1@rushtownpoultry.com';

UPDATE users SET full_name = 'Executive View',   role_id = (SELECT id FROM roles WHERE name = 'executive'), is_active = true
  WHERE email = 'executive@rushtownpoultry.com';

-- Assign owner role to owner user
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'owner')
  WHERE email = 'owner@rushtownpoultry.com';

-- Set up department managers
INSERT INTO department_managers (department_id, user_id, is_primary)
SELECT
  (SELECT id FROM departments WHERE code = 'PROD'),
  u.id,
  true
FROM users u WHERE u.email = 'prod.mgr@rushtownpoultry.com'
ON CONFLICT DO NOTHING;

INSERT INTO department_managers (department_id, user_id, is_primary)
SELECT
  (SELECT id FROM departments WHERE code = 'PROC'),
  u.id,
  true
FROM users u WHERE u.email = 'proc.mgr@rushtownpoultry.com'
ON CONFLICT DO NOTHING;

INSERT INTO department_managers (department_id, user_id, is_primary)
SELECT
  (SELECT id FROM departments WHERE code = 'TRANS'),
  u.id,
  true
FROM users u WHERE u.email = 'trans.mgr@rushtownpoultry.com'
ON CONFLICT DO NOTHING;
