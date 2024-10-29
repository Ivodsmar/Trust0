'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Transaction = {
  id: string
  type: 'buy' | 'sell'
  commodity: string
  quantity: number
  price: number
  total: number
  date: string
  buyerId: string
  sellerId: string
}

type TransactionContextType = {
  transactions: Transaction[]
  addTransaction: (transaction: Transaction) => void
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
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions')
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
  }, [])

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prevTransactions => {
      const newTransactions = [...prevTransactions, transaction]
      localStorage.setItem('transactions', JSON.stringify(newTransactions))
      return newTransactions
    })
  }

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  )
}