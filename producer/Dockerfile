FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv --no-cache-dir

# Copy project definition and source
COPY pyproject.toml .
COPY src/ src/

# Install dependencies via uv (no venv – system install inside container)
RUN uv pip install --system .

ENV PYTHONPATH=/app/src

CMD ["python", "src/main.py"]
