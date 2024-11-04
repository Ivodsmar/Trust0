'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
<<<<<<< Updated upstream
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertCircle, Upload } from 'lucide-react'
=======
import { AlertCircle } from 'lucide-react'
>>>>>>> Stashed changes
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProfiles } from '@/contexts/ProfileContext'
import { useTransactions } from '@/contexts/TransactionContext'

export default function TransactionPage() {
  // const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
<<<<<<< Updated upstream
  const { profiles, currentProfile, updateProfileBalance, getProfileById, updateFinancierFunds } = useProfiles()
=======
  const { profiles, currentProfile, updateProfileBalance, updateProfileLoans } = useProfiles()
>>>>>>> Stashed changes
  const { addTransaction } = useTransactions()
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
    // Inicializar detalhes da transação a partir dos parâmetros de busca
    const type = searchParams.get('type') || ''
    const price = Number(searchParams.get('price')) || 0
    const quantity = Number(searchParams.get('quantity')) || 0
    const commodity = searchParams.get('commodity') || ''
    const traderName = searchParams.get('traderName') || ''

<<<<<<< Updated upstream
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

=======
    setTransactionDetails({ type, price, quantity, commodity, traderName })

    // Encontrar o contraparte com base no nome do trader
    const foundCounterparty = profiles.find(p => p.name === traderName)
    setCounterparty(foundCounterparty || null)

    if (!foundCounterparty) {
      setError(`Counterparty not found for name: ${traderName}`)
    }
  }, [searchParams, profiles])

>>>>>>> Stashed changes
  const handleTransaction = () => {
    if (!currentProfile || !counterparty) {
      setError('Current profile or counterparty not found')
      return
    }

    const totalAmount = transactionDetails.price * transactionDetails.quantity
<<<<<<< Updated upstream
    let loanedAmount = 0

    if (selectedFinancier && loanAmount) {
      loanedAmount = parseFloat(loanAmount)
      const financier = getProfileById(selectedFinancier)
      if (financier && financier.balance >= loanedAmount) {
        updateFinancierFunds(financier.id, (-loanedAmount).toString(), loanedAmount)
        updateProfileBalance(currentProfile.id, currentProfile.balance + loanedAmount)
      } else {
        setError('Insufficient financier balance')
        return
      }
    }
=======
    const financier = profiles.find(p => p.type === 'financier') // Assumindo que existe apenas um financiador

    if (!financier) {
      setError("No financier available to cover transaction costs.")
      return
    }

    if (transactionDetails.type === 'buy') {
      if (financier.balance >= totalAmount) {
        // Deduzir fundos do financiador e criar um empréstimo para o trader
        updateProfileBalance(financier.id, financier.balance - totalAmount)
        
        // Adicionar uma entrada de empréstimo para o trader
        updateProfileLoans(currentProfile.id, {
          ...currentProfile.loans, // Preserve existing loans
          [financier.id]: (currentProfile.loans?.[financier.id] || 0) + totalAmount, // Add to existing loan or initialize
        })

        updateProfileLoans(financier.id, { [currentProfile.id]: totalAmount });

        // Registar a transação
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
      // Processa a transação de venda normalmente, sem envolvimento de empréstimo
      if (currentProfile.balance >= totalAmount) {
        updateProfileBalance(currentProfile.id, currentProfile.balance + totalAmount)
        updateProfileBalance(counterparty.id, counterparty.balance - totalAmount)
>>>>>>> Stashed changes

    if (transactionDetails.type === 'buy') {
      if (currentProfile.balance >= totalAmount) {
        updateProfileBalance(currentProfile.id, currentProfile.balance - totalAmount)
        updateProfileBalance(counterparty.id, counterparty.balance + totalAmount)
        addTransaction({
          type: 'buy',
          commodity: transactionDetails.commodity,
          quantity: transactionDetails.quantity,
          price: transactionDetails.price,
          total: totalAmount,
<<<<<<< Updated upstream
          buyerId: currentProfile.id,
          sellerId: counterparty.id,
          financierId: selectedFinancier || undefined,
          loanAmount: loanedAmount,
=======
          buyerId: counterparty.id,
          sellerId: currentProfile.id,
          financierId: financier.id,
          loanAmount: 0, // Sem empréstimo em uma transação de venda
>>>>>>> Stashed changes
        })
        if (loanedAmount > 0) {
          addTransaction({
            type: 'finance',
            commodity: 'Loan',
            quantity: 1,
            price: loanedAmount,
            total: loanedAmount,
            buyerId: currentProfile.id,
            sellerId: '',
            financierId: selectedFinancier,
            loanAmount: loanedAmount,
          })
        }
        router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
      } else {
<<<<<<< Updated upstream
        setError('Insufficient balance')
=======
        setError("Insufficient balance in buyer's account for transaction.")
>>>>>>> Stashed changes
      }
    } else if (transactionDetails.type === 'sell') {
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
        financierId: selectedFinancier || undefined,
        loanAmount: loanedAmount,
      })
      if (loanedAmount > 0) {
        addTransaction({
          type: 'finance',
          commodity: 'Loan',
          quantity: 1,
          price: loanedAmount,
          total: loanedAmount,
          buyerId: counterparty.id,
          sellerId: '',
          financierId: selectedFinancier,
          loanAmount: loanedAmount,
        })
      }
      router.push(`/transaction-success?type=${transactionDetails.type}&commodity=${transactionDetails.commodity}&quantity=${transactionDetails.quantity}&price=${transactionDetails.price}`)
    }
  }

  const financier = profiles.find(p => p.type === 'financier') // Assumindo que existe apenas um financiador

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
          <p>Financier Balance: ${financier?.balance.toFixed(2) || '0.00'}</p>

<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleTransaction}>Proceed with Transaction</Button>
    </div>
  )
}