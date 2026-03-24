-- =============================================================
-- SEED 002: Departments & Locations
-- =============================================================

INSERT INTO locations (name, type, address) VALUES
  ('Barn Complex A',    'chicken_house',    '1200 Poultry Farm Rd, Rushtown, TN 37701'),
  ('Barn Complex B',    'chicken_house',    '1250 Poultry Farm Rd, Rushtown, TN 37701'),
  ('Processing Plant',  'processing_plant', '500 Industrial Blvd, Rushtown, TN 37701'),
  ('Main Office',       'office',           '100 Corporate Dr, Rushtown, TN 37701'),
  ('Fleet Yard',        'fleet',            '300 Transport Way, Rushtown, TN 37701'),
  ('Maintenance Shop',  'maintenance',      '600 Industrial Blvd, Rushtown, TN 37701')
ON CONFLICT DO NOTHING;

INSERT INTO departments (name, code, location_id, default_shift_hours) VALUES
  ('Production',     'PROD',  (SELECT id FROM locations WHERE name = 'Barn Complex A' LIMIT 1),   8),
  ('Processing',     'PROC',  (SELECT id FROM locations WHERE name = 'Processing Plant' LIMIT 1),  8),
  ('Transportation', 'TRANS', (SELECT id FROM locations WHERE name = 'Fleet Yard' LIMIT 1),        10),
  ('Accounting',     'ACCT',  (SELECT id FROM locations WHERE name = 'Main Office' LIMIT 1),       8),
  ('Maintenance',    'MAINT', (SELECT id FROM locations WHERE name = 'Maintenance Shop' LIMIT 1),  8)
ON CONFLICT (name) DO NOTHING;
