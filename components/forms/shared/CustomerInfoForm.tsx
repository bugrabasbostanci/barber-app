'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from './PhoneInput'
import { User, Phone, Mail } from 'lucide-react'

interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email?: string
}

interface CustomerInfoFormProps {
  value: CustomerInfo
  onChange: (value: CustomerInfo) => void
  errors?: Partial<CustomerInfo>
  disabled?: boolean
  showEmail?: boolean
  title?: string
  required?: {
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    email?: boolean
  }
}

export const CustomerInfoForm = ({
  value,
  onChange,
  errors = {},
  disabled = false,
  showEmail = false,
  title = 'Müşteri Bilgileri',
  required = {
    firstName: true,
    lastName: true,
    phone: true,
    email: false
  }
}: CustomerInfoFormProps) => {
  const [localValue, setLocalValue] = useState<CustomerInfo>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleFieldChange = (field: keyof CustomerInfo, newValue: string) => {
    const updatedValue = { ...localValue, [field]: newValue }
    setLocalValue(updatedValue)
    onChange(updatedValue)
  }

  const validateTurkishName = (name: string): boolean => {
    // Turkish name validation - allows Turkish characters
    const turkishNameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/
    return turkishNameRegex.test(name.trim())
  }

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email is optional by default
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="customer-firstName">
            Ad
            {required.firstName && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="customer-firstName"
            type="text"
            value={localValue.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            disabled={disabled}
            placeholder="Adınızı giriniz"
            className={`${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
          {localValue.firstName && !validateTurkishName(localValue.firstName) && (
            <p className="text-sm text-orange-500">
              Lütfen geçerli bir ad giriniz (sadece harfler)
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="customer-lastName">
            Soyad
            {required.lastName && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="customer-lastName"
            type="text"
            value={localValue.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            disabled={disabled}
            placeholder="Soyadınızı giriniz"
            className={`${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
          {localValue.lastName && !validateTurkishName(localValue.lastName) && (
            <p className="text-sm text-orange-500">
              Lütfen geçerli bir soyad giriniz (sadece harfler)
            </p>
          )}
        </div>

        {/* Phone */}
        <PhoneInput
          value={localValue.phone}
          onChange={(phone) => handleFieldChange('phone', phone)}
          error={errors.phone}
          label="Telefon Numarası"
          required={required.phone}
          disabled={disabled}
        />

        {/* Email (Optional) */}
        {showEmail && (
          <div className="space-y-2">
            <Label htmlFor="customer-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-posta
              {required.email && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={localValue.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={disabled}
              placeholder="E-posta adresinizi giriniz"
              className={`${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            {localValue.email && !validateEmail(localValue.email) && (
              <p className="text-sm text-orange-500">
                Lütfen geçerli bir e-posta adresi giriniz
              </p>
            )}
          </div>
        )}

        {/* Customer Info Summary */}
        {(localValue.firstName || localValue.lastName || localValue.phone) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700">Müşteri Özeti:</p>
            <div className="text-sm text-gray-600 mt-1">
              {localValue.firstName && localValue.lastName && (
                <p>{localValue.firstName} {localValue.lastName}</p>
              )}
              {localValue.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {localValue.phone}
                </p>
              )}
              {showEmail && localValue.email && (
                <p className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {localValue.email}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}