"""
Configuration – loaded from environment / .env file.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # Kafka
    kafka_bootstrap_servers: str = "localhost:29092"
    kafka_topic_raw: str = "stock.raw.quotes"
    kafka_topic_alerts: str = "stock.alerts"

    # Stock data sources
    alpha_vantage_api_key: str = ""
    finnhub_api_key: str = ""
    twelve_data_api_key: str = ""

    # Symbols to track
    stock_symbols: str = "AAPL,MSFT,TSLA,GOOGL,AMZN"
    fetch_interval_seconds: int = 5

    @property
    def symbols_list(self) -> List[str]:
        return [s.strip() for s in self.stock_symbols.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
