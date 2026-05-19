"""
/api/ml endpoints — Price Direction Predictions showcase
=========================================================

Endpoints:
  GET /api/ml/predictions          → latest UP/DOWN prediction for every symbol
  GET /api/ml/predictions/{symbol} → prediction history for one symbol
  GET /api/ml/model                → info about the trained model (accuracy, top features, etc.)
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(prefix="/api/ml", tags=["ml"])


# ─────────────────────────────────────────────────────────────────────────────
# Response models
# ─────────────────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    id: int
    symbol: str
    prediction: str          # "UP" or "DOWN"
    confidence: float        # 0.0 – 1.0
    price_at_pred: Optional[float]
    features: Optional[dict] # the exact numbers the model used
    model_version: Optional[str]
    predicted_at: datetime

    class Config:
        from_attributes = True


class ModelInfoResponse(BaseModel):
    model_version: str
    symbols_trained: List[str]
    total_rows: int
    accuracy: float          # e.g. 0.7210 = 72.1%
    top_feature: Optional[str]
    trained_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ml/predictions
# Returns the LATEST prediction for each symbol (showcase summary view)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/predictions", response_model=List[PredictionResponse])
def get_latest_predictions(db: Session = Depends(get_db)):
    """
    Returns the most recent UP/DOWN prediction for every tracked symbol.
    This is the main showcase endpoint — shows what the model currently thinks.
    """
    sql = text("""
        SELECT DISTINCT ON (symbol)
            id, symbol, prediction, confidence,
            price_at_pred, features, model_version, predicted_at
        FROM ml_predictions
        ORDER BY symbol, predicted_at DESC
    """)
    rows = db.execute(sql).fetchall()
    return [
        PredictionResponse(
            id=r.id,
            symbol=r.symbol,
            prediction=r.prediction,
            confidence=float(r.confidence),
            price_at_pred=float(r.price_at_pred) if r.price_at_pred else None,
            features=r.features,
            model_version=r.model_version,
            predicted_at=r.predicted_at,
        )
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ml/predictions/{symbol}
# Returns prediction history for one symbol (for a chart showing predictions over time)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/predictions/{symbol}", response_model=List[PredictionResponse])
def get_symbol_predictions(
    symbol: str,
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    Returns the prediction history for a single symbol.
    Useful for a chart that shows how the model's prediction changed over time.
    """
    sql = text("""
        SELECT id, symbol, prediction, confidence,
               price_at_pred, features, model_version, predicted_at
        FROM ml_predictions
        WHERE symbol = :symbol
        ORDER BY predicted_at DESC
        LIMIT :lim
    """)
    rows = db.execute(sql, {"symbol": symbol.upper(), "lim": limit}).fetchall()
    return [
        PredictionResponse(
            id=r.id,
            symbol=r.symbol,
            prediction=r.prediction,
            confidence=float(r.confidence),
            price_at_pred=float(r.price_at_pred) if r.price_at_pred else None,
            features=r.features,
            model_version=r.model_version,
            predicted_at=r.predicted_at,
        )
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ml/model
# Returns training metadata — accuracy, top feature, number of rows trained on
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/model", response_model=Optional[ModelInfoResponse])
def get_model_info(db: Session = Depends(get_db)):
    """
    Returns the most recent model training run details.
    Great for showing in the showcase: accuracy score, what data it was trained on, etc.
    """
    sql = text("""
        SELECT model_version, symbols_trained, total_rows,
               accuracy, top_feature, trained_at
        FROM ml_model_runs
        ORDER BY trained_at DESC
        LIMIT 1
    """)
    row = db.execute(sql).fetchone()

    if not row:
        return None

    return ModelInfoResponse(
        model_version=row.model_version,
        symbols_trained=row.symbols_trained,
        total_rows=row.total_rows,
        accuracy=float(row.accuracy),
        top_feature=row.top_feature,
        trained_at=row.trained_at,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ml/summary
# Quick showcase summary: prediction count, accuracy, UP vs DOWN counts
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/summary")
def get_ml_summary(db: Session = Depends(get_db)):
    """
    Showcase summary — total predictions made, UP vs DOWN split, latest accuracy.
    """
    sql = text("""
        SELECT
            COUNT(*)                                          AS total_predictions,
            COUNT(*) FILTER (WHERE prediction = 'UP')        AS up_count,
            COUNT(*) FILTER (WHERE prediction = 'DOWN')      AS down_count,
            ROUND(AVG(confidence) * 100, 1)                  AS avg_confidence_pct,
            COUNT(DISTINCT symbol)                           AS symbols_covered
        FROM ml_predictions
    """)
    row = db.execute(sql).fetchone()

    model_sql = text("""
        SELECT accuracy, model_version, trained_at
        FROM ml_model_runs
        ORDER BY trained_at DESC LIMIT 1
    """)
    model_row = db.execute(model_sql).fetchone()

    return {
        "total_predictions":  row.total_predictions,
        "up_count":           row.up_count,
        "down_count":         row.down_count,
        "avg_confidence_pct": float(row.avg_confidence_pct) if row.avg_confidence_pct else None,
        "symbols_covered":    row.symbols_covered,
        "model_accuracy_pct": round(float(model_row.accuracy) * 100, 1) if model_row else None,
        "model_version":      model_row.model_version if model_row else None,
        "last_trained_at":    model_row.trained_at if model_row else None,
    }
