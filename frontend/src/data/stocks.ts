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
    price: 295.46,
    changeAmount: -4.21,
    changePercent: -1.41,
    isPositive: false,
    stats: {
      open: '296.40',
      dayLow: '292.55',
      dayHigh: '298.19',
      volume: '45.2M',
      yearLow: '169.21',
      yearHigh: '260.10',
      marketCap: '4.43T',
      eps: '6.97',
      peRatio: '42.37',
    },
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    exchange: 'NASDAQ',
    price: 411.03,
    changeAmount: 8.55,
    changePercent: 2.12,
    isPositive: true,
    stats: {
      open: '402.48',
      dayLow: '399.02',
      dayHigh: '414.50',
      volume: '92.1M',
      yearLow: '138.80',
      yearHigh: '488.54',
      marketCap: '1.32T',
      eps: '3.56',
      peRatio: '115.46',
    },
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc',
    exchange: 'NASDAQ',
    price: 612.45,
    changeAmount: 9.82,
    changePercent: 1.63,
    isPositive: true,
    stats: {
      open: '602.63',
      dayLow: '600.44',
      dayHigh: '614.90',
      volume: '11.3M',
      yearLow: '414.50',
      yearHigh: '740.91',
      marketCap: '1.56T',
      eps: '23.86',
      peRatio: '25.67',
    },
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    exchange: 'NASDAQ',
    price: 265.09,
    changeAmount: 3.21,
    changePercent: 1.23,
    isPositive: true,
    stats: {
      open: '261.88',
      dayLow: '260.11',
      dayHigh: '266.15',
      volume: '28.6M',
      yearLow: '164.07',
      yearHigh: '242.52',
      marketCap: '2.82T',
      eps: '5.53',
      peRatio: '47.94',
    },
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc',
    exchange: 'NASDAQ',
    price: 401.47,
    changeAmount: 4.69,
    changePercent: 1.18,
    isPositive: true,
    stats: {
      open: '396.78',
      dayLow: '394.53',
      dayHigh: '408.61',
      volume: '15.1M',
      yearLow: '155.55',
      yearHigh: '208.70',
      marketCap: '4.89T',
      eps: '8.95',
      peRatio: '44.86',
    },
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    exchange: 'NASDAQ',
    price: 420.03,
    changeAmount: 5.12,
    changePercent: 1.23,
    isPositive: true,
    stats: {
      open: '414.91',
      dayLow: '412.86',
      dayHigh: '421.40',
      volume: '18.9M',
      yearLow: '344.79',
      yearHigh: '468.35',
      marketCap: '3.12T',
      eps: '12.41',
      peRatio: '33.85',
    },
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    exchange: 'NASDAQ',
    price: 221.04,
    changeAmount: 6.78,
    changePercent: 3.16,
    isPositive: true,
    stats: {
      open: '214.26',
      dayLow: '212.40',
      dayHigh: '222.30',
      volume: '198.4M',
      yearLow: '86.22',
      yearHigh: '153.13',
      marketCap: '5.38T',
      eps: '2.99',
      peRatio: '73.92',
    },
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc',
    exchange: 'NASDAQ',
    price: 1108.52,
    changeAmount: -12.34,
    changePercent: -1.10,
    isPositive: false,
    stats: {
      open: '1120.86',
      dayLow: '1103.18',
      dayHigh: '1124.22',
      volume: '2.8M',
      yearLow: '542.01',
      yearHigh: '1114.72',
      marketCap: '473.2B',
      eps: '19.83',
      peRatio: '55.90',
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
