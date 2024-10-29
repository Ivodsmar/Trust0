'use client'

import { useState } from 'react'
import { useProfiles } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Mock data for users
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
]

export default function AdminPage() {
  const { profiles, currentProfile, setCurrentProfile, updateProfileBalance } = useProfiles()
  const [newBalance, setNewBalance] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [newUser, setNewUser] = useState({ name: '', email: '' })

  const handleProfileChange = (profileId: string) => {
    const selectedProfile = profiles.find(p => p.id === profileId)
    if (selectedProfile) {
      setCurrentProfile(selectedProfile)
    }
  }

  const handleBalanceUpdate = () => {
    if (currentProfile && newBalance) {
      const updatedBalance = parseFloat(newBalance)
      if (!isNaN(updatedBalance)) {
        updateProfileBalance(currentProfile.id, updatedBalance)
        setNewBalance('')
      } else {
        alert('Please enter a valid number for the balance.')
      }
    }
  }

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value })
  }

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: (users.length + 1).toString(), ...newUser }])
      setNewUser({ name: '', email: '' })
    } else {
      alert('Please enter both name and email for the new user.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Select onValueChange={handleProfileChange} value={currentProfile?.id || ''}>
              <SelectTrigger className="w-[200px]">
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
          {currentProfile && (
            <div>
              <p>Current Profile: {currentProfile.name}</p>
              <p>Type: {currentProfile.type}</p>
              <p>Balance: ${currentProfile.balance.toFixed(2)}</p>
              <div className="mt-4 flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="New Balance"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                />
                <Button onClick={handleBalanceUpdate}>Update Balance</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.type}</TableCell>
                  <TableCell>${profile.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-end space-x-4">
            <div className="flex-grow">
              <Label htmlFor="newUserName">Name</Label>
              <Input
                id="newUserName"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
                placeholder="Enter name"
              />
            </div>
            <div className="flex-grow">
              <Label htmlFor="newUserEmail">Email</Label>
              <Input
                id="newUserEmail"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="Enter email"
              />
            </div>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Users: {users.length}</p>
          <p>Total Profiles: {profiles.length}</p>
          <p>Total Balance (all profiles): ${profiles.reduce((sum, profile) => sum + profile.balance, 0).toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  )
}