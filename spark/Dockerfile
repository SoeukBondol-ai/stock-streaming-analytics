# Official Apache Spark 3.5 on Python 3.11
FROM apache/spark:3.5.1-python3

USER root

# Install Python dependencies needed by the streaming job
RUN pip install --no-cache-dir \
    psycopg2-binary \
    python-dotenv

# Pre-download the Kafka + Postgres JDBC jars so spark-submit doesn't need
# internet access at job-submission time.
RUN curl -fSL \
    https://repo1.maven.org/maven2/org/apache/spark/spark-sql-kafka-0-10_2.12/3.5.1/spark-sql-kafka-0-10_2.12-3.5.1.jar \
    -o /opt/spark/jars/spark-sql-kafka-0-10_2.12-3.5.1.jar && \
    curl -fSL \
    https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/3.4.0/kafka-clients-3.4.0.jar \
    -o /opt/spark/jars/kafka-clients-3.4.0.jar && \
    curl -fSL \
    https://repo1.maven.org/maven2/org/apache/spark/spark-token-provider-kafka-0-10_2.12/3.5.1/spark-token-provider-kafka-0-10_2.12-3.5.1.jar \
    -o /opt/spark/jars/spark-token-provider-kafka-0-10_2.12-3.5.1.jar && \
    curl -fSL \
    https://repo1.maven.org/maven2/org/apache/commons/commons-pool2/2.11.1/commons-pool2-2.11.1.jar \
    -o /opt/spark/jars/commons-pool2-2.11.1.jar && \
    curl -fSL \
    https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.1/postgresql-42.7.1.jar \
    -o /opt/spark/jars/postgresql-42.7.1.jar

USER spark

WORKDIR /opt/spark