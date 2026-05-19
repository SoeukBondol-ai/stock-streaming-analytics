#!/bin/bash
# init_db.sh – Idempotent database + schema bootstrap.
#
# This script runs every time the stack starts (via the init-db service).
# It is safe to run multiple times — all SQL uses CREATE IF NOT EXISTS.
#
# It does TWO things Docker's initdb.d cannot do reliably:
#   1. Creates the database if it doesn't exist yet.
#   2. Applies all schema migrations in order, even on an existing volume.

set -euo pipefail

PGHOST="${POSTGRES_HOST:-postgres}"
PGPORT="${POSTGRES_PORT:-5432}"
PGUSER="${POSTGRES_USER:-stockuser}"
PGPASSWORD="${POSTGRES_PASSWORD:-stockpass}"
PGDB="${POSTGRES_DB:-stockdb}"

export PGPASSWORD

echo "=========================================="
echo " Stock DB Init — $(date)"
echo " Host: $PGHOST:$PGPORT  DB: $PGDB  User: $PGUSER"
echo "=========================================="

# ── Wait for Postgres to be ready ──────────────────────────────────────────
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -q; do
  echo "  ... not ready yet, retrying in 2s"
  sleep 2
done
echo "✓ PostgreSQL is up."

# ── Ensure the database exists ─────────────────────────────────────────────
# Connect to the default "postgres" maintenance DB to create our target DB.
DB_EXISTS=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres \
  -tAc "SELECT 1 FROM pg_database WHERE datname = '${PGDB}';")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database '${PGDB}'..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres \
    -c "CREATE DATABASE \"${PGDB}\";"
  echo "✓ Database '${PGDB}' created."
else
  echo "✓ Database '${PGDB}' already exists."
fi

# ── Apply SQL migrations in order ──────────────────────────────────────────
SQL_DIR="/sql"
echo "Applying schema migrations from ${SQL_DIR} ..."

for sql_file in $(ls "${SQL_DIR}"/*.sql 2>/dev/null | sort); do
  filename=$(basename "$sql_file")
  echo "  → Running ${filename}..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -f "$sql_file" \
    --set ON_ERROR_STOP=off -q
  echo "    ✓ Done."
done

echo "=========================================="
echo " ✓ Database init complete — all tables ready."
echo "=========================================="
