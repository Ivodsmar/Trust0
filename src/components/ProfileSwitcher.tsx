'use client'

import { useProfiles } from '@/contexts/ProfileContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProfileSwitcher() {
  const { profiles, currentProfile, setCurrentProfile } = useProfiles()

  const handleProfileChange = (profileId: string) => {
    const selectedProfile = profiles.find(p => p.id === profileId)
    if (selectedProfile) {
      setCurrentProfile(selectedProfile)
    }
  }

  if (!currentProfile) return null

  return (
    <Select onValueChange={handleProfileChange} value={currentProfile.id}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}