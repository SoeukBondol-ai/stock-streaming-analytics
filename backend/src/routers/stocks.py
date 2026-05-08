"""
/api/stocks endpoints – latest quotes, history, and technical indicators.
"""
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

VALID_SYMBOLS = {"AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "NVDA", "META", "NFLX"}


# ─── Pydantic response schemas ──────────────────────────────────────────────

class QuoteResponse(BaseModel):
    symbol: str
    price: float
    open_price: Optional[float]
    high_price: Optional[float]
    low_price: Optional[float]
    volume: Optional[int]
    event_time: datetime
    source: Optional[str]

    class Config:
        from_attributes = True


class FactResponse(BaseModel):
    symbol: str
    event_time: datetime
    price: float
    price_change: Optional[float]
    pct_change: Optional[float]
    moving_avg_5: Optional[float]
    moving_avg_20: Optional[float]
    volatility: Optional[float]
    volume: Optional[int]
    anomaly_flag: bool

    class Config:
        from_attributes = True


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[QuoteResponse])
def list_stocks(db: Session = Depends(get_db)):
    """Return the latest quote for every tracked symbol."""
    sql = text("""
        SELECT DISTINCT ON (symbol)
            symbol, price, open_price, high_price, low_price,
            volume, event_time, source
        FROM silver_stock_quotes
        ORDER BY symbol, event_time DESC
    """)
    rows = db.execute(sql).fetchall()
    return [QuoteResponse(**dict(r._mapping)) for r in rows]


@router.get("/{symbol}/latest", response_model=QuoteResponse)
def latest_quote(symbol: str, db: Session = Depends(get_db)):
    symbol = symbol.upper()
    if symbol not in VALID_SYMBOLS:
        raise HTTPException(status_code=404, detail=f"Unknown symbol {symbol}")

    sql = text("""
        SELECT symbol, price, open_price, high_price, low_price,
               volume, event_time, source
        FROM silver_stock_quotes
        WHERE symbol = :symbol
        ORDER BY event_time DESC
        LIMIT 1
    """)
    row = db.execute(sql, {"symbol": symbol}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="No data yet for " + symbol)
    return QuoteResponse(**dict(row._mapping))


@router.get("/{symbol}/history", response_model=List[QuoteResponse])
def stock_history(
    symbol: str,
    hours: int = Query(default=24, ge=1, le=24 * 365),
    db: Session = Depends(get_db),
):
    symbol = symbol.upper()
    if symbol not in VALID_SYMBOLS:
        raise HTTPException(status_code=404, detail=f"Unknown symbol {symbol}")

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    sql = text("""
        SELECT symbol, price, open_price, high_price, low_price,
               volume, event_time, source
        FROM silver_stock_quotes
        WHERE symbol = :symbol AND event_time >= :since
        ORDER BY event_time ASC
        LIMIT 10000
    """)
    rows = db.execute(sql, {"symbol": symbol, "since": since}).fetchall()
    return [QuoteResponse(**dict(r._mapping)) for r in rows]


@router.get("/{symbol}/indicators", response_model=List[FactResponse])
def technical_indicators(
    symbol: str,
    limit: int = Query(default=100, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    symbol = symbol.upper()
    if symbol not in VALID_SYMBOLS:
        raise HTTPException(status_code=404, detail=f"Unknown symbol {symbol}")

    sql = text("""
        SELECT symbol, event_time, price, price_change, pct_change,
               moving_avg_5, moving_avg_20, volatility, volume, anomaly_flag
        FROM fact_stock_price
        WHERE symbol = :symbol
        ORDER BY event_time DESC
        LIMIT :lim
    """)
    rows = db.execute(sql, {"symbol": symbol, "lim": limit}).fetchall()
    return [FactResponse(**dict(r._mapping)) for r in rows]
