'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertCircle, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'

export default function TransactionPage() {
  // const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profiles, currentProfile, updateProfileBalance, getProfileById } = useProfiles()
  const { addTransaction } = useTransactions()
  const [selectedFinancier, setSelectedFinancier] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState({
    type: '',
    price: 0,
    quantity: 0,
    commodity: '',
    traderName: '',
  })
  interface Profile {
    id: string;
    name: string;
    balance: number;
    type: string;
  }

  const [counterparty, setCounterparty] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTransactionDetails({
      type: searchParams.get('type') || '',
      price: Number(searchParams.get('price')) || 0,
      quantity: Number(searchParams.get('quantity')) || 0,
      commodity: searchParams.get('commodity') || '',
      traderName: searchParams.get('traderName') || '',
    })

    const traderName = searchParams.get('traderName')
    if (traderName) {
      const foundCounterparty = profiles.find(p => p.name === traderName)
      if (foundCounterparty) {
        setCounterparty(foundCounterparty)
      } else {
        setError(`Counterparty not found for name: ${traderName}`)
        console.error(`Counterparty not found for name: ${traderName}`)
      }
    } else {
      setError('Trader name not provided in search parameters')
      console.error('Trader name not provided in search parameters')
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
      console.error('Error analyzing contract:', error)
      setAnalysisResult(
        error instanceof Error ? error.message : 'An error occurred while analyzing the contract. Please try again.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTransaction = () => {
    if (!currentProfile || !counterparty) {
      setError('Current profile or counterparty not found');
      return;
    }
  
    const totalAmount = transactionDetails.price * transactionDetails.quantity;
    let loanedAmount = 0;
  
    // Check for selected financier and validate loan amount
    if (selectedFinancier && loanAmount) {
      loanedAmount = parseFloat(loanAmount);
      const financier = getProfileById(selectedFinancier);
  
      if (financier) {
        // Check if the financier has enough funds
        if (financier.balance >= loanedAmount) {
          // Deduct the loan amount from the financier's balance
          updateProfileBalance(financier.id, financier.balance - loanedAmount);
  
          // Add the loan amount to the trader's balance
          updateProfileBalance(currentProfile.id, currentProfile.balance + loanedAmount);
  
          // Register the loan in the trader's profile under loans
          const updatedLoans = {
            ...currentProfile.loans,
            [financier.id]: ((currentProfile.loans?.[financier.id] || 0) + loanedAmount),
          };
          currentProfile.loans = updatedLoans;
  
          // Add the loan transaction
          addTransaction({
            type: 'finance',
            commodity: 'Loan',
            quantity: 1,
            price: loanedAmount,
            total: loanedAmount,
            buyerId: currentProfile.id,
            sellerId: '',
            financierId: financier.id,
            loanAmount: loanedAmount,
          });
        } else {
          setError('Insufficient financier balance for loan');
          return;
        }
      } else {
        setError('Financier not found');
        return;
      }
    }
  
    // Proceed with the purchase transaction if the trader has enough balance after the loan
    if (transactionDetails.type === 'buy') {
      if (currentProfile.balance >= totalAmount) {
        // Deduct the purchase amount from the trader's balance
        updateProfileBalance(currentProfile.id, currentProfile.balance - totalAmount);
        
        // Add the purchase amount to the counterparty's balance
        updateProfileBalance(counterparty.id, counterparty.balance + totalAmount);
  
        // Register the buy transaction
        addTransaction({
          type: 'buy',
          commodity: transactionDetails.commodity,
          quantity: transactionDetails.quantity,
          price: transactionDetails.price,
          total: totalAmount,
          buyerId: currentProfile.id,
          sellerId: counterparty.id,
          financierId: selectedFinancier || undefined,
          loanAmount: loanedAmount,
        });
  
        // Redirect to success page
        router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`);
      } else {
        setError('Insufficient balance for purchase');
      }
    } else if (transactionDetails.type === 'sell') {
      // Process a sell transaction if it's a sell
      updateProfileBalance(currentProfile.id, currentProfile.balance + totalAmount);
      updateProfileBalance(counterparty.id, counterparty.balance - totalAmount);
  
      // Register the sell transaction
      addTransaction({
        type: 'sell',
        commodity: transactionDetails.commodity,
        quantity: transactionDetails.quantity,
        price: transactionDetails.price,
        total: totalAmount,
        buyerId: counterparty.id,
        sellerId: currentProfile.id,
        financierId: selectedFinancier || undefined,
        loanAmount: loanedAmount,
      });
  
      // Redirect to success page
      router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`);
    }
  };
  
  
  

  const financiers = profiles.filter(p => p.type === 'financier')

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/admin')}>Back to Admin</Button>
      </div>
    )
  }

  if (!counterparty) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction with {counterparty.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{counterparty.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{counterparty.name}</p>
            <p className="text-sm text-muted-foreground">Trader ID: {counterparty.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Type: {transactionDetails.type.toUpperCase()}</p>
          <p>Commodity: {transactionDetails.commodity}</p>
          <p>Price: ${transactionDetails.price}</p>
          <p>Quantity: {transactionDetails.quantity}</p>
          <p>Total Amount: ${transactionDetails.price * transactionDetails.quantity}</p>
          <p>Your Balance: ${currentProfile?.balance.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Financier Loan</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedFinancier} value={selectedFinancier}>
            <SelectTrigger>
              <SelectValue placeholder="Select a financier" />
            </SelectTrigger>
            <SelectContent>
              {financiers.map((financier) => (
                <SelectItem key={financier.id} value={financier.id}>
                  {financier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFinancier && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">
                Financier Balance: ${getProfileById(selectedFinancier)?.balance.toFixed(2)}
              </p>
              <Input
                type="number"
                placeholder="Loan Amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
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

      <Button className="w-full" onClick={handleTransaction}>Proceed with Transaction</Button>
    </div>
  )
}