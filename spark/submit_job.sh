#!/bin/bash
# Run this from the project root to submit the PySpark streaming job
# to the spark-master container.

#!/bin/bash
docker exec spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.sql.streaming.checkpointLocation=/tmp/spark-checkpoints \
  --conf "spark.driver.extraJavaOptions=-Dlog4j.rootCategory=WARN,console" \
  /opt/spark/jobs/stream_quotes.py
