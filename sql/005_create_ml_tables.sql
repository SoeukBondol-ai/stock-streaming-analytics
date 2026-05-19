-- ─────────────────────────────────────────────
-- 005 – ML Layer: price direction predictions
-- ─────────────────────────────────────────────

-- Stores each prediction made by the ML model
CREATE TABLE IF NOT EXISTS ml_predictions (
    id              BIGSERIAL PRIMARY KEY,
    symbol          VARCHAR(16)    NOT NULL,
    prediction      VARCHAR(4)     NOT NULL,   -- 'UP' or 'DOWN'
    confidence      NUMERIC(5, 4)  NOT NULL,   -- e.g. 0.8700 = 87%
    price_at_pred   NUMERIC(18, 4),            -- price at time of prediction
    features        JSONB,                     -- features used (for explainability)
    model_version   VARCHAR(64),               -- which model made this prediction
    predicted_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_symbol      ON ml_predictions (symbol);
CREATE INDEX IF NOT EXISTS idx_ml_time        ON ml_predictions (predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_symbol_time ON ml_predictions (symbol, predicted_at DESC);

-- Stores model training run metadata (useful for school showcase)
CREATE TABLE IF NOT EXISTS ml_model_runs (
    id              BIGSERIAL PRIMARY KEY,
    model_version   VARCHAR(64)    NOT NULL,
    symbols_trained TEXT[]         NOT NULL,   -- which symbols were used
    total_rows      INTEGER        NOT NULL,   -- training data size
    accuracy        NUMERIC(5, 4)  NOT NULL,   -- e.g. 0.7210 = 72.1%
    top_feature     VARCHAR(64),               -- most important feature
    trained_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
