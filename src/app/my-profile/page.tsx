'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useProfiles, Profile } from '@/contexts/ProfileContext'
import { useTransactions, Transaction } from '@/contexts/TransactionContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, Edit2, Save, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type InterestType = 'buy' | 'sell' | 'finance'

export default function MyProfilePage() {
  const { currentProfile, setProfiles, updateProfileBalance, updateProfileInterests, repayLoan } = useProfiles()
  const { getTransactionsByProfile, getTotalLoanedAmount } = useTransactions()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(currentProfile)
  const [newInterest, setNewInterest] = useState({ type: 'buy' as InterestType, value: '' })
  const [repaymentAmount, setRepaymentAmount] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [currentLoans, setCurrentLoans] = useState<{ [key: string]: number }>({})

  const updateLoans = useCallback(() => {
    if (currentProfile) {
      const transactions = getTransactionsByProfile(currentProfile.id)
      const loans = transactions.filter((t: Transaction) =>
        (t.type === 'finance' && t.buyerId === currentProfile.id) ||
        (t.type === 'repay' && t.financierId === currentProfile.id)
      )

      const newLoans = loans.reduce((acc: { [key: string]: number }, loan: Transaction) => {
        if (loan.type === 'finance' && loan.financierId) {
          acc[loan.financierId] = (acc[loan.financierId] || 0) + (loan.loanAmount || 0)
        } else if (loan.type === 'repay' && loan.financierId) {
          acc[loan.financierId] = Math.max((acc[loan.financierId] || 0) - (loan.loanAmount || 0), 0)
        }
        return acc
      }, {})

      // Remove any fully repaid loans
      Object.keys(newLoans).forEach(key => {
        if (newLoans[key] <= 0) {
          delete newLoans[key]
        }
      })

      setCurrentLoans(newLoans)
    }
  }, [currentProfile, getTransactionsByProfile])

  useEffect(() => {
    if (currentProfile) {
      setEditedProfile(currentProfile)
      updateLoans()
    }
  }, [currentProfile, updateLoans])

  if (!currentProfile || !editedProfile) {
    return <div>Loading...</div>
  }

  const transactions = getTransactionsByProfile(currentProfile.id)
  const totalLoanedAmount = getTotalLoanedAmount(currentProfile.id)
  const transactionVolume = transactions.reduce((sum, t) => sum + t.total, 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleInterestAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newInterest.value && editedProfile && editedProfile.interests) {
      setEditedProfile(prev => ({
        ...prev!,
        interests: {
          ...prev!.interests,
          [newInterest.type]: [...(prev!.interests[newInterest.type] || []), newInterest.value]
        }
      }))
      setNewInterest({ type: 'buy', value: '' })
    }
  }

  const handleInterestRemove = (type: InterestType, interest: string) => {
    if (editedProfile && editedProfile.interests) {
      setEditedProfile(prev => ({
        ...prev!,
        interests: {
          ...prev!.interests,
          [type]: prev!.interests[type].filter(i => i !== interest)
        }
      }))
    }
  }

  const handleSave = () => {
    if (editedProfile) {
      console.log('Saving user data:', editedProfile)
      updateProfileBalance(currentProfile.id, editedProfile.balance)
      if (editedProfile.interests) {
        updateProfileInterests(currentProfile.id, editedProfile.interests)
      }
      setIsEditing(false)
    }
  }

  const handleRepayment = (financierId: string) => {
    const amount = repaymentAmount[financierId];
    if (amount && amount > 0) {
      if (amount > editedProfile.balance) {
        setError("Insufficient balance for repayment");
        return;
      }
      if (amount > currentLoans[financierId]) {
        setError("Repayment amount exceeds the outstanding loan");
        return;
      }
  
      // Perform the repayment
      repayLoan(currentProfile.id, financierId, amount);
  
      // Update the currentLoans immediately
      setCurrentLoans((prevLoans) => {
        const updatedLoans = { ...prevLoans };
        updatedLoans[financierId] -= amount;
        if (updatedLoans[financierId] <= 0) {
          delete updatedLoans[financierId];
        }
        return updatedLoans;
      });
  
      // Reset repayment amount and update balance in the component
      setRepaymentAmount((prev) => ({ ...prev, [financierId]: 0 }));
      setEditedProfile((prev) => ({
        ...prev!,
        balance: prev!.balance - amount,
      }));
  
      // Update profiles in localStorage using setProfiles
      setProfiles((prevProfiles: Profile[]) => {
        const updatedProfiles = prevProfiles.map((profile: Profile) => {
          if (profile.id === currentProfile?.id) {
            return {
              ...profile,
              balance: profile.balance - amount,
              loans: currentLoans,
            };
          }
          return profile;
        });
  
        // Save updated profiles to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('profiles', JSON.stringify(updatedProfiles));
        }
        return updatedProfiles;
      });
  
      // Clear errors after a successful transaction
      setError(null);
    } else {
      setError("Please enter a valid repayment amount");
    }
  };
  
  
  
  
  const availableFunds = currentProfile.availableFunds || currentProfile.balance
  const totalFunds = currentProfile.totalFunds || currentProfile.balance
  const usedFundsPercentage = currentProfile.type === 'financier' ? ((totalLoanedAmount / totalFunds) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
              <p className="text-sm font-semibold">Balance: ${editedProfile.balance.toFixed(2)}</p>
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
                value={editedProfile.email || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={editedProfile.bio || ''}
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
              {editedProfile.interests && Object.entries(editedProfile.interests).map(([type, interests]) => (
                <div key={type} className="mb-2">
                  <span className="font-medium capitalize">{type}: </span>
                  {interests.map((interest, index) => (
                    <Badge key={`${type}-${interest}-${index}`} variant="secondary" className="mr-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleInterestRemove(type as InterestType, interest)}
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
                    onChange={(e) => setNewInterest(prev => ({ ...prev, type: e.target.value as InterestType }))}
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

      {currentProfile.type === 'trader' && Object.keys(currentLoans).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Financier ID</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(currentLoans).map(([financierId, amount]) => (
                  <TableRow key={`loan-${financierId}`}>
                    <TableCell>{financierId}</TableCell>
                    <TableCell>${amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Amount to repay"
                          value={repaymentAmount[financierId] || ''}
                          onChange={(e) => setRepaymentAmount(prev => ({ ...prev, [financierId]: parseFloat(e.target.value) }))}
                          className="w-32"
                        />
                        <Button onClick={() => handleRepayment(financierId)}>Repay</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
              {transactions.map((transaction, index) => (
                <TableRow key={`transaction-${transaction.id}-${index}`}>
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