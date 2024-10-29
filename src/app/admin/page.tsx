'use client'

import React, { useState } from 'react'
import { useProfiles } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Component() {
  const { profiles, addProfile, updateProfileBalance, setCurrentProfile } = useProfiles()
  const [newProfile, setNewProfile] = useState({
    name: '',
    balance: 0,
    type: 'trader' as 'trader' | 'financier',
  })
  const [updateBalance, setUpdateBalance] = useState({
    id: '',
    amount: 0,
  })

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault()
    addProfile({
      ...newProfile,
      interests: { buy: [], sell: [], finance: [] },
      email: '',
      bio: '',
    })
    setNewProfile({ name: '', balance: 0, type: 'trader' })
  }

  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault()
    if (updateBalance.id && updateBalance.amount) {
      updateProfileBalance(updateBalance.id, updateBalance.amount)
      setUpdateBalance({ id: '', amount: 0 })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                value={newProfile.balance}
                onChange={(e) => setNewProfile({ ...newProfile, balance: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={newProfile.type}
                onValueChange={(value: 'trader' | 'financier') => setNewProfile({ ...newProfile, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="financier">Financier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Add Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Update Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateBalance} className="space-y-4">
            <div>
              <Label htmlFor="profileId">Profile</Label>
              <Select
                value={updateBalance.id}
                onValueChange={(value: string) => setUpdateBalance({ ...updateBalance, id: value })}
              >
                <SelectTrigger>
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
            </div>
            <div>
              <Label htmlFor="amount">New Balance</Label>
              <Input
                id="amount"
                type="number"
                value={updateBalance.amount}
                onChange={(e) => setUpdateBalance({ ...updateBalance, amount: Number(e.target.value) })}
                required
              />
            </div>
            <Button type="submit">Update Balance</Button>
          </form>
        </CardContent>
      </Card>
        
      <Card>
        <CardHeader>
          <CardTitle>All Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Available Funds</TableHead>
                <TableHead>Total Funds</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.type}</TableCell>
                  <TableCell>${profile.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    {profile.type === 'financier' && profile.availableFunds
                      ? `$${profile.availableFunds.toFixed(2)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {profile.type === 'financier' && profile.totalFunds
                      ? `$${profile.totalFunds.toFixed(2)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">View Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{profile.name}&#39;s Profile</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <p><strong>ID:</strong> {profile.id}</p>
                          <p><strong>Type:</strong> {profile.type}</p>
                          <p><strong>Balance:</strong> ${profile.balance.toFixed(2)}</p>
                          {profile.type === 'financier' && (
                            <>
                              <p><strong>Available Funds:</strong> ${profile.availableFunds?.toFixed(2) || 'N/A'}</p>
                              <p><strong>Total Funds:</strong> ${profile.totalFunds?.toFixed(2) || 'N/A'}</p>
                            </>
                          )}
                          <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
                          <p><strong>Bio:</strong> {profile.bio || 'N/A'}</p>
                          <div>
                            <strong>Interests:</strong>
                            <ul>
                              {profile.interests && Object.entries(profile.interests).map(([type, interests]) => (
                                <li key={type}>
                                  {type}: {Array.isArray(interests) && interests.length > 0 ? interests.join(', ') : 'None'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => setCurrentProfile(profile)}>Switch to Profile</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
