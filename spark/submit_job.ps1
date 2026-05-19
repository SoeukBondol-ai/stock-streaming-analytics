# submit_job.ps1 – Windows PowerShell version of spark/submit_job.sh
# Run this from the PROJECT ROOT:
#   PowerShell> .\spark\submit_job.ps1
#
# Requirements: Docker Desktop for Windows must be running.

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Stock Streaming — Spark Job Submitter  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── Load .env file ──────────────────────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (Test-Path $envFile) {
    Write-Host "Loading .env from: $envFile" -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            $key   = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "Warning: .env file not found, using defaults." -ForegroundColor Yellow
}

# ── Read values (with defaults matching docker-compose) ─────────────────────
$PG_DB   = if ($env:POSTGRES_DB)       { $env:POSTGRES_DB }       else { "stockdb" }
$PG_USER = if ($env:POSTGRES_USER)     { $env:POSTGRES_USER }     else { "stockuser" }
$PG_PASS = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "stockpass" }
$KAFKA   = if ($env:KAFKA_BOOTSTRAP_SERVERS) { $env:KAFKA_BOOTSTRAP_SERVERS } else { "kafka:9092" }

$STREAM_RUN_ID = "stable"

Write-Host ""
Write-Host "Submitting Spark job (checkpoint run-id: $STREAM_RUN_ID)" -ForegroundColor Green
Write-Host "  PG host: postgres  db: $PG_DB  user: $PG_USER" -ForegroundColor Gray
Write-Host ""

# ── Submit the job ──────────────────────────────────────────────────────────
docker exec `
    -e STREAM_RUN_ID=$STREAM_RUN_ID `
    -e STREAM_CHECKPOINT_ROOT=/tmp/checkpoints `
    -e POSTGRES_HOST=postgres `
    -e POSTGRES_PORT=5432 `
    -e POSTGRES_DB=$PG_DB `
    -e POSTGRES_USER=$PG_USER `
    -e POSTGRES_PASSWORD=$PG_PASS `
    -e KAFKA_BOOTSTRAP_SERVERS=$KAFKA `
    spark-master `
    /opt/spark/bin/spark-submit `
        --master spark://spark-master:7077 `
        --conf "spark.driver.extraJavaOptions=-Dlog4j.rootCategory=WARN,console" `
        /opt/spark/jobs/stream_quotes.py

Write-Host ""
Write-Host "Spark streaming job finished." -ForegroundColor Green
