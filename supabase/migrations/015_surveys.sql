-- =============================================================
-- MIGRATION 015: Surveys & Feedback
-- =============================================================

CREATE TABLE IF NOT EXISTS surveys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  questions       JSONB NOT NULL DEFAULT '[]',  -- [{id, text, type, options[], required}]
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','department','role')),
  target_dept_id  UUID REFERENCES departments(id),
  is_anonymous    BOOLEAN DEFAULT true,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  opens_at        TIMESTAMPTZ,
  closes_at       TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_surveys_status   ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_closes   ON surveys(closes_at) WHERE status = 'active';

CREATE TRIGGER trg_surveys_updated_at
  BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS survey_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES users(id),  -- NULL if anonymous
  answers       JSONB NOT NULL DEFAULT '{}',
  submitted_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey    ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_respondent ON survey_responses(respondent_id) WHERE respondent_id IS NOT NULL;
