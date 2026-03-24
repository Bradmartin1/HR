-- =============================================================
-- MIGRATION 006: Documents & Acknowledgements
-- =============================================================

CREATE TABLE IF NOT EXISTS document_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  is_sensitive  BOOLEAN DEFAULT false,
  requires_ack  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type_id UUID REFERENCES document_types(id),
  name             TEXT NOT NULL,
  storage_path     TEXT NOT NULL,
  file_size        INTEGER,
  mime_type        TEXT,
  is_sensitive     BOOLEAN DEFAULT false,
  expiry_date      DATE,
  uploaded_by      UUID REFERENCES users(id),
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_docs_employee  ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_docs_type      ON employee_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_docs_expiry    ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS acknowledgements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES employee_documents(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address      TEXT,
  UNIQUE (document_id, employee_id)
);

CREATE TABLE IF NOT EXISTS attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  name         TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type    TEXT,
  file_size    INTEGER,
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
