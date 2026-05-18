"""
API client with multi-source support.

Priority:
  1. Yahoo Finance  (real-time, no key required)
  2. Finnhub        (real-time, 60 req/min free)
  3. Twelve Data    (real-time, 800 req/day free)
  4. Alpha Vantage  (5 req/min free)
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import requests

from config import settings

log = logging.getLogger(__name__)




# ─────────────────────────────────────────────────────────────────────────────
# Yahoo Finance REST (Unrestricted, real-time, no API key required)
# ─────────────────────────────────────────────────────────────────────────────

def _yahoo_finance_quote(symbol: str) -> Optional[Dict[str, Any]]:
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
        }
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code != 200:
            return None
        data = resp.json()
        result = data.get("chart", {}).get("result", [])
        if not result:
            return None
        meta = result[0].get("meta", {})
        price = meta.get("regularMarketPrice")
        if price is None:
            return None
        
        # Use previousClose or chartPreviousClose as a baseline for Open
        prev_close = meta.get("previousClose") or meta.get("chartPreviousClose") or price
        
        return {
            "symbol":    symbol,
            "price":     price,
            "open":      prev_close,
            "high":      meta.get("regularMarketDayHigh") or price,
            "low":       meta.get("regularMarketDayLow") or price,
            "volume":    meta.get("regularMarketVolume") or 1000000,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source":    "yahoo_finance",
        }
    except Exception as exc:
        log.warning("Yahoo Finance error for %s: %s", symbol, exc)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Finnhub REST
# ─────────────────────────────────────────────────────────────────────────────

def _finnhub_quote(symbol: str) -> Optional[Dict[str, Any]]:
    if not settings.finnhub_api_key:
        return None
    try:
        url = "https://finnhub.io/api/v1/quote"
        resp = requests.get(url, params={"symbol": symbol, "token": settings.finnhub_api_key}, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        if not data.get("c"):  # current price absent
            return None
        return {
            "symbol":    symbol,
            "price":     data["c"],
            "open":      data.get("o"),
            "high":      data.get("h"),
            "low":       data.get("l"),
            "volume":    None,           # Finnhub free tier omits volume here
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source":    "finnhub",
        }
    except Exception as exc:
        log.warning("Finnhub error for %s: %s", symbol, exc)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Alpha Vantage
# ─────────────────────────────────────────────────────────────────────────────

def _alpha_vantage_quote(symbol: str) -> Optional[Dict[str, Any]]:
    if not settings.alpha_vantage_api_key or settings.alpha_vantage_api_key == "demo":
        return None
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol":   symbol,
            "apikey":   settings.alpha_vantage_api_key,
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        gq = resp.json().get("Global Quote", {})
        if not gq.get("05. price"):
            return None
        return {
            "symbol":    symbol,
            "price":     float(gq["05. price"]),
            "open":      float(gq.get("02. open", 0)),
            "high":      float(gq.get("03. high", 0)),
            "low":       float(gq.get("04. low", 0)),
            "volume":    int(gq.get("06. volume", 0)),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source":    "alpha_vantage",
        }
    except Exception as exc:
        log.warning("Alpha Vantage error for %s: %s", symbol, exc)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Twelve Data
# ─────────────────────────────────────────────────────────────────────────────

def _twelve_data_quote(symbol: str) -> Optional[Dict[str, Any]]:
    if not settings.twelve_data_api_key:
        return None
    try:
        url = "https://api.twelvedata.com/quote"
        params = {
            "symbol":  symbol,
            "apikey":  settings.twelve_data_api_key,
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") == "error" or not data.get("close"):
            return None
        return {
            "symbol":    symbol,
            "price":     float(data["close"]),
            "open":      float(data.get("open") or data["close"]),
            "high":      float(data.get("high") or data["close"]),
            "low":       float(data.get("low") or data["close"]),
            "volume":    int(data.get("volume") or 0),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source":    "twelve_data",
        }
    except Exception as exc:
        log.warning("Twelve Data error for %s: %s", symbol, exc)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Public interface
# ─────────────────────────────────────────────────────────────────────────────

def fetch_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """Try real APIs in order, return None if all fail."""
    return (
        _yahoo_finance_quote(symbol)
        or _finnhub_quote(symbol)
        or _twelve_data_quote(symbol)
        or _alpha_vantage_quote(symbol)
    )

