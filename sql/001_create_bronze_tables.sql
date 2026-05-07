-- ─────────────────────────────────────────────
-- 001 – Bronze Layer: raw ingestion
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bronze_stock_quotes (
    id          BIGSERIAL PRIMARY KEY,
    raw_json    JSONB         NOT NULL,
    source      VARCHAR(64),
    topic       VARCHAR(128),
    ingest_time TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bronze_ingest_time ON bronze_stock_quotes (ingest_time DESC);
CREATE INDEX IF NOT EXISTS idx_bronze_source ON bronze_stock_quotes (source);
