'use client'

import { useProfiles } from '@/contexts/ProfileContext'

export function BalanceDisplay() {
  const { currentProfile } = useProfiles()

  if (!currentProfile) {
    return null
  }

  return (
    <div className="text-white font-semibold">
      {currentProfile.name}: ${currentProfile.balance.toFixed(2)}
    </div>
  )
}