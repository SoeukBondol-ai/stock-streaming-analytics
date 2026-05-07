"""
WebSocket – /ws/stocks
Pushes the latest quote for every tracked symbol every 3 seconds.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import text

from database import SessionLocal

log = logging.getLogger("websocket")

SYMBOLS = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN"]
PUSH_INTERVAL = 3  # seconds


def _fetch_latest() -> list[dict]:
    db = SessionLocal()
    try:
        sql = text("""
            SELECT DISTINCT ON (symbol)
                symbol, price, price_change, pct_change,
                moving_avg_5, volume, anomaly_flag, event_time
            FROM fact_stock_price
            ORDER BY symbol, event_time DESC
        """)
        rows = db.execute(sql).fetchall()
        result = []
        for r in rows:
            d = dict(r._mapping)
            # Make JSON-serialisable
            if isinstance(d.get("event_time"), datetime):
                d["event_time"] = d["event_time"].isoformat()
            for k, v in d.items():
                if hasattr(v, "__float__"):
                    d[k] = float(v)
            result.append(d)
        return result
    finally:
        db.close()


async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    log.info("WebSocket client connected: %s", websocket.client)
    try:
        while True:
            data = _fetch_latest()
            await websocket.send_text(json.dumps({"type": "quotes", "data": data}))
            await asyncio.sleep(PUSH_INTERVAL)
    except WebSocketDisconnect:
        log.info("WebSocket client disconnected")
    except Exception as exc:
        log.error("WebSocket error: %s", exc)
        await websocket.close()
