FROM python:3.11-slim

WORKDIR /ml

# Install uv (same as producer & backend)
RUN pip install uv --no-cache-dir

# Install system dep for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy project definition first (Docker layer caching —
# dependencies only reinstall when pyproject.toml changes)
COPY pyproject.toml .

# Install dependencies via uv (no venv – system install inside container)
RUN uv pip install --system .

# Copy ML scripts
COPY train.py   .
COPY predict.py .
COPY run.py     .

# Create model directory with correct permissions
RUN mkdir -p /ml/model && chmod 777 /ml/model

# Default: train then predict in a loop (see run.py)
CMD ["python", "run.py"]
