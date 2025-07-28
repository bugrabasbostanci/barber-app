'use client'

import { useState } from 'react'
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
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from "lucide-react"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface BlockedTime {
  id: string
  date: Date
  startTime?: string
  endTime?: string
  reason: string
  isFullDay: boolean
  staffId: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
}

export function TimeBlockingForm() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [blockType, setBlockType] = useState<'full-day' | 'time-range'>('time-range')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])

  // Mock staff data
  const staff: Staff[] = [
    { id: '1', firstName: 'Mehmet', lastName: 'Berber' },
    { id: '2', firstName: 'Ali', lastName: 'Saç' },
    { id: '3', firstName: 'Osman', lastName: 'Traş' }
  ]

  const timeOptions = [
    '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', 
    '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:00', '20:45', '21:30'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedStaff || !reason) {
      alert('Lütfen tüm gerekli alanları doldurun.')
      return
    }

    if (blockType === 'time-range' && (!startTime || !endTime)) {
      alert('Lütfen başlangıç ve bitiş saatini seçin.')
      return
    }

    const newBlock: BlockedTime = {
      id: Date.now().toString(),
      date: selectedDate,
      startTime: blockType === 'full-day' ? undefined : startTime,
      endTime: blockType === 'full-day' ? undefined : endTime,
      reason,
      isFullDay: blockType === 'full-day',
      staffId: selectedStaff
    }

    setBlockedTimes(prev => [...prev, newBlock])
    
    // Reset form
    setSelectedDate(undefined)
    setSelectedStaff('')
    setStartTime('')
    setEndTime('')
    setReason('')
    setBlockType('time-range')
  }

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(prev => prev.filter(block => block.id !== id))
  }

  const getStaffName = (staffId: string) => {
    const person = staff.find(s => s.id === staffId)
    return person ? `${person.firstName} ${person.lastName}` : 'Bilinmeyen'
  }

  // Date validation - don't allow past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return isBefore(date, today)
  }

  return (
    <div className="space-y-6">
      {/* Add New Block Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
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
            <Label>Personel</Label>
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

          {/* Block Type */}
          <div className="space-y-2">
            <Label>Blok Türü</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={blockType === 'full-day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBlockType('full-day')}
              >
                Tüm Gün
              </Button>
              <Button
                type="button"
                variant={blockType === 'time-range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBlockType('time-range')}
              >
                Saat Aralığı
              </Button>
            </div>
          </div>

          {/* Time Range Selection */}
          {blockType === 'time-range' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Saati</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bitiş Saati</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Sebep</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Zaman bloklama sebebi..."
              rows={2}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Zaman Bloğu Ekle
          </Button>
        </div>
      </form>

      {/* Blocked Times List */}
      {blockedTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bloklanmış Zamanlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedTimes.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {format(block.date, "dd MMMM yyyy", { locale: tr })}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{getStaffName(block.staffId)}</span>
                      {block.isFullDay ? (
                        <span> - Tüm gün</span>
                      ) : (
                        <span> - {block.startTime} / {block.endTime}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {block.reason}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlockedTime(block.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}