'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, Clock, User, Save, Search } from "lucide-react"
import { format, addDays, isAfter, isBefore, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { BUSINESS_RULES } from "@/lib/constants"

interface TimeSlot {
  time: string
  available: boolean
}

interface Staff {
  id: string
  firstName: string
  lastName: string
}

export function NewAppointmentForm() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedStaff, setSelectedStaff] = useState<string>()
  const [customerType, setCustomerType] = useState<'existing' | 'new'>('new')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    existingCustomerId: '',
    notes: ''
  })

  // Mock data - in real app, fetch from API
  const [staff] = useState<Staff[]>([
    { id: '1', firstName: 'Mehmet', lastName: 'Berber' },
    { id: '2', firstName: 'Ali', lastName: 'Saç' },
    { id: '3', firstName: 'Osman', lastName: 'Traş' }
  ])

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Generate time slots based on business rules
  useEffect(() => {
    if (!selectedDate || !selectedStaff) {
      setTimeSlots([])
      return
    }

    const slots: TimeSlot[] = []
    const startHour = 9
    const startMinute = 30
    const endHour = 21
    const endMinute = 30
    const duration = BUSINESS_RULES.APPOINTMENT_DURATION

    let currentTime = new Date()
    currentTime.setHours(startHour, startMinute, 0, 0)
    
    const endTime = new Date()
    endTime.setHours(endHour, endMinute, 0, 0)

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm')
      
      // Mock availability check - in real app, check against existing appointments
      const isAvailable = Math.random() > 0.3 // 70% chance of being available
      
      slots.push({
        time: timeString,
        available: isAvailable
      })

      currentTime.setMinutes(currentTime.getMinutes() + duration)
    }

    setTimeSlots(slots)
  }, [selectedDate, selectedStaff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !selectedStaff) {
      alert('Lütfen tüm gerekli alanları doldurun.')
      return
    }

    if (customerType === 'new' && (!formData.customerName || !formData.customerPhone)) {
      alert('Lütfen müşteri adı ve telefon numarasını girin.')
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call - in real app, create appointment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Randevu başarıyla oluşturuldu!')
      router.push('/barber/appointments')
    } catch (error) {
      alert('Randevu oluşturulurken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Date validation - only allow future dates within booking window
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    const maxDate = addDays(today, BUSINESS_RULES.BOOKING_WINDOW_DAYS)
    const isSunday = date.getDay() === 0 // Sunday is closed
    
    return isBefore(date, today) || isAfter(date, maxDate) || isSunday
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date, Time, Staff Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Randevu Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Staff Selection */}
              <div className="space-y-2">
                <Label>Berber/Personel</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && selectedStaff && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Saat Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        !slot.available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {timeSlots.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Tarih ve personel seçimi yapın
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Type Selection */}
              <div className="space-y-2">
                <Label>Müşteri Türü</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={customerType === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCustomerType('new')}
                  >
                    Yeni Müşteri
                  </Button>
                  <Button
                    type="button"
                    variant={customerType === 'existing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCustomerType('existing')}
                  >
                    Mevcut Müşteri
                  </Button>
                </div>
              </div>

              {customerType === 'new' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Müşteri Adı</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Müşteri adını girin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telefon Numarası</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="05XX XXX XX XX"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Mevcut Müşteri</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Müşteri ara..." />
                    <Button type="button" variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar (İsteğe bağlı)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Randevu ile ilgili notlar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedDate && selectedTime && selectedStaff && (
            <Card>
              <CardHeader>
                <CardTitle>Randevu Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih:</span>
                  <span className="font-medium">
                    {format(selectedDate, "dd MMMM yyyy, EEEE", { locale: tr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saat:</span>
                  <span className="font-medium">{selectedTime} - {
                    format(new Date(`2000-01-01T${selectedTime}:00`).getTime() + 45 * 60000, "HH:mm")
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Berber:</span>
                  <span className="font-medium">
                    {staff.find(s => s.id === selectedStaff)?.firstName} {staff.find(s => s.id === selectedStaff)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Süre:</span>
                  <span className="font-medium">{BUSINESS_RULES.APPOINTMENT_DURATION} dakika</span>
                </div>
                {(formData.customerName || formData.existingCustomerId) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Müşteri:</span>
                    <span className="font-medium">
                      {customerType === 'new' ? formData.customerName : 'Mevcut müşteri'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
        </Button>
      </div>
    </form>
  )
}