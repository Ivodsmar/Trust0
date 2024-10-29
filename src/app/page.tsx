'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useProfiles } from '@/contexts/ProfileContext'

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
  const { profiles, currentProfile } = useProfiles()

  useEffect(() => {
    // Generate listings based on profiles
    const traders = profiles.filter(p => p.type === 'trader')
    const newBuyListings: Listing[] = traders.map((trader, index) => ({
      id: `buy-${trader.id}`,
      traderName: trader.name,
      price: 70 + Math.random() * 5,
      quantity: 1000 + Math.floor(Math.random() * 1000),
      type: 'buy',
      commodity: 'Oil'
    }))
    const newSellListings: Listing[] = traders.map((trader, index) => ({
      id: `sell-${trader.id}`,
      traderName: trader.name,
      price: 72 + Math.random() * 5,
      quantity: 1000 + Math.floor(Math.random() * 1000),
      type: 'sell',
      commodity: 'Oil'
    }))

    setBuyListings(newBuyListings)
    setSellListings(newSellListings)
    setLivePrice(72.5)
    setHistoricalPrices([
      { date: '2023-01-01', price: 70 },
      { date: '2023-02-01', price: 71 },
      { date: '2023-03-01', price: 72 },
      { date: '2023-04-01', price: 72.5 },
    ])
  }, [profiles])

  const handleListingClick = (listing: Listing) => {
    router.push(`/transaction/${listing.id}?type=${listing.type}&price=${listing.price}&quantity=${listing.quantity}&commodity=${listing.commodity}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Oil Market</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Oil Price: ${livePrice.toFixed(2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              price: {
                label: "Price",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalPrices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="var(--color-price)" name="Price" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buy Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {buyListings.sort((a, b) => a.price - b.price).map((listing) => (
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
            {sellListings.sort((a, b) => b.price - a.price).map((listing) => (
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
      {currentProfile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${currentProfile.balance.toFixed(2)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}