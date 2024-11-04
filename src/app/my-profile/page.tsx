'use client'

<<<<<<< Updated upstream
import React, { useState, useEffect, useCallback } from 'react'
import { useProfiles, Profile } from '@/contexts/ProfileContext'
import { useTransactions, Transaction } from '@/contexts/TransactionContext'
=======
import React, { useState, useEffect } from 'react'
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'
>>>>>>> Stashed changes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star } from 'lucide-react'

export default function MyProfilePage() {
<<<<<<< Updated upstream
  const { currentProfile, setProfiles, updateProfileBalance, updateProfileInterests, repayLoan } = useProfiles()
  const { getTransactionsByProfile, getTotalLoanedAmount } = useTransactions()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(currentProfile)
  const [newInterest, setNewInterest] = useState({ type: 'buy' as InterestType, value: '' })
=======
  const { profiles, currentProfile, repayLoan } = useProfiles()
  const { getTransactionsByProfile, addTransaction } = useTransactions()
>>>>>>> Stashed changes
  const [repaymentAmount, setRepaymentAmount] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const [currentLoans, setCurrentLoans] = useState<{ [key: string]: number }>({})

<<<<<<< Updated upstream
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
=======
  useEffect(() => {
    if (currentProfile) {
      const storedLoans = JSON.parse(localStorage.getItem(`loans_${currentProfile.id}`) || '{}')
      setCurrentLoans(storedLoans)
    }
  }, [currentProfile])

  const handleRepayment = (financierId: string) => {
    const amount = parseFloat(repaymentAmount[financierId]?.toFixed(2)) || 0;
    const outstandingLoan = currentLoans[financierId] || 0;  // Certifique-se de que o valor atual está sendo lido

    console.log("Attempting to repay loan:", { amount, outstandingLoan, balance: currentProfile?.balance });

    if (amount > 0 && amount <= outstandingLoan) {
      if (currentProfile && amount > currentProfile.balance) {
        setError("Insufficient balance for repayment");
        return;
      }

      // Atualiza o valor do empréstimo após o pagamento
      const newLoanAmount = outstandingLoan - amount;
      if (currentProfile) {
        repayLoan(currentProfile.id, financierId, amount);
      }

      // Atualiza o estado do empréstimo
      setCurrentLoans(prevLoans => {
        const updatedLoans = { ...prevLoans, [financierId]: parseFloat(newLoanAmount.toFixed(2)) };
        if (updatedLoans[financierId] <= 0) delete updatedLoans[financierId]; // Remove se o saldo for zero
        return updatedLoans;
      });

      if (currentProfile) {
        addTransaction({
          type: 'repay',
          commodity: 'Loan Repayment',
          quantity: 1,
          price: amount,
          total: amount,
          buyerId: currentProfile.id,
          sellerId: financierId,
          financierId,
          loanAmount: amount,
        });
      }

      setRepaymentAmount(prev => ({ ...prev, [financierId]: 0 }));
      setError(null);
    } else {
      setError("Invalid repayment amount or exceeds outstanding loan");
    }
  };
  

  if (!currentProfile) return <div>Loading...</div>
>>>>>>> Stashed changes

  // Ensure these are only declared once
  const transactions = getTransactionsByProfile(currentProfile.id)
  const totalLoanedAmount = getTotalLoanedAmount(currentProfile.id)
  const transactionVolume = transactions.reduce((sum, t) => sum + t.total, 0)
<<<<<<< Updated upstream

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
=======
  const isFinancier = currentProfile.type === 'financier'
  const outstandingLoans = Object.entries(currentLoans).filter(([, amount]) => amount > 0)
  const usedFundsPercentage = isFinancier && currentProfile.totalFunds ? (transactionVolume / currentProfile.totalFunds) * 100 : 0
>>>>>>> Stashed changes

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500">{error}</p>}

      {/* Profile Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{currentProfile.name} - {currentProfile.type}</CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< Updated upstream
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
=======
          <p>Email: {currentProfile.email || "Not provided"}</p>
          <p>Bio: {currentProfile.bio || "No bio available"}</p>
          <p>Balance: ${currentProfile.balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Trust Rank */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Trust Rank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Star className="text-yellow-400 mr-1" />
            <span className="text-xl font-bold">4.5</span>
            <span className="text-sm text-muted-foreground ml-2">
              (Based on ${transactionVolume.toLocaleString()} USD transaction volume)
            </span>
>>>>>>> Stashed changes
          </div>
        </CardContent>
      </Card>

<<<<<<< Updated upstream
      {currentProfile.type === 'trader' && Object.keys(currentLoans).length > 0 && (
=======
      {/* Financing Overview (Financier) */}
      {isFinancier && (
>>>>>>> Stashed changes
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financing Overview</CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< Updated upstream
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
=======
            <Progress value={usedFundsPercentage} className="w-full" />
            <div className="flex justify-between mt-2">
              <span>Available: ${currentProfile.availableFunds?.toFixed(2)}</span>
              <span>In Use: ${transactionVolume.toFixed(2)}</span>
              <span>Total: ${currentProfile.totalFunds?.toFixed(2)}</span>
            </div>
>>>>>>> Stashed changes
          </CardContent>
        </Card>
      )}

      {/* Loans Section */}
{!isFinancier ? (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Current Loans</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Financier</TableHead>
            <TableHead>Amount Owed</TableHead>
            <TableHead>Repay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(currentProfile.loans || {}).map(([financierId, amount]) => (
            <TableRow key={financierId}>
              <TableCell>{profiles.find(p => p.id === financierId)?.name || financierId}</TableCell>
              <TableCell>${amount.toFixed(2)}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Amount to repay"
                  step={0.01}
                  value={repaymentAmount[financierId] || ''}
                  onChange={(e) => setRepaymentAmount(prev => ({ ...prev, [financierId]: parseFloat(e.target.value) }))}
                  className="w-24 mr-2"
                />
                <Button onClick={() => handleRepayment(financierId)}>Repay</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
) : (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Loans Given</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trader</TableHead>
            <TableHead>Amount Owed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(currentProfile.loans || {}).map(([traderId, amount]) => {
            const trader = profiles.find(p => p.id === traderId);
            return (
              <TableRow key={traderId}>
                <TableCell>{trader ? trader.name : traderId}</TableCell>
                <TableCell>${amount.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)}
      {/* Transaction History */}
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
<<<<<<< Updated upstream
}
=======
}
function updateProfileLoans(profileId: string, updatedLoans: { [key: string]: number }) {
  const storedProfiles = JSON.parse(localStorage.getItem('profiles') || '{}');
  const profile = storedProfiles[profileId];

  if (profile) {
    profile.loans = updatedLoans;
    storedProfiles[profileId] = profile;
    localStorage.setItem('profiles', JSON.stringify(storedProfiles));
  }
}

>>>>>>> Stashed changes
