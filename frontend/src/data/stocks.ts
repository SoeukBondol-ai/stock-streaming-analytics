export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX'

export interface StockStats {
  open: string
  dayLow: string
  dayHigh: string
  volume: string
  yearLow: string
  yearHigh: string
  marketCap: string
  eps: string
  peRatio: string
}

export interface Stock {
  ticker: string
  name: string
  exchange: string
  price: number
  changeAmount: number
  changePercent: number
  isPositive: boolean
  stats: StockStats
}

export const stocks: Stock[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    exchange: 'NASDAQ',
    price: 285.17,
    changeAmount: 2.14,
    changePercent: 0.76,
    isPositive: true,
    stats: {
      open: '282.05',
      dayLow: '280.83',
      dayHigh: '286.69',
      volume: '12.4M',
      yearLow: '165.67',
      yearHigh: '298.34',
      marketCap: '4.2T',
      eps: '8.26',
      peRatio: '34.53',
    },
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    exchange: 'NASDAQ',
    price: 202.64,
    changeAmount: -5.32,
    changePercent: -2.56,
    isPositive: false,
    stats: {
      open: '208.00',
      dayLow: '198.50',
      dayHigh: '210.20',
      volume: '105.2M',
      yearLow: '152.37',
      yearHigh: '299.29',
      marketCap: '645.8B',
      eps: '3.12',
      peRatio: '64.95',
    },
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc',
    exchange: 'NASDAQ',
    price: 502.3,
    changeAmount: 12.45,
    changePercent: 2.54,
    isPositive: true,
    stats: {
      open: '492.10',
      dayLow: '490.50',
      dayHigh: '505.80',
      volume: '18.6M',
      yearLow: '198.20',
      yearHigh: '510.00',
      marketCap: '1.28T',
      eps: '14.87',
      peRatio: '33.78',
    },
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    exchange: 'NASDAQ',
    price: 178.22,
    changeAmount: 1.4,
    changePercent: 0.79,
    isPositive: true,
    stats: {
      open: '176.50',
      dayLow: '175.80',
      dayHigh: '179.10',
      volume: '35.2M',
      yearLow: '96.29',
      yearHigh: '180.14',
      marketCap: '1.85T',
      eps: '2.90',
      peRatio: '61.45',
    },
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc',
    exchange: 'NASDAQ',
    price: 138.08,
    changeAmount: -1.2,
    changePercent: -0.86,
    isPositive: false,
    stats: {
      open: '139.50',
      dayLow: '137.20',
      dayHigh: '140.10',
      volume: '22.1M',
      yearLow: '102.63',
      yearHigh: '153.78',
      marketCap: '1.72T',
      eps: '5.80',
      peRatio: '23.81',
    },
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    exchange: 'NASDAQ',
    price: 415.5,
    changeAmount: 3.2,
    changePercent: 0.78,
    isPositive: true,
    stats: {
      open: '412.00',
      dayLow: '410.50',
      dayHigh: '416.80',
      volume: '19.8M',
      yearLow: '269.52',
      yearHigh: '420.82',
      marketCap: '3.09T',
      eps: '11.06',
      peRatio: '37.57',
    },
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    exchange: 'NASDAQ',
    price: 822.79,
    changeAmount: 31.67,
    changePercent: 4.0,
    isPositive: true,
    stats: {
      open: '795.00',
      dayLow: '792.50',
      dayHigh: '823.00',
      volume: '45.6M',
      yearLow: '255.23',
      yearHigh: '823.94',
      marketCap: '2.06T',
      eps: '11.93',
      peRatio: '68.97',
    },
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc',
    exchange: 'NASDAQ',
    price: 619.34,
    changeAmount: -8.5,
    changePercent: -1.35,
    isPositive: false,
    stats: {
      open: '625.00',
      dayLow: '615.20',
      dayHigh: '628.50',
      volume: '3.4M',
      yearLow: '315.62',
      yearHigh: '634.36',
      marketCap: '268.1B',
      eps: '12.03',
      peRatio: '51.48',
    },
  },
]

export const getLogoUrl = (ticker: string) =>
  `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${ticker}.png`

// Helper to format date as "May 5"
const formatShortDate = (date: Date) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

const formatTime = (hour: number, minute: number) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

export const generateChartData = (
  basePrice: number,
  range: TimeRange,
  isPositive: boolean,
  previousClose: number,
) => {
  let dataPoints = 39
  let volatility = 0.005

  switch (range) {
    case '1D':
      dataPoints = 78 // every 5 minutes from 9:30 AM to 4:00 PM
      volatility = 0.003
      break
    case '5D':
      dataPoints = 80
      volatility = 0.008
      break
    case '1M':
      dataPoints = 22
      volatility = 0.015
      break
    case '6M':
      dataPoints = 26
      volatility = 0.025
      break
    case 'YTD':
      dataPoints = 30
      volatility = 0.025
      break
    case '1Y':
      dataPoints = 52
      volatility = 0.03
      break
    case '5Y':
      dataPoints = 60
      volatility = 0.05
      break
    case 'MAX':
      dataPoints = 100
      volatility = 0.06
      break
  }

  // Start from previousClose for 1D, otherwise from a "logical" starting point
  const startPrice =
    range === '1D' ? previousClose : basePrice * (isPositive ? 0.85 : 1.15)
  let currentPrice = startPrice
  const trendStrength = (basePrice - startPrice) / dataPoints

  const data: { time: string; price: number }[] = []

  for (let i = 0; i < dataPoints; i++) {
    const noise = currentPrice * volatility * (Math.random() - 0.5)
    currentPrice = currentPrice + trendStrength + noise

    if (i === dataPoints - 1) {
      currentPrice = basePrice
    }

    let timeLabel = ''
    if (range === '1D') {
      // 9:30 AM start, 5 min intervals
      const totalMinutes = 9 * 60 + 30 + i * 5
      const hour = Math.floor(totalMinutes / 60)
      const minute = totalMinutes % 60
      timeLabel = formatTime(hour, minute)
    } else if (range === '5D') {
      // ~16 points per day across 5 days
      const dayOffset = Math.floor((i / dataPoints) * 5)
      const date = new Date()
      date.setDate(date.getDate() - (4 - dayOffset))
      timeLabel = formatShortDate(date)
    } else if (range === '1M') {
      const date = new Date()
      date.setDate(date.getDate() - (dataPoints - 1 - i))
      timeLabel = formatShortDate(date)
    } else if (range === '6M' || range === 'YTD') {
      const date = new Date()
      const monthsBack = range === '6M' ? 6 : 5
      date.setMonth(
        date.getMonth() -
          monthsBack +
          Math.floor((i / dataPoints) * monthsBack),
      )
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      timeLabel = months[date.getMonth()]
    } else if (range === '1Y') {
      const date = new Date()
      date.setMonth(date.getMonth() - 12 + Math.floor((i / dataPoints) * 12))
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      timeLabel = months[date.getMonth()]
    } else if (range === '5Y') {
      const yearsBack = 5
      const year =
        new Date().getFullYear() -
        yearsBack +
        Math.floor((i / dataPoints) * yearsBack)
      timeLabel = `${year}`
    } else {
      const yearsBack = 20
      const year =
        new Date().getFullYear() -
        yearsBack +
        Math.floor((i / dataPoints) * yearsBack)
      timeLabel = `${year}`
    }

    data.push({
      time: timeLabel,
      price: Number(currentPrice.toFixed(2)),
    })
  }

  return data
}
