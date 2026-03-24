-- =============================================================
-- SEED 003: Job Titles
-- =============================================================

-- Production
INSERT INTO job_titles (title, department_id, pay_grade) VALUES
  ('Poultry Technician',      (SELECT id FROM departments WHERE code='PROD'), 'P1'),
  ('Senior Poultry Tech',     (SELECT id FROM departments WHERE code='PROD'), 'P2'),
  ('Barn Supervisor',         (SELECT id FROM departments WHERE code='PROD'), 'P3'),
  ('Flock Manager',           (SELECT id FROM departments WHERE code='PROD'), 'P4')
ON CONFLICT DO NOTHING;

-- Processing
INSERT INTO job_titles (title, department_id, pay_grade) VALUES
  ('Line Worker',             (SELECT id FROM departments WHERE code='PROC'), 'L1'),
  ('Line Lead',               (SELECT id FROM departments WHERE code='PROC'), 'L2'),
  ('QA Inspector',            (SELECT id FROM departments WHERE code='PROC'), 'L2'),
  ('Processing Supervisor',   (SELECT id FROM departments WHERE code='PROC'), 'L3'),
  ('Plant Foreman',           (SELECT id FROM departments WHERE code='PROC'), 'L4')
ON CONFLICT DO NOTHING;

-- Transportation
INSERT INTO job_titles (title, department_id, pay_grade) VALUES
  ('CDL Driver',              (SELECT id FROM departments WHERE code='TRANS'), 'T1'),
  ('Driver Lead',             (SELECT id FROM departments WHERE code='TRANS'), 'T2'),
  ('Dispatch Coordinator',    (SELECT id FROM departments WHERE code='TRANS'), 'T2'),
  ('Fleet Supervisor',        (SELECT id FROM departments WHERE code='TRANS'), 'T3')
ON CONFLICT DO NOTHING;

-- Accounting
INSERT INTO job_titles (title, department_id, pay_grade) VALUES
  ('Accounts Payable Clerk',  (SELECT id FROM departments WHERE code='ACCT'), 'A1'),
  ('Payroll Specialist',      (SELECT id FROM departments WHERE code='ACCT'), 'A2'),
  ('Staff Accountant',        (SELECT id FROM departments WHERE code='ACCT'), 'A2'),
  ('Accounting Manager',      (SELECT id FROM departments WHERE code='ACCT'), 'A4')
ON CONFLICT DO NOTHING;

-- Maintenance
INSERT INTO job_titles (title, department_id, pay_grade) VALUES
  ('Maintenance Technician',  (SELECT id FROM departments WHERE code='MAINT'), 'M1'),
  ('Electrician',             (SELECT id FROM departments WHERE code='MAINT'), 'M2'),
  ('Maintenance Lead',        (SELECT id FROM departments WHERE code='MAINT'), 'M3'),
  ('Facilities Manager',      (SELECT id FROM departments WHERE code='MAINT'), 'M4')
ON CONFLICT DO NOTHING;
