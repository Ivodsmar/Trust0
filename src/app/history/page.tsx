'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBalance } from '@/hooks/useBalance'
import { useTransactions } from '@/contexts/TransactionContext'

export default function HistoryPage() {
  const { transactions } = useTransactions()
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { balance } = useBalance()

  useEffect(() => {
    const filtered = transactions.filter(transaction => 
      (filterType === 'all' || transaction.type === filterType) &&
      (transaction.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
       transaction.date.includes(searchTerm))
    )
    setFilteredTransactions(filtered)
  }, [filterType, searchTerm, transactions])

  const totalBought = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + t.total, 0)

  const totalSold = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + t.total, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Total Bought</p>
              <p className="text-2xl font-bold">${totalBought.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Sold</p>
              <p className="text-2xl font-bold">${totalSold.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Current Balance</p>
              <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-grow">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by commodity or date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter">Filter</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className={transaction.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{transaction.commodity}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>${transaction.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}