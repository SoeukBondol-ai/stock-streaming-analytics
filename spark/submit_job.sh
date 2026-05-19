#!/bin/bash
# Run this from the project root to submit the PySpark streaming job
# to the spark-master container.
#
# Uses a FIXED checkpoint ID ("stable") so that restarting the container
# resumes Kafka offsets from where the job left off — no data loss or gaps.
# If you want a clean restart (replay from latest), delete the checkpoint:
#   docker exec spark-master rm -rf /tmp/checkpoints/stable

set -euo pipefail

# Load .env so we can forward credentials into the container
if [ -f .env ]; then
  # Export only the PG/Kafka vars (skip blank lines and comments)
  set -o allexport
  # shellcheck disable=SC1091
  source .env
  set +o allexport
fi

# Use a stable, fixed run ID so checkpoints persist across restarts.
# Change this value only if you intentionally want a fresh stream start.
STREAM_RUN_ID="stable"

echo "▶ Submitting Spark job (checkpoint run-id: ${STREAM_RUN_ID})"
echo "  PG host: postgres  db: ${POSTGRES_DB:-stockdb}  user: ${POSTGRES_USER:-stockuser}"

docker exec \
  -e STREAM_RUN_ID="${STREAM_RUN_ID}" \
  -e STREAM_CHECKPOINT_ROOT=/tmp/checkpoints \
  -e POSTGRES_HOST=postgres \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB="${POSTGRES_DB:-stockdb}" \
  -e POSTGRES_USER="${POSTGRES_USER:-stockuser}" \
  -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-stockpass}" \
  -e KAFKA_BOOTSTRAP_SERVERS="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}" \
  spark-master \
  /opt/spark/bin/spark-submit \
    --master spark://spark-master:7077 \
    --conf "spark.driver.extraJavaOptions=-Dlog4j.rootCategory=WARN,console" \
    /opt/spark/jobs/stream_quotes.py
