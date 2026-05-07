"""
/api/market endpoints – overview and pipeline monitoring stats.
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(prefix="/api/market", tags=["market"])


class MarketOverviewItem(BaseModel):
    symbol: str
    company_name: Optional[str]
    sector: Optional[str]
    price: Optional[float]
    price_change: Optional[float]
    pct_change: Optional[float]
    volume: Optional[int]
    anomaly_flag: Optional[bool]
    event_time: Optional[datetime]


class PipelineStats(BaseModel):
    bronze_count: int
    silver_count: int
    gold_count: int
    alert_count: int
    latest_ingest: Optional[datetime]


@router.get("/overview", response_model=List[MarketOverviewItem])
def market_overview(db: Session = Depends(get_db)):
    """Latest enriched snapshot for all tracked symbols."""
    sql = text("""
        SELECT DISTINCT ON (f.symbol)
            f.symbol,
            d.company_name,
            d.sector,
            f.price,
            f.price_change,
            f.pct_change,
            f.volume,
            f.anomaly_flag,
            f.event_time
        FROM fact_stock_price f
        LEFT JOIN dim_stock d ON d.symbol = f.symbol
        ORDER BY f.symbol, f.event_time DESC
    """)
    rows = db.execute(sql).fetchall()
    return [MarketOverviewItem(**dict(r._mapping)) for r in rows]


@router.get("/pipeline", response_model=PipelineStats)
def pipeline_stats(db: Session = Depends(get_db)):
    """Row counts for each medallion layer – useful for monitoring."""
    bronze = db.execute(text("SELECT COUNT(*) FROM bronze_stock_quotes")).scalar() or 0
    silver = db.execute(text("SELECT COUNT(*) FROM silver_stock_quotes")).scalar() or 0
    gold   = db.execute(text("SELECT COUNT(*) FROM fact_stock_price")).scalar() or 0
    alerts = db.execute(text("SELECT COUNT(*) FROM stock_alerts")).scalar() or 0
    latest = db.execute(
        text("SELECT MAX(ingest_time) FROM bronze_stock_quotes")
    ).scalar()

    return PipelineStats(
        bronze_count=bronze,
        silver_count=silver,
        gold_count=gold,
        alert_count=alerts,
        latest_ingest=latest,
    )
