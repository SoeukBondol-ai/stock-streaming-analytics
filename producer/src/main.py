"""
Producer entry point.

Fetches stock quotes every FETCH_INTERVAL_SECONDS seconds and
publishes them to the Kafka topic `stock.raw.quotes`.
"""
import logging
import signal
import sys
import time

from config import settings
from api_client import fetch_quote
from kafka_producer import StockProducer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("producer.main")

_running = True


def _shutdown(sig, frame):
    global _running
    log.info("Received signal %s – shutting down …", sig)
    _running = False


def main():
    signal.signal(signal.SIGINT,  _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    symbols = settings.symbols_list
    interval = settings.fetch_interval_seconds

    log.info("Starting producer | symbols=%s interval=%ds", symbols, interval)
    producer = StockProducer()

    try:
        while _running:
            for symbol in symbols:
                if not _running:
                    break
                try:
                    quote = fetch_quote(symbol)
                    if quote:
                        producer.send_quote(quote)
                        log.info("📤  %s  price=%.4f  source=%s",
                                 symbol, quote["price"], quote["source"])
                    else:
                        log.warning("⚠️  Failed to fetch real data for %s", symbol)
                except Exception as exc:
                    log.error("Failed to process %s: %s", symbol, exc)
            time.sleep(interval)
    finally:
        producer.close()
        log.info("Producer stopped.")


if __name__ == "__main__":
    main()
