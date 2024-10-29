'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Edit2, Save } from 'lucide-react'
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'

type Interest = {
  buy: string[];
  sell: string[];
  finance: string[];
}

type Profile = {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  interests?: Interest;
  balance: number;
  type: 'trader' | 'financier';
  totalFunds?: number;
  availableFunds?: number;
}

type EditedProfile = Omit<Profile, 'id' | 'type'> & {
  interests: Interest;
}

export default function MyProfilePage() {
  const { currentProfile, updateProfileBalance } = useProfiles()
  const { getTransactionsByProfile, getTotalLoanedAmount } = useTransactions()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<EditedProfile | null>(null)
  const [newInterest, setNewInterest] = useState({ type: 'buy', value: '' })

  useEffect(() => {
    if (currentProfile) {
      setEditedProfile({
        name: currentProfile.name,
        email: currentProfile.email || '',
        bio: currentProfile.bio || '',
        interests: currentProfile.interests || { buy: [], sell: [], finance: [] },
        balance: currentProfile.balance
      })
    }
  }, [currentProfile])

  if (!currentProfile || !editedProfile) {
    return <div>Loading...</div>
  }

  const transactions = getTransactionsByProfile(currentProfile.id)
  const totalLoanedAmount = getTotalLoanedAmount(currentProfile.id)
  const transactionVolume = transactions.reduce((sum, t) => sum + t.total, 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedProfile(prev => ({ ...prev!, [name]: value }))
  }

  const handleInterestAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newInterest.value) {
      setEditedProfile(prev => ({
        ...prev!,
        interests: {
          ...prev!.interests,
          [newInterest.type]: [...prev!.interests[newInterest.type as keyof Interest], newInterest.value]
        }
      }))
      setNewInterest({ type: 'buy', value: '' })
    }
  }

  const handleInterestRemove = (type: keyof Interest, interest: string) => {
    setEditedProfile(prev => ({
      ...prev!,
      interests: {
        ...prev!.interests,
        [type]: prev!.interests[type].filter(i => i !== interest)
      }
    }))
  }

  const handleSave = () => {
    if (editedProfile) {
      console.log('Saving user data:', editedProfile)
      updateProfileBalance(currentProfile.id, editedProfile.balance)
      // Here you would typically send the full editedProfile to your backend
      setIsEditing(false)
    }
  }

  const availableFunds = currentProfile.balance
  const totalFunds = currentProfile.type === 'financier' ? (currentProfile.totalFunds || currentProfile.balance) : currentProfile.balance
  const usedFundsPercentage = currentProfile.type === 'financier' ? ((totalLoanedAmount / totalFunds) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`/placeholder.svg?height=100&width=100`} alt={currentProfile.name} />
              <AvatarFallback>{currentProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  currentProfile.name
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">User ID: {currentProfile.id}</p>
              <p className="text-sm text-muted-foreground">Type: {currentProfile.type}</p>
              <p className="text-sm font-semibold">Balance: ${currentProfile.balance.toFixed(2)}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={editedProfile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={editedProfile.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-24"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Trust Rank</h3>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" />
                <span className="text-xl font-bold">4.5</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (Based on ${transactionVolume.toLocaleString()} USD transaction volume)
                </span>
              </div>
            </div>
            {currentProfile.type === 'financier' && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Financing Overview</h3>
                <Progress value={usedFundsPercentage} className="w-full" />
                <div className="flex justify-between mt-2">
                  <span>Available: ${availableFunds.toFixed(2)}</span>
                  <span>In Use: ${totalLoanedAmount.toFixed(2)}</span>
                  <span>Total: ${totalFunds.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2">Interests</h3>
              {Object.entries(editedProfile.interests).map(([type, interests]) => (
                <div key={type} className="mb-2">
                  <span className="font-medium capitalize">{type}: </span>
                  {interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleInterestRemove(type as keyof Interest, interest)}
                          className="ml-1 text-xs text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              ))}
              {isEditing && (
                <form onSubmit={handleInterestAdd} className="mt-2 flex items-center space-x-2">
                  <select
                    value={newInterest.type}
                    onChange={(e) => setNewInterest(prev => ({ ...prev, type: e.target.value as 'buy' | 'sell' | 'finance' }))}
                    className="border rounded p-1"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                    <option value="finance">Finance</option>
                  </select>
                  <Input
                    value={newInterest.value}
                    onChange={(e) => setNewInterest(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="New interest"
                    className="flex-grow"
                  />
                  <Button type="submit">Add</Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.commodity}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>${transaction.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {transaction.buyerId === currentProfile.id ? 'Buyer' : 
                     transaction.sellerId === currentProfile.id ? 'Seller' : 'Financier'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}