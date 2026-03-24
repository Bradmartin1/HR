-- =============================================================
-- MIGRATION 012: Attendance / Incidents
-- =============================================================

CREATE TABLE IF NOT EXISTS attendance_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id),
  event_date   DATE NOT NULL,
  event_type   TEXT NOT NULL CHECK (event_type IN ('present','absent','tardy','early_leave','no_call_no_show','excused')),
  minutes_late INTEGER,
  hours_missed NUMERIC(4,2),
  notes        TEXT,
  entered_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date     ON attendance_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_type     ON attendance_events(event_type);
