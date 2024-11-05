'use client'

import { useEffect } from 'react'
import { useProfiles } from '@/contexts/ProfileContext'

export function BalanceDisplay() {
  const { currentProfile } = useProfiles()

  // Optional: Log whenever the balance changes (useful for debugging)
  useEffect(() => {
    if (currentProfile) {
      console.log(`Balance updated: ${currentProfile.balance}`)
    }
  }, [currentProfile?.balance])

  if (!currentProfile) {
    return null
  }

  return (
    <div className="text-white font-semibold">
      {currentProfile.name}: ${currentProfile.balance.toFixed(2)}
    </div>
  )
}
