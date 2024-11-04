'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type TransactionType = 'buy' | 'sell' | 'finance' | 'repay'

export interface Transaction {
  id: string
  type: TransactionType
  commodity: string
  quantity: number
  price: number
  total: number
  date: string
  buyerId: string
  sellerId: string
  financierId?: string
  loanAmount?: number
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  getTransactionsByProfile: (profileId: string) => Transaction[]
  getTotalTransactionVolume: () => number
  getTransactionById: (id: string) => Transaction | undefined
  getTotalLoanedAmount: (financierId: string) => number
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const storedTransactions = localStorage.getItem('transactions')
      return storedTransactions ? JSON.parse(storedTransactions) : []
    }
    return []
  })

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0]
    }

    setTransactions(prevTransactions => [...prevTransactions, newTransaction])

    // Update localStorage for loans if it's a loan-related transaction
    if (transaction.loanAmount && transaction.loanAmount > 0) {
      const loansKey = `loans_${transaction.buyerId}`
      const storedLoans = JSON.parse(localStorage.getItem(loansKey) || '{}')
      if (transaction.type === 'buy') {
        storedLoans[transaction.financierId!] = (storedLoans[transaction.financierId!] || 0) + transaction.loanAmount
      } else if (transaction.type === 'repay') {
        storedLoans[transaction.financierId!] = (storedLoans[transaction.financierId!] || 0) - transaction.loanAmount
        if (storedLoans[transaction.financierId!] <= 0) {
          delete storedLoans[transaction.financierId!]
        }
      }
      localStorage.setItem(loansKey, JSON.stringify(storedLoans))
    }
  }

  const getTransactionsByProfile = (profileId: string) => {
    return transactions.filter(
      transaction => 
        transaction.buyerId === profileId || 
        transaction.sellerId === profileId || 
        transaction.financierId === profileId
    )
  }

  const getTotalTransactionVolume = () => {
    return transactions.reduce((sum, transaction) => sum + transaction.total, 0)
  }

  const getTransactionById = (id: string) => {
    return transactions.find(transaction => transaction.id === id)
  }

  const getTotalLoanedAmount = (financierId: string) => {
    return transactions
      .filter(t => t.financierId === financierId)
      .reduce((sum, t) => {
        if (t.type === 'repay') {
          return sum - (t.loanAmount || 0)
        }
        return sum + (t.loanAmount || 0)
      }, 0)
  }

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction, 
      getTransactionsByProfile,
      getTotalTransactionVolume,
      getTransactionById,
      getTotalLoanedAmount
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactions = () => {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}