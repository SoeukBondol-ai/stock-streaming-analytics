"""
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import stocks, alerts, market, ml
from websocket import websocket_endpoint

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist yet (idempotent)
    Base.metadata.create_all(bind=engine)
    log.info("Database tables verified.")
    yield
    log.info("Shutting down.")


app = FastAPI(
    title="Stock Streaming Analytics API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routers
app.include_router(stocks.router)
app.include_router(alerts.router)
app.include_router(market.router)
app.include_router(ml.router)


# WebSocket
@app.websocket("/ws/stocks")
async def ws_stocks(websocket: WebSocket):
    await websocket_endpoint(websocket)


@app.get("/health")
def health():
    return {"status": "ok"}
