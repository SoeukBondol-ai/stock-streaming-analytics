#  Stock Streaming Analytics

Real-time stock market analytics pipeline using **Kafka · PySpark · PostgreSQL · FastAPI · React Vite**.

```
Stock API → Producer → Kafka → PySpark → Bronze/Silver/Gold → FastAPI → React Dashboard
```

<div align="center">
  <video src="public/SampleCast.mp4" controls autoplay loop muted width="100%">
    <a href="public/SampleCast.mp4">▶ Watch Demo</a>
  </video>
</div>


## Quick Start

### 1. Clone & configure

```bash
git clone 
cd stock-streaming-analytics
cp .env.example .env

```

### 2. Start all services

```bash
docker compose up --build -d
```

Services and their ports:

| Service       | URL                          |
|---------------|------------------------------|
| React frontend | http://localhost:3000        |
| FastAPI docs   | http://localhost:8000/docs   |
| Spark UI       | http://localhost:8080        |
| pgAdmin        | http://localhost:5050        |
| Kafka          | localhost:29092              |

### 3. Submit the PySpark streaming job

```bash
chmod +x spark/submit_job.sh
./spark/submit_job.sh
```

This starts the Structured Streaming job that reads from Kafka and writes to Postgres.

### 4. Open the dashboard

Navigate to **http://localhost:3000** and watch live prices stream in.

---

## Project Structure

```
stock-streaming-analytics/
├── docker-compose.yml          # All services
├── .env.example                # Config template
├── producer/                   # Kafka producer (Python / uv)
│   ├── src/
│   │   ├── main.py             # Entry point – fetch & publish loop
│   │   ├── api_client.py       # Finnhub / Alpha Vantage / Mock
│   │   ├── kafka_producer.py   # confluent-kafka wrapper
│   │   └── config.py           # Pydantic settings
├── spark/
│   ├── jobs/
│   │   └── stream_quotes.py    # PySpark Structured Streaming job
│   └── submit_job.sh           # Helper script
├── backend/                    # FastAPI (Python / uv)
│   ├── src/
│   │   ├── main.py             # App + CORS + WebSocket
│   │   ├── database.py         # SQLAlchemy engine
│   │   ├── models.py           # ORM models
│   │   ├── routers/
│   │   │   ├── stocks.py       # /api/stocks
│   │   │   ├── alerts.py       # /api/alerts
│   │   │   └── market.py       # /api/market
│   │   └── websocket.py        # /ws/stocks push loop
├── frontend/                   # React Vite dashboard
│   ├── src/
│   │   ├── pages/              # MarketOverview, StockDetail, Alerts, Pipeline, Architecture
│   │   └── components/         # StockCard, StockChart, StatGrid, AlertCard, Layout
└── sql/                        # Init SQL (auto-run by Postgres on first start)
    ├── 001_create_bronze_tables.sql
    ├── 002_create_silver_tables.sql
    ├── 003_create_gold_tables.sql
    └── 004_seed_dim_stock.sql
```

---

## API Reference

| Endpoint                          | Description                          |
|-----------------------------------|--------------------------------------|
| `GET /api/stocks`                 | Latest quote for all symbols         |
| `GET /api/stocks/{sym}/latest`    | Latest quote for one symbol          |
| `GET /api/stocks/{sym}/history`   | Historical quotes (pass `?hours=24`) |
| `GET /api/stocks/{sym}/indicators`| Gold metrics + moving averages       |
| `GET /api/alerts`                 | Anomaly alerts                       |
| `GET /api/market/overview`        | Enriched snapshot for all symbols    |
| `GET /api/market/pipeline`        | Bronze/Silver/Gold row counts        |
| `WS  /ws/stocks`                  | Live push every 3 s                  |

Full interactive docs: http://localhost:8000/docs

---

## Data Pipeline (Medallion Architecture)

```
Bronze  →  Raw JSON messages from Kafka (bronze_stock_quotes)
Silver  →  Cleaned, typed, deduplicated (silver_stock_quotes)
Gold    →  Aggregated metrics, MAs, anomaly flags (fact_stock_price)
```

Alerts are written to `stock_alerts` when:
- Price moves **> 2 %** within a micro-batch window
- (Extend: volume spike, MA crossover)

---

## Local Development (without Docker)

### Producer
```bash
cd producer
pip install uv
uv sync
KAFKA_BOOTSTRAP_SERVERS=localhost:29092 uv run python src/main.py
```

### Backend
```bash
cd backend
uv sync
DATABASE_URL=postgresql://stockuser:stockpass@localhost:5432/stockdb \
  uv run uvicorn src.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## Extending the Project

- **Add ML anomaly detection**: replace the threshold rule in `stream_quotes.py` with a scikit-learn Isolation Forest or LSTM loaded via MLflow.
- **Add more indicators**: RSI, MACD, Bollinger Bands – add columns to `fact_stock_price` and compute inside `write_gold()`.
- **Add Grafana**: point it at PostgreSQL and build dashboards using the Gold tables.
- **Add Apache Superset**: connect to PostgreSQL for ad-hoc SQL exploration.
- **Export CSV**: add a `GET /api/stocks/{sym}/export` endpoint that streams a CSV response.

https://query1.finance.yahoo.com/v8/finance/chart/googl

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Producer can't reach Kafka | Wait 30 s for Kafka to fully start, then `docker compose restart producer` |
| No data in dashboard | Submit the Spark job (`./spark/submit_job.sh`). Postgres needs data in `fact_stock_price`. |
| Spark job fails with class not found | Ensure the `--packages` jars are downloaded (first run needs internet access) |
| pgAdmin login | Email: `admin@stock.com` · Password: `admin` |
