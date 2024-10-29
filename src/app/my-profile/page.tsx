'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Star, Edit2, Save } from 'lucide-react'

// Mock user data
const initialUserData = {
  id: '1',
  name: 'John Doe',
  avatar: '/placeholder.svg?height=100&width=100',
  email: 'john.doe@example.com',
  bio: 'Experienced commodities trader specializing in oil and precious metals.',
  interests: {
    buy: ['Oil', 'Natural Gas', 'Gold'],
    sell: ['Silver', 'Copper'],
    finance: ['Invoice Financing', 'Trade Finance']
  },
  trustRank: 4.5,
  transactionVolume: 1000000,
}

export default function MyProfilePage() {
  const [userData, setUserData] = useState(initialUserData)
  const [isEditing, setIsEditing] = useState(false)
  const [newInterest, setNewInterest] = useState({ type: 'buy', value: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newInterest.value) {
      setUserData(prev => ({
        ...prev,
        interests: {
          ...prev.interests,
          [newInterest.type]: [...prev.interests[newInterest.type as keyof typeof prev.interests], newInterest.value]
        }
      }))
      setNewInterest({ type: 'buy', value: '' })
    }
  }

  const handleInterestRemove = (type: string, interest: string) => {
    setUserData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [type]: prev.interests[type as keyof typeof prev.interests].filter(i => i !== interest)
      }
    }))
  }

  const handleSave = () => {
    // Here you would typically send the updated userData to your backend
    console.log('Saving user data:', userData)
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  userData.name
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">User ID: {userData.id}</p>
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
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-24"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Trust Rank</h3>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" />
                <span className="text-xl font-bold">{userData.trustRank.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (Based on {userData.transactionVolume.toLocaleString()} USD transaction volume)
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Interests</h3>
              {Object.entries(userData.interests).map(([type, interests]) => (
                <div key={type} className="mb-2">
                  <span className="font-medium capitalize">{type}: </span>
                  {interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleInterestRemove(type, interest)}
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
                    onChange={(e) => setNewInterest(prev => ({ ...prev, type: e.target.value }))}
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
          <p className="text-muted-foreground">
            Your transaction history will be displayed here. This section can include a table or list of your recent transactions,
            including details such as date, commodity, quantity, price, and transaction status.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}