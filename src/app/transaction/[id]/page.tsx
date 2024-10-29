'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'

export default function TransactionPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profiles, currentProfile, updateProfileBalance } = useProfiles()
  const { addTransaction } = useTransactions()
  const [selectedFinancier, setSelectedFinancier] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState({
    type: '',
    price: 0,
    quantity: 0,
    commodity: '',
  })
  const [counterparty, setCounterparty] = useState<any>(null)

  useEffect(() => {
    setTransactionDetails({
      type: searchParams.get('type') || '',
      price: Number(searchParams.get('price')) || 0,
      quantity: Number(searchParams.get('quantity')) || 0,
      commodity: searchParams.get('commodity') || '',
    })

    // Extract the actual profile ID from the transaction ID
    const [transactionType, profileId] = (id as string).split('-')
    
    // Find the counterparty based on the extracted profile ID
    const foundCounterparty = profiles.find(p => p.id === profileId)
    if (foundCounterparty) {
      setCounterparty(foundCounterparty)
    } else {
      console.error('Counterparty not found for id:', profileId)
    }
  }, [searchParams, profiles, id])

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
      alert('Current profile or counterparty not found')
      return
    }

    const totalAmount = transactionDetails.price * transactionDetails.quantity

    if (transactionDetails.type === 'buy') {
      if (currentProfile.balance >= totalAmount) {
        updateProfileBalance(currentProfile.id, currentProfile.balance - totalAmount)
        updateProfileBalance(counterparty.id, counterparty.balance + totalAmount)
        addTransaction({
          id: Date.now().toString(),
          type: 'buy',
          commodity: transactionDetails.commodity,
          quantity: transactionDetails.quantity,
          price: transactionDetails.price,
          total: totalAmount,
          date: new Date().toISOString().split('T')[0],
          buyerId: currentProfile.id,
          sellerId: counterparty.id,
        })
        router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
      } else {
        alert('Insufficient balance')
      }
    } else if (transactionDetails.type === 'sell') {
      updateProfileBalance(currentProfile.id, currentProfile.balance + totalAmount)
      updateProfileBalance(counterparty.id, counterparty.balance - totalAmount)
      addTransaction({
        id: Date.now().toString(),
        type: 'sell',
        commodity: transactionDetails.commodity,
        quantity: transactionDetails.quantity,
        price: transactionDetails.price,
        total: totalAmount,
        date: new Date().toISOString().split('T')[0],
        buyerId: counterparty.id,
        sellerId: currentProfile.id,
      })
      router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
    }
  }

  const financiers = profiles.filter(p => p.type === 'financier')

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
          <CardTitle>Choose a Financier</CardTitle>
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
            <p className="mt-2 text-sm text-muted-foreground">
              Financier Balance: ${profiles.find(f => f.id === selectedFinancier)?.balance.toFixed(2)}
            </p>
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