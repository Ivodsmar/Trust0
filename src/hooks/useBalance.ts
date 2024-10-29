import { useState, useEffect } from 'react'

export function useBalance() {
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // Load balance from localStorage on component mount
    const storedBalance = localStorage.getItem('balance')
    if (storedBalance) {
      setBalance(parseFloat(storedBalance))
    } else {
      // Set initial balance if not found in localStorage
      setBalance(10000) // Starting with $10,000
      localStorage.setItem('balance', '10000')
    }
  }, [])

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance)
    localStorage.setItem('balance', newBalance.toString())
  }

  return { balance, updateBalance }
}