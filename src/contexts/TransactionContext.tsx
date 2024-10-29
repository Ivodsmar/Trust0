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

export const useTransactions = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const storedTransactions = localStorage.getItem('transactions')
      return storedTransactions ? JSON.parse(storedTransactions) : []
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    }
    setTransactions(prevTransactions => [...prevTransactions, newTransaction])
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