'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Calendar, Clock } from 'lucide-react'
import { DateTimePicker } from '../shared/DateTimePicker'
import { StaffSelector } from '../shared/StaffSelector'
import { CustomerInfoForm } from '../shared/CustomerInfoForm'
import { 
  appointmentFormSchema, 
  manualAppointmentFormSchema,
  type AppointmentFormData,
  type ManualAppointmentFormData,
  type AppointmentFormState,
  type ManualAppointmentFormState
} from '@/lib/validation/formSchemas'
import { toast } from 'sonner'

interface AppointmentFormProps {
  mode: 'customer' | 'barber'
  onSubmit: (data: AppointmentFormData | ManualAppointmentFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  initialData?: Partial<AppointmentFormState | ManualAppointmentFormState>
  bookedSlots?: string[]
  blockedSlots?: string[]
  title?: string
}

export const AppointmentForm = ({
  mode,
  onSubmit,
  onCancel,
  loading = false,
  initialData = {},
  bookedSlots = [],
  blockedSlots = [],
  title
}: AppointmentFormProps) => {
  const [formData, setFormData] = useState<AppointmentFormState | ManualAppointmentFormState>({
    date: initialData.date || null,
    time: initialData.time || '',
    staffId: initialData.staffId || '',
    customer: initialData.customer || {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
    notes: initialData.notes || ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    // Convert form state to submission data for validation
    if (!formData.date) {
      setErrors({ date: 'Tarih seçimi gereklidir' })
      return false
    }

    const submissionData = {
      ...formData,
      date: formData.date // Now we know it's not null
    }

    const schema = mode === 'barber' ? manualAppointmentFormSchema : appointmentFormSchema
    const result = schema.safeParse(submissionData)
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      })
      setErrors(fieldErrors)
      return false
    }
    
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen form hatalarını düzeltin')
      return
    }

    // Convert to submission data (we know date is not null after validation)
    const submissionData = {
      ...formData,
      date: formData.date!
    }

    try {
      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Randevu oluşturulurken hata oluştu')
    }
  }

  const handleDateTimeChange = (field: 'date' | 'time', value: Date | string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear time when date changes
    if (field === 'date') {
      setFormData(prev => ({ ...prev, time: '' }))
    }
  }

  const handleStaffChange = (staffId: string) => {
    setFormData(prev => ({ ...prev, staffId }))
  }

  const handleCustomerChange = (customer: typeof formData.customer) => {
    setFormData(prev => ({ ...prev, customer }))
  }

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }))
  }

  const getTitle = () => {
    if (title) return title
    return mode === 'barber' ? 'Randevu Oluştur' : 'Randevu Al'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Staff Selection */}
          <StaffSelector
            value={formData.staffId}
            onChange={handleStaffChange}
            error={errors.staffId}
            disabled={loading}
          />

          {/* Date and Time Selection */}
          <DateTimePicker
            selectedDate={formData.date}
            selectedTime={formData.time}
            onDateChange={(date) => handleDateTimeChange('date', date)}
            onTimeChange={(time) => handleDateTimeChange('time', time)}
            error={errors.date || errors.time}
            disabled={loading}
            bookedSlots={bookedSlots}
            blockedSlots={blockedSlots}
          />

          {/* Customer Information */}
          <CustomerInfoForm
            value={formData.customer}
            onChange={handleCustomerChange}
            errors={{
              firstName: errors['customer.firstName'],
              lastName: errors['customer.lastName'],
              phone: errors['customer.phone'],
              email: errors['customer.email']
            }}
            disabled={loading}
            showEmail={mode === 'barber'}
            required={{
              firstName: true,
              lastName: true,
              phone: true,
              email: mode === 'barber'
            }}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="appointment-notes">
              Notlar
              <span className="text-gray-500 text-sm ml-1">(İsteğe bağlı)</span>
            </Label>
            <Textarea
              id="appointment-notes"
              value={formData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Randevu ile ilgili özel notlarınızı yazabilirsiniz..."
              disabled={loading}
              rows={3}
              maxLength={500}
              className={`${errors.notes ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {formData.notes && (
              <p className="text-xs text-gray-500">
                {formData.notes.length}/500 karakter
              </p>
            )}
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
          </div>

          {/* Appointment Summary */}
          {formData.date && formData.time && formData.customer.firstName && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Randevu Özeti
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Tarih:</span> {formData.date?.toLocaleDateString('tr-TR')}
                  </p>
                  <p>
                    <span className="font-medium">Saat:</span> {formData.time}
                  </p>
                  <p>
                    <span className="font-medium">Müşteri:</span> {formData.customer.firstName} {formData.customer.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Süre:</span> 45 dakika
                  </p>
                  {formData.notes && (
                    <p>
                      <span className="font-medium">Notlar:</span> {formData.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            İptal
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {mode === 'barber' ? 'Randevuyu Oluştur' : 'Randevu Al'}
        </Button>
      </div>
    </form>
  )
}