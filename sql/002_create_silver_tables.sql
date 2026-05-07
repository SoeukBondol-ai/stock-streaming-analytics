-- ─────────────────────────────────────────────
-- 002 – Silver Layer: cleaned / typed data
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS silver_stock_quotes (
    id          BIGSERIAL PRIMARY KEY,
    symbol      VARCHAR(16)     NOT NULL,
    price       NUMERIC(18, 4)  NOT NULL,
    open_price  NUMERIC(18, 4),
    high_price  NUMERIC(18, 4),
    low_price   NUMERIC(18, 4),
    volume      BIGINT,
    event_time  TIMESTAMPTZ     NOT NULL,
    source      VARCHAR(64),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_silver_symbol ON silver_stock_quotes (symbol);
CREATE INDEX IF NOT EXISTS idx_silver_event_time ON silver_stock_quotes (event_time DESC);
CREATE INDEX IF NOT EXISTS idx_silver_symbol_time ON silver_stock_quotes (symbol, event_time DESC);
