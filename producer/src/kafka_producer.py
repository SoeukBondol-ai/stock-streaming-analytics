"""
Thin wrapper around confluent-kafka Producer.
Handles serialisation, delivery reports, and retry logic.
"""
import json
import logging
from typing import Any, Dict

from confluent_kafka import Producer, KafkaException

from config import settings

log = logging.getLogger(__name__)


def _delivery_report(err, msg):
    if err:
        log.error("Delivery failed for %s: %s", msg.key(), err)
    else:
        log.debug("Delivered %s → %s [%d] offset %d",
                  msg.key(), msg.topic(), msg.partition(), msg.offset())


class StockProducer:
    def __init__(self):
        self._producer = Producer({
            "bootstrap.servers": settings.kafka_bootstrap_servers,
            "client.id":         "stock-data-producer",
            "acks":              "all",
            "retries":           5,
            "retry.backoff.ms":  500,
        })
        log.info("Kafka producer connected to %s", settings.kafka_bootstrap_servers)

    def send_quote(self, quote: Dict[str, Any]) -> None:
        """Publish a quote dict to stock.raw.quotes."""
        payload = json.dumps(quote).encode("utf-8")
        key = quote.get("symbol", "unknown").encode("utf-8")
        self._producer.produce(
            topic=settings.kafka_topic_raw,
            key=key,
            value=payload,
            on_delivery=_delivery_report,
        )
        # Non-blocking poll to trigger delivery callbacks
        self._producer.poll(0)

    def flush(self):
        self._producer.flush()

    def close(self):
        self.flush()
        log.info("Kafka producer closed.")
