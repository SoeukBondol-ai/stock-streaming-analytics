"""
stream_quotes.py – Robust PySpark Structured Streaming job.

Simplified approach to avoid Py4J callback errors:
- Uses psycopg2 directly inside foreachBatch (more stable than JDBC in driver mode)
- No complex Spark window functions inside foreachBatch callbacks
- Each layer is an independent streaming query with its own checkpoint
"""

import os
import logging
import psycopg2

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField,
    StringType, DoubleType, LongType,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s – %(message)s"
)
log = logging.getLogger("spark.stream_quotes")

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
KAFKA_TOPIC   = "stock.raw.quotes"

PG_HOST = os.getenv("POSTGRES_HOST", "postgres")
PG_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
PG_DB   = os.getenv("POSTGRES_DB",   "stockdb")
PG_USER = os.getenv("POSTGRES_USER", "stockuser")
PG_PASS = os.getenv("POSTGRES_PASSWORD", "stockpass")

PRICE_SPIKE_PCT = 2.0   # alert threshold %

# ─────────────────────────────────────────────────────────────────────────────
# Postgres helper
# ─────────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host=PG_HOST, port=PG_PORT,
        dbname=PG_DB, user=PG_USER, password=PG_PASS
    )

# ─────────────────────────────────────────────────────────────────────────────
# Spark session
# ─────────────────────────────────────────────────────────────────────────────
spark = (
    SparkSession.builder
    .appName("StockStreamingPipeline")
    .config("spark.sql.shuffle.partitions", "2")
    .config("spark.default.parallelism", "2")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

# ─────────────────────────────────────────────────────────────────────────────
# Schema for incoming Kafka JSON messages
# ─────────────────────────────────────────────────────────────────────────────
QUOTE_SCHEMA = StructType([
    StructField("symbol",    StringType(), True),
    StructField("price",     DoubleType(), True),
    StructField("open",      DoubleType(), True),
    StructField("high",      DoubleType(), True),
    StructField("low",       DoubleType(), True),
    StructField("volume",    LongType(),   True),
    StructField("timestamp", StringType(), True),
    StructField("source",    StringType(), True),
])

# ─────────────────────────────────────────────────────────────────────────────
# Read from Kafka and parse JSON
# ─────────────────────────────────────────────────────────────────────────────
raw_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_SERVERS)
    .option("subscribe", KAFKA_TOPIC)
    .option("startingOffsets", "latest")
    .option("failOnDataLoss", "false")
    .option("kafka.session.timeout.ms", "30000")
    .load()
)

parsed = (
    raw_stream
    .select(
        F.col("value").cast("string").alias("raw_value"),
    )
    .withColumn("data", F.from_json("raw_value", QUOTE_SCHEMA))
    .select(
        F.col("raw_value"),
        F.col("data.symbol").alias("symbol"),
        F.col("data.price").cast("double").alias("price"),
        F.col("data.open").cast("double").alias("open_price"),
        F.col("data.high").cast("double").alias("high_price"),
        F.col("data.low").cast("double").alias("low_price"),
        F.col("data.volume").cast("long").alias("volume"),
        F.to_timestamp("data.timestamp").alias("event_time"),
        F.col("data.source").alias("source"),
    )
    .filter(F.col("symbol").isNotNull() & F.col("price").isNotNull())
)

# ─────────────────────────────────────────────────────────────────────────────
# Bronze – raw JSON stored as-is
# ─────────────────────────────────────────────────────────────────────────────

def write_bronze(batch_df, batch_id):
    try:
        rows = batch_df.select("raw_value", "source").collect()
        if not rows:
            return
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.executemany(
                    "INSERT INTO bronze_stock_quotes (raw_json, source, topic) VALUES (%s, %s, %s)",
                    [(r.raw_value, r.source or "unknown", KAFKA_TOPIC) for r in rows]
                )
        conn.close()
        log.info("[Bronze] batch=%d  rows=%d", batch_id, len(rows))
    except Exception as e:
        log.error("[Bronze] ERROR batch=%d: %s", batch_id, e)


# ─────────────────────────────────────────────────────────────────────────────
# Silver – cleaned, typed records
# ─────────────────────────────────────────────────────────────────────────────

def write_silver(batch_df, batch_id):
    try:
        rows = batch_df.select(
            "symbol", "price", "open_price", "high_price",
            "low_price", "volume", "event_time", "source"
        ).collect()
        if not rows:
            return
        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                cur.executemany("""
                    INSERT INTO silver_stock_quotes
                        (symbol, price, open_price, high_price, low_price, volume, event_time, source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    (
                        r.symbol,
                        float(r.price),
                        float(r.open_price)  if r.open_price  else None,
                        float(r.high_price)  if r.high_price  else None,
                        float(r.low_price)   if r.low_price   else None,
                        int(r.volume)        if r.volume       else None,
                        r.event_time,
                        r.source or "unknown",
                    )
                    for r in rows
                ])
        conn.close()
        log.info("[Silver] batch=%d  rows=%d", batch_id, len(rows))
    except Exception as e:
        log.error("[Silver] ERROR batch=%d: %s", batch_id, e)


# ─────────────────────────────────────────────────────────────────────────────
# Gold – enriched metrics with moving averages + anomaly detection
# ─────────────────────────────────────────────────────────────────────────────

def write_gold(batch_df, batch_id):
    try:
        rows = batch_df.select(
            "symbol", "price", "volume", "event_time"
        ).collect()
        if not rows:
            return

        conn = get_conn()
        with conn:
            with conn.cursor() as cur:
                for r in rows:
                    symbol = r.symbol
                    price  = float(r.price)
                    volume = int(r.volume) if r.volume else None
                    etime  = r.event_time

                    # Previous price for change calculation
                    cur.execute("""
                        SELECT price FROM fact_stock_price
                        WHERE symbol = %s ORDER BY event_time DESC LIMIT 1
                    """, (symbol,))
                    prev_row   = cur.fetchone()
                    prev_price = float(prev_row[0]) if prev_row else None
                    price_change = (price - prev_price)           if prev_price else None
                    pct_change   = (price_change / prev_price * 100) if prev_price else None

                    # Moving averages from silver history
                    cur.execute("""
                        SELECT price FROM silver_stock_quotes
                        WHERE symbol = %s ORDER BY event_time DESC LIMIT 20
                    """, (symbol,))
                    recent = [float(row[0]) for row in cur.fetchall()]
                    ma5  = sum(recent[:5])  / len(recent[:5])  if recent else None
                    ma20 = sum(recent[:20]) / len(recent[:20]) if recent else None

                    # Volatility (std dev of last 5)
                    volatility = None
                    if len(recent) >= 2:
                        sample = recent[:5]
                        mean   = sum(sample) / len(sample)
                        volatility = (sum((x - mean) ** 2 for x in sample) / len(sample)) ** 0.5

                    # Anomaly flag: price moved > 2% from previous
                    anomaly = bool(pct_change and abs(pct_change) > PRICE_SPIKE_PCT)

                    cur.execute("""
                        INSERT INTO fact_stock_price
                            (symbol, event_time, price, previous_price, price_change,
                             pct_change, moving_avg_5, moving_avg_20, volatility,
                             volume, anomaly_flag)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """, (
                        symbol, etime, price, prev_price, price_change,
                        pct_change, ma5, ma20, volatility, volume, anomaly
                    ))

                    # Generate alert for anomalous moves
                    if anomaly and pct_change is not None:
                        direction = "up" if pct_change > 0 else "down"
                        severity  = "HIGH" if abs(pct_change) > 5 else "MEDIUM"
                        cur.execute("""
                            INSERT INTO stock_alerts
                                (symbol, alert_type, message, severity, price, pct_change)
                            VALUES (%s,%s,%s,%s,%s,%s)
                        """, (
                            symbol, "PRICE_SPIKE",
                            f"{symbol} moved {direction} {abs(pct_change):.2f}% to ${price:.2f}",
                            severity, price, pct_change,
                        ))
                        log.warning("[Alert] %s  pct=%.2f%%  severity=%s", symbol, pct_change, severity)

        conn.close()
        log.info("[Gold] batch=%d  rows=%d", batch_id, len(rows))
    except Exception as e:
        log.error("[Gold] ERROR batch=%d: %s", batch_id, e)


# ─────────────────────────────────────────────────────────────────────────────
# Launch all three streaming queries
# ─────────────────────────────────────────────────────────────────────────────

bronze_query = (
    parsed.writeStream
    .foreachBatch(write_bronze)
    .option("checkpointLocation", "/tmp/checkpoints/bronze")
    .trigger(processingTime="5 seconds")
    .start()
)
log.info(" Bronze query started")

silver_query = (
    parsed.writeStream
    .foreachBatch(write_silver)
    .option("checkpointLocation", "/tmp/checkpoints/silver")
    .trigger(processingTime="5 seconds")
    .start()
)
log.info(" Silver query started")

gold_query = (
    parsed.writeStream
    .foreachBatch(write_gold)
    .option("checkpointLocation", "/tmp/checkpoints/gold")
    .trigger(processingTime="10 seconds")
    .start()
)
log.info("Gold query started")

log.info(" All streaming queries running…")
spark.streams.awaitAnyTermination()