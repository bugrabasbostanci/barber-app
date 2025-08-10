'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface Staff {
  id: string
  firstName: string
  lastName: string
}

interface StaffSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  excludeIds?: string[]
}

export const StaffSelector = ({
  value,
  onChange,
  error,
  label = 'Berber Seçin',
  placeholder = 'Berber seçiniz',
  required = true,
  disabled = false,
  excludeIds = []
}: StaffSelectorProps) => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        setApiError(null)
        
        const response = await fetch('/api/staff')
        if (!response.ok) {
          throw new Error('Staff bilgileri yüklenirken hata oluştu')
        }
        
        const data = await response.json()
        const filteredStaff = data.filter((member: Staff) => !excludeIds.includes(member.id))
        setStaff(filteredStaff)
      } catch (error) {
        console.error('Error fetching staff:', error)
        setApiError(error instanceof Error ? error.message : 'Bilinmeyen hata')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [excludeIds])

  const selectedStaffName = staff.find(member => member.id === value)
    ? `${staff.find(member => member.id === value)?.firstName} ${staff.find(member => member.id === value)?.lastName}`
    : ''

  if (loading) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">Berberler yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="p-3 border rounded-md bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="staff-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger 
          id="staff-selector"
          className={`${error ? 'border-red-500 focus:border-red-500' : ''}`}
        >
          <SelectValue placeholder={placeholder}>
            {selectedStaffName || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {staff.length === 0 ? (
            <SelectItem value="" disabled>
              Hiç berber bulunamadı
            </SelectItem>
          ) : (
            staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}