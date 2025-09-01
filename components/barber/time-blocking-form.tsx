'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react"
import { formatEnglishDate, dateToLocalString } from "@/lib/utils"
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
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch staff and existing time blocks from database
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch staff
        const staffResponse = await fetch('/api/staff')
        if (staffResponse.ok) {
          const result = await staffResponse.json()
          if (result.success && Array.isArray(result.data)) {
            setStaff(result.data)
          }
        } else {
          console.error('Failed to fetch staff:', staffResponse.statusText)
          setStaff([])
        }

        // Fetch existing time blocks
        const blocksResponse = await fetch('/api/time-blocks')
        if (blocksResponse.ok) {
          const result = await blocksResponse.json()
          if (result.success && Array.isArray(result.data)) {
            const blocksData = result.data
            const formattedBlocks = blocksData.map((block: {id: string; date: string; startTime: string | null; endTime: string | null; reason: string; isFullDay: boolean; staffId: string}) => ({
              id: block.id,
              date: new Date(block.date),
              startTime: block.startTime,
              endTime: block.endTime,
              reason: block.reason,
              isFullDay: block.isFullDay,
              staffId: block.staffId
            }))
            setBlockedTimes(formattedBlocks)
          }
        } else {
          console.error('Failed to fetch time blocks:', blocksResponse.statusText)
          setBlockedTimes([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setStaff([])
        setBlockedTimes([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const timeOptions = [
    '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', 
    '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:00', '20:45', '21:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedStaff || !reason) {
      alert('Please fill in all required fields.')
      return
    }

    if (blockType === 'time-range' && (!startTime || !endTime)) {
      alert('Please select start and end times.')
      return
    }

    try {
      const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateToLocalString(selectedDate),
          staffId: selectedStaff,
          startTime: blockType === 'full-day' ? null : startTime,
          endTime: blockType === 'full-day' ? null : endTime,
          reason,
          isFullDay: blockType === 'full-day'
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Add to local state
        const newBlock: BlockedTime = {
          id: result.timeBlock.id,
          date: selectedDate,
          startTime: result.timeBlock.startTime,
          endTime: result.timeBlock.endTime,
          reason: result.timeBlock.reason,
          isFullDay: result.timeBlock.isFullDay,
          staffId: result.timeBlock.staffId
        }

        setBlockedTimes(prev => [...prev, newBlock])
        
        // Reset form
        setSelectedDate(undefined)
        setSelectedStaff('')
        setStartTime('')
        setEndTime('')
        setReason('')
        setBlockType('time-range')

        alert('Time block created successfully!')
      } else {
        alert(result.error || 'An error occurred while creating the time block.')
      }
    } catch (error) {
      console.error('Error creating time block:', error)
      alert('An error occurred while creating the time block. Please try again.')
    }
  }

  const removeBlockedTime = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time block?')) {
      return
    }

    try {
      const response = await fetch(`/api/time-blocks/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setBlockedTimes(prev => prev.filter(block => block.id !== id))
        alert('Time block deleted successfully!')
      } else {
        alert(result.error || 'An error occurred while deleting the time block.')
      }
    } catch (error) {
      console.error('Error deleting time block:', error)
      alert('An error occurred while deleting the time block. Please try again.')
    }
  }

  const getStaffName = (staffId: string) => {
    const person = staff.find(s => s.id === staffId)
    return person ? `${person.firstName} ${person.lastName}` : 'Unknown'
  }

  // Date validation - don't allow past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-6">
      {/* Add New Block Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
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
                    formatEnglishDate(dateToLocalString(selectedDate))
                  ) : (
                    <span>Select date</span>
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
                  weekStartsOn={1}
                  formatters={{
                    formatWeekdayName: (date: Date) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return days[date.getDay()];
                    },
                    formatMonthCaption: (date: Date) => {
                      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                      return `${months[date.getMonth()]} ${date.getFullYear()}`;
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label>Staff</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading staff..." : "Select staff"} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : staff.length === 0 ? (
                  <SelectItem value="no-staff" disabled>
                    No staff found
                  </SelectItem>
                ) : (
                  staff.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Block Type */}
          <div className="space-y-2">
            <Label>Block Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={blockType === 'full-day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBlockType('full-day')}
              >
                Full Day
              </Button>
              <Button
                type="button"
                variant={blockType === 'time-range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBlockType('time-range')}
              >
                Time Range
              </Button>
            </div>
          </div>

          {/* Time Range Selection */}
          {blockType === 'time-range' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
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
                <Label>End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
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
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for time blocking..."
              rows={2}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Block
          </Button>
        </div>
      </form>

      {/* Blocked Times List */}
      {blockedTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedTimes.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatEnglishDate(dateToLocalString(block.date))}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{getStaffName(block.staffId)}</span>
                      {block.isFullDay ? (
                        <span> - Full day</span>
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