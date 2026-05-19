"""
WHAT THIS DOES:
  1. Loads the trained model from disk (saved by train.py)
  2. Every N seconds, queries the latest Gold data per symbol
  3. Computes the same features used during training
  4. Predicts UP or DOWN for each symbol
  5. Saves predictions to ml_predictions table (read by the FastAPI backend)

HOW TO READ THE OUTPUT:
  Each row in ml_predictions contains:
    - symbol      : e.g. "AAPL"
    - prediction  : "UP" or "DOWN"
    - confidence  : 0.0 – 1.0  (e.g. 0.87 = model is 87% sure)
    - features    : the exact numbers the model used (for showcase/debugging)
    - predicted_at: when the prediction was made

RUN:
  python predict.py
"""

import os
import sys
import json
import time
import logging
from pathlib import Path

import numpy as np
import psycopg2
import joblib

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("ml.predict")

DB_CONFIG = {
    "host":     os.getenv("POSTGRES_HOST",     "postgres"),
    "port":     int(os.getenv("POSTGRES_PORT", "5432")),
    "dbname":   os.getenv("POSTGRES_DB",       "stockdb"),
    "user":     os.getenv("POSTGRES_USER",     "stockuser"),
    "password": os.getenv("POSTGRES_PASSWORD", "stockpass"),
}

MODEL_PATH         = Path(os.getenv("MODEL_DIR", "/ml/model")) / "price_direction_model.pkl"
PREDICT_INTERVAL   = int(os.getenv("PREDICT_INTERVAL_SECONDS", "30"))  # predict every 30s
STARTUP_WAIT       = int(os.getenv("STARTUP_WAIT_SECONDS", "60"))       # wait for training first


# ─────────────────────────────────────────────────────────────────────────────
# Load model
# ─────────────────────────────────────────────────────────────────────────────
def load_model():
    """Load the saved model artifact from disk."""
    if not MODEL_PATH.exists():
        log.error(f"Model not found at {MODEL_PATH}. Run train.py first!")
        return None, None, None

    artifact      = joblib.load(MODEL_PATH)
    model         = artifact["model"]
    version       = artifact["version"]
    features      = artifact["features"]
    log.info(f"Model loaded: {version}  (features: {features})")
    return model, version, features


# ─────────────────────────────────────────────────────────────────────────────
# Build features for latest data (same as train.py)
# ─────────────────────────────────────────────────────────────────────────────
def get_latest_features(conn, symbol: str, feature_columns: list):
    """
    Query the latest row from fact_stock_price for a given symbol
    and compute the same features used during training.

    Returns: (feature_values, price, feature_dict_for_display)
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT price, pct_change, moving_avg_5, moving_avg_20, volatility, volume
            FROM fact_stock_price
            WHERE symbol = %s
              AND pct_change    IS NOT NULL
              AND moving_avg_5  IS NOT NULL
              AND moving_avg_20 IS NOT NULL
            ORDER BY event_time DESC
            LIMIT 1
        """, (symbol,))
        row = cur.fetchone()

    if not row:
        return None, None, None

    price, pct_change, ma5, ma20, volatility, volume = row

    # Engineered features (same as train.py)
    ma_ratio     = float(ma5)  / float(ma20)  if ma20 else None
    price_vs_ma5 = (float(price) - float(ma5)) / float(ma5) if ma5 else None

    if ma_ratio is None or price_vs_ma5 is None:
        return None, None, None

    feature_dict = {
        "pct_change":    float(pct_change)   if pct_change   else 0.0,
        "moving_avg_5":  float(ma5)          if ma5          else 0.0,
        "moving_avg_20": float(ma20)         if ma20         else 0.0,
        "ma_ratio":      ma_ratio,
        "price_vs_ma5":  price_vs_ma5,
        "volatility":    float(volatility)   if volatility   else 0.0,
        "volume":        float(volume)       if volume       else 0.0,
    }

    # Build feature array in the exact order the model expects
    feature_values = [feature_dict[col] for col in feature_columns]
    return feature_values, float(price), feature_dict


# ─────────────────────────────────────────────────────────────────────────────
# Save predictions to database
# ─────────────────────────────────────────────────────────────────────────────
def save_predictions(conn, predictions: list):
    """Insert all predictions for this batch into ml_predictions."""
    if not predictions:
        return

    with conn:
        with conn.cursor() as cur:
            cur.executemany("""
                INSERT INTO ml_predictions
                    (symbol, prediction, confidence, price_at_pred, features, model_version)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, predictions)


# ─────────────────────────────────────────────────────────────────────────────
# Get all tracked symbols
# ─────────────────────────────────────────────────────────────────────────────
def get_symbols(conn) -> list:
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT symbol FROM fact_stock_price ORDER BY symbol")
        return [row[0] for row in cur.fetchall()]


# ─────────────────────────────────────────────────────────────────────────────
# One prediction round
# ─────────────────────────────────────────────────────────────────────────────
def run_predictions(model, version, feature_columns):
    """Predict direction for all symbols and save to database."""
    conn = psycopg2.connect(**DB_CONFIG)
    symbols = get_symbols(conn)

    if not symbols:
        log.warning("No symbols found in fact_stock_price yet — waiting for Spark data...")
        conn.close()
        return

    predictions = []
    results_log = []

    for symbol in symbols:
        feature_values, price, feature_dict = get_latest_features(conn, symbol, feature_columns)

        if feature_values is None:
            continue

        # Predict
        proba      = model.predict_proba([feature_values])[0]  # [P(DOWN), P(UP)]
        pred_class = int(model.predict([feature_values])[0])   # 0=DOWN, 1=UP
        label      = "UP" if pred_class == 1 else "DOWN"
        confidence = float(proba[pred_class])

        predictions.append((
            symbol,
            label,
            confidence,
            price,
            json.dumps(feature_dict),
            version,
        ))

        arrow = "↑" if label == "UP" else "↓"
        results_log.append(f"{symbol}: {arrow} {label} ({confidence:.0%})")

    save_predictions(conn, predictions)
    conn.close()

    log.info(f"Predictions saved ({len(predictions)} symbols): {' | '.join(results_log)}")


# ─────────────────────────────────────────────────────────────────────────────
# Main loop
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("=" * 50)
    log.info(" Price Direction Prediction Service Starting")
    log.info("=" * 50)

    # Wait for training to finish on first startup
    log.info(f"Waiting {STARTUP_WAIT}s for training to complete...")
    time.sleep(STARTUP_WAIT)

    model, version, feature_columns = load_model()
    if model is None:
        log.error("Cannot start prediction service — no model found. Exiting.")
        sys.exit(1)

    log.info(f"Predicting every {PREDICT_INTERVAL}s. Press Ctrl+C to stop.")

    while True:
        try:
            run_predictions(model, version, feature_columns)
        except Exception as e:
            log.error(f"Prediction error: {e}")

        time.sleep(PREDICT_INTERVAL)
