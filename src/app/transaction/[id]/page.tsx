'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'
import { Input } from "@/components/ui/input"

interface Profile {
  id: string;
  name: string;
  balance: number;
  type: 'trader' | 'financier';
  loans?: { [financierId: string]: number };
}

export default function TransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profiles, currentProfile, updateProfileBalance, updateFinancierFunds, setCurrentProfile } = useProfiles()
  const { addTransaction } = useTransactions()
  
  const [transactionDetails, setTransactionDetails] = useState({
    type: '',
    price: 0,
    quantity: 0,
    commodity: '',
    traderName: '',
  })
  const [counterparty, setCounterparty] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Initialize transaction details from query parameters
    const type = searchParams.get('type') || ''
    const price = Number(searchParams.get('price')) || 0
    const quantity = Number(searchParams.get('quantity')) || 0
    const commodity = searchParams.get('commodity') || ''
    const traderName = searchParams.get('traderName') || ''

    setTransactionDetails({ type, price, quantity, commodity, traderName })

    // Find counterparty based on trader name
    const foundCounterparty = profiles.find(p => p.name === traderName)
    setCounterparty(foundCounterparty || null)

    if (!foundCounterparty) {
      setError(`Counterparty not found for name: ${traderName}`)
    }
  }, [searchParams, profiles])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const analyzeContract = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setAnalysisResult('Analyzing contract...')

    try {
      const fileContents = await file.text()

      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractText: fileContents }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.')
        }
        throw new Error('Failed to analyze contract')
      }

      const data = await response.json()
      setAnalysisResult(data.analysis)
    } catch (error) {
      setAnalysisResult(
        error instanceof Error ? error.message : 'An error occurred while analyzing the contract. Please try again.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTransaction = () => {
    if (!currentProfile || !counterparty) {
      setError('Current profile or counterparty not found')
      return
    }

    const totalAmount = transactionDetails.price * transactionDetails.quantity
    const financier = profiles.find(p => p.type === 'financier') // Assuming there's only one financier

    if (!financier) {
      setError("No financier available to cover transaction costs.")
      return
    }

    if (transactionDetails.type === 'buy') {
      if (financier.balance >= totalAmount) {
        // Deduct funds from financier and create a loan for the trader
        updateProfileBalance(financier.id, financier.balance - totalAmount)
        
        // Add a loan entry for the trader
        updateFinancierFunds(currentProfile.id, financier.id, totalAmount)

        setCurrentProfile(prevProfile => ({
          ...prevProfile!,
          loans: {
            ...prevProfile!.loans,
            [financier.id]: (prevProfile!.loans?.[financier.id] || 0) + totalAmount
          }
        }))
        
        // Record the transaction
        addTransaction({
          type: 'buy',
          commodity: transactionDetails.commodity,
          quantity: transactionDetails.quantity,
          price: transactionDetails.price,
          total: totalAmount,
          buyerId: currentProfile.id,
          sellerId: counterparty.id,
          financierId: financier.id,
          loanAmount: totalAmount,
        })

        alert(`Trader ${currentProfile.name} received $${totalAmount} as a loan from ${financier.name} to complete the transaction.`)
        setError(null)
        router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
      } else {
        setError("Insufficient funds in financier's account to cover the transaction.")
      }
    } else if (transactionDetails.type === 'sell') {
      if (currentProfile.balance >= totalAmount) {
        updateProfileBalance(currentProfile.id, currentProfile.balance + totalAmount)
        updateProfileBalance(counterparty.id, counterparty.balance - totalAmount)

        addTransaction({
          type: 'sell',
          commodity: transactionDetails.commodity,
          quantity: transactionDetails.quantity,
          price: transactionDetails.price,
          total: totalAmount,
          buyerId: counterparty.id,
          sellerId: currentProfile.id,
          financierId: financier.id,
          loanAmount: 0, // No loan involved in a sale transaction
        })

        router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
      } else {
        setError("Insufficient balance in buyer's account for transaction.")
      }
    }
  }

  const financier = profiles.find(p => p.type === 'financier')

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction with {counterparty?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Type: {transactionDetails.type.toUpperCase()}</p>
          <p>Commodity: {transactionDetails.commodity}</p>
          <p>Price: ${transactionDetails.price}</p>
          <p>Quantity: {transactionDetails.quantity}</p>
          <p>Total Amount: ${transactionDetails.price * transactionDetails.quantity}</p>
          <p>Your Balance: ${currentProfile?.balance.toFixed(2)}</p>
          <p>Financier Balance: ${financier?.balance.toFixed(2) || '0.00'}</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input type="file" onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx" />
            <Button onClick={analyzeContract} disabled={!file || isAnalyzing}>
              <Upload className="mr-2 h-4 w-4" /> {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
            </Button>
          </div>
          {analysisResult && (
            <Alert className="mt-4" variant={analysisResult.startsWith('Error') ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{analysisResult.startsWith('Error') ? 'Error' : 'Analysis Result'}</AlertTitle>
              <AlertDescription>{analysisResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Button 
        className="w-full mt-4" 
        onClick={handleTransaction}
        disabled={!!error}
      >
        Proceed with Transaction
      </Button>
    </div>
  )
}
