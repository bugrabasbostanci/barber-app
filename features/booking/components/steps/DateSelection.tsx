"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { DateSelectionProps } from '../../types/booking.types';
import { BookingService } from '../../services/bookingService';
import { DateUtils } from '@/shared';
import { cn } from "@/lib/utils";

export function DateSelection({ 
  selectedDate, 
  onSelect, 
  minDate = new Date(), 
  maxDate = DateUtils.addDays(new Date(), 7),
  excludeDates = [] 
}: DateSelectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks worth of days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const today = new Date();

  const isDateDisabled = (date: Date) => {
    const dateString = DateUtils.dateToLocalString(date);
    
    // Past dates
    if (date < minDate) return true;
    
    // Future limit
    if (date > maxDate) return true;
    
    // Sundays
    if (DateUtils.isSunday(date)) return true;
    
    // Excluded dates
    if (excludeDates.includes(dateString)) return true;
    
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return DateUtils.dateToLocalString(date) === selectedDate;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateString = DateUtils.dateToLocalString(date);
    onSelect(dateString);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Tarih Seçin</h3>
        <p className="text-gray-600">
          Randevu almak istediğiniz tarihi seçin
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h4 className="font-semibold">
              {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </h4>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const isToday = DateUtils.isToday(date);
              const currentMonthDay = isCurrentMonth(date);

              return (
                <Button
                  key={index}
                  variant={selected ? "default" : "ghost"}
                  className={cn(
                    "h-10 w-10 p-0 text-sm",
                    !currentMonthDay && "text-gray-400",
                    disabled && "opacity-30 cursor-not-allowed",
                    isToday && !selected && "bg-blue-100 text-blue-600",
                    selected && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  disabled={disabled}
                  onClick={() => handleDateClick(date)}
                >
                  {date.getDate()}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>En fazla 7 gün ileri tarih seçebilirsiniz</span>
        </div>
        <p>• Pazar günleri kapalıyız</p>
        <p>• Geçmiş tarihler seçilemez</p>
      </div>

      {selectedDate && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Seçilen tarih:</strong> {DateUtils.formatTurkishDate(selectedDate)}
          </p>
        </div>
      )}
    </div>
  );
}