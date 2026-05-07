import client from './client'
import { StockQuote, StockAlert, PipelineStatus } from '../types/stock'

export async function getMarketOverview(): Promise<StockQuote[]> {
  const response = await client.get<StockQuote[]>('/api/market/overview')
  return response.data
}

export async function getStockLatestList(): Promise<StockQuote[]> {
  const response = await client.get<StockQuote[]>('/api/stocks/')
  return response.data
}

export async function getStockLatest(symbol: string): Promise<StockQuote> {
  const response = await client.get<StockQuote>(`/api/stocks/${symbol}/latest`)
  return response.data
}

export async function getStockIndicators(symbol: string, limit: number = 2000): Promise<StockQuote[]> {
  const response = await client.get<StockQuote[]>(`/api/stocks/${symbol}/indicators`, {
    params: { limit },
  })
  return response.data
}

export async function getStockHistory(symbol: string, hours: number = 24): Promise<StockQuote[]> {
  const response = await client.get<StockQuote[]>(`/api/stocks/${symbol}/history`, {
    params: { hours },
  })
  return response.data
}

export async function getAlerts(params?: { symbol?: string; severity?: string }): Promise<StockAlert[]> {
  const response = await client.get<StockAlert[]>('/api/alerts', { params })
  return response.data
}

export async function getPipelineStatus(): Promise<PipelineStatus> {
  const response = await client.get<PipelineStatus>('/api/market/pipeline')
  return response.data
}
