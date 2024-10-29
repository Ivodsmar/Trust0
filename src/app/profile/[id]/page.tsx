'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Star } from 'lucide-react'

// Mock data for demonstration purposes
const mockUser = {
  id: '1',
  name: 'John Doe',
  avatar: '/placeholder.svg?height=100&width=100',
  interests: {
    buy: ['Oil', 'Natural Gas', 'Gold'],
    sell: ['Silver', 'Copper'],
    finance: ['Invoice Financing', 'Trade Finance']
  },
  trustRank: 4.5,
  transactionVolume: 1000000,
  listings: {
    buy: [
      { id: '1', commodity: 'Oil', quantity: '1000 barrels', price: '$70/barrel' },
      { id: '2', commodity: 'Gold', quantity: '100 oz', price: '$1800/oz' }
    ],
    sell: [
      { id: '3', commodity: 'Silver', quantity: '5000 oz', price: '$25/oz' },
      { id: '4', commodity: 'Copper', quantity: '10 tons', price: '$6000/ton' }
    ]
  }
}

export default function ProfilePage() {
  const { id } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
              <p className="text-sm text-muted-foreground">User ID: {id}</p>
            </div>
          </div>
          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Trust Rank</h3>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" />
              <span className="text-xl font-bold">{mockUser.trustRank.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-2">
                (Based on {mockUser.transactionVolume.toLocaleString()} USD transaction volume)
              </span>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Interests</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Buy: </span>
                {mockUser.interests.buy.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">{interest}</Badge>
                ))}
              </div>
              <div>
                <span className="font-medium">Sell: </span>
                {mockUser.interests.sell.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">{interest}</Badge>
                ))}
              </div>
              <div>
                <span className="font-medium">Finance: </span>
                {mockUser.interests.finance.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">{interest}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Buy Orders</h3>
              <ul className="list-disc list-inside">
                {mockUser.listings.buy.map((listing) => (
                  <li key={listing.id}>
                    {listing.commodity}: {listing.quantity} at {listing.price}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Sell Orders</h3>
              <ul className="list-disc list-inside">
                {mockUser.listings.sell.map((listing) => (
                  <li key={listing.id}>
                    {listing.commodity}: {listing.quantity} at {listing.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Transaction history will be displayed here. You can implement a table or list of recent transactions,
            including details such as date, commodity, quantity, price, and transaction status.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
