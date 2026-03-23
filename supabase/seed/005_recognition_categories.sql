-- =============================================================
-- SEED 005: Recognition Categories & PTO Policies
-- =============================================================

INSERT INTO recognition_categories (name, icon, points) VALUES
  ('Safety Star',         '⭐', 3),
  ('Team Player',         '🤝', 2),
  ('Above & Beyond',      '🚀', 3),
  ('Perfect Attendance',  '📅', 2),
  ('Innovation',          '💡', 2),
  ('Customer First',      '🏆', 2),
  ('Mentor of the Month', '🎓', 3),
  ('Quick Learner',       '📚', 1)
ON CONFLICT (name) DO NOTHING;

-- Default PTO Policies
INSERT INTO pto_policies (name, department_id, accrual_type, annual_hours, carry_over_hours, max_accrual_hours, waiting_period_days, requires_approval, advance_request_days)
VALUES
  ('Standard PTO Policy',       NULL, 'annual', 80,  40,  120, 90,  true, 14),
  ('Transportation PTO Policy', (SELECT id FROM departments WHERE code='TRANS'), 'annual', 80, 40, 160, 90, true, 7)
ON CONFLICT DO NOTHING;

-- Document types
INSERT INTO document_types (name, is_sensitive, requires_ack) VALUES
  ('I-9 Employment Eligibility', true,  true),
  ('W-4 Tax Withholding',        true,  false),
  ('Offer Letter',               true,  true),
  ('Employee Handbook',          false, true),
  ('Safety Manual',              false, true),
  ('Non-Disclosure Agreement',   true,  true),
  ('Direct Deposit Form',        true,  false),
  ('Performance Review',         false, false),
  ('Write-Up / Disciplinary',    true,  true),
  ('CDL License',                false, false),
  ('Training Certificate',       false, false),
  ('Medical Certification',      true,  false),
  ('Other',                      false, false)
ON CONFLICT (name) DO NOTHING;

-- Global onboarding template
INSERT INTO onboarding_templates (name, department_id, job_title_id, is_active)
VALUES ('Standard New Hire Onboarding', NULL, NULL, true)
ON CONFLICT DO NOTHING;
