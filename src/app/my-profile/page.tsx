'use client'

import React, { useState, useEffect } from 'react'
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MyProfilePage() {
  const { profiles, currentProfile, updateProfileBalance, repayLoan } = useProfiles()
  const router = useRouter()
  const { getTransactionsByProfile, addTransaction } = useTransactions()
  const [error, setError] = useState<string | null>(null)
  const [currentLoans, setCurrentLoans] = useState<{ [key: string]: number }>({})
  const [processingRepayment, setProcessingRepayment] = useState(false)

  useEffect(() => {
    if (currentProfile) {
      loadLoansForProfile(currentProfile.id)
    }
  }, [currentProfile])

  const loadLoansForProfile = (profileId: string) => {
    const storedLoans = localStorage.getItem(`loans_${profileId}`)
    setCurrentLoans(storedLoans ? JSON.parse(storedLoans) : {})
  }

  const handleFullRepayment = async (financierId: string) => {
    if (processingRepayment) return
    setProcessingRepayment(true)

    try {
      if (!currentProfile) {
        setError("No current profile selected")
        return
      }

      const outstandingLoan = currentLoans[financierId] || 0

      if (outstandingLoan > 0) {
        if (outstandingLoan > currentProfile.balance) {
          setError(`Insufficient balance. Your current balance is $${currentProfile.balance}`)
          return
        }

        repayLoan(currentProfile.id, financierId, outstandingLoan)

        const updatedLoans = { ...currentLoans }
        delete updatedLoans[financierId]
        setCurrentLoans(updatedLoans)
        localStorage.setItem(`loans_${currentProfile.id}`, JSON.stringify(updatedLoans))

        await addTransaction({
          type: 'repay',
          commodity: 'Loan Repayment',
          quantity: 1,
          price: outstandingLoan,
          total: outstandingLoan,
          buyerId: currentProfile.id,
          sellerId: financierId,
          financierId,
          loanAmount: outstandingLoan,
          date: new Date(),
        })

        setError(null)
        router.refresh()
      } else {
        setError("No outstanding loan to repay")
      }
    } catch (err) {
      setError("An error occurred during repayment.")
    } finally {
      setProcessingRepayment(false)
    }
  }

  if (!currentProfile) {
    return <div>Loading Profile...</div>
  }

  const transactions = getTransactionsByProfile(currentProfile.id)
  const transactionVolume = transactions.reduce((sum, t) => sum + t.total, 0)
  const isFinancier = currentProfile.type === 'financier'
  const outstandingLoans = Object.entries(currentLoans).filter(([, amount]) => amount > 0)

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500">{error}</p>}

      {/* Profile Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{currentProfile.name} - {currentProfile.type}</CardTitle>
        </CardHeader>
        <CardContent>
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
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Repay Full Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingLoans.map(([financierId, amountOwed]) => (
                  <TableRow key={financierId}>
                    <TableCell>{profiles.find(p => p.id === financierId)?.name || financierId}</TableCell>
                    <TableCell>${amountOwed.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleFullRepayment(financierId)} disabled={processingRepayment}>
                        {processingRepayment ? 'Processing...' : 'Repay Full Amount'}
                      </Button>
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingLoans.map(([traderId, amount]) => {
                  const trader = profiles.find(p => p.id === traderId)
                  return (
                    <TableRow key={traderId}>
                      <TableCell>{trader ? trader.name : traderId}</TableCell>
                      <TableCell>${amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="text-yellow-600">Active</span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="mb-8">
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
                <TableRow key={index}>
                  <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.commodity}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>${transaction.total.toFixed(2)}</TableCell>
                  <TableCell>{transaction.buyerId === currentProfile.id ? 'Buyer' : 'Seller'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
