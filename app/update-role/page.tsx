'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UpdateRolePage() {
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success?: boolean; error?: string} | null>(null)

  const handleUpdateRole = async () => {
    if (!selectedRole) {
      alert('Please select a role')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      })

      const result = await response.json()
      setResult(result)

      if (result.success) {
        alert(`Role successfully updated to ${selectedRole}!`)
        // Refresh page so new role becomes active
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } else {
        alert(result.error || 'An error occurred while updating role')
      }
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Role Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Role:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer (CUSTOMER)</SelectItem>
                <SelectItem value="EMPLOYEE">Employee (EMPLOYEE)</SelectItem>
                <SelectItem value="BARBER">Barber (BARBER)</SelectItem>
                <SelectItem value="ADMIN">Admin (ADMIN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleUpdateRole} 
            disabled={loading || !selectedRole}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>

          {result && (
            <div className={`p-3 rounded-lg text-sm ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p><strong>Note:</strong> This page is for testing purposes only.</p>
            <p>Select BARBER role to access the barber panel.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}