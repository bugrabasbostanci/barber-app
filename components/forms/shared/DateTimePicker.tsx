'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock } from 'lucide-react'
import { formatTurkishDate, dateToLocalString } from '@/lib/utils'
import { generateTimeSlots } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  selectedDate: Date | null
  selectedTime: string
  onDateChange: (date: Date | null) => void
  onTimeChange: (time: string) => void
  error?: string
  dateLabel?: string
  timeLabel?: string
  required?: boolean
  disabled?: boolean
  disabledDates?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  workingHours?: { start: string; end: string }
  bookedSlots?: string[]
  blockedSlots?: string[]
}

export const DateTimePicker = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
  dateLabel = 'Select Date',
  timeLabel = 'Select Time',
  required = true,
  disabled = false,
  disabledDates,
  minDate,
  maxDate,
  workingHours = { start: '09:30', end: '21:30' },
  bookedSlots = [],
  blockedSlots = []
}: DateTimePickerProps) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)

  // Default business rules for barber system
  const defaultDisabledDates = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Disable Sundays (0) and past dates
    return date.getDay() === 0 || date < today
  }

  // Combine default business rules with custom disabled dates
  const combinedDisabledDates = (date: Date) => {
    if (defaultDisabledDates(date)) return true
    if (disabledDates) return disabledDates(date)
    return false
  }

  // Set default date constraints for 7-day booking window
  const effectiveMinDate = minDate || new Date()
  const effectiveMaxDate = maxDate || (() => {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    return sevenDaysFromNow
  })()

  // Generate available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots()

      // Convert to start times and filter out booked and blocked slots
      const timeStrings = slots.map(slot => slot.start)
      const unavailableSlots = [...bookedSlots, ...blockedSlots]
      const availableSlots = timeStrings.filter(slot => !unavailableSlots.includes(slot))
      
      setAvailableTimeSlots(availableSlots)

      // Clear selected time if it's no longer available
      if (selectedTime && !availableSlots.includes(selectedTime)) {
        onTimeChange('')
      }
    } else {
      setAvailableTimeSlots([])
      onTimeChange('')
    }
  }, [selectedDate, workingHours, bookedSlots, blockedSlots, selectedTime, onTimeChange])

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date || null)
    setIsDatePickerOpen(false)
  }

  const handleTimeSelect = (time: string) => {
    onTimeChange(time)
    setIsTimePickerOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="space-y-2">
        {dateLabel && (
          <Label>
            {dateLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
                error && 'border-red-500 focus:border-red-500'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? formatTurkishDate(dateToLocalString(selectedDate)) : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={combinedDisabledDates}
              fromDate={effectiveMinDate}
              toDate={effectiveMaxDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-2">
          {timeLabel && (
            <Label>
              {timeLabel}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled || availableTimeSlots.length === 0}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedTime && 'text-muted-foreground',
                  error && 'border-red-500 focus:border-red-500'
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                {selectedTime || (availableTimeSlots.length === 0 ? 'No available times' : 'Select time')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4">
                {availableTimeSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No available times for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTimeSelect(time)}
                        className="h-8 text-xs"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Appointment Duration Info */}
      {selectedDate && selectedTime && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <p className="font-medium">Selected Appointment:</p>
          <p>{formatTurkishDate(dateToLocalString(selectedDate))} - {selectedTime}</p>
          <p className="text-xs mt-1">Appointment duration: 45 minutes</p>
        </div>
      )}
    </div>
  )
}