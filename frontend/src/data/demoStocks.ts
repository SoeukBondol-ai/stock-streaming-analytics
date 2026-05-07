import { StockQuote, StockAlert, PipelineStatus } from '../types/stock'

export const DEMO_COMPANIES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  TSLA: 'Tesla, Inc.',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com, Inc.',
  NVDA: 'NVIDIA Corporation',
}

export const DEMO_QUOTES: StockQuote[] = [
  {
    symbol: 'AAPL',
    company_name: 'Apple Inc.',
    companyName: 'Apple Inc.',
    price: 172.62,
    price_change: 1.45,
    change: 1.45,
    pct_change: 0.85,
    changePercent: 0.85,
    open_price: 171.17,
    open: 171.17,
    high_price: 173.05,
    high: 173.05,
    low_price: 170.80,
    low: 170.80,
    volume: 52403200,
    moving_avg_5: 171.92,
    ma5: 171.92,
    moving_avg_20: 170.45,
    ma20: 170.45,
    volatility: 1.22,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  },
  {
    symbol: 'MSFT',
    company_name: 'Microsoft Corporation',
    companyName: 'Microsoft Corporation',
    price: 415.60,
    price_change: -3.20,
    change: -3.20,
    pct_change: -0.76,
    changePercent: -0.76,
    open_price: 418.80,
    open: 418.80,
    high_price: 419.25,
    high: 419.25,
    low_price: 414.50,
    low: 414.50,
    volume: 22849500,
    moving_avg_5: 416.80,
    ma5: 416.80,
    moving_avg_20: 412.15,
    ma20: 412.15,
    volatility: 1.45,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  },
  {
    symbol: 'TSLA',
    company_name: 'Tesla, Inc.',
    companyName: 'Tesla, Inc.',
    price: 178.45,
    price_change: 8.24,
    change: 8.24,
    pct_change: 4.84,
    changePercent: 4.84,
    open_price: 170.21,
    open: 170.21,
    high_price: 179.43,
    high: 179.43,
    low_price: 169.88,
    low: 169.88,
    volume: 98450100,
    moving_avg_5: 173.20,
    ma5: 173.20,
    moving_avg_20: 168.40,
    ma20: 168.40,
    volatility: 3.82,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  },
  {
    symbol: 'GOOGL',
    company_name: 'Alphabet Inc.',
    companyName: 'Alphabet Inc.',
    price: 154.09,
    price_change: 0.52,
    change: 0.52,
    pct_change: 0.34,
    changePercent: 0.34,
    open_price: 153.57,
    open: 153.57,
    high_price: 155.12,
    high: 155.12,
    low_price: 153.25,
    low: 153.25,
    volume: 28401000,
    moving_avg_5: 153.80,
    ma5: 153.80,
    moving_avg_20: 151.60,
    ma20: 151.60,
    volatility: 1.10,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  },
  {
    symbol: 'AMZN',
    company_name: 'Amazon.com, Inc.',
    companyName: 'Amazon.com, Inc.',
    price: 181.28,
    price_change: -1.82,
    change: -1.82,
    pct_change: -0.99,
    changePercent: -0.99,
    open_price: 183.10,
    open: 183.10,
    high_price: 183.30,
    high: 183.30,
    low_price: 180.12,
    low: 180.12,
    volume: 38405000,
    moving_avg_5: 182.40,
    ma5: 182.40,
    moving_avg_20: 178.90,
    ma20: 178.90,
    volatility: 1.62,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  },
  {
    symbol: 'NVDA',
    company_name: 'NVIDIA Corporation',
    companyName: 'NVIDIA Corporation',
    price: 875.39,
    price_change: 14.52,
    change: 14.52,
    pct_change: 3.57,
    changePercent: 3.57,
    open_price: 860.10,
    open: 860.10,
    high_price: 880.50,
    high: 880.50,
    low_price: 855.20,
    low: 855.20,
    volume: 44600000,
    moving_avg_5: 865.20,
    ma5: 865.20,
    moving_avg_20: 850.40,
    ma20: 850.40,
    volatility: 2.85,
    anomaly_flag: false,
    anomalyFlag: false,
    event_time: new Date().toISOString(),
  }
]

export const generateDemoHistory = (symbol: string, hours: number): any[] => {
  const points: any[] = []
  const now = Date.now()
  const step = (hours * 3600 * 1000) / 100 // 100 steps
  
  const baseQuote = DEMO_QUOTES.find(q => q.symbol === symbol) || DEMO_QUOTES[0]
  let currentPrice = baseQuote.price - (baseQuote.price_change ?? 0)
  
  for (let i = 0; i <= 100; i++) {
    const time = new Date(now - (100 - i) * step).toISOString()
    const pct = (i / 100)
    // Add some random walks
    const noise = (Math.random() - 0.48) * (currentPrice * 0.005)
    currentPrice += noise
    
    // Smooth moving averages simulation
    const ma5 = currentPrice * (1 + (Math.sin(i / 5) * 0.002))
    const ma20 = currentPrice * (1 + (Math.cos(i / 15) * 0.004))

    points.push({
      event_time: time,
      eventTime: time,
      price: currentPrice,
      moving_avg_5: ma5,
      ma5: ma5,
      moving_avg_20: ma20,
      ma20: ma20,
    })
  }
  return points
}

export const DEMO_ALERTS: StockAlert[] = [
  {
    id: 1,
    symbol: 'TSLA',
    alert_type: 'Anomaly Detection',
    alertType: 'Anomaly Detection',
    message: 'Tesla stock price surging over 4.5% within 15 minutes. Significant volume spike detected.',
    severity: 'HIGH',
    price: 178.45,
    pct_change: 4.84,
    pctChange: 4.84,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
  },
  {
    id: 2,
    symbol: 'MSFT',
    alert_type: 'MACD Crossover',
    alertType: 'MACD Crossover',
    message: 'Microsoft price crossed below its 20-period simple moving average on high volatility.',
    severity: 'MEDIUM',
    price: 415.60,
    pct_change: -0.76,
    pctChange: -0.76,
    created_at: new Date(Date.now() - 24 * 60000).toISOString(), // 24 mins ago
  },
  {
    id: 3,
    symbol: 'AAPL',
    alert_type: 'Volume Trigger',
    alertType: 'Volume Trigger',
    message: 'Apple volume crossed 1.5x daily moving average. Price holding stable support zone.',
    severity: 'LOW',
    price: 172.62,
    pct_change: 0.85,
    pctChange: 0.85,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
  }
]

export const DEMO_PIPELINE: PipelineStatus = {
  bronze_count: 3450212,
  silver_count: 3450198,
  gold_count: 3450198,
  alert_count: 245,
  latest_ingest: new Date().toISOString(),
}
