'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const PhoneInput = ({
  value,
  onChange,
  error,
  label = 'Telefon Numarası',
  placeholder = '5XX XXX XX XX',
  required = true,
  disabled = false
}: PhoneInputProps) => {
  const [formattedValue, setFormattedValue] = useState(value)

  const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    if (cleaned.startsWith('90')) {
      const number = cleaned.slice(2)
      if (number.length <= 3) return number
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`
      if (number.length <= 8) return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`
    }
    
    if (cleaned.startsWith('0')) {
      const number = cleaned.slice(1)
      if (number.length <= 3) return number
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`
      if (number.length <= 8) return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`
    }
    
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`
  }

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    if (cleaned.startsWith('90')) {
      return cleaned.length === 12 && cleaned.slice(2, 3) === '5'
    }
    
    if (cleaned.startsWith('0')) {
      return cleaned.length === 11 && cleaned.slice(1, 2) === '5'
    }
    
    return cleaned.length === 10 && cleaned.slice(0, 1) === '5'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const cleaned = inputValue.replace(/\D/g, '')
    
    if (cleaned.length <= 10) {
      const formatted = formatPhoneNumber(inputValue)
      setFormattedValue(formatted)
      
      const cleanedForValidation = cleaned.startsWith('90') ? cleaned : 
                                  cleaned.startsWith('0') ? cleaned.slice(1) : cleaned
      onChange(cleanedForValidation)
    }
  }

  useEffect(() => {
    if (value) {
      setFormattedValue(formatPhoneNumber(value))
    }
  }, [value])

  const isValid = !value || validatePhoneNumber(formattedValue)

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="phone-input">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        id="phone-input"
        type="tel"
        value={formattedValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${error || (!isValid && value) ? 'border-red-500 focus:border-red-500' : ''}`}
      />
      {(error || (!isValid && value)) && (
        <p className="text-sm text-red-500">
          {error || 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)'}
        </p>
      )}
    </div>
  )
}