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
      alert('Lütfen bir rol seçin')
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

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert(`Rol başarıyla ${selectedRole} olarak güncellendi!`)
        // Sayfayı yenile ki yeni rol aktif olsun
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
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
          <CardTitle>Rol Güncelleme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Yeni Rol:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Müşteri (CUSTOMER)</SelectItem>
                <SelectItem value="EMPLOYEE">Çalışan (EMPLOYEE)</SelectItem>
                <SelectItem value="BARBER">Berber (BARBER)</SelectItem>
                <SelectItem value="ADMIN">Admin (ADMIN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleUpdateRole} 
            disabled={loading || !selectedRole}
            className="w-full"
          >
            {loading ? 'Güncelleniyor...' : 'Rolü Güncelle'}
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
            <p><strong>Not:</strong> Bu sayfa sadece test amaçlıdır.</p>
            <p>BARBER rolü seçerek berber paneline erişebilirsiniz.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}