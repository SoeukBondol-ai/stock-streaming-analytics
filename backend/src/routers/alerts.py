"""
/api/alerts endpoints
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertResponse(BaseModel):
    id: int
    symbol: str
    alert_type: str
    message: str
    severity: str
    price: Optional[float]
    pct_change: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    symbol: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Return recent alerts, optionally filtered by symbol or severity."""
    where_clauses = []
    params: dict = {"lim": limit}

    if symbol:
        where_clauses.append("symbol = :symbol")
        params["symbol"] = symbol.upper()
    if severity:
        where_clauses.append("severity = :severity")
        params["severity"] = severity.upper()

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    sql = text(f"""
        SELECT id, symbol, alert_type, message, severity, price, pct_change, created_at
        FROM stock_alerts
        {where_sql}
        ORDER BY created_at DESC
        LIMIT :lim
    """)
    rows = db.execute(sql, params).fetchall()
    return [AlertResponse(**dict(r._mapping)) for r in rows]
