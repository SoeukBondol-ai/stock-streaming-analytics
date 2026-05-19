"""
This is what the Docker container runs.
Flow:
  1. Train the model (train.py)      — runs ONCE on startup
  2. Start prediction loop (predict.py) — runs FOREVER every 30s

Environment variables:
  TRAIN_MIN_ROWS          : minimum Gold rows needed to train (default: 100)
  PREDICT_INTERVAL_SECONDS: how often to predict (default: 30)
  STARTUP_WAIT_SECONDS    : seconds to wait after training before predicting (default: 60)
  RETRAIN_EVERY_MINUTES   : retrain model this often in minutes (default: 60)
"""

import os
import sys
import time
import logging
import subprocess
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("ml.run")

MODEL_PATH             = Path(os.getenv("MODEL_DIR", "/ml/model")) / "price_direction_model.pkl"
PREDICT_INTERVAL       = int(os.getenv("PREDICT_INTERVAL_SECONDS", "30"))
RETRAIN_EVERY_MINUTES  = int(os.getenv("RETRAIN_EVERY_MINUTES", "60"))

import psycopg2
import numpy as np
import pandas as pd
import json
import joblib
from train   import (
    load_data, build_features, train, save_model, log_training_run,
    MIN_ROWS, MODEL_VERSION, MODEL_DIR, FEATURE_COLUMNS
)
from predict import load_model, run_predictions


def do_train():
    """Run a full training cycle. Returns True if successful."""
    log.info("─── TRAINING ───────────────────────────────────")
    try:
        df = load_data()
        if len(df) < MIN_ROWS:
            log.warning(f"Only {len(df)} rows — need {MIN_ROWS} to train. Skipping.")
            return False

        df = build_features(df)
        model, accuracy, top_feature, symbols = train(df)
        save_model(model, MODEL_VERSION)
        log_training_run(MODEL_VERSION, symbols, len(df), accuracy, top_feature)
        log.info(f"Training done. Accuracy: {accuracy:.1%}")
        return True
    except Exception as e:
        log.error(f"Training failed: {e}")
        return False


if __name__ == "__main__":
    log.info("=" * 55)
    log.info("  ML Service: Price Direction Classifier")
    log.info("=" * 55)

    # ── Step 1: Initial training ─────────────────────────────
    log.info("Waiting 30s for Spark to populate Gold data...")
    time.sleep(30)

    success = do_train()
    if not success:
        log.info("Not enough data yet. Waiting 2 minutes and retrying...")
        time.sleep(120)
        success = do_train()
        if not success:
            log.error("Still not enough data. Check Spark job is running.")
            sys.exit(1)

    # ── Step 2: Load model and start prediction loop ─────────
    model, version, feature_columns = load_model()
    if model is None:
        sys.exit(1)

    log.info(f"Starting prediction loop (every {PREDICT_INTERVAL}s)")
    log.info(f"Will retrain every {RETRAIN_EVERY_MINUTES} minutes")

    retrain_at  = time.time() + RETRAIN_EVERY_MINUTES * 60

    while True:
        try:
            run_predictions(model, version, feature_columns)
        except Exception as e:
            log.error(f"Prediction error: {e}")

        # Periodic retraining
        if time.time() >= retrain_at:
            log.info("─── Scheduled retrain ───────────────────────────")
            if do_train():
                model, version, feature_columns = load_model()
            retrain_at = time.time() + RETRAIN_EVERY_MINUTES * 60

        time.sleep(PREDICT_INTERVAL)
