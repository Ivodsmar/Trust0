'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfiles } from '@/contexts/ProfileContext'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type Listing = {
  id: string
  traderName: string
  price: number
  quantity: number
  type: 'buy' | 'sell'
  commodity: string
}

type HistoricalPrice = {
  date: string
  price: number
}

export default function HomePage() {
  const [buyListings, setBuyListings] = useState<Listing[]>([])
  const [sellListings, setSellListings] = useState<Listing[]>([])
  const [livePrice, setLivePrice] = useState<number>(0)
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([])
  const router = useRouter()
  const { profiles } = useProfiles()

  useEffect(() => {
    // Generate listings for Trader A and Trader B
    const traders = ['A', 'B']
    const newBuyListings: Listing[] = traders.flatMap((trader) => 
      Array(10).fill(null).map((_, index) => ({
        id: `buy-${trader}-${index}`,
        traderName: `Trader ${trader}`,
        price: 70 + Math.random() * 5,
        quantity: 1000 + Math.floor(Math.random() * 1000),
        type: 'buy',
        commodity: 'Oil'
      }))
    )
    const newSellListings: Listing[] = traders.flatMap((trader) => 
      Array(10).fill(null).map((_, index) => ({
        id: `sell-${trader}-${index}`,
        traderName: `Trader ${trader}`,
        price: 72 + Math.random() * 5,
        quantity: 1000 + Math.floor(Math.random() * 1000),
        type: 'sell',
        commodity: 'Oil'
      }))
    )

    setBuyListings(newBuyListings)
    setSellListings(newSellListings)
    
    // Set live price as the average of the highest buy and lowest sell price
    const highestBuyPrice = Math.max(...newBuyListings.map(l => l.price))
    const lowestSellPrice = Math.min(...newSellListings.map(l => l.price))
    const newLivePrice = (highestBuyPrice + lowestSellPrice) / 2
    setLivePrice(newLivePrice)

    // Generate historical prices
    const today = new Date()
    const newHistoricalPrices: HistoricalPrice[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        price: 70 + Math.random() * 5
      }
    })
    newHistoricalPrices.push({ date: today.toISOString().split('T')[0], price: newLivePrice })
    setHistoricalPrices(newHistoricalPrices)
  }, [profiles])

  const handleListingClick = (listing: Listing) => {
    router.push(`/transaction/${listing.id}?type=${listing.type}&price=${listing.price}&quantity=${listing.quantity}&commodity=${listing.commodity}&traderName=${encodeURIComponent(listing.traderName)}`)
  }

  const chartData = {
    labels: historicalPrices.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Oil Price',
        data: historicalPrices.map(item => item.price),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 5,
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Oil Market</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Live Oil Price: ${livePrice.toFixed(2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buy Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {buyListings.sort((a, b) => b.price - a.price).map((listing) => (
              <Button
                key={listing.id}
                variant="outline"
                className="w-full text-left mb-2"
                onClick={() => handleListingClick(listing)}
              >
                <span>{listing.traderName}</span>
                <span className="ml-auto">${listing.price.toFixed(2)} - {listing.quantity} barrels</span>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sell Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {sellListings.sort((a, b) => a.price - b.price).map((listing) => (
              <Button
                key={listing.id}
                variant="outline"
                className="w-full text-left mb-2"
                onClick={() => handleListingClick(listing)}
              >
                <span>{listing.traderName}</span>
                <span className="ml-auto">${listing.price.toFixed(2)} - {listing.quantity} barrels</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}