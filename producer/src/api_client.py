"""
API client with multi-source support and mock fallback.

Priority:
  1. Finnhub  (real-time WebSocket quotes – REST used here for simplicity)
  2. Alpha Vantage  (5-min delayed free tier)
  3. Mock generator  (always available; used when no API key is configured)
"""
import random
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import requests

from config import settings

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Base prices for the mock generator (seeded from realistic values)
# ─────────────────────────────────────────────────────────────────────────────
_MOCK_BASE: Dict[str, float] = {
    "AAPL":  189.5,
    "MSFT":  415.2,
    "TSLA":  245.8,
    "GOOGL": 175.3,
    "AMZN":  195.7,
    "NVDA":  822.79,
    "META":  502.3,
    "NFLX":  619.34,
}
_mock_prices: Dict[str, float] = dict(_MOCK_BASE)


def _mock_quote(symbol: str) -> Dict[str, Any]:
    """Generate a realistic-looking random stock quote."""
    base = _mock_prices.get(symbol, 100.0)
    # Random walk: ±0.5 %
    change_pct = random.gauss(0, 0.005)
    price = round(base * (1 + change_pct), 4)
    _mock_prices[symbol] = price

    open_p  = round(price * random.uniform(0.99, 1.01), 4)
    high_p  = round(max(price, open_p) * random.uniform(1.0, 1.005), 4)
    low_p   = round(min(price, open_p) * random.uniform(0.995, 1.0), 4)
    volume  = random.randint(100_000, 5_000_000)

    return {
        "symbol":    symbol,
        "price":     price,
        "open":      open_p,
        "high":      high_p,
        "low":       low_p,
        "volume":    volume,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source":    "mock",
    }


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
# Public interface
# ─────────────────────────────────────────────────────────────────────────────

def fetch_quote(symbol: str) -> Dict[str, Any]:
    """Try real APIs in order, fall back to mock generator."""
    quote = _yahoo_finance_quote(symbol) or _finnhub_quote(symbol) or _alpha_vantage_quote(symbol)
    if quote is None:
        quote = _mock_quote(symbol)
    return quote
