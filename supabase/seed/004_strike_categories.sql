-- =============================================================
-- SEED 004: Strike Categories & Default Rules
-- =============================================================

INSERT INTO strike_categories (name, code, description) VALUES
  ('Tardy',             'TARDY',           'Late arrival without prior notice'),
  ('Absent',            'ABSENT',          'Unexcused absence'),
  ('No Call / No Show', 'NCNS',            'Failed to show up or call in'),
  ('Insubordination',   'INSUBORDINATION', 'Refusal to follow reasonable instructions'),
  ('Safety Violation',  'SAFETY',          'Violation of safety procedures or protocols'),
  ('Policy Violation',  'POLICY',          'Violation of company policy'),
  ('Performance Issue', 'PERFORMANCE',     'Repeated performance below expectations')
ON CONFLICT (code) DO NOTHING;

-- Global default strike rules (department_id = NULL means applies to all)
INSERT INTO strike_rules (department_id, category_id, level, trigger_count, window_days, action_required, notify_roles) VALUES
  -- Tardy: 3=verbal, 5=written, 8=final, 12=termination (rolling 90 days)
  (NULL, (SELECT id FROM strike_categories WHERE code='TARDY'), 1, 3,  90, 'verbal_warning',  '{"hr_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='TARDY'), 2, 5,  90, 'written_warning', '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='TARDY'), 3, 8,  90, 'suspension',      '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='TARDY'), 4, 12, 90, 'termination',     '{"hr_manager","owner"}'),

  -- Absent: faster escalation
  (NULL, (SELECT id FROM strike_categories WHERE code='ABSENT'), 1, 2,  90, 'verbal_warning',  '{"hr_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='ABSENT'), 2, 4,  90, 'written_warning', '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='ABSENT'), 3, 6,  90, 'suspension',      '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='ABSENT'), 4, 8,  90, 'termination',     '{"hr_manager","owner"}'),

  -- No Call / No Show: immediate escalation
  (NULL, (SELECT id FROM strike_categories WHERE code='NCNS'), 1, 1, NULL, 'written_warning', '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='NCNS'), 2, 2, NULL, 'suspension',      '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='NCNS'), 3, 3, NULL, 'termination',     '{"hr_manager","owner"}'),

  -- Safety / Insubordination: single event escalation
  (NULL, (SELECT id FROM strike_categories WHERE code='SAFETY'), 1, 1, NULL, 'written_warning', '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='SAFETY'), 2, 2, NULL, 'suspension',      '{"hr_manager","owner"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='SAFETY'), 3, 3, NULL, 'termination',     '{"hr_manager","owner"}'),

  (NULL, (SELECT id FROM strike_categories WHERE code='INSUBORDINATION'), 1, 1, NULL, 'written_warning', '{"hr_manager","department_manager"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='INSUBORDINATION'), 2, 2, NULL, 'suspension',      '{"hr_manager","owner"}'),
  (NULL, (SELECT id FROM strike_categories WHERE code='INSUBORDINATION'), 3, 3, NULL, 'termination',     '{"hr_manager","owner"}')
ON CONFLICT DO NOTHING;
