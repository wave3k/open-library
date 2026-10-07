-- Migration v4 : état d'onboarding (les questions se posent sur une page dédiée, skippable).
ALTER TABLE users ADD COLUMN onboarded INTEGER NOT NULL DEFAULT 0;
