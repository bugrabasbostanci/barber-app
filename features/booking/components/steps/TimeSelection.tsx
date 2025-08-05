"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { TimeSelectionProps } from '../../types/booking.types';
import { BookingService } from '../../services/bookingService';
import { DateUtils } from '@/shared';
import { cn } from "@/lib/utils";

export function TimeSelection({ 
  date, 
  staffId, 
  selectedTime, 
  onSelect, 
  timeSlots, 
  loading = false 
}: TimeSelectionProps) {
  const allTimeSlots = BookingService.generateTimeSlots();

  // Group time slots by time periods
  const groupTimeSlots = () => {
    const groups = {
      morning: { label: 'Sabah (09:30 - 12:00)', slots: [] as string[] },
      afternoon: { label: 'Öğleden Sonra (12:00 - 17:00)', slots: [] as string[] },
      evening: { label: 'Akşam (17:00 - 21:30)', slots: [] as string[] }
    };

    allTimeSlots.forEach(time => {
      const [hours] = time.split(':').map(Number);
      
      if (hours < 12) {
        groups.morning.slots.push(time);
      } else if (hours < 17) {
        groups.afternoon.slots.push(time);
      } else {
        groups.evening.slots.push(time);
      }
    });

    return groups;
  };

  const timeGroups = groupTimeSlots();

  const getSlotInfo = (time: string) => {
    const slot = timeSlots.find(s => s.time === time && s.staffId === staffId);
    return {
      available: slot?.available ?? false,
      staffId: slot?.staffId ?? staffId
    };
  };

  const isTimeSelected = (time: string) => selectedTime === time;

  const handleTimeSelect = (time: string) => {
    const slotInfo = getSlotInfo(time);
    if (slotInfo.available) {
      onSelect(time);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Saat Seçin</h3>
        <div className="space-y-4">
          {Object.entries(timeGroups).map(([key, group]) => (
            <div key={key}>
              <h4 className="font-medium mb-3">{group.label}</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {group.slots.map((_, index) => (
                  <div key={index} className="h-10 bg-gray-200 rounded-md animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Saat Seçin</h3>
        <p className="text-gray-600">
          {DateUtils.formatTurkishDate(date)} için uygun saati seçin
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(timeGroups).map(([key, group]) => {
          const availableSlots = group.slots.filter(time => getSlotInfo(time).available);
          
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {group.label}
                  </h4>
                  <Badge variant="secondary">
                    {availableSlots.length} müsait
                  </Badge>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {group.slots.map((time) => {
                    const slotInfo = getSlotInfo(time);
                    const selected = isTimeSelected(time);
                    const available = slotInfo.available;
                    const endTime = BookingService.calculateEndTime(time);

                    return (
                      <Button
                        key={time}
                        variant={selected ? "default" : available ? "outline" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-auto p-2 text-xs flex flex-col",
                          !available && "opacity-40 cursor-not-allowed bg-gray-100",
                          selected && "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                        disabled={!available}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <div className="flex items-center space-x-1">
                          {selected && <CheckCircle className="w-3 h-3" />}
                          <span className="font-medium">{time}</span>
                        </div>
                        <span className="text-xs opacity-75">
                          {endTime}
                        </span>
                      </Button>
                    );
                  })}
                </div>

                {availableSlots.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Bu zaman diliminde müsait slot yok
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Tüm randevular 45 dakika sürmektedir</span>
        </div>
        <p>• Çalışma saatleri: 09:30 - 21:30</p>
        <p>• Randevunuzu 2 saat öncesine kadar iptal edebilirsiniz</p>
      </div>

      {selectedTime && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Seçilen saat:</strong> {selectedTime} - {BookingService.calculateEndTime(selectedTime)}
          </p>
        </div>
      )}
    </div>
  );
}