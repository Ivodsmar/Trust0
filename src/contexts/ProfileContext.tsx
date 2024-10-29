'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Profile = {
  id: string
  name: string
  balance: number
  type: 'trader' | 'financier'
}

type ProfileContextType = {
  profiles: Profile[]
  currentProfile: Profile | null
  setCurrentProfile: (profile: Profile) => void
  updateProfileBalance: (id: string, newBalance: number) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const useProfiles = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider')
  }
  return context
}

const initialProfiles: Profile[] = [
  { id: '1', name: 'Trader A', balance: 100000, type: 'trader' },
  { id: '2', name: 'Trader B', balance: 150000, type: 'trader' },
  { id: '3', name: 'Financier X', balance: 500000, type: 'financier' },
]

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const storedProfiles = localStorage.getItem('profiles')
    return storedProfiles ? JSON.parse(storedProfiles) : initialProfiles
  })
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)

  useEffect(() => {
    // Set the first profile as the current profile when the app loads
    if (profiles.length > 0 && !currentProfile) {
      setCurrentProfile(profiles[0])
    }
  }, [profiles, currentProfile])

  useEffect(() => {
    // Save profiles to localStorage whenever they change
    localStorage.setItem('profiles', JSON.stringify(profiles))
  }, [profiles])

  const updateProfileBalance = (id: string, newBalance: number) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id ? { ...profile, balance: newBalance } : profile
      )
    )
    if (currentProfile && currentProfile.id === id) {
      setCurrentProfile({ ...currentProfile, balance: newBalance })
    }
  }

  return (
    <ProfileContext.Provider value={{ profiles, currentProfile, setCurrentProfile, updateProfileBalance }}>
      {children}
    </ProfileContext.Provider>
  )
}