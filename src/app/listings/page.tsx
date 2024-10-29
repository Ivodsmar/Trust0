'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Search } from 'lucide-react'

// Mock data for commodities
const commodities = [
  { id: 'oil', name: 'Crude Oil', unit: 'barrel' },
  { id: 'gold', name: 'Gold', unit: 'ounce' },
  { id: 'silver', name: 'Silver', unit: 'ounce' },
  { id: 'copper', name: 'Copper', unit: 'ton' },
  { id: 'wheat', name: 'Wheat', unit: 'bushel' },
  { id: 'corn', name: 'Corn', unit: 'bushel' },
  { id: 'coffee', name: 'Coffee', unit: 'pound' },
  { id: 'natural_gas', name: 'Natural Gas', unit: 'MMBtu' },
]

// Mock data for listings
const mockListings = commodities.flatMap(commodity => 
  Array(5).fill(null).map((_, index) => ({
    id: `${commodity.id}-${index}`,
    commodityId: commodity.id,
    type: index % 2 === 0 ? 'buy' : 'sell',
    price: Math.random() * 1000,
    quantity: Math.floor(Math.random() * 1000),
    trader: `Trader${Math.floor(Math.random() * 100)}`,
  }))
)

export default function ListingsPage() {
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'price', direction: 'asc' })

  const filteredListings = mockListings.filter(listing => 
    (selectedCommodity === 'all' || listing.commodityId === selectedCommodity) &&
    (listing.trader.toLowerCase().includes(searchTerm.toLowerCase()) ||
     commodities.find(c => c.id === listing.commodityId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Commodity Listings</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select commodity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Commodities</SelectItem>
              {commodities.map(commodity => (
                <SelectItem key={commodity.id} value={commodity.id}>{commodity.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort('commodityId')}>
                    Commodity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('type')}>
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('price')}>
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort('quantity')}>
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Trader</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    {commodities.find(c => c.id === listing.commodityId)?.name}
                  </TableCell>
                  <TableCell>
                    <span className={listing.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                      {listing.type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ${listing.price.toFixed(2)} / {commodities.find(c => c.id === listing.commodityId)?.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {listing.quantity} {commodities.find(c => c.id === listing.commodityId)?.unit}s
                  </TableCell>
                  <TableCell className="text-right">{listing.trader}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}