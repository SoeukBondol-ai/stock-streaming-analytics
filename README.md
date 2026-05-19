<div align="center">

#  Stock Streaming Analytics

**Real-time stock market pipeline · Kafka · PySpark · PostgreSQL · FastAPI · React**

[![Docker](https://img.shields.io/badge/Docker-required-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![Apache Spark](https://img.shields.io/badge/Apache%20Spark-3.5-E25A1C?logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-7.5-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)

```
Stock APIs → Kafka Producer → Apache Kafka → PySpark Streaming
    → Bronze / Silver / Gold (PostgreSQL) → FastAPI → React Dashboard
```

</div>

---

## 🎬 Demo

<video src="public/SampleCast.mp4" controls width="100%">
  <a href="public/SampleCast.mp4">▶ Watch Demo Video</a>
</video>

> **Can't see the video?** [Click here to download and watch it](public/SampleCast.mp4)

---

##  Table of Contents

- [Architecture](#architecture)
- [Services & Ports](#services--ports)
- [Quick Start — Linux / Mac](#quick-start--linux--mac)
- [Quick Start — Windows](#quick-start--windows-)
- [Project Structure](#project-structure)
- [Data Pipeline — Medallion Architecture](#data-pipeline--medallion-architecture)
- [API Reference](#api-reference)
- [Configuration (.env)](#configuration-env)
- [pgAdmin — Browse the Database](#pgadmin--browse-the-database)
- [Troubleshooting](#troubleshooting)
- [Extending the Project](#extending-the-project)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stock Streaming Analytics                     │
│                                                                  │
│  ┌──────────────┐    ┌───────────┐    ┌────────────────────┐   │
│  │ Stock APIs   │───▶│  Kafka    │───▶│  PySpark Streaming │   │
│  │ • Finnhub    │    │ Producer  │    │  (stream_quotes.py)│   │
│  │ • AlphaVant. │    │           │    └────────┬───────────┘   │
│  │ • TwelveData │    └───────────┘             │               │
│  └──────────────┘                              ▼               │
│                                    ┌───────────────────────┐   │
│                                    │   PostgreSQL (Layers) │   │
│                                    │  🥉 Bronze  raw JSON  │   │
│                                    │  🥈 Silver  cleaned   │   │
│                                    │  🥇 Gold    metrics   │   │
│                                    └───────────┬───────────┘   │
│                                                │               │
│                               ┌────────────────▼────────────┐  │
│                               │  FastAPI + WebSocket        │  │
│                               │  REST API + Live Push       │  │
│                               └────────────────┬────────────┘  │
│                                                │               │
│                               ┌────────────────▼────────────┐  │
│                               │  React + Vite Dashboard     │  │
│                               │  Live charts, alerts, KPIs  │  │
│                               └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Services & Ports

| Service | URL | Credentials |
|---------|-----|-------------|
| 🖥️ React Dashboard | http://localhost:3000 | — |
| ⚡ FastAPI Docs | http://localhost:8000/docs | — |
| 🔥 Spark Master UI | http://localhost:8082 | — |
| 🗄️ pgAdmin (DB Browser) | http://localhost:5050 | `admin@stock.com` / `admin` |
| 🐘 PostgreSQL (direct) | localhost:5433 | `stockuser` / `stockpass` |
| 📨 Kafka (external) | localhost:29092 | — |

---

## Quick Start — Linux / Mac

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Docker Compose v2
- Git

### Step 1 — Clone & Configure

```bash
git clone <your-repo-url>
cd stock-streaming

# Copy environment config and add your API keys (optional — mock data works without keys)
cp .env.example .env
```

Edit `.env` and add at least one API key for live data (see [Configuration](#configuration-env)):

```bash
nano .env    # or use any editor
```

### Step 2 — Start All Services

```bash
docker compose up --build -d
```

>  **First run takes ~3–5 minutes** to build images and download Spark jars. Subsequent starts are fast.

Wait for all services to be healthy:

```bash
docker compose ps
```

You should see all containers as `healthy` or `running`.

### Step 3 — Submit the PySpark Streaming Job

```bash
# Make executable (only needed once)
chmod +x spark/submit_job.sh

# Run from the project root
bash spark/submit_job.sh
```

You'll see output like:
```
▶ Submitting Spark job (checkpoint run-id: stable)
  PG host: postgres  db: stockdb  user: stockuser
...
[INFO] spark.stream_quotes – Bronze query started
[INFO] spark.stream_quotes – Silver query started
[INFO] spark.stream_quotes – Gold query started
[INFO] spark.stream_quotes – All streaming queries running…
[INFO] spark.stream_quotes – [Bronze] batch=1  rows=7
```

> The job runs **continuously**. Keep this terminal open, or run it with `nohup bash spark/submit_job.sh &` to background it.

### Step 4 — Open the Dashboard

Navigate to **http://localhost:3000** — live stock prices will start streaming in.

### Step 5 — Stop Everything

```bash
docker compose down           # Stop containers (keeps data)
docker compose down -v        # Stop + delete ALL data (fresh start)
```

---

## Quick Start — Windows 🪟

Your Windows friends can run this too! There are **two options**:

---

### Option A — Git Bash (Recommended, Easiest)

**Prerequisites:**
1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) — enable WSL 2 backend during install
2. Install [Git for Windows](https://git-scm.com/download/win) — this includes **Git Bash**

**Steps:**

1. Open **Git Bash** (search for it in Start Menu)

2. Clone the project:
   ```bash
   git clone <your-repo-url>
   cd stock-streaming
   cp .env.example .env
   ```

3. Start all services:
   ```bash
   docker compose up --build -d
   ```

4. Submit the Spark job — **Git Bash can run `.sh` files directly**:
   ```bash
   bash spark/submit_job.sh
   ```

5. Open http://localhost:3000 in your browser ✅

> **Note:** On Windows, the `docker` command works from Git Bash as long as Docker Desktop is running. You'll see the Docker icon in your system tray.

---

### Option B — PowerShell / Command Prompt

If your friend doesn't want to use Git Bash, they can run the `docker exec` command manually from PowerShell:

1. Start all services (same as above, works in PowerShell):
   ```powershell
   docker compose up --build -d
   ```

2. Submit the Spark job manually (copy-paste this into PowerShell):
   ```powershell
   # Load .env file
   Get-Content .env | ForEach-Object {
     if ($_ -match '^([^#][^=]*)=(.*)$') {
       [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
     }
   }

   # Submit the job
   docker exec `
     -e STREAM_RUN_ID=stable `
     -e STREAM_CHECKPOINT_ROOT=/tmp/checkpoints `
     -e POSTGRES_HOST=postgres `
     -e POSTGRES_PORT=5432 `
     -e POSTGRES_DB=$env:POSTGRES_DB `
     -e POSTGRES_USER=$env:POSTGRES_USER `
     -e POSTGRES_PASSWORD=$env:POSTGRES_PASSWORD `
     -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 `
     spark-master `
     /opt/spark/bin/spark-submit `
       --master spark://spark-master:7077 `
       --conf "spark.driver.extraJavaOptions=-Dlog4j.rootCategory=WARN,console" `
       /opt/spark/jobs/stream_quotes.py
   ```

---

### Option C — WSL 2 (Most Linux-like)

If your friend has WSL 2 installed (Ubuntu on Windows):
```bash
# Inside WSL terminal — works exactly like Linux
bash spark/submit_job.sh
```

---

### Windows Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker: command not found` in Git Bash | Make sure Docker Desktop is running (check system tray icon) |
| `permission denied` on `.sh` file | Use `bash spark/submit_job.sh` instead of `./spark/submit_job.sh` |
| Port already in use | Another app is using that port. Change the left-side port in `docker-compose.yml` (e.g., `"3001:80"`) |
| Docker Desktop won't start | Enable virtualization in BIOS, or enable WSL 2 in Windows Features |
| Line ending errors (`\r`) in bash scripts | In Git Bash: `sed -i 's/\r//' spark/submit_job.sh && bash spark/submit_job.sh` |

---

## Project Structure

```
stock-streaming/
├── 📄 docker-compose.yml          # All 10 services defined here
├── 📄 .env                        # Your config (not committed to git)
├── 📄 .env.example                # Template — copy this to .env
│
├── 📁 producer/                   # Stock data Kafka producer
│   ├── Dockerfile
│   └── src/
│       ├── main.py                # Entry point – fetch & publish loop
│       ├── api_client.py          # Finnhub / Alpha Vantage / TwelveData / Mock
│       ├── kafka_producer.py      # confluent-kafka wrapper
│       └── config.py              # Pydantic settings
│
├── 📁 spark/                      # PySpark streaming job
│   ├── Dockerfile                 # Spark image + Python deps + JDBC jars
│   ├── submit_job.sh              # Helper: submits job with correct env vars (Linux/Mac)
│   ├── submit_job.ps1             # Helper: submits job for Windows PowerShell
│   └── jobs/
│       └── stream_quotes.py       # Structured Streaming: Bronze → Silver → Gold
│
├── 📁 backend/                    # FastAPI REST + WebSocket server
│   ├── Dockerfile                 # Uses uv + pyproject.toml
│   ├── pyproject.toml
│   └── src/
│       ├── main.py                # App + CORS + WebSocket setup
│       ├── database.py            # SQLAlchemy engine + session
│       ├── models.py              # ORM models for all tables
│       └── routers/
│           ├── stocks.py          # GET /api/stocks/*
│           ├── alerts.py          # GET /api/alerts
│           ├── market.py          # GET /api/market/*
│           └── ml.py              # GET /api/ml/* (predictions showcase)
│
├── 📁 ml/                         # 🤖 Price Direction Classifier (ML module)
│   ├── Dockerfile                 # Uses uv + pyproject.toml (same as backend/producer)
│   ├── pyproject.toml             # scikit-learn, pandas, numpy, psycopg2
│   ├── train.py                   # Pulls Gold data, trains Random Forest, saves model
│   ├── predict.py                 # Loads model, predicts every 30s, writes to DB
│   └── run.py                     # Entrypoint: train → predict loop (auto-retrains hourly)
│
├── 📁 frontend/                   # React + Vite dashboard
│   └── src/
│       ├── pages/
│       │   ├── MarketOverview.tsx # Live price grid + KPIs
│       │   ├── StockDetail.tsx    # Individual stock chart
│       │   ├── Alerts.tsx         # Anomaly alerts feed
│       │   ├── Pipeline.tsx       # Bronze/Silver/Gold row counts
│       │   └── Architecture.tsx   # System diagram
│       └── components/
│           ├── stocks/            # StockCard, StockChart, StockGrid
│           └── layout/            # AppShell, Sidebar, Header
│
└── 📁 sql/                        # Database schema (auto-applied on startup)
    ├── 001_create_bronze_tables.sql
    ├── 002_create_silver_tables.sql
    ├── 003_create_gold_tables.sql
    ├── 004_seed_dim_stock.sql
    ├── 005_create_ml_tables.sql   # ml_predictions + ml_model_runs
    └── init_db.sh                 # Idempotent init script (runs every startup)
```

---

## Data Pipeline — Medallion Architecture

```
                    Kafka Topic: stock.raw.quotes
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  🥉 BRONZE  (bronze_stock_quotes)    │
          │  • Raw JSON stored as-is (JSONB)     │
          │  • Never modified — full audit trail │
          └──────────────────┬───────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  🥈 SILVER  (silver_stock_quotes)    │
          │  • Parsed, typed, validated          │
          │  • Nulls removed, timestamps fixed   │
          └──────────────────┬───────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  🥇 GOLD    (fact_stock_price)       │
          │  • Moving averages (MA5, MA20)       │
          │  • Price change % per tick           │
          │  • Volatility (std dev)              │
          │  • Anomaly flag (>2% spike)          │
          └──────────────────┬───────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  🚨 ALERTS  (stock_alerts)           │
          │  • Auto-generated on anomaly         │
          │  • MEDIUM (>2%) / HIGH (>5%)         │
          └──────────────────────────────────────┘
```

**Checkpoint Persistence:** The Spark job uses a **stable checkpoint ID** (`/tmp/checkpoints/stable`) stored in a Docker named volume. This means:
- Restarting containers **does not lose Kafka offsets**
- No duplicate or missing data across restarts
- To reset (replay from scratch): `docker exec spark-master rm -rf /tmp/checkpoints/stable`

---

## API Reference

All endpoints served from **http://localhost:8000**. Interactive docs at `/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stocks` | Latest quote for all tracked symbols |
| `GET` | `/api/stocks/{sym}/latest` | Latest quote for one symbol (e.g. `AAPL`) |
| `GET` | `/api/stocks/{sym}/history?hours=24` | Historical quotes (default 24h) |
| `GET` | `/api/stocks/{sym}/indicators` | Gold metrics: MAs, volatility, anomaly |
| `GET` | `/api/alerts` | Recent anomaly alerts |
| `GET` | `/api/market/overview` | Enriched snapshot for all symbols |
| `GET` | `/api/market/pipeline` | Bronze/Silver/Gold row counts |
| `GET` | `/api/ml/predictions` |  Latest UP/DOWN prediction for every symbol |
| `GET` | `/api/ml/predictions/{sym}` |  Prediction history for one symbol |
| `GET` | `/api/ml/model` |  Training info: accuracy, top feature, rows trained |
| `GET` | `/api/ml/summary` |  Total predictions, UP/DOWN split, avg confidence |
| `WS` | `/ws/stocks` | WebSocket — live push every 3 seconds |

---

## Configuration (.env)

```bash
# ── PostgreSQL ──────────────────────────────────────
POSTGRES_USER=stockuser
POSTGRES_PASSWORD=stockpass        # Change in production!
POSTGRES_DB=stockdb

# ── Kafka ───────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# ── Stock API Keys (add at least one for live data) ─
# If all are empty, the mock generator runs automatically
ALPHA_VANTAGE_API_KEY=            # https://www.alphavantage.co/support/#api-key
FINNHUB_API_KEY=                  # https://finnhub.io/ (free tier)
TWELVE_DATA_API_KEY=              # https://twelvedata.com/ (free tier)

# ── Producer Settings ───────────────────────────────
STOCK_SYMBOLS=AAPL,MSFT,TSLA,GOOGL,AMZN,NVDA,META,NFLX
FETCH_INTERVAL_SECONDS=5

# ── Backend ─────────────────────────────────────────
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
SECRET_KEY=change_me_in_production
```

---

## pgAdmin — Browse the Database

1. Go to **http://localhost:5050**
2. Login: `admin@stock.com` / `admin`
3. Right-click **Servers** → **Register** → **Server**
4. Fill in:
   - **Name:** `Stock DB`
   - **Host:** `postgres`
   - **Port:** `5432`
   - **Database:** `stockdb`
   - **Username:** `stockuser`
   - **Password:** `stockpass`
5. Click **Save** — you'll see all tables under `stockdb → Schemas → public → Tables`

**Useful queries to run in pgAdmin:**

```sql
-- Check data counts across all layers
SELECT 'bronze' AS layer, COUNT(*) FROM bronze_stock_quotes
UNION ALL SELECT 'silver', COUNT(*) FROM silver_stock_quotes
UNION ALL SELECT 'gold',   COUNT(*) FROM fact_stock_price
UNION ALL SELECT 'alerts', COUNT(*) FROM stock_alerts
UNION ALL SELECT 'ml_predictions', COUNT(*) FROM ml_predictions;

-- Latest prices
SELECT symbol, price, pct_change, anomaly_flag, event_time
FROM fact_stock_price
ORDER BY event_time DESC
LIMIT 20;

-- Recent alerts
SELECT * FROM stock_alerts ORDER BY created_at DESC LIMIT 10;

-- ML predictions (latest per symbol)
SELECT DISTINCT ON (symbol)
    symbol, prediction, confidence, price_at_pred, predicted_at
FROM ml_predictions
ORDER BY symbol, predicted_at DESC;

-- ML model training history (accuracy over time)
SELECT model_version, total_rows, accuracy, top_feature, trained_at
FROM ml_model_runs
ORDER BY trained_at DESC;
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `stockdb does not exist` | Volume existed before DB was created | Run `docker compose down -v && docker compose up -d` for a clean start |
| No data in dashboard | Spark job not submitted | Run `bash spark/submit_job.sh` from the project root |
| Spark job fails — checkpoint mkdir error | Permission issue on checkpoint volume | Run `docker exec --user root spark-master chmod 777 /tmp/checkpoints` then re-submit |
| Producer crashes immediately | Kafka not ready yet | Wait 30s, then `docker compose restart producer` |
| `kafka: command not found` | Wrong container | The Kafka container is named `kafka`, not `kafka-broker` |
| pgAdmin can't connect to postgres | Wrong host | Use `postgres` (container name), NOT `localhost` |
| Port 3000 already in use | Another app using it | Edit `docker-compose.yml`: change `"3000:80"` to `"3001:80"` |
| Spark UI shows no workers | Worker not connected | Check `docker logs spark-worker` for errors |
| `Error: ENOENT` on frontend | Node modules missing | Run `docker compose build --no-cache frontend` |
| ML not predicting yet | Not enough Gold rows | Wait for Spark to collect 100+ rows, or lower `TRAIN_MIN_ROWS` in `docker-compose.yml` |
| ML always predicts DOWN | Mock/flat price data | Normal with mock data (zero volatility — model is correct). Use real API keys for varied predictions |
| ML container crashes | Missing model or DB not ready | Check `docker logs stock-ml`. It retries automatically if data is insufficient |

---

## Extending the Project

| Feature | How to Add |
|---------|-----------|
| **RSI / MACD / Bollinger Bands** | Add columns to `fact_stock_price`, compute inside `write_gold()` in `stream_quotes.py` |
| **ML Anomaly Detection** | Replace the `>2%` threshold in `write_gold()` with scikit-learn Isolation Forest |
| **Time Series Forecast (Prophet)** | Add `prophet` to `ml/pyproject.toml`, create `forecast.py`, new endpoint `/api/ml/forecast/{sym}` |
| **LSTM Deep Learning** | Add `torch` to `ml/pyproject.toml`, replace Random Forest in `ml/train.py` with LSTM |
| **Grafana Dashboard** | Add Grafana service to `docker-compose.yml`, connect to PostgreSQL Gold + ML tables |
| **Apache Superset** | Add Superset service, connect to `postgres:5432/stockdb` for SQL exploration |
| **CSV Export** | Add `GET /api/stocks/{sym}/export` endpoint in `backend/src/routers/stocks.py` |
| **More Symbols** | Edit `STOCK_SYMBOLS` in `.env` — no code changes needed |
| **Email Alerts** | Add an SMTP call in `write_gold()` when `anomaly=True` |
| **Apache Airflow** | Add a DAG that calls `spark/submit_job.sh` on a schedule |

---

## License

MIT — free to use, modify, and distribute.
