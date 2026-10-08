-- Migration v9 : limitation de débit + approbation des abonnements.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

ALTER TABLE follows ADD COLUMN status TEXT NOT NULL DEFAULT 'accepted';
