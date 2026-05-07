"""
SQLAlchemy ORM models – mirror the PostgreSQL schema.
"""
from datetime import datetime
from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, Integer,
    Numeric, String, Text, func,
)
from src.database import Base


class BronzeStockQuote(Base):
    __tablename__ = "bronze_stock_quotes"
    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    raw_json    = Column(Text, nullable=False)
    source      = Column(String(64))
    topic       = Column(String(128))
    ingest_time = Column(DateTime(timezone=True), server_default=func.now())


class SilverStockQuote(Base):
    __tablename__ = "silver_stock_quotes"
    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    symbol      = Column(String(16), nullable=False)
    price       = Column(Numeric(18, 4), nullable=False)
    open_price  = Column(Numeric(18, 4))
    high_price  = Column(Numeric(18, 4))
    low_price   = Column(Numeric(18, 4))
    volume      = Column(BigInteger)
    event_time  = Column(DateTime(timezone=True), nullable=False)
    source      = Column(String(64))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class FactStockPrice(Base):
    __tablename__ = "fact_stock_price"
    id             = Column(BigInteger, primary_key=True, autoincrement=True)
    symbol         = Column(String(16), nullable=False)
    event_time     = Column(DateTime(timezone=True), nullable=False)
    price          = Column(Numeric(18, 4), nullable=False)
    previous_price = Column(Numeric(18, 4))
    price_change   = Column(Numeric(18, 4))
    pct_change     = Column(Numeric(10, 4))
    moving_avg_5   = Column(Numeric(18, 4))
    moving_avg_20  = Column(Numeric(18, 4))
    volatility     = Column(Numeric(10, 6))
    volume         = Column(BigInteger)
    anomaly_flag   = Column(Boolean, default=False)


class DimStock(Base):
    __tablename__ = "dim_stock"
    stock_id     = Column(Integer, primary_key=True, autoincrement=True)
    symbol       = Column(String(16), unique=True, nullable=False)
    company_name = Column(String(256), nullable=False)
    sector       = Column(String(128))
    exchange     = Column(String(64))


class StockAlert(Base):
    __tablename__ = "stock_alerts"
    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    symbol      = Column(String(16), nullable=False)
    alert_type  = Column(String(64), nullable=False)
    message     = Column(Text, nullable=False)
    severity    = Column(String(16), default="MEDIUM")
    price       = Column(Numeric(18, 4))
    pct_change  = Column(Numeric(10, 4))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
