"""
WHAT THIS DOES:
  Trains a Random Forest model to predict whether the next stock price tick
  will go UP or DOWN, using features from the Gold layer (fact_stock_price).

FEATURES USED (all from fact_stock_price):
  - pct_change    : % price move from previous tick  → momentum signal
  - moving_avg_5  : 5-tick moving average            → short-term trend
  - moving_avg_20 : 20-tick moving average           → long-term trend
  - ma_ratio      : MA5 / MA20                       → golden/death cross signal
  - price_vs_ma5  : (price - MA5) / MA5              → how overbought/oversold
  - volatility    : std dev of last 5 prices         → market noise level
  - volume        : trading volume                   → market conviction

LABEL:
  - direction = 1 (UP)   if the NEXT row's price > current price
  - direction = 0 (DOWN) otherwise

MODEL:
  - RandomForestClassifier — no normalization needed, handles missing values well,
    and gives feature importances for free (great for school showcase!)

OUTPUT:
  - Saved model: /ml/model/price_direction_model.pkl
  - Training run logged to ml_model_runs table
"""

import os
import sys
import json
import logging
import joblib
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import psycopg2
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix
)

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("ml.train")

DB_CONFIG = {
    "host":     os.getenv("POSTGRES_HOST",     "postgres"),
    "port":     int(os.getenv("POSTGRES_PORT", "5432")),
    "dbname":   os.getenv("POSTGRES_DB",       "stockdb"),
    "user":     os.getenv("POSTGRES_USER",     "stockuser"),
    "password": os.getenv("POSTGRES_PASSWORD", "stockpass"),
}

MIN_ROWS         = int(os.getenv("TRAIN_MIN_ROWS", "100"))   # need at least this many rows
MODEL_DIR        = Path(os.getenv("MODEL_DIR", "/ml/model"))
MODEL_PATH       = MODEL_DIR / "price_direction_model.pkl"
MODEL_VERSION    = f"rf_v{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
FEATURE_COLUMNS  = [
    "pct_change",
    "moving_avg_5",
    "moving_avg_20",
    "ma_ratio",        # engineered: MA5 / MA20
    "price_vs_ma5",    # engineered: (price - MA5) / MA5
    "volatility",
    "volume",
]


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 – Load data from Gold table
# ─────────────────────────────────────────────────────────────────────────────
def load_data() -> pd.DataFrame:
    """Pull historical price data from fact_stock_price (Gold layer)."""
    log.info("Connecting to PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)

    query = """
        SELECT
            symbol,
            event_time,
            price,
            pct_change,
            moving_avg_5,
            moving_avg_20,
            volatility,
            volume
        FROM fact_stock_price
        WHERE
            pct_change    IS NOT NULL AND
            moving_avg_5  IS NOT NULL AND
            moving_avg_20 IS NOT NULL
        ORDER BY symbol, event_time ASC
    """
    df = pd.read_sql(query, conn)
    conn.close()

    log.info(f"Loaded {len(df):,} rows from fact_stock_price")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 – Feature engineering + create labels
# ─────────────────────────────────────────────────────────────────────────────
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add engineered features and create the UP/DOWN label.

    Label rule:
      For each row, look at the NEXT row's price (per symbol).
      If next_price > current_price → label = 1 (UP)
      Otherwise                    → label = 0 (DOWN)
    """
    log.info("Building features and labels...")

    # Engineered features
    df["ma_ratio"]     = df["moving_avg_5"] / df["moving_avg_20"].replace(0, np.nan)
    df["price_vs_ma5"] = (df["price"] - df["moving_avg_5"]) / df["moving_avg_5"].replace(0, np.nan)

    # Label: next tick direction per symbol
    df["next_price"] = df.groupby("symbol")["price"].shift(-1)
    df["direction"]  = (df["next_price"] > df["price"]).astype(int)

    # Drop rows without a label (last row per symbol has no "next" price)
    df = df.dropna(subset=["next_price"] + FEATURE_COLUMNS)

    log.info(f"After feature engineering: {len(df):,} usable rows")
    log.info(f"Label balance → UP: {df['direction'].sum():,}  DOWN: {(df['direction']==0).sum():,}")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 – Train the model
# ─────────────────────────────────────────────────────────────────────────────
def train(df: pd.DataFrame):
    """Train a Random Forest classifier and return the trained model."""
    X = df[FEATURE_COLUMNS].values
    y = df["direction"].values

    # Split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=True
    )
    log.info(f"Training on {len(X_train):,} rows, testing on {len(X_test):,} rows")

    # Random Forest — 200 trees, no normalization needed
    model = RandomForestClassifier(
        n_estimators=200,      # number of trees
        max_depth=8,           # prevent overfitting
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,             # use all CPU cores
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    log.info("=" * 50)
    log.info(f"  MODEL ACCURACY: {accuracy:.1%}")
    log.info("=" * 50)
    # Specify labels=[0, 1] so that classification_report works even when only one class is present in y_test
    print(classification_report(y_test, y_pred, labels=[0, 1], target_names=["DOWN", "UP"], zero_division=0))

    # Feature importances (great for showcase!)
    importances = dict(zip(FEATURE_COLUMNS, model.feature_importances_))
    sorted_imp  = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    log.info("Feature Importances:")
    for feat, imp in sorted_imp:
        bar = "█" * int(imp * 40)
        log.info(f"  {feat:<20} {bar} {imp:.3f}")

    top_feature = sorted_imp[0][0]
    return model, accuracy, top_feature, df["symbol"].unique().tolist()


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 – Save model to disk
# ─────────────────────────────────────────────────────────────────────────────
def save_model(model, model_version: str):
    """Save the trained model to disk using joblib."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": model_version, "features": FEATURE_COLUMNS}, MODEL_PATH)
    log.info(f"Model saved → {MODEL_PATH}")


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 – Log training run to database
# ─────────────────────────────────────────────────────────────────────────────
def log_training_run(model_version, symbols, total_rows, accuracy, top_feature):
    """Insert a training metadata row into ml_model_runs for the showcase."""
    conn = psycopg2.connect(**DB_CONFIG)
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ml_model_runs
                    (model_version, symbols_trained, total_rows, accuracy, top_feature)
                VALUES (%s, %s, %s, %s, %s)
            """, (model_version, symbols, total_rows, float(accuracy), top_feature))
    conn.close()
    log.info("Training run logged to ml_model_runs table")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("=" * 50)
    log.info(" Starting ML Training — Price Direction Classifier")
    log.info("=" * 50)

    df = load_data()

    if len(df) < MIN_ROWS:
        log.warning(
            f"Not enough data to train: {len(df)} rows (need {MIN_ROWS}). "
            "Wait for more Spark batches and try again."
        )
        sys.exit(0)

    df       = build_features(df)
    model, accuracy, top_feature, symbols = train(df)
    save_model(model, MODEL_VERSION)
    log_training_run(MODEL_VERSION, symbols, len(df), accuracy, top_feature)

    log.info("")
    log.info("Training complete!")
    log.info(f"  Model version : {MODEL_VERSION}")
    log.info(f"  Accuracy      : {accuracy:.1%}")
    log.info(f"  Top feature   : {top_feature}")
    log.info(f"  Symbols       : {', '.join(symbols)}")
    log.info(f"  Saved to      : {MODEL_PATH}")
